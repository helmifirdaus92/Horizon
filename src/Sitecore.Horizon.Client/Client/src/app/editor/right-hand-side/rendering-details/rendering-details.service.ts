/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { CanvasServices } from 'app/editor/shared/canvas.services';
import { RenderingDefinition } from 'app/editor/shared/layout/page-layout';
import { CdpSiteDataService } from 'app/pages/left-hand-side/personalization/personalization-services/cdp-site-data.service';
import {
  PersonalizationLayoutService,
  PersonlizedRenderingInfo,
} from 'app/pages/left-hand-side/personalization/personalization-services/personalization.layout.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { isEqualObject } from 'app/shared/utils/utils';
import { firstValueFrom } from 'rxjs';
import {
  CanvasUpdateOptions,
  RenderingDetails,
  RenderingDetailsUpdate,
} from 'sdk/contracts/rendering-properties.contract';

export type TabMode = 'design' | 'content';

@Injectable({
  providedIn: 'root',
})
export class RenderingDetailsService {
  private _mode: TabMode;

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly canvasServices: CanvasServices,
    private readonly personalizationLayoutService: PersonalizationLayoutService,
    private readonly contextService: ContextService,
    private readonly cdpSiteDataService: CdpSiteDataService,
  ) {}

  set mode(val: TabMode) {
    this._mode = val;
  }

  get mode(): TabMode {
    return this._mode;
  }

  public async getRenderingDetails(renderingInstanceId: string): Promise<RenderingDetails> {
    let rendering: RenderingDefinition;
    let isPersonalizationVariant = false;

    if (
      (await this.usePersonalizedRendering(renderingInstanceId)) &&
      this.configurationService.isParametersPersonalizationEnabled()
    ) {
      rendering = await this.getPersonalizedRendering(renderingInstanceId);
      isPersonalizationVariant = true;
    } else {
      rendering = this.canvasServices.getCurrentLayout().getRendering(renderingInstanceId);
    }

    const renderingDetails: RenderingDetails = {
      instanceId: rendering.instanceId,
      renderingId: rendering.id,
      placeholderKey: rendering.placeholderKey,
      dataSource: rendering.dataSource,
      parameters: rendering.parameters,
    };
    if (isPersonalizationVariant) {
      renderingDetails.personalizationVariantRenderingId = rendering.id;
    }

    return renderingDetails;
  }

  public async setRenderingDetails(
    renderingInstanceId: string,
    details: RenderingDetailsUpdate,
    options?: CanvasUpdateOptions,
  ) {
    if (
      !(await this.usePersonalizedRendering(renderingInstanceId)) ||
      !this.configurationService.isParametersPersonalizationEnabled()
    ) {
      await this.canvasServices.getCurrentLayout().updateRenderings(
        [
          {
            renderingInstanceId,
            update: {
              placeholderKey: details.placeholderKey,
              dataSource: details.dataSource,
              id: details.renderingId,
              parameters: details.parameters,
            },
          },
        ],
        { reloadCanvas: options?.reloadRequired ?? true, skipHistory: false },
      );
      return;
    }

    const baseRenderingInfo = await this.getPersonalizedRendering(renderingInstanceId);
    const renderingInfoToUpdate: PersonlizedRenderingInfo = {
      dataSource: baseRenderingInfo.dataSource !== details.dataSource ? details.dataSource : undefined,
      renderingId: baseRenderingInfo.id !== details.renderingId ? details.renderingId : undefined,
      renderingParameters: !isEqualObject(baseRenderingInfo.parameters, details.parameters)
        ? details.parameters
        : undefined,
    };

    const reloadRequired =
      options?.reloadRequired ||
      !(await this.hasAppliedPersonalizationActions(renderingInstanceId, this.contextService.variant as string));
    await this.personalizationLayoutService.addRenderingDetailsPersonalizationRule(
      renderingInstanceId,
      this.contextService.variant as string,
      renderingInfoToUpdate,
      reloadRequired,
    );
    return;
  }

  private async hasAppliedPersonalizationActions(renderingInstanceId: string, variant: string) {
    const personalizedRenderingInfo = await this.personalizationLayoutService.getPersonalizedRenderingInfo(
      renderingInstanceId,
      variant,
    );

    return (
      !!personalizedRenderingInfo?.dataSource ||
      !!personalizedRenderingInfo?.renderingId ||
      !!personalizedRenderingInfo?.renderingParameters
    );
  }

  private async getPersonalizedRendering(renderingInstanceId: string): Promise<RenderingDefinition> {
    const rendering = this.canvasServices.getCurrentLayout().getRendering(renderingInstanceId);
    const personalizedRenderingInfo = await this.personalizationLayoutService.getPersonalizedRenderingInfo(
      rendering.instanceId,
      this.contextService.variant,
    );

    return {
      ...rendering,
      id: personalizedRenderingInfo?.renderingId ?? rendering.id,
      dataSource: personalizedRenderingInfo?.dataSource ?? rendering.dataSource,
      parameters: personalizedRenderingInfo?.renderingParameters ?? rendering.parameters,
    };
  }

  private async usePersonalizedRendering(renderingInstanceId: string) {
    const cdpSiteData = await firstValueFrom(this.cdpSiteDataService.watchCdpSiteData());

    const isPagePersonalizedVariant =
      !!this.contextService.variant && cdpSiteData.hasPagePersonalization(this.contextService.itemId);
    const isRenderingAbTestVariant =
      !!this.contextService.variant &&
      cdpSiteData.hasComponentAbTest(this.contextService.itemId, renderingInstanceId, false) &&
      (await this.hasAppliedPersonalizationActions(renderingInstanceId, this.contextService.variant));

    const result = isPagePersonalizedVariant || isRenderingAbTestVariant;
    return result;
  }
}
