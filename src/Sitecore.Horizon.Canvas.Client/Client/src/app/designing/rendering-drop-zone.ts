/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { RenderingChrome } from '../chrome/chrome.rendering';
import { HighlightFrame } from '../frame/highlight-frame';
import { setElementDimensions } from '../utils/dom';
import { PlacementAnchorPosition } from '../utils/placement-anchor';
import style from './rendering-drop-zone.scss';
import { RenderingDropZonesUtil } from './rendering-drop-zones-util';

export class RenderingDropZone extends HighlightFrame {
  private readonly dropZoneUtil: RenderingDropZonesUtil;
  isPointerInDropZone?: boolean;

  get nativeElement(): HTMLElement {
    return this.frameElement;
  }

  constructor(readonly renderingChrome: RenderingChrome, readonly placement: PlacementAnchorPosition, canDrop?: boolean) {
    super(renderingChrome);

    this.frameElement.className = style['sc-rendering-drop-zone'];
    if (canDrop === undefined) {
      this.frameElement.classList.add(style['notDefinedCanDrop']);
    } else if (!canDrop) {
      this.frameElement.classList.add(style['error']);
    }

    this.dropZoneUtil = new RenderingDropZonesUtil();
    this.isPointerInDropZone = canDrop
  }

  updatePosAndSize(): void {
    const chromeDimensions = this.renderingChrome.getDimensions();

    const dropZoneSizeAndPos = this.isPointerInDropZone
      ? this.dropZoneUtil.getInsertionIndication()
      : this.dropZoneUtil.getDropZoneSize(this.renderingChrome);

    const position = dropZoneSizeAndPos.fullSpace ? 'center' : this.placement;

    let topOffset: number = chromeDimensions.top;
    switch (position) {
      case 'before':
        topOffset = chromeDimensions.top;
        break;

      case 'center':
        topOffset = chromeDimensions.top + (chromeDimensions.height - dropZoneSizeAndPos.height) / 2;
        break;

      case 'after':
        topOffset = chromeDimensions.top + chromeDimensions.height - dropZoneSizeAndPos.height;
        break;
    }

    setElementDimensions(this.frameElement, {
      top: topOffset,
      left: chromeDimensions.left,
      height: dropZoneSizeAndPos.height,
      width: Math.max(20, chromeDimensions.width),
    });
  }
}
