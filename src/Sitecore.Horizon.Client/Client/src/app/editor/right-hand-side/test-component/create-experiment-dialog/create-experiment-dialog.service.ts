/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { getComponentVariantId } from 'app/pages/left-hand-side/personalization/personalization-api/personalization.api.utils';
import { AbTestComponentService } from 'app/pages/left-hand-side/personalization/personalization-services/ab-test-component.service';
import { BXComponentFlowDefinition } from 'app/pages/left-hand-side/personalization/personalization.types';
import { ContextService } from 'app/shared/client-state/context.service';
import { EditingMessagingChannel } from 'app/shared/messaging/horizon-canvas.contract.defs';
import { RenderingChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { firstValueFrom, Observable } from 'rxjs';
import { CreateExperimentDialogComponent } from './create-experiment-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class CreateExperimentDialogService {
  private readonly editingChannel: EditingMessagingChannel;
  constructor(
    private readonly overlayService: DialogOverlayService,
    private readonly abTestComponentService: AbTestComponentService,
    private readonly contextService: ContextService,
    private readonly messagingService: MessagingService,
  ) {
    this.editingChannel = this.messagingService.getEditingCanvasChannel();
  }

  show(options: {
    renderingInstanceId: string;
    renderingDisplayName: string;
    existingNames: Promise<string[]>;
  }): Observable<BXComponentFlowDefinition | null> {
    const comp = this.overlayService.open(CreateExperimentDialogComponent, {
      size: 'AutoHeight',
    });

    comp.component.existingNamesPromise = options.existingNames;
    comp.component.renderingInstanceId = options.renderingInstanceId;
    comp.component.renderingDisplayName = options.renderingDisplayName;
    return comp.component.onCreate;
  }

  async promptCreateAbTestComponent(
    chrome: RenderingChromeInfo,
    updateContext: boolean = true,
  ): Promise<BXComponentFlowDefinition | null> {
    try {
      const flowDefinition = await firstValueFrom(
        this.show({
          renderingInstanceId: chrome.renderingInstanceId,
          renderingDisplayName: chrome.displayName,
          existingNames: this.abTestComponentService
            .getCurrentSiteFlowDefinitions()
            .then((flows) => flows.map((f) => f.name)),
        }),
      );

      if (!flowDefinition) {
        return null;
      }

      await this.abTestComponentService.refetchFlows(this.contextService.itemId, this.contextService.language);
      if (updateContext) {
        await this.editingChannel.syncEmit('canvas:before-unload', { preserveCanvasSelection: true });
        const variantB = getComponentVariantId(flowDefinition?.variants?.[1]);
        this.contextService.updateContext({ itemVersion: this.contextService.itemVersion, variant: variantB });
      }
      return flowDefinition;
    } catch (error) {
      console.warn('Error create ab test component', error);
      return null;
    }
  }
}
