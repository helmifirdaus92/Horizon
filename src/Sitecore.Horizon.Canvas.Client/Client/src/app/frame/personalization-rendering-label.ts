/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Chrome } from '../chrome/chrome';
import { TranslationService } from '../services/translation.service';
import { setElementDimensions } from '../utils/dom';
import { renderIconElement } from '../utils/icon';
import style from './personalization-labels.scss';

export class PersonalizationRenderingLabel {
  private readonly rootElement: HTMLElement;
  private readonly containerElement: HTMLDivElement;
  private readonly iconElement: HTMLSpanElement;
  private readonly textElement: HTMLDivElement;

  constructor(
    private readonly chrome: Chrome,
    private readonly abortController: AbortController,
  ) {
    this.rootElement = document.createElement('div');
    this.rootElement.className = style['sc-personalization-label-root'];

    this.containerElement = document.createElement('div');
    this.containerElement.className = style['sc-personalization-label'];
    if (!chrome.getIsPersonalized()) {
      this.containerElement.className += ` ${style['not-personalized']}`;
    }

    this.containerElement.addEventListener(
      'mousedown',
      (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        this.chrome.select();
      },
      { signal: this.abortController.signal },
    );
    this.rootElement.appendChild(this.containerElement);

    this.iconElement = document.createElement('div');
    const icon = chrome.getIsPersonalized() ? 'target-account' : 'target';
    this.iconElement.innerHTML = renderIconElement(icon);
    this.iconElement.className = style['icon'];
    this.iconElement.classList.add(style['target-account']);
    if (!chrome.getIsPersonalized()) {
      this.iconElement.className += ` ${style['not-personalized']}`;
      this.iconElement.classList.add(style['target']);
    }
    this.containerElement.appendChild(this.iconElement);

    this.textElement = document.createElement('div');
    this.textElement.className = style['text'];
    const text = chrome.getIsPersonalized()
      ? TranslationService.get('RENDERING_IS_PERSONALIZED').replace('{{renderingName}}', chrome.displayName)
      : TranslationService.get('RENDERING_IS_NOT_PERSONALIZED').replace('{{renderingName}}', chrome.displayName);
    this.textElement.innerText = text;
    this.containerElement.addEventListener(
      'mouseover',
      (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        this.containerElement.appendChild(this.textElement);
      },
      { signal: this.abortController.signal },
    );
    this.containerElement.addEventListener(
      'mouseleave',
      (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        this.containerElement.removeChild(this.textElement);
      },
      { signal: this.abortController.signal },
    );

    window.document.body.appendChild(this.rootElement);
  }

  show() {
    const dimensions = this.chrome.getDimensions();
    setElementDimensions(this.rootElement, {
      top: dimensions.top,
      left: dimensions.left,
      width: dimensions.width,
    });
  }

  hide() {
    setElementDimensions(this.rootElement, { left: -2000 });
  }
}
