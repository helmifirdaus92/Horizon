/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeHighlighter } from '../chrome/chrome-highlighter';
import { ChromeManager } from '../chrome/chrome-manager';
import { isRenderingChrome } from '../chrome/chrome.rendering';
import { AbTestHighlightManager } from '../frame/ab-test-highlight-manager';
import { FrameManager } from '../frame/frame-manager';
import { PersonalizationLabelsManager } from '../frame/personalization-labels-manager';
import { ConfigurationService } from '../services/configuration.service';
import { isAbTestConfigured } from '../utils/chrome';
import { Wiring } from './wiring';

export class ChromeHighlightingFramesWiring implements Wiring {
  constructor(
    private readonly chromeManager: ChromeManager,
    private readonly chromeHighlighter: ChromeHighlighter,
    private readonly frameManager: FrameManager,
    private readonly personalizationLabelsManager: PersonalizationLabelsManager,
    private readonly abTestHighlightManager: AbTestHighlightManager,
  ) {}

  wire(): void {
    this.initCommonHighlighting();

    const pageHasAbTestConfigured = this.chromeManager.chromes.some((chrome) =>
      isRenderingChrome(chrome) ? isAbTestConfigured(chrome.renderingInstanceId) : false,
    );
    if (pageHasAbTestConfigured) {
      this.initAbTestHighlighting();
    } else {
      this.initPersonalizationHighlighting();
    }
  }

  private initCommonHighlighting() {
    this.chromeHighlighter.onEnter.on((chrome) => this.frameManager.highlight(chrome));
    this.chromeHighlighter.onLeave.on(() => this.frameManager.unhighlight());

    this.chromeHighlighter.onSelect.on((chrome) => {
      this.frameManager.select(chrome);
    });
    this.chromeHighlighter.onDeselect.on(() => {
      this.frameManager.deselect();
    });
  }

  private initAbTestHighlighting() {
    this.abTestHighlightManager.renderLabels();

    this.chromeHighlighter.onSelect.on((chrome) => {
      this.abTestHighlightManager.hideLabel(chrome);
    });

    this.chromeHighlighter.onDeselect.on(() => {
      this.abTestHighlightManager.showAllLabels();
    });
  }

  private initPersonalizationHighlighting() {
    if (!!ConfigurationService.activeVariant) {
      this.personalizationLabelsManager.renderLabels();
    }

    this.chromeHighlighter.onSelect.on((chrome) => {
      this.personalizationLabelsManager.handleChromeSelect(chrome);
    });

    this.chromeHighlighter.onDeselect.on(() => {
      this.personalizationLabelsManager.handleChromeSelect(undefined);
    });
  }
}
