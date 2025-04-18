/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeManager } from '../chrome/chrome-manager';
import { FieldValue } from '../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../messaging/messaging-service';
import { Wiring } from './wiring';

export class SaveFieldChangesMessagingWiring implements Wiring {
  constructor(private readonly chromeManager: ChromeManager, private readonly messaging: MessagingService) {}

  wire(): void {
    for (const chrome of this.chromeManager.fieldChromes) {
      chrome.onChange.on(async ({ value, requireSSR }) =>
        requireSSR ? this.dispatchFieldChangeWithSSR(value) : this.dispatchFieldChange(value),
      );
    }
  }

  private async dispatchFieldChangeWithSSR(value: FieldValue): Promise<void> {
    await this.messaging.editingChannel.syncEmit('field:change', value);

    // Do not await as this page will be destroyed after RPC call.
    this.messaging.editingChannel.rpc.reloadCanvas();
  }

  private dispatchFieldChange(value: FieldValue): void {
    this.messaging.editingChannel.emit('field:change', value);
  }
}
