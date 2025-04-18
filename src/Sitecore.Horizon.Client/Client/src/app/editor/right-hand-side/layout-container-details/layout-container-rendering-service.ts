/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { CanvasServices } from 'app/editor/shared/canvas.services';
import { RenderingDefinition } from 'app/editor/shared/layout/page-layout';
import { EditingMessagingChannel } from 'app/shared/messaging/horizon-canvas.contract.defs';
import { PlaceholderChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { BehaviorSubject, filter, map } from 'rxjs';
import { RenderingDetails } from 'sdk/contracts/rendering-properties.contract';
import { RenderingDetailsService } from '../rendering-details/rendering-details.service';
import { ContentPosition } from './column-content-layout';
import { LayoutContainerParametersParseService } from './layout-container-parameters-parse.service';
import { layoutTemplates, LayoutTemplatesKey } from './layout-size-templates';

export interface LayoutContainerPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface LayoutContainerStyles {
  width: { value: number | '100%'; unit: string };
  gap: { value: number; unit: string };
  padding: { value: LayoutContainerPadding; unit: string };
}

export interface LayoutContainerColumn {
  size: string | undefined;
  direction: 'horizontal' | 'vertical';
  wrap: boolean;
  position: ContentPosition;
}

export interface LayoutContainerModel {
  layoutTemplateKey: LayoutTemplatesKey;
  columns: LayoutContainerColumn[];
  containerStyles: LayoutContainerStyles;
  stackBreakpoint: string;
}

export interface LayoutContainer {
  model: LayoutContainerModel;
  instanceId: string;
  renderingParameters: Record<string, string>;
}

export type LayoutContainerEditKind = 'columnStyles' | 'containerStyles';

interface UpdateLayoutStyleOptions {
  containerType?: LayoutContainerEditKind;
  index?: number;
  breakPoint?: string;
}

@Injectable({ providedIn: 'root' })
export class LayoutContainerRenderingService {
  private readonly _layoutContainer$ = new BehaviorSubject<LayoutContainer | undefined>(undefined);
  public readonly layoutContainerModel$ = this._layoutContainer$.asObservable().pipe(
    filter(Boolean),
    map((lc) => lc.model),
  );
  private readonly editingChannel: EditingMessagingChannel;
  private renderingDetails?: RenderingDetails;

  constructor(
    private readonly renderingDetailsService: RenderingDetailsService,
    private readonly layoutContainerParameterParser: LayoutContainerParametersParseService,
    private readonly messagingService: MessagingService,
    private readonly canvasServices: CanvasServices,
  ) {
    this.editingChannel = this.messagingService.getEditingCanvasChannel();
  }

  async initFromRendering(renderingInstanceId: string) {
    this.renderingDetails = await this.renderingDetailsService.getRenderingDetails(renderingInstanceId);

    if (!!this.renderingDetails) {
      this._layoutContainer$.next({
        instanceId: renderingInstanceId,
        renderingParameters: this.renderingDetails.parameters,
        model: this.layoutContainerParameterParser.parseLayoutContainerModel(this.renderingDetails.parameters),
      });
    }
  }

  async updateContainerStyles<T extends keyof LayoutContainerStyles>(containerStyles: Pick<LayoutContainerStyles, T>) {
    const layoutContainer = this._layoutContainer$.value;
    if (!layoutContainer) {
      return;
    }
    const layoutModel = layoutContainer.model;

    layoutModel.containerStyles = {
      ...layoutModel.containerStyles,
      ...containerStyles,
    };
    await this.updateLayoutContainerModelAndParameters(layoutModel, layoutContainer, {
      containerType: 'containerStyles',
    });
  }

  async updateColumnStackBreakpoint(stackBreakpoint: string) {
    const layoutContainer = this._layoutContainer$.value;
    if (!layoutContainer) {
      return;
    }
    const layoutModel = layoutContainer.model;

    layoutModel.stackBreakpoint = stackBreakpoint;
    await this.updateLayoutContainerModelAndParameters(layoutModel, layoutContainer, { breakPoint: stackBreakpoint });
  }

  async updateLayoutTemplate(layoutTemplateKey: LayoutTemplatesKey) {
    const layoutContainer = this._layoutContainer$.value;

    if (!layoutContainer) {
      return;
    }
    const layoutModel = layoutContainer.model;

    if (layoutModel.layoutTemplateKey === layoutTemplateKey) {
      return;
    }

    const newLayoutTemplate =
      layoutTemplates.find((template) => template.key === layoutTemplateKey) || layoutTemplates[0];

    layoutModel.columns = layoutModel.columns.slice(0, newLayoutTemplate.columnsCount);
    for (let i = 0; i < newLayoutTemplate.columnsCount; i++) {
      if (layoutModel.columns[i]) {
        layoutModel.columns[i].size = newLayoutTemplate.columns[i];
      } else {
        layoutModel.columns.push({
          size: newLayoutTemplate.columns[i],
          direction: 'vertical',
          wrap: false,
          position: 'top-left',
        });
      }
    }
    layoutModel.layoutTemplateKey = layoutTemplateKey;

    await this.updateLayoutContainerModelAndParameters(layoutModel, layoutContainer);
  }

  async updateColumnLayout<T extends keyof LayoutContainerColumn>(
    columnLayoutUpdate: Pick<LayoutContainerColumn, T>,
    index: number,
  ) {
    const layoutContainer = this._layoutContainer$.value;
    if (!layoutContainer) {
      return;
    }
    const layoutModel = layoutContainer.model;

    Object.assign(layoutModel.columns[index], columnLayoutUpdate);

    if (layoutModel.columns[index].direction === 'vertical') {
      layoutModel.columns[index].wrap = false;
    }
    await this.updateLayoutContainerModelAndParameters(layoutModel, layoutContainer, {
      containerType: 'columnStyles',
      index,
    });
  }

  async getRenderingsInsideRemovingColumn(newEnabledColumn: number): Promise<RenderingDefinition[]> {
    const phKeysOfColumnsToRemove = await this.getPhKeysOfRemovingColumns(newEnabledColumn);
    const allRenderings = this.canvasServices.getCurrentLayout().getAllRenderings();

    return allRenderings.filter((rendering) => {
      const renderingsPhKey = rendering.placeholderKey;
      return phKeysOfColumnsToRemove.includes(renderingsPhKey);
    });
  }

  async getPhKeyOfContentAppendingColumn(newEnabledColumn: number): Promise<string> {
    const childPlaceholders: PlaceholderChromeInfo[] = await this.getChildPlaceholders();
    return childPlaceholders[newEnabledColumn - 1].placeholderKey;
  }

  private async getPhKeysOfRemovingColumns(newEnabledColumn: number): Promise<string[]> {
    const childPlaceholders: PlaceholderChromeInfo[] = await this.getChildPlaceholders();
    // Get the childPlaceholderKeys starting from newEnabledColumn
    return childPlaceholders.slice(newEnabledColumn).map((ph) => ph.placeholderKey);
  }

  private async getChildPlaceholders(): Promise<PlaceholderChromeInfo[]> {
    const renderingInstanceId = this.renderingDetails?.instanceId ?? '';
    return await this.editingChannel.rpc.getChildPlaceholders(renderingInstanceId);
  }

  private async updateLayoutContainerModelAndParameters(
    updatedLayoutContainerModel: LayoutContainerModel,
    currentLayoutContainer: LayoutContainer,
    layoutOptions: UpdateLayoutStyleOptions = {},
  ) {
    let reloadRequired = true;
    const parameters =
      this.layoutContainerParameterParser.serializeLayoutContainerParameters(updatedLayoutContainerModel);
    const updatedParameters = {
      ...currentLayoutContainer.renderingParameters,
      ...parameters,
    };
    const updateLayoutContainer: LayoutContainer = {
      instanceId: currentLayoutContainer.instanceId,
      renderingParameters: updatedParameters,
      model: updatedLayoutContainerModel,
    };
    this._layoutContainer$.next(updateLayoutContainer);

    const { containerType, index, breakPoint } = layoutOptions;

    if (containerType || breakPoint) {
      reloadRequired = false;
      this.editingChannel.emit('layoutComponentStylesSetting:change', {
        containerInstanceId: currentLayoutContainer.instanceId,
        renderingParameters: updateLayoutContainer.renderingParameters,
        containerType,
        columnIndex: index,
        breakPoint: breakPoint,
      });
    }

    await this.renderingDetailsService.setRenderingDetails(
      updateLayoutContainer.instanceId,
      { parameters: updatedParameters },
      {
        reloadRequired,
      },
    );
  }
}
