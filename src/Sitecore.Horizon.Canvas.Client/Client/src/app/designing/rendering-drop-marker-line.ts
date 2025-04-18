/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeHighlightFrameSource } from '../chrome/chrome';
import { Frame } from '../frame/frame';
import { ElementDimensions, setElementDimensions } from '../utils/dom';
import { PlacementAnchorPosition } from '../utils/placement-anchor';
import style from './rendering-drop-marker-line.scss';

const LINE_HEIGHT = 5;

export class RenderingDropMarkerLine implements Frame {
  readonly nativeElement: HTMLElement;

  constructor(
    private readonly chromeHighlightFrameSource: ChromeHighlightFrameSource,
    private readonly position: PlacementAnchorPosition,
    private readonly canDrop = true,
  ) {
    this.nativeElement = document.createElement('div');
    this.nativeElement.className = style['sc-rendering-drop-marker-line'];
    if (!this.canDrop) {
      this.nativeElement.className += ` ${style['error-state']}`;
    }
  }

  static isLineCentered(renderingDimensions: ElementDimensions): boolean {
    return renderingDimensions.height <= LINE_HEIGHT;
  }

  show(host: Element): void {
    this.updatePosAndSize();
    host.appendChild(this.nativeElement);
  }

  hide(): void {
    this.nativeElement.remove();
  }

  updatePosAndSize(): void {
    const dimensions = this.chromeHighlightFrameSource.getDimensions();

    const linePlacement = RenderingDropMarkerLine.isLineCentered(dimensions) ? 'center' : this.position;

    let topOffset: number = dimensions.top; // Assign as TS doesn't understand that we checked all cases.
    switch (linePlacement) {
      case 'before':
        topOffset = dimensions.top;
        break;

      case 'center':
        topOffset = dimensions.top + (dimensions.height - LINE_HEIGHT) / 2;
        break;

      case 'after':
        topOffset = dimensions.top + dimensions.height - LINE_HEIGHT;
        break;
    }

    setElementDimensions(this.nativeElement, {
      top: topOffset,
      left: dimensions.left,
      height: LINE_HEIGHT,
      width: Math.max(20, dimensions.width),
    });
  }
}
