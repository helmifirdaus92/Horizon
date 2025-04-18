/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeManager } from '../chrome/chrome-manager';
import { MessagingService } from '../messaging/messaging-service';
import { Wiring } from './wiring';

export class OnLeaveWiring implements Wiring {
  constructor(private readonly chromeManager: ChromeManager, private readonly messaging: MessagingService) {}

  wire(): void {
    // Don't use window.addEventListener() as it doesn't work in all the browsers.
    //
    // UPD: Please re-test this statement, as looks like it's actually works in major browsers.
    // If that's the case - switch back to usage of `addEventListener()`
    window.onbeforeunload = () => {
      this.chromeManager.fieldChromes.forEach((f) => f.flushChanges());

      this.messaging.editingChannel.emit('page:unloaded');
    };
  }
}
