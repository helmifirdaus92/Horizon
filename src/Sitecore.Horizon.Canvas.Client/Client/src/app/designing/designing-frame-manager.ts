/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeDom } from '../chrome/chrome-dom';
import { PlaceholderChrome } from '../chrome/chrome.placeholder';
import { RenderingChrome } from '../chrome/chrome.rendering';
import { FrameManager } from '../frame/frame-manager';
import { EventEmitter } from '../messaging/event-emitter';
import { PlacementAnchorPosition } from '../utils/placement-anchor';
import { DropTarget } from './designing-manager';
import { PlaceholderDroppingFrame } from './placeholder-dropping-frame';
import { RenderingDropZone } from './rendering-drop-zone';
import { RenderingDroppingFrame } from './rendering-dropping-frame';

export interface AuxiliaryDropZone {
  readonly element: Element;
  readonly position: PlacementAnchorPosition;
}

function withAnchorPosition(target: DropTarget, position: PlacementAnchorPosition): DropTarget {
  if (!target.anchor || target.anchor.position === position) {
    return target;
  }

  return { ...target, anchor: { ...target.anchor, position } };
}

export class DesigningFrameManager {
  private readonly chromeToFrameMap: Map<
    PlaceholderChrome,
    { droppable?: PlaceholderDroppingFrame; nonDroppable?: PlaceholderDroppingFrame }
  > = new Map();

  private beforeRenderingGuideDropZone: RenderingDropZone | null = null;
  private afterRenderingGuideDropZone: RenderingDropZone | null = null;

  private currentPlaceholderHighlightFrame: PlaceholderDroppingFrame | null = null;
  private currentRenderingDropZoneFrame: RenderingDroppingFrame | null = null;
  private overlay: HTMLElement | undefined;

  private readonly _onAddNativeDropZoneElement = new EventEmitter<{
    element: Element;
    dropTarget: DropTarget;
  }>();
  readonly onAddNativeDropZoneElement = this._onAddNativeDropZoneElement.asSource();
  isEmptyPlaceholderFrame?: boolean;

  constructor(
    private readonly chromeDom: ChromeDom,
    private readonly frameManager: FrameManager,
    private readonly abortController: AbortController,
  ) {}

  showGuideDropZones(chrome: RenderingChrome) {
    if (this.beforeRenderingGuideDropZone?.renderingChrome === chrome && this.afterRenderingGuideDropZone?.renderingChrome === chrome) {
      return;
    }

    this.hideGuideDropZones();
    this.beforeRenderingGuideDropZone = new RenderingDropZone(chrome, 'before');
    this.afterRenderingGuideDropZone = new RenderingDropZone(chrome, 'after');

    this.frameManager.highlight(chrome);
    this.beforeRenderingGuideDropZone.show(this.chromeDom.root);
    this.afterRenderingGuideDropZone.show(this.chromeDom.root);
  }

  hideGuideDropZones() {
    if (!this.beforeRenderingGuideDropZone && !this.afterRenderingGuideDropZone) {
      return;
    }

    this.frameManager.unhighlight();
    this.beforeRenderingGuideDropZone?.hide();
    this.beforeRenderingGuideDropZone = null;

    this.afterRenderingGuideDropZone?.hide();
    this.afterRenderingGuideDropZone = null;
  }

  highlight(dropTarget: DropTarget, canDrop: boolean): void {
    if (dropTarget.anchor) {
      this.isEmptyPlaceholderFrame = false;
      this.highlightPlaceholder(dropTarget.placeholder, canDrop);
      this.addRenderingDropMarkers(dropTarget.anchor.target, dropTarget.anchor.position, canDrop, dropTarget);
    } else {
      this.clearRenderingDropMark();
      this.isEmptyPlaceholderFrame = true;
      this.highlightPlaceholder(dropTarget.placeholder, canDrop);
    }
  }

  unhighlight(): void {
    this.stopDropAnimation();
    this.clearRenderingDropMark();
  }

  animateDrop(chrome: PlaceholderChrome): void {
    if (!this.currentPlaceholderHighlightFrame) {
      this.currentPlaceholderHighlightFrame = new PlaceholderDroppingFrame(this.abortController, chrome, 'dropped');
    }

    this.currentPlaceholderHighlightFrame.show(this.chromeDom.root);

    // Add overlay to prevent further interaction with page. Expect page reload to happen.
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.zIndex = '1000';

    this.overlay = overlay;
    this.chromeDom.root.appendChild(this.overlay);
  }

  stopDropAnimation(): void {
    this.currentPlaceholderHighlightFrame?.hide();
    this.currentPlaceholderHighlightFrame = null;
    this.overlay?.remove();
    this.overlay = undefined;
  }

  private highlightPlaceholder(chrome: PlaceholderChrome, canDrop: boolean): void {
    if (this.currentPlaceholderHighlightFrame && this.currentPlaceholderHighlightFrame.chrome === chrome) {
      // Do nothing - same frame is already highlighted.
      return;
    }

    this.unhighlight();

    this.currentPlaceholderHighlightFrame = this.getOrCreatePlaceholderFrame(chrome, canDrop ? 'droppable' : 'non-droppable');
    this.currentPlaceholderHighlightFrame.show(this.chromeDom.root);
  }

  private addRenderingDropMarkers(
    rendering: RenderingChrome,
    position: PlacementAnchorPosition,
    canDrop: boolean,
    dropTarget: DropTarget,
  ): void {
    if (
      this.currentRenderingDropZoneFrame &&
      this.currentRenderingDropZoneFrame.rendering === rendering &&
      this.currentRenderingDropZoneFrame.position === position &&
      this.currentRenderingDropZoneFrame.canDrop === canDrop
    ) {
      // Do nothing - should show same line in same place.
      return;
    }

    this.clearRenderingDropMark();

    this.currentRenderingDropZoneFrame = new RenderingDroppingFrame(
      rendering,
      position,
      canDrop,
      dropTarget.placeholder,
      this.abortController,
    );
    this.currentRenderingDropZoneFrame
      .getAuxiliaryDropZones()
      .forEach((zone) =>
        this._onAddNativeDropZoneElement.emit({ element: zone.element, dropTarget: withAnchorPosition(dropTarget, zone.position) }),
      );

    this.currentRenderingDropZoneFrame.show(this.chromeDom.root);
  }

  private clearRenderingDropMark(): void {
    if (!this.currentRenderingDropZoneFrame) {
      return;
    }

    // Notice, it's important to kill frames once they should be hidden and to not re-use them.
    // The reason is that it's strictly bound to the event which created it, so other components bind to them.
    this.currentRenderingDropZoneFrame.hide();
    this.currentRenderingDropZoneFrame = null;
  }

  private getOrCreatePlaceholderFrame(chrome: PlaceholderChrome, kind: 'droppable' | 'non-droppable'): PlaceholderDroppingFrame {
    let frames = this.chromeToFrameMap.get(chrome);
    if (!frames) {
      frames = {};
      this.chromeToFrameMap.set(chrome, frames);
    }

    switch (kind) {
      case 'droppable':
        if (!frames.droppable) {
          frames.droppable = new PlaceholderDroppingFrame(
            this.abortController,
            chrome,
            'can-drop',
            this.isEmptyPlaceholderFrame,
            chrome.displayName,
          );
        }
        return frames.droppable;

      case 'non-droppable':
        if (!frames.nonDroppable) {
          frames.nonDroppable = new PlaceholderDroppingFrame(
            this.abortController,
            chrome,
            'cannot-drop',
            this.isEmptyPlaceholderFrame,
            chrome.displayName,
          );
        }
        return frames.nonDroppable;
    }
  }
}
