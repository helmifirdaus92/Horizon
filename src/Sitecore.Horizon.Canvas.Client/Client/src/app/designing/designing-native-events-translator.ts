/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Chrome } from '../chrome/chrome';
import { ChromeDom } from '../chrome/chrome-dom';
import { RenderingChrome } from '../chrome/chrome.rendering';
import { EventEmitter } from '../messaging/event-emitter';
import { DragInfo } from '../messaging/horizon-canvas.contract.parts';
import { setupChromeEventsHierarchically } from '../utils/chrome';

const FIND_CHROME_EVENT = 'horizon:designing:find-rendering';
interface FindChromeEventDetail {
  hit?: { type: 'native'; chrome: Chrome } | { type: 'custom'; data: unknown };
}

export interface DesigningHitEvent {
  readonly renderingDefinitionId: string;
  readonly movedRendering?: RenderingChrome;
  readonly hit: { type: 'native'; chrome: Chrome; clientY: number } | { type: 'custom'; data: unknown };
}

export class DesigningNativeEventsTranslator {
  private readonly _onDragStart = new EventEmitter();
  readonly onDragStart = this._onDragStart.asSource();

  private readonly _onDrop = new EventEmitter<DesigningHitEvent>();
  readonly onDrop = this._onDrop.asSource();

  private readonly _onDragOver = new EventEmitter<DesigningHitEvent>();
  readonly onDragOver = this._onDragOver.asSource();

  private readonly _onDragLeave = new EventEmitter();
  readonly onDragLeave = this._onDragLeave.asSource();

  constructor(private readonly chromeDom: ChromeDom, private readonly abortController: AbortController) {}

  setupEvents(chromes: readonly Chrome[]): void {
    const registerHit = (element: Element, chrome: Chrome) => {
      element.addEventListener(
        FIND_CHROME_EVENT,
        (ev) => {
          const event = ev as CustomEvent<FindChromeEventDetail>;
          event.stopPropagation();

          event.detail.hit = { type: 'native', chrome };
        },
        { signal: this.abortController.signal },
      );
    };
    setupChromeEventsHierarchically(chromes, {
      field: registerHit,
      rendering: registerHit,
      placeholder: registerHit,
    });
  }

  registerCustomDropZone(element: Element, data: unknown): void {
    element.addEventListener(
      FIND_CHROME_EVENT,
      (ev) => {
        const event = ev as CustomEvent<FindChromeEventDetail>;
        event.stopPropagation();

        event.detail.hit = { type: 'custom', data };
      },
      { signal: this.abortController.signal },
    );
  }

  onNativeDragStart(): void {
    this._onDragStart.emit();
  }

  onNativeDragOver(dragInfo: DragInfo): void {
    const hit = this.resolveHit(dragInfo);

    // If we cannot find chromes under cursor, behave like something out of region was highlighted.
    if (!hit) {
      this._onDragLeave.emit();
      return;
    }

    if (hit.type === 'custom') {
      this._onDragOver.emit({
        renderingDefinitionId: dragInfo.renderingId,
        movedRendering: dragInfo.movedRendering,
        hit: { type: 'custom', data: hit.data },
      });
      return;
    }

    this._onDragOver.emit({
      renderingDefinitionId: dragInfo.renderingId,
      movedRendering: dragInfo.movedRendering,
      hit: { type: 'native', chrome: hit.chrome, clientY: dragInfo.clientY },
    });
  }

  onNativeDrop(dragInfo: DragInfo): void {
    const hit = this.resolveHit(dragInfo);

    // If we cannot find element under cursor, behave like user cancelled the operation.
    if (!hit) {
      this._onDragLeave.emit();
      return;
    }

    if (hit.type === 'custom') {
      this._onDrop.emit({
        renderingDefinitionId: dragInfo.renderingId,
        movedRendering: dragInfo.movedRendering,
        hit: { type: 'custom', data: hit.data },
      });
      return;
    }

    this._onDrop.emit({
      renderingDefinitionId: dragInfo.renderingId,
      movedRendering: dragInfo.movedRendering,
      hit: { type: 'native', chrome: hit.chrome, clientY: dragInfo.clientY },
    });
  }

  onNativeDragLeave(): void {
    this._onDragLeave.emit();
  }

  onNativeDragEnd(): void {
    this._onDragLeave.emit();
  }

  private resolveHit(dragInfo: DragInfo): FindChromeEventDetail['hit'] | undefined {
    const elementsFromPoint = this.chromeDom.elementsFromPoint(dragInfo.clientX, dragInfo.clientY);
    const destinationElement = this.isDesigningOverlayPresentOnPage(dragInfo) ? elementsFromPoint[1] : elementsFromPoint[0];

    if (!destinationElement) {
      return undefined;
    }

    const eventDetail: FindChromeEventDetail = {};
    destinationElement.dispatchEvent(
      new CustomEvent<FindChromeEventDetail>(FIND_CHROME_EVENT, {
        bubbles: true,
        cancelable: true,
        detail: eventDetail,
      }),
    );

    return eventDetail.hit;
  }

  private isDesigningOverlayPresentOnPage(dragInfo: DragInfo): boolean {
    return !!dragInfo.movedRendering;
  }
}
