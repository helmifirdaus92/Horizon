/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { EditorWorkspaceComponent } from '../editor-workspace/editor-workspace.component';

// Using a Symbol to keep this class property private to this file
const DESIGNING_OVERLAY_ONDESTROY = Symbol();

/**
 * This service can render an overlay on top of the iframe
 */
@Injectable({ providedIn: 'root' })
export class DesigningOverlayService {
  constructor(private readonly ngzone: NgZone) {}

  /**
   * Creates an overlay positioned on top of the Editor Iframe
   */
  addOverlayOverIframe(): DesigningOverlay {
    const iframe = EditorWorkspaceComponent.getIframe();

    if (!iframe) {
      throw Error('Editing iframe could not be found');
    }

    // The overlay is a native component and should be created outside Angular.
    // Running it in Angular would degrade performance because frequent dragging events would be attached to ngzone.
    const overlay = this.ngzone.runOutsideAngular(() => new DesigningOverlay());

    iframe.insertAdjacentElement('afterend', overlay.element);

    // Workaround to enable overlay to capture drag events.
    // There is an issue in chromium that will make the iframe capture drag events that should target the overlay.
    // https://bugs.chromium.org/p/chromium/issues/detail?id=923651
    const pointerEventsValue = iframe.style.pointerEvents;
    iframe.style.pointerEvents = 'none';

    overlay[DESIGNING_OVERLAY_ONDESTROY] = () => {
      overlay.element.remove();

      // Undo the workaround
      iframe.style.pointerEvents = pointerEventsValue;
    };

    return overlay;
  }
}

export class DesigningOverlay {
  allowDrop = false;
  readonly element: HTMLElement;

  private readonly _dragenter$ = new Subject<void>();
  private readonly _dragleave$ = new Subject<void>();
  private readonly _dragover$ = new Subject<DragEvent>();
  private readonly _drop$ = new Subject<DragEvent>();

  readonly dragenter$ = this._dragenter$.asObservable();
  readonly dragleave$ = this._dragleave$.asObservable();
  readonly dragover$ = this._dragover$.asObservable();
  readonly drop$ = this._drop$.asObservable();

  [DESIGNING_OVERLAY_ONDESTROY] = () => {};

  constructor() {
    this.element = document.createElement('div');
    this.element.classList.add('designing-page-overlay');
    this.attachEvents();
  }

  destroy() {
    this[DESIGNING_OVERLAY_ONDESTROY]();
  }

  private attachEvents() {
    const el = this.element;
    el.addEventListener('dragenter', (_event) => this._dragenter$.next(undefined));
    el.addEventListener('dragleave', (_event) => this._dragleave$.next(undefined));
    el.addEventListener('dragover', (event) => this.onDragOver(event));
    el.addEventListener('drop', (event) => this._drop$.next(event));
  }

  private onDragOver(event: DragEvent) {
    this._dragover$.next(event);
    if (this.allowDrop) {
      event.preventDefault();
    }
  }
}
