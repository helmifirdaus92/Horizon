/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { MessagingRpcServicesClient } from '@sitecore/page-composer-sdk';
import {
  BYOC_RENDERING_ID,
  FEAAS_RENDERING_ID,
} from 'app/editor/right-hand-side/feaas-rhs-region/feaas-extension-filter';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { Observable } from 'rxjs';
import { EditorCommands, RenderingInitializationContext } from 'sdk/contracts/commands.contract';
import { DatasourcePickerContract, DatasourcePickerRpc } from 'sdk/contracts/datasource-picker.contract';
import {
  FEaaSComponent,
  FEaaSComponentsCollection,
  FEaaSExternalComponent,
  FEaaSExternalComponentRenderingParameters,
  FEaaSRenderingParameters,
} from './feaas-component-types';
import { FEaaSComponentsDalService, FEaaSComponentsUtils } from './feaas-components.dal.service';

export function isExternalComponent(value: FEaaSComponent | FEaaSExternalComponent): value is FEaaSExternalComponent {
  return value.isExternal;
}

@Injectable({
  providedIn: 'root',
})
export class FEaaSComponentsService {
  private lastInsertComponent?: FEaaSComponent | FEaaSExternalComponent;
  private datasourcePickerRpc: Promise<MessagingRpcServicesClient<DatasourcePickerRpc>>;
  fEaaSComponentsCdnHostName: Promise<string>;
  utils: Promise<FEaaSComponentsUtils>;
  componentsCollections$: Observable<FEaaSComponentsCollection[]>;
  isLoading$: Observable<boolean>;

  constructor(
    private messaging: NgGlobalMessaging,
    private readonly dalService: FEaaSComponentsDalService,
    private readonly timedNotificationService: TimedNotificationsService,
    private readonly translateService: TranslateService,
  ) {
    this.componentsCollections$ = this.dalService.componentsCollections$;
    this.isLoading$ = this.dalService.isLoading$;
    this.fEaaSComponentsCdnHostName = this.dalService.configuration.then((c) => c.cdnHostName);
    this.utils = this.dalService.utils;
    this.datasourcePickerRpc = this.messaging.getRpc(DatasourcePickerContract);
    this.setupSetRenderingParametersHook();
  }

  startInsertComponent(component: FEaaSComponent | FEaaSExternalComponent) {
    this.lastInsertComponent = component;
  }

  private async setupSetRenderingParametersHook() {
    if (window.FED_UI) {
      const cm = window.FED_UI?.getCommandManager<EditorCommands>();
      cm?.register('pages:editor:rendering:insert', (context) => this.populateRenderingDetails(context));
    }
  }

  async populateRenderingDetails(context: RenderingInitializationContext): Promise<RenderingInitializationContext> {
    if (
      (context.renderingDetails.renderingId !== FEAAS_RENDERING_ID &&
        context.renderingDetails.renderingId !== BYOC_RENDERING_ID) ||
      !this.lastInsertComponent
    ) {
      return Promise.resolve(context);
    }

    // rendering parameters
    let renderingParameters;
    if (context.renderingDetails.renderingId === FEAAS_RENDERING_ID) {
      renderingParameters = await this.setFEaaSRenderingParameters(this.fEaaSComponentsCdnHostName, this.utils);
    } else {
      renderingParameters = this.setExternalComponentRenderingParameters();
    }

    Object.assign(context.renderingDetails.parameters, renderingParameters);

    // data-source
    if (
      !isExternalComponent(this.lastInsertComponent) &&
      this.lastInsertComponent.canUseXMDatasources &&
      this.lastInsertComponent.datasourceIds?.length
    ) {
      try {
        // DatasourcePicker and RenderingInitializationContext types have a conflict, so we need to pass "parameters" as "renderingDetails" as the picker input
        const promptInput = {
          ...context.renderingDetails,
          ...{ renderingDetails: context.renderingDetails.parameters },
        };
        const result = await (
          await this.datasourcePickerRpc
        ).prompt(promptInput, {
          compatibleTemplateIds: this.lastInsertComponent.datasourceIds,
        });
        if (result.status === 'OK') {
          context.renderingDetails.dataSource = result.datasource;
        } else {
          this.timedNotificationService.push(
            'noDataSourceSet',
            this.translateService.get('EDITOR.RENDERING.REQUIRES_DATASOURCE'),
            'warning',
          );

          context.cancelRenderingInsert = true;
          return context;
        }
      } catch {
        context.cancelRenderingInsert = true;
        return context;
      }
    }

    this.lastInsertComponent = undefined;
    return context;
  }

  private async setFEaaSRenderingParameters(
    fEaaSComponentsCdnHostName: Promise<string>,
    utils: Promise<FEaaSComponentsUtils>,
  ) {
    if (!this.lastInsertComponent || isExternalComponent(this.lastInsertComponent)) {
      return;
    }

    const fEaaSRenderingParameters: FEaaSRenderingParameters = {
      LibraryId: this.lastInsertComponent.libraryId,
      ComponentName: this.lastInsertComponent.name,
      ComponentLabel: this.lastInsertComponent.name,
      ComponentId: this.lastInsertComponent.id,
      ComponentVersion: 'responsive',
      ComponentRevision: 'staged',
      ComponentHostName: await fEaaSComponentsCdnHostName,
      ComponentInstanceId: (await utils).getUniqueId(),
      ComponentHTMLOverride: '',
    };
    this.addDataSettings(fEaaSRenderingParameters);

    return fEaaSRenderingParameters;
  }

  private setExternalComponentRenderingParameters(): any {
    if (!this.lastInsertComponent) {
      return;
    }

    if (!isExternalComponent(this.lastInsertComponent)) {
      return;
    }

    const externalRenderingParameters: FEaaSExternalComponentRenderingParameters = {
      ComponentName: this.lastInsertComponent.id || this.lastInsertComponent.name,
      ComponentLabel: this.lastInsertComponent.title || this.lastInsertComponent.name,
    };

    return externalRenderingParameters;
  }

  private addDataSettings(fEaaSRenderingParameters: FEaaSRenderingParameters) {
    if (
      this.lastInsertComponent &&
      !isExternalComponent(this.lastInsertComponent) &&
      this.lastInsertComponent?.dataSettings
    ) {
      fEaaSRenderingParameters.ComponentDataOverride = this.lastInsertComponent?.dataSettings;
    }
  }
}
