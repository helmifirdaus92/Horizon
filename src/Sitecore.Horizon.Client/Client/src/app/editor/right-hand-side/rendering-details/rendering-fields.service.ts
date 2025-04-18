/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { EditingMessagingChannel } from 'app/shared/messaging/horizon-canvas.contract.defs';
import { RenderingChromeInfo, RenderingField } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';

@Injectable({
  providedIn: 'root',
})
export class RenderingFieldsService {
  private readonly editingChannel: EditingMessagingChannel;

  constructor(private readonly messagingService: MessagingService) {
    this.editingChannel = this.messagingService.getEditingCanvasChannel();
  }

  async fetchTextRenderingFields(chrome: RenderingChromeInfo): Promise<RenderingField[]> {
    const renderingFields = await this.editingChannel.rpc.getRenderingFields(chrome.renderingInstanceId);
    return (
      renderingFields.fields?.filter(
        (fieldChrome) =>
          fieldChrome.fieldType === 'single-line text' ||
          fieldChrome.fieldType === 'multi-line text' ||
          fieldChrome.fieldType === 'rich text',
      ) ?? []
    );
  }
}
