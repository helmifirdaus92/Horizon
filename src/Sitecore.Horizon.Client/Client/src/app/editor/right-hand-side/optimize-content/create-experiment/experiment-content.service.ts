/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { MessagingRpcServicesClient } from '@sitecore/page-composer-sdk';
import { EditorWorkspaceService } from 'app/editor/editor-workspace/editor-workspace.service';
import { CanvasServices } from 'app/editor/shared/canvas.services';
import { getComponentVariantId } from 'app/pages/left-hand-side/personalization/personalization-api/personalization.api.utils';
import { PersonalizationLayoutService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.layout.service';
import { ContextService } from 'app/shared/client-state/context.service';
import {
  DatasourceDialogService,
  PageDatasource,
} from 'app/shared/dialogs/datasource-dialog/datasource-dialog.service';
import { DatasourcePickerService } from 'app/shared/dialogs/datasource-picker/datasource-picker.service';
import { RenderingChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { firstValueFrom } from 'rxjs';
import { EditingShellContract, EditingShellRpcServices, FieldState } from 'sdk';
import { CreateExperimentDialogService } from '../../test-component/create-experiment-dialog/create-experiment-dialog.service';

@Injectable({ providedIn: 'root' })
export class ExperimentContentService {
  private readonly editingShellRpcClient: Promise<MessagingRpcServicesClient<EditingShellRpcServices>>;

  constructor(
    private readonly createExperimentDialogService: CreateExperimentDialogService,
    private readonly dataSourceDialogService: DatasourceDialogService,
    private readonly canvasServices: CanvasServices,
    private readonly personalizationLayoutService: PersonalizationLayoutService,
    private readonly dataSourcePickerService: DatasourcePickerService,
    private readonly contextService: ContextService,
    private readonly editorWorkspaceService: EditorWorkspaceService,
    globalMessaging: NgGlobalMessaging,
  ) {
    this.editingShellRpcClient = globalMessaging.getRpc(EditingShellContract);
  }

  async setupExperimentForContent(
    renderingChrome: RenderingChromeInfo,
    fields: FieldState[],
  ): Promise<{ isSuccessful: false } | { isSuccessful: true; variantBId: string }> {
    const flowDefinition = await this.createExperimentDialogService.promptCreateAbTestComponent(renderingChrome, false);
    if (!flowDefinition) {
      return { isSuccessful: false };
    }

    this.editorWorkspaceService.setCanvasLoadState({ isLoading: true });

    const dataSource = await this.getNewDataSource(renderingChrome);
    if (!dataSource) {
      console.warn('Failed to create new data source');
      return { isSuccessful: false };
    }

    const writeFieldsPromise = this.writeFields(dataSource.itemId, fields);

    const variantBId = getComponentVariantId(flowDefinition.variants[1]);
    if (!variantBId) {
      console.warn('Failed to get components variant id');
      return { isSuccessful: false };
    }
    const setRulePromise = this.personalizationLayoutService.addSetDataSourcePersonalizationRule(
      renderingChrome.renderingInstanceId,
      variantBId,
      dataSource.layoutRecord,
      false,
    );

    this.editorWorkspaceService.setChromeToSelectOnPageLoad({
      id: renderingChrome.renderingInstanceId,
      chromeType: 'rendering',
      shouldScrollIntoView: true,
    });

    await Promise.all([writeFieldsPromise, setRulePromise]);

    return { isSuccessful: true, variantBId };
  }

  private async writeFields(dataSourceItemId: string, fields: FieldState[]) {
    const dataSourceFields: FieldState[] = fields.map((field) => {
      return {
        ...field,
        itemId: dataSourceItemId,
      };
    });

    const result = await (
      await this.editingShellRpcClient
    ).save({ fields: dataSourceFields }, this.contextService.value, true);
    if (result && result.kind === 'error') {
      throw Error('Error saving content');
    }
  }

  private async getNewDataSource(renderingChrome: RenderingChromeInfo): Promise<PageDatasource> {
    const rendering = this.canvasServices.getCurrentLayout().findRendering(renderingChrome.renderingInstanceId);

    let dataSource: PageDatasource;
    const currentDataSource = rendering?.dataSource;
    if (!currentDataSource) {
      dataSource = await this.assignDataSource(renderingChrome.renderingDefinitionId);
    } else {
      try {
        dataSource = await this.duplicateDataSource(currentDataSource);
      } catch {
        dataSource = await this.assignDataSource(renderingChrome.renderingDefinitionId);
      }
    }

    return dataSource;
  }

  private async assignDataSource(renderingDefinitionId: string): Promise<PageDatasource> {
    return await firstValueFrom(
      this.dataSourceDialogService.show({
        renderingId: renderingDefinitionId,
        mode: 'ChangeDatasource',
      }),
    );
  }

  private async duplicateDataSource(dataSource: string): Promise<PageDatasource> {
    return await this.dataSourcePickerService.duplicateDataSource(dataSource);
  }
}
