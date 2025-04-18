/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import Popper from 'popper.js';
import { PlaceholderChrome } from '../chrome/chrome.placeholder';
import { RenderingChrome } from '../chrome/chrome.rendering';
import { OutlineTheme, PageElementOutlineComponent } from '../frame/page-element-outline.component';
import { PlacementAnchorPosition } from '../utils/placement-anchor';
import { AuxiliaryDropZone } from './designing-frame-manager';
import { RenderingDropMarkerLine } from './rendering-drop-marker-line';
import { RenderingDropZonesUtil } from './rendering-drop-zones-util';

interface OutlineWithPopper {
  outline: PageElementOutlineComponent;
  popper: Popper;
  position: PlacementAnchorPosition;
}

export class RenderingDropOutline {
  private primaryOutline: OutlineWithPopper;
  private secondaryOutline?: OutlineWithPopper;

  constructor(
    private readonly rendering: RenderingChrome,
    position: PlacementAnchorPosition,
    placeholder: PlaceholderChrome,
    dropMarkerLine: RenderingDropMarkerLine,
    private readonly abortController: AbortController,
    canDrop: boolean,
  ) {
    this.primaryOutline = this.createOutline(position, placeholder.displayName, dropMarkerLine, canDrop);

    const dropZoneSize = new RenderingDropZonesUtil().getDropZoneSize(rendering);
    if (dropZoneSize.fullSpace) {
      this.secondaryOutline = this.createOutline(
        position === 'before' ? 'after' : 'before',
        placeholder.displayName,
        dropMarkerLine,
        canDrop,
      );
    }
  }

  show(host: Node): void {
    this.primaryOutline.outline.attach(host);
    if (this.secondaryOutline) {
      this.secondaryOutline.outline.attach(host);
    }

    this.updatePosition();
  }

  hide(): void {
    this.primaryOutline.outline.detach();
    if (this.secondaryOutline) {
      this.secondaryOutline.outline.detach();
    }
  }

  updatePosition(): void {
    this.primaryOutline.popper.update();
    if (this.secondaryOutline) {
      this.secondaryOutline.popper.update();
    }
  }

  getAuxiliaryDropZones(): readonly AuxiliaryDropZone[] {
    const result = [{ element: this.primaryOutline.outline.containerElement, position: this.primaryOutline.position }];
    if (this.secondaryOutline) {
      result.push({ element: this.secondaryOutline.outline.containerElement, position: this.secondaryOutline.position });
    }

    return result;
  }

  private createOutline(
    position: PlacementAnchorPosition,
    placeholderName: string,
    dropMarkerLine: RenderingDropMarkerLine,
    canDrop: boolean,
  ): OutlineWithPopper {
    const outline = new PageElementOutlineComponent(this.abortController, this.rendering);
    outline.text = placeholderName;
    outline.enableEvents = true;

    let currentState: OutlineTheme = 'default';

    currentState = canDrop ? 'focused' : 'error';

    outline.state = currentState;

    const markerLineElement = dropMarkerLine.nativeElement;

    // In either state i.e. can-drop and cannot-drop we will set marker line as the anchor element.
    const anchorElement = markerLineElement;

    const popper = new Popper(anchorElement, outline.containerElement, {
      placement: position === 'before' ? 'top-start' : 'bottom-start',
      eventsEnabled: false,
      modifiers: {
        preventOverflow: {
          padding: 0,
        },
      },
    });

    return {
      outline,
      popper,
      position,
    };
  }
}
