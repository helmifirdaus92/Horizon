/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeManager } from '../chrome/chrome-manager';
import { MessagingService } from '../messaging/messaging-service';
import { Wiring } from './wiring';

export class RhsEditorCommunicationMessagingWiring implements Wiring {
  constructor(private readonly chromeManager: ChromeManager, private readonly messaging: MessagingService) {}

  wire(): void {
    for (const chrome of this.chromeManager.chromes) {
      chrome.rhsMessaging.changePort({
        postMessage: (msg) => this.messaging.editingChannel.emit('chrome:rhs:message', { chromeId: chrome.chromeId, msg }),
        onMessage: (handler) =>
          this.messaging.editingChannel.on('chrome:rhs:message', ({ chromeId, msg }) => {
            if (chromeId === chrome.chromeId) {
              handler(msg);
            }
          }),
      });

      // Keep the messaging always connected.
      // That supports scenarios when user selects another chrome and the RHS editor for the previous one wants to flush changes.
      // If we disconnect it on unselection, the last changes might be lost.
      // This way we give RHS editor an opportunity to communicate with chrome for the last time before going into oblivion.
      chrome.rhsMessaging.reconnect();
    }
  }
}
