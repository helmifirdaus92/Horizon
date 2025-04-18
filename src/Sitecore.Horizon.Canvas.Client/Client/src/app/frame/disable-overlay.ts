/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Chrome } from '../chrome/chrome';
import { setElementDimensions } from '../utils/dom';
import style from './frame.scss';

export type HighlightFrameStyle = 'default' | 'personalized' | 'non-personalized';

export class DisableChromeOverlay {
  protected frameElement: HTMLElement;

  constructor(
    readonly chrome: Chrome,
    private readonly abortController: AbortController,
  ) {
    this.frameElement = document.createElement('div');
    this.frameElement.className = style['disable-frame'];
  }

  render(): void {
    this.frameElement.addEventListener(
      'mousedown',
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.chrome.select();
      },
      { signal: this.abortController.signal },
    );

    this.chrome.onSizeChange.on(() => {
      setElementDimensions(this.frameElement, this.chrome.getDimensions());
    });

    document.body.appendChild(this.frameElement);
    setElementDimensions(this.frameElement, this.chrome.getDimensions());
  }

  remove(): void {
    this.frameElement.remove();
  }
}
