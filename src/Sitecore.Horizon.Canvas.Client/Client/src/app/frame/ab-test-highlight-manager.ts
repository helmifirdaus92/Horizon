/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Chrome } from '../chrome/chrome';
import { ChromeManager } from '../chrome/chrome-manager';
import { isPlaceholderChrome } from '../chrome/chrome.placeholder';
import { isRenderingChrome } from '../chrome/chrome.rendering';
import { findClosestParentRendering, isAbTestConfigured } from '../utils/chrome';
import { setElementDimensions } from '../utils/dom';
import { renderIconElement } from '../utils/icon';
import { HighlightFrame } from './highlight-frame';
import style from './personalization-labels.scss';

export class AbTestHighlightManager {
  private labels: Map<Chrome, HTMLElement> = new Map();

  constructor(
    private readonly chromeManager: ChromeManager,
    private readonly abortController: AbortController,
  ) {
    this.abortController.signal.addEventListener('abort', () => {
      this.labels.forEach((label) => {
        label.remove();
      });
    });
  }

  renderLabels() {
    this.chromeManager.chromes.forEach((chrome) => {
      if (isRenderingChrome(chrome) && isAbTestConfigured(chrome.renderingInstanceId)) {
        const frame: HighlightFrame = this.renderFrame(chrome);
        const label: HTMLDivElement = this.renderLabel(chrome);

        this.labels.set(chrome, label);

        chrome.onSizeChange.on(() => {
          this.updatePosition(chrome, label, frame);
        });
        window.addEventListener('resize', () => this.updatePosition(chrome, label, frame));
      }
    });
  }

  showAllLabels() {
    this.labels.forEach((l) => {
      l.style.display = 'flex';
    });
  }

  hideLabel(chrome: Chrome) {
    this.showAllLabels();

    const renderingChrome = isRenderingChrome(chrome)
      ? chrome
      : !isPlaceholderChrome(chrome)
        ? findClosestParentRendering(chrome)
        : undefined;
    if (renderingChrome) {
      const labelToHide = this.labels.get(renderingChrome);
      if (labelToHide) {
        labelToHide.style.display = 'none';
      }
    }
  }

  private renderLabel(chrome: Chrome): HTMLDivElement {
    const rootElement = document.createElement('div');
    rootElement.className = style['sc-personalization-label-root'];

    const containerElement = document.createElement('div');
    containerElement.className = style['sc-personalization-label-ab-test'];
    containerElement.addEventListener(
      'mousedown',
      (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        chrome.select();
      },
      { signal: this.abortController.signal },
    );
    rootElement.appendChild(containerElement);

    const iconElement = document.createElement('div');
    const icon = 'testComponent';
    iconElement.innerHTML = renderIconElement(icon);
    iconElement.className = style['icon'];
    iconElement.classList.add(style['test-component']);
    containerElement.appendChild(iconElement);
    window.document.body.appendChild(rootElement);

    return rootElement;
  }

  private renderFrame(chrome: Chrome): HighlightFrame {
    // Remove the frame if it already created on the same chrome
    const abTestFrame = document.querySelector(`[data-instance-id="${chrome.chromeId}"]`);
    if (abTestFrame) {
      abTestFrame.remove();
    }

    const frame = new HighlightFrame(chrome, 'ab-test', chrome.chromeId);
    frame.show(window.document.body);
    return frame;
  }

  private updatePosition(chrome: Chrome, icon: HTMLElement, frame: HighlightFrame) {
    const dimensions = chrome.getDimensions();
    setElementDimensions(icon, {
      top: dimensions.top,
      left: dimensions.left,
      width: dimensions.width,
    });

    frame.updatePosAndSize();
  }
}
