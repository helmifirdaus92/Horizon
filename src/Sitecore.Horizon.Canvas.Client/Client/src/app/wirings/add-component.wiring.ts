/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeManager } from '../chrome/chrome-manager';
import { isPlaceholderChrome } from '../chrome/chrome.placeholder';
import { MessagingService } from '../messaging/messaging-service';
import { Wiring } from './wiring';

export class AddComponentWiring implements Wiring {
  constructor(
    private readonly chromeManager: ChromeManager,
    private readonly messaging: MessagingService,
  ) {}
  wire(): void {
    this.chromeManager.chromes.forEach((chrome) => {
      if (isPlaceholderChrome(chrome)) {
        const placeholderKey = chrome.getChromeInfo().placeholderKey;
        const allowedRenderingIds = chrome.allowedRenderingIds;
        chrome.onAddCompBtnClick.on(() => {
          this.messaging.designingChannel.rpc.promptInsertRendering(placeholderKey, allowedRenderingIds, chrome.getDimensions());
        });
      }
    });
    this.messaging.designingChannel.on('addRenderingDialog:close', () => {
      const spacer = document.querySelector('[class*="hovered"]');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      spacer?.classList.remove(spacer.classList.value.match(/hovered\S*/) as any);
    });
  }
}
