/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeManager } from '../chrome/chrome-manager';
import { MessagingService } from '../messaging/messaging-service';
import { Wiring } from './wiring';

export class FlushFieldsBeforeUnloadMessagingWiring implements Wiring {
  constructor(private readonly chromeManager: ChromeManager, private readonly messaging: MessagingService) {}

  wire(): void {
    this.messaging.editingChannel.on('canvas:before-unload', () => {
      this.chromeManager.fieldChromes.forEach((f) => f.flushChanges());
    });
  }
}
