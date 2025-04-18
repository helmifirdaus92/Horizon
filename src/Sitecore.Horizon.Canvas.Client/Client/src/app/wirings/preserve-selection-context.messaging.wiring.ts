/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeHighlighter } from '../chrome/chrome-highlighter';
import { ChromePersistSelection } from '../chrome/chrome-persist-selection';
import { ChromeReader } from '../chrome/chrome-reader';
import { MessagingService } from '../messaging/messaging-service';
import { Wiring } from './wiring';

export class PreserveSelectionContextWiring implements Wiring {
  constructor(
    private readonly messaging: MessagingService,
    private readonly chromePersistSelection: ChromePersistSelection,
    private readonly chromeHighlighter: ChromeHighlighter,
  ) {}

  wire(): void {
    this.messaging.editingChannel.on('canvas:before-unload', ({ preserveCanvasSelection, chromeToSelect }) => {
      if (!preserveCanvasSelection) {
        return;
      }

      let chromeId: string | undefined;
      if (chromeToSelect) {
        chromeId = ChromeReader.buildChromeId(chromeToSelect.chromeId, chromeToSelect.chromeType);
      } else {
        chromeId = this.chromeHighlighter.selectedChrome?.chromeId;
      }

      if (chromeId) {
        this.chromePersistSelection.saveSnapshot(chromeId);
      }
    });
  }
}
