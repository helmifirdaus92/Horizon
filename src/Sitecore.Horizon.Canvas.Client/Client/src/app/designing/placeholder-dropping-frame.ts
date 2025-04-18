/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import Popper from 'popper.js';
import { Chrome } from '../chrome/chrome';
import { PlaceholderChrome } from '../chrome/chrome.placeholder';
import { Frame } from '../frame/frame';
import { OutlineTheme, PageElementOutlineComponent } from '../frame/page-element-outline.component';
import { TranslationService } from '../services/translation.service';
import { setElementDimensions } from '../utils/dom';
import { createChip } from '../utils/popper';
import { NotificationBlock } from './notification';
import style from './placeholder-dropping-frame.scss';

type DropState = 'can-drop' | 'cannot-drop' | 'dropped';
export class PlaceholderDroppingFrame implements Frame {
  private readonly frameElement: HTMLElement;
  private notification?: NotificationBlock;

  private popper?: Popper;
  private outline?: PageElementOutlineComponent;

  constructor(
    private abortController: AbortController,
    public readonly chrome: Chrome,
    state: DropState,
    public readonly isEmptyPlaceholderFrame?: boolean,
    displayName = '',
  ) {
    this.frameElement = document.createElement('div');
    this.frameElement.className = style['sc-designing-frame'];
    this.emptyPlaceholderFrameTweaks(displayName, state);

    switch (state) {
      case 'cannot-drop':
        this.frameElement.className += ` ${style['non-droppable']}`;
        return;

      case 'dropped':
        this.frameElement.innerHTML = `
          <div class="${style['horizon-loading-indicator']}">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          `;
        return;
    }
  }

  private emptyPlaceholderFrameTweaks(displayName: string, dropState: DropState): void {
    if (this.isEmptyPlaceholderFrame) {
      this.frameElement.className += ` ${style['empty-placeholder-frame']}`;
      const placeholderState: OutlineTheme = dropState === 'cannot-drop' ? 'error' : 'default';

      if (placeholderState === 'error') {
        this.notification = new NotificationBlock(this.chrome as PlaceholderChrome);
        this.notification.text = TranslationService.get('RENDERING_ERROR');
      }
      this.addChipToEmptyPlaceholder(displayName, placeholderState);
    }
  }

  private addChipToEmptyPlaceholder(displayName: string, state: OutlineTheme): void {
    this.outline = new PageElementOutlineComponent(this.abortController, this.chrome);
    this.outline.containerElement.className += ` ${style['empty-frame-chip']}`;
    this.outline.text = displayName;
    this.outline.state = state;
    this.popper = createChip(this.frameElement, this.outline.containerElement);
  }

  show(host: Element): void {
    host.appendChild(this.frameElement);
    this.updatePosAndSize();

    if (this.outline) {
      this.outline.attach(host);
    }

    if (this.notification) {
      this.notification.attach(this.frameElement);
    }
  }

  hide(): void {
    this.frameElement.remove();
    if (this.outline) {
      this.outline.detach();
    }
    if (this.notification) {
      this.notification.detach();
    }
  }

  updatePosAndSize(): void {
    setElementDimensions(this.frameElement, this.chrome.getDimensions());
    if (this.popper) {
      this.popper.update();
    }
  }
}
