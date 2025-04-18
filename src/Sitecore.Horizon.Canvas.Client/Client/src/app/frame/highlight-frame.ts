/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeHighlightFrameSource } from '../chrome/chrome';
import { setElementDimensions } from '../utils/dom';
import { Frame } from './frame';
import style from './frame.scss';

export type HighlightFrameStyle = 'default' | 'personalized' | 'ab-test' | 'non-personalized';

export class HighlightFrame implements Frame {
  protected frameElement: HTMLElement;

  constructor(
    private readonly highlightFrameSource: ChromeHighlightFrameSource,
    frameStyle?: HighlightFrameStyle,
    instanceId?: string,
  ) {
    this.frameElement = document.createElement('div');
    this.frameElement.className = style['sc-frame'];
    if (highlightFrameSource.getIsPersonalized()) {
      this.frameElement.className += ` ${style['sc-personalized']}`;
    }
    if (instanceId) {
      this.frameElement.setAttribute('data-instance-id', instanceId);
    }

    if (frameStyle) {
      if (frameStyle === 'non-personalized') {
        this.frameElement.className += ` ${style['sc-non-personalized']}`;
      } else if (frameStyle === 'personalized') {
        this.frameElement.className += ` ${style['sc-personalized']}`;
      }
    }
  }

  show(host: Element): void {
    host.appendChild(this.frameElement);
    this.updatePosAndSize();
  }

  hide(): void {
    this.frameElement.remove();
  }

  updatePosAndSize(): void {
    const dimensions = this.highlightFrameSource.getDimensions();
    // Extend frame 2px left to prevent overlapping of an input caret if there is needed space
    if (dimensions.left >= 2) {
      dimensions.left -= 2;
      dimensions.width += 2;
    }

    setElementDimensions(this.frameElement, dimensions);
  }
}
