/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { PlaceholderChrome } from '../chrome/chrome.placeholder';
import { RenderingChrome } from '../chrome/chrome.rendering';
import { Frame } from '../frame/frame';
import { TranslationService } from '../services/translation.service';
import { PlacementAnchorPosition } from '../utils/placement-anchor';
import { AuxiliaryDropZone } from './designing-frame-manager';
import { NotificationBlock } from './notification';
import { RenderingDropMarkerLine } from './rendering-drop-marker-line';
import { RenderingDropOutline } from './rendering-drop-outline';
import { RenderingDropZone } from './rendering-drop-zone';

export class RenderingDroppingFrame implements Frame {
  private readonly dropZone: RenderingDropZone;
  private readonly dropMarkerLine?: RenderingDropMarkerLine;
  private readonly outline?: RenderingDropOutline;
  private readonly errorBlock?: NotificationBlock;

  constructor(
    public readonly rendering: RenderingChrome,
    public readonly position: PlacementAnchorPosition,
    public readonly canDrop: boolean,
    placeholder: PlaceholderChrome,
    private readonly abortController: AbortController,
  ) {
    // When we cannot drop to the rendering, we still create transparent drop zone.
    // The reason is that drop zone serves for two purposes:
    //    - visual indication about drop zone boundaries
    //    - cursor lock, so when it moves through the area it's always in droppable area.
    //      That matters when rendering has gaps, so rendering under cursor constantly changes. Not anymore.

    this.dropZone = new RenderingDropZone(rendering, position, canDrop);
    this.dropMarkerLine = new RenderingDropMarkerLine(rendering, position, canDrop);
    this.outline = new RenderingDropOutline(rendering, position, placeholder, this.dropMarkerLine, this.abortController, canDrop);

    if (!canDrop) {
      this.errorBlock = new NotificationBlock(rendering, position);
      this.errorBlock.text = TranslationService.get('RENDERING_ERROR');
    }
  }

  show(host: Element): void {
    this.dropZone.show(host);

    if (this.dropMarkerLine) {
      this.dropMarkerLine.show(host);
    }

    if (this.outline) {
      this.outline.show(host);
    }

    if (this.errorBlock) {
      this.errorBlock.attach(this.dropZone.nativeElement);
    }
  }

  hide(): void {
    this.dropZone.hide();

    if (this.dropMarkerLine) {
      this.dropMarkerLine.hide();
    }

    if (this.outline) {
      this.outline.hide();
    }

    if (this.errorBlock) {
      this.errorBlock.detach();
    }
  }

  updatePosAndSize(): void {
    this.dropZone.updatePosAndSize();

    if (this.dropMarkerLine) {
      this.dropMarkerLine.updatePosAndSize();
    }

    if (this.outline) {
      this.outline.updatePosition();
    }
  }

  getAuxiliaryDropZones(): readonly AuxiliaryDropZone[] {
    return [
      { element: this.dropZone.nativeElement, position: this.position },
      ...(this.dropMarkerLine ? [{ element: this.dropMarkerLine.nativeElement, position: this.position }] : []),
      ...(this.outline ? this.outline.getAuxiliaryDropZones() : []),
    ];
  }
}
