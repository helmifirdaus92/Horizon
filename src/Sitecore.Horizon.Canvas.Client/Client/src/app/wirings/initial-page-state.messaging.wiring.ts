/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeManager } from '../chrome/chrome-manager';
import { isFieldChrome } from '../chrome/chrome.field';
import { isPlaceholderChrome } from '../chrome/chrome.placeholder';
import { FrameManager } from '../frame/frame-manager';
import { MessagingService } from '../messaging/messaging-service';
import { PageStateReader } from '../page-state-reader';
import { Wiring } from './wiring';

export class InitialPageStateMessagingWiring implements Wiring {
  constructor(
    private readonly chromeManager: ChromeManager,
    private readonly frameManager: FrameManager,
    private readonly pageStateReader: PageStateReader,
    private readonly messaging: MessagingService,
    private readonly isAppResetRequested: boolean,
  ) {}

  async wire(): Promise<void> {
    this.messaging.editingChannel.on('canvas:set-personalization-mode', ({ isPersonalizationMode }) => {
      this.frameManager.setPersonalizationMode(isPersonalizationMode);
      for (const chrome of this.chromeManager.chromes) {
        if (isPlaceholderChrome(chrome)) {
          chrome.disableEditingInPersonalizationMode(isPersonalizationMode);
        }
      }
    });
    this.frameManager.permissions = await this.messaging.editingChannel.rpc.getItemPermissions();

    if (this.isAppResetRequested) {
      return;
    }

    const initialFieldValues = this.chromeManager.chromes.filter(isFieldChrome).map((chrome) => ({
      itemId: chrome.itemContext.id,
      itemVersion: chrome.itemContext.version,
      fieldId: chrome.fieldId,
      value: chrome.getValue(),
      revision: chrome.itemContext.revision,
      reset: chrome.containsStandardValue,
    }));

    const droppableRenderingIds = this.chromeManager.chromes
      //
      .filter(isPlaceholderChrome)
      .reduce((memo, ph) => {
        // It would be ideal to normalize all IDs, to ensure we don't keep duplicates just because of different id format.
        // Let's presume for now that all chrome IDs come in the same format across the page.
        ph.allowedRenderingIds.forEach((id) => memo.add(id));
        return memo;
      }, new Set<string>());

    await this.messaging.editingChannel.syncEmit('page:load', {
      fields: initialFieldValues,
      layout: this.pageStateReader.getPageLayout(),
      layoutDeviceId: this.pageStateReader.getHorizonPageState().deviceId,
      droppableRenderingIds: [...droppableRenderingIds.values()],
      styles: {
        fontSizePx: getComputedStyle(document.documentElement).fontSize,
      },
    });
  }
}
