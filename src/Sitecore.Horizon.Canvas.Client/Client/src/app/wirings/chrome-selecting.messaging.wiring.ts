/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeHighlighter } from '../chrome/chrome-highlighter';
import { MessagingService } from '../messaging/messaging-service';
import { Wiring } from './wiring';

export class ChromeSelectingMessagingWiring implements Wiring {
  constructor(
    private readonly chromeHighlighter: ChromeHighlighter,
    private readonly messaging: MessagingService,
  ) {}

  wire(): void {
    this.chromeHighlighter.onSelect.on((chrome) => this.messaging.editingChannel.emit('chrome:select', chrome.getChromeInfo()));
    this.chromeHighlighter.onDeselect.on(() => this.messaging.editingChannel.emit('chrome:deselect', undefined));
  }
}
