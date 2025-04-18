/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Chrome } from '../chrome/chrome';
import { ChromeHighlighter } from '../chrome/chrome-highlighter';
import { ChromeManager } from '../chrome/chrome-manager';
import { ChromeReader } from '../chrome/chrome-reader';
import { RenderingChrome, isRenderingChrome } from '../chrome/chrome.rendering';
import { DisableChromeOverlay } from '../frame/disable-overlay';
import { ChromeType } from '../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../messaging/messaging-service';
import { PageStateReader } from '../page-state-reader';
import { findClosestParentRendering, getAbTestFlow, isAbTestConfigured, isAbTestHasVariant } from '../utils/chrome';
import { Wiring } from './wiring';

export class DisableChromeWiring implements Wiring {
  private chromesToDisableMap = new Map<string, Chrome>();
  private hoverChromeOverlay?: DisableChromeOverlay;
  private selectChromeOverlay?: DisableChromeOverlay;

  constructor(
    private readonly chromeManager: ChromeManager,
    private readonly pageStateReader: PageStateReader,
    private readonly messaging: MessagingService,
    private readonly chromeHighlighter: ChromeHighlighter,
    private readonly abortController: AbortController,
  ) {}

  wire(): void {
    this.abortController.signal.addEventListener('abort', () => {
      this.hoverChromeOverlay?.remove();
      this.selectChromeOverlay?.remove();
    });

    this.populateRenderingsToDisable();

    this.chromeHighlighter.onEnter.on((chrome) => {
      this.renderHoverChromeOverlay(chrome);
    });
    this.chromeHighlighter.onLeave.on(() => {
      this.removeHoverChromeOverlay();
    });
    this.chromeHighlighter.onSelect.on((chrome) => {
      this.renderSelectedChromeOverlay(chrome);
    });
    this.chromeHighlighter.onDeselect.on(() => {
      this.removeSelectChromeOverlay();
    });

    this.messaging.editingChannel.on('chrome:enable', (params: { id: string; chromeType: ChromeType }) => {
      const chromeToEnable = this.chromeManager.getByChromeId(ChromeReader.buildChromeId(params.id, params.chromeType));
      if (chromeToEnable) {
        this.selectChromeOverlay?.remove();
        this.hoverChromeOverlay?.remove();

        const chromesToEnable: string[] = [];
        for (const [key, value] of this.chromesToDisableMap.entries()) {
          if (value === chromeToEnable) {
            chromesToEnable.push(key);
          }
        }
        chromesToEnable.forEach((id) => this.chromesToDisableMap.delete(id));
      }
    });
  }

  private populateRenderingsToDisable() {
    const abTestRenderings = this.chromeManager.chromes.filter((chrome) => {
      return isRenderingChrome(chrome) && isAbTestConfigured(chrome.renderingInstanceId);
    }) as RenderingChrome[];

    const abTestProductionStatusRenderings = abTestRenderings.filter((r) => getAbTestFlow(r.renderingInstanceId)?.status === 'PRODUCTION');

    const contextVariant = this.pageStateReader.getHorizonPageState().variant;
    const abTestWithContextVariantRenderings = contextVariant
      ? abTestRenderings.filter((r) => isAbTestHasVariant(r.renderingInstanceId, contextVariant))
      : [];

    const isAbTestConfiguredOnPage = abTestRenderings.length > 0;
    if (isAbTestConfiguredOnPage) {
      this.chromeManager.chromes.forEach((chrome) => {
        const rendering = isRenderingChrome(chrome) ? chrome : findClosestParentRendering(chrome);
        const renderingHasAbTest = rendering && abTestRenderings.includes(rendering);
        if (!renderingHasAbTest) {
          return;
        }

        if (abTestProductionStatusRenderings.includes(rendering)) {
          this.chromesToDisableMap.set(chrome.chromeId, rendering);
          return;
        }

        if (abTestWithContextVariantRenderings.includes(rendering) && rendering.appliedPersonalizationActions.length === 0) {
          this.chromesToDisableMap.set(chrome.chromeId, rendering);
        }
      });
    } else if (this.pageStateReader.getHorizonPageState().variant) {
      this.chromeManager.chromes.forEach((chrome) => {
        const rendering = isRenderingChrome(chrome) ? chrome : findClosestParentRendering(chrome);
        if (rendering && rendering.appliedPersonalizationActions.length === 0) {
          this.chromesToDisableMap.set(chrome.chromeId, rendering);
        }
      });
    }
  }

  private renderSelectedChromeOverlay(chrome: Chrome) {
    this.removeHoverChromeOverlay();
    this.removeSelectChromeOverlay();

    const chromeToDisable = this.chromesToDisableMap.get(chrome.chromeId);
    if (chromeToDisable) {
      this.selectChromeOverlay = new DisableChromeOverlay(chromeToDisable, this.abortController);
      this.selectChromeOverlay.render();
    }
  }

  private renderHoverChromeOverlay(chrome: Chrome) {
    this.removeHoverChromeOverlay();

    if (chrome === this.selectChromeOverlay?.chrome || chrome.parentChrome === this.selectChromeOverlay?.chrome) {
      return;
    }

    const chromeToDisable = this.chromesToDisableMap.get(chrome.chromeId);
    if (chromeToDisable) {
      this.hoverChromeOverlay = new DisableChromeOverlay(chromeToDisable, this.abortController);
      this.hoverChromeOverlay.render();
    }
  }

  private removeSelectChromeOverlay() {
    this.selectChromeOverlay?.remove();
    this.selectChromeOverlay = undefined;
  }

  private removeHoverChromeOverlay() {
    this.hoverChromeOverlay?.remove();
    this.hoverChromeOverlay = undefined;
  }
}
