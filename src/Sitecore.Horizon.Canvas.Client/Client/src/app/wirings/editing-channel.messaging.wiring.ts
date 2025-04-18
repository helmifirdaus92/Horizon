/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Chrome } from '../chrome/chrome';
import { ChromeHighlighter } from '../chrome/chrome-highlighter';
import { ChromeManager } from '../chrome/chrome-manager';
import { ChromeReader } from '../chrome/chrome-reader';
import { isFieldChrome } from '../chrome/chrome.field';
import { isRenderingChrome } from '../chrome/chrome.rendering';
import { FrameManager } from '../frame/frame-manager';
import { PlaceholderChromeInfo, RenderingChromeInfo, RenderingFieldsdData } from '../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../messaging/messaging-service';
import { Wiring } from './wiring';

export class EditingChannelMessagingWiring implements Wiring {
  constructor(
    private readonly chromeManager: ChromeManager,
    private readonly messaging: MessagingService,
    private readonly chromeHighlighter: ChromeHighlighter,
    private readonly frameManager: FrameManager,
  ) {}

  wire(): void {
    this.messaging.setEditingChannelRpcServices({
      updatePageState: ({ fields }) => {
        if (fields) {
          this.chromeManager.writeFields(fields);
        }
      },
      selectChrome: (chromeId) => {
        this.chromeManager.getByChromeId(chromeId)?.select();
      },
      deselectChrome: () => {
        this.chromeHighlighter.resetAllHighlightings();
      },
      highlightPartialDesign: (partialDesignId) => {
        const chromes: Chrome[] = this.chromeManager.getByChromeSxaSource(partialDesignId);

        this.frameManager.highlightChromes(chromes);
      },
      unhighlightPartialDesign: () => {
        this.frameManager.unhighlightChromes();
      },
      getChildRenderings: (renderingInstanceId) => {
        let childRenderings: RenderingChromeInfo[] = [];
        const rendering = this.chromeManager.getByChromeId(ChromeReader.buildChromeId(renderingInstanceId, 'rendering'));
        if (rendering && isRenderingChrome(rendering)) {
          childRenderings = rendering.getChildRenderings();
        }
        return childRenderings;
      },
      getChildPlaceholders: (renderingInstanceId) => {
        let childPlaceholders: PlaceholderChromeInfo[] = [];
        const rendering = this.chromeManager.getByChromeId(ChromeReader.buildChromeId(renderingInstanceId, 'rendering'));
        if (rendering && isRenderingChrome(rendering)) {
          childPlaceholders = rendering.getChildPlaceholders();
        }
        return childPlaceholders;
      },
      selectRendering: (renderingInstanceId: string, shouldScrollIntoView: boolean) => {
        const chrome = this.chromeManager.getByChromeId(ChromeReader.buildChromeId(renderingInstanceId, 'rendering'));
        if (!chrome) {
          return;
        }

        chrome.select();

        if (shouldScrollIntoView) {
          const { top, height } = chrome.getDimensions();
          // If the chrome is not visible, scroll to it
          const isChromeVisible = top + height < window.innerHeight;
          if (!isChromeVisible) {
            window.scrollTo({ top, behavior: 'smooth' });
          }
        }
      },
      getRenderingFields: (renderingInstanceId) => {
        let renderingFieldData: RenderingFieldsdData = {};
        const rendering = this.chromeManager.getByChromeId(ChromeReader.buildChromeId(renderingInstanceId, 'rendering'));
        if (rendering && isRenderingChrome(rendering)) {
          renderingFieldData = rendering.getChromeFields();
        }
        return renderingFieldData;
      },
      getPageFields: () => {
        const fields = this.chromeManager.chromes.filter(isFieldChrome).map((chrome) => ({
          itemId: chrome.itemContext.id,
          itemVersion: chrome.itemContext.version,
          fieldId: chrome.fieldId,
          fieldType: chrome.fieldType,
          value: chrome.getValue(),
          revision: chrome.itemContext.revision,
          reset: chrome.containsStandardValue,
        }));
        return fields;
      },
    });
  }
}
