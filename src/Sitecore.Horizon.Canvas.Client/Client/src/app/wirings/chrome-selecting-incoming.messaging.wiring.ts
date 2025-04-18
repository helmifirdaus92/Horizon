/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeManager } from '../chrome/chrome-manager';
import { ChromeReader } from '../chrome/chrome-reader';
import { FrameManager } from '../frame/frame-manager';
import { ChromeType } from '../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../messaging/messaging-service';
import { Wiring } from './wiring';

export class ChromeSelectingIncomeMessagingWiring implements Wiring {
  constructor(
    private readonly chromeManager: ChromeManager,
    private readonly frameManager: FrameManager,
    private readonly messaging: MessagingService,
  ) {}

  wire(): void {
    this.messaging.editingChannel.on('chrome:select', (params: { id: string; chromeType: ChromeType; shouldScrollIntoView?: boolean }) => {
      const chrome = this.chromeManager.getByChromeId(ChromeReader.buildChromeId(params.id, params.chromeType));

      if (!chrome) {
        return;
      }

      chrome.select();

      if (params.shouldScrollIntoView) {
        const { top, height } = chrome.getDimensions();
        // If the chrome is not visible, scroll to it
        const isChromeVisible = top + height < window.innerHeight;
        if (!isChromeVisible) {
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });

    this.messaging.editingChannel.on('chrome:highlight', (params: { id: string; chromeType: ChromeType }) => {
      const chrome = this.chromeManager.getByChromeId(ChromeReader.buildChromeId(params.id, params.chromeType));

      if (!chrome) {
        return;
      }

      this.frameManager.highlight(chrome);
    });

    this.frameManager.onDeleteRendering.on((chrome) => this.messaging.editingChannel.emit('chrome:remove', chrome.getChromeInfo()));
  }
}
