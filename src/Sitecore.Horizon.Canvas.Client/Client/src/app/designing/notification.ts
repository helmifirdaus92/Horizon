/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { PlaceholderChrome } from '../chrome/chrome.placeholder';
import { RenderingChrome } from '../chrome/chrome.rendering';
import { PlacementAnchorPosition } from '../utils/placement-anchor';
import style from './notification.scss';
import { RenderingDropZonesUtil } from './rendering-drop-zones-util';

export class NotificationBlock {
  private readonly notificationWrapper: HTMLDivElement;
  private readonly messageEl: HTMLSpanElement;
  private readonly dropZoneUtil: RenderingDropZonesUtil;

  get text(): string {
    return this.messageEl.innerText;
  }
  set text(value: string) {
    this.messageEl.innerText = value;
  }

  constructor(
    private readonly chrome: RenderingChrome | PlaceholderChrome,
    private readonly placement?: PlacementAnchorPosition,
  ) {
    this.dropZoneUtil = new RenderingDropZonesUtil();

    // Wrapper element
    this.notificationWrapper = document.createElement('div');
    this.notificationWrapper.className = style['sc-error-block'];

    // Message text element
    this.messageEl = document.createElement('span');
    this.messageEl.className = style['sc-error-text'];
    this.messageEl.innerText = this.text;

    this.notificationWrapper.appendChild(this.messageEl);
  }

  attach(host: Element): void {
    host.appendChild(this.notificationWrapper);
    this.setWrapperDimension();
  }

  detach(): void {
    this.notificationWrapper.remove();
  }

  private setWrapperDimension(): void {
    const chromeDimensions = this.chrome.getDimensions();

    const dropZoneSizeAndPos = this.dropZoneUtil.getDropZoneSize(this.chrome);

    if (this.placement === 'before') {
      this.notificationWrapper.style.top = dropZoneSizeAndPos.height + 10 + 'px';
    }
    if (this.placement === 'after') {
      this.notificationWrapper.style.bottom = dropZoneSizeAndPos.height + 10 + 'px';
    }
    if (chromeDimensions.top < 40 && chromeDimensions.height < 80) {
      // It happens that when bottom is specified for the element, top get ignored so to
      // solve this issue, remove the bottom first and set the top value.
      this.notificationWrapper.style.removeProperty('bottom');
      this.notificationWrapper.style.top = dropZoneSizeAndPos.height + 10 + 'px';
    }
    if (chromeDimensions.width < 350) {
      if (this.isInVisibleZone()) {
        this.notificationWrapper.style.left = chromeDimensions.width + 10 + 'px';
      } else {
        this.notificationWrapper.style.right = chromeDimensions.width + 10 + 'px';
      }
    }
  }

  private isInVisibleZone(): boolean {
    // First remove the previously defined value for right and left to correctly position the element,
    // as in some case it may happen that host frame has its on configure position and
    // because of that child element property may not be set properly.
    this.notificationWrapper.style.removeProperty('right');
    this.notificationWrapper.style.removeProperty('left');

    const blockPosAndSize = this.notificationWrapper.getBoundingClientRect();
    const windowWidth = document.documentElement.clientWidth + window.pageXOffset;
    return blockPosAndSize.right <= windowWidth;
  }
}
