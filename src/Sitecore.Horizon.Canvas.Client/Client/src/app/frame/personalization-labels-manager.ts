/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Chrome } from '../chrome/chrome';
import { ChromeManager } from '../chrome/chrome-manager';
import { isPlaceholderChrome } from '../chrome/chrome.placeholder';
import { isRenderingChrome } from '../chrome/chrome.rendering';
import { findClosestParentRendering } from '../utils/chrome';
import { HighlightFrame } from './highlight-frame';
import { PersonalizationRenderingLabel } from './personalization-rendering-label';

interface LabelWithFrame {
  chrome: Chrome;
  label: PersonalizationRenderingLabel;
  frame: HighlightFrame;
}

export class PersonalizationLabelsManager {
  private labels: Map<string, LabelWithFrame> = new Map();
  private hiddenLabel?: LabelWithFrame;

  constructor(
    private readonly chromeManager: ChromeManager,
    private readonly abortController: AbortController,
  ) {}

  renderLabels() {
    this.chromeManager.chromes.forEach((chrome) => {
      if (this.isTopLevelEditableRendering(chrome)) {
        const frame: HighlightFrame = this.showFrame(chrome);
        const label = new PersonalizationRenderingLabel(chrome, this.abortController);
        label.show();

        this.labels.set(chrome.chromeId, { label, frame, chrome });

        chrome.onSizeChange.on(() => {
          this.updateLabelsPosition(chrome);
        });
        window.addEventListener('resize', () => this.updateLabelsPosition(chrome));
      }
    });
  }

  private updateLabelsPosition(chrome: Chrome) {
    const label = this.labels.get(chrome.chromeId);

    if (label) {
      if (this.hiddenLabel !== label) {
        label.label.show();
      }
      label.frame.updatePosAndSize();
    }
  }

  handleChromeSelect(chrome: Chrome | undefined) {
    if (this.hiddenLabel) {
      this.hiddenLabel.label.show();
      this.hiddenLabel.frame = this.showFrame(this.hiddenLabel.chrome);
      this.hiddenLabel = undefined;
    }

    if (!chrome) {
      return;
    }

    const rendering = isRenderingChrome(chrome) ? chrome : !isPlaceholderChrome(chrome) ? findClosestParentRendering(chrome) : undefined;

    if (!rendering) {
      return;
    }

    const labelToHide = this.labels.get(rendering.chromeId);
    if (labelToHide) {
      labelToHide.label.hide();
      labelToHide.frame.hide();
      this.hiddenLabel = labelToHide;
    }
  }

  private showFrame(chrome: Chrome): HighlightFrame {
    const frameStyle = !chrome.getIsPersonalized() ? 'non-personalized' : undefined;
    const frame = new HighlightFrame(chrome, frameStyle);
    frame.show(window.document.body);
    return frame;
  }

  private isTopLevelEditableRendering(chrome: Chrome) {
    if (!isRenderingChrome(chrome) || !chrome.editable) {
      return false;
    }

    const childPlaceholders = chrome.childChromes.filter((childChrome) => isPlaceholderChrome(childChrome));
    return !childPlaceholders.some((placeholder) => placeholder.childChromes.length);
  }
}
