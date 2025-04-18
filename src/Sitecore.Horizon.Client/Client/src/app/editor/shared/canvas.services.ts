/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Injectable } from '@angular/core';
import { EventSource } from 'app/shared/client-state/context.service';
import { ChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { BehaviorSubject } from 'rxjs';
import { RhsEditorMessagingReconnectable } from '../right-hand-side/rhs-editor-messaging';
import { PageLayout } from './layout/page-layout';

export interface ChromeSelectEvent {
  selection: ChromeSelection | undefined;
  eventSource: EventSource | undefined;
}

export interface ChromeSelection {
  chrome: ChromeInfo;
  messaging: RhsEditorMessagingReconnectable;
  parentChrome?: { chrome: ChromeInfo; messaging: RhsEditorMessagingReconnectable };
}

export type CanvasLayoutServices = Pick<
  PageLayout,
  | 'findRendering'
  | 'getRendering'
  | 'getAllRenderings'
  | 'insertRendering'
  | 'moveRendering'
  | 'removeRendering'
  | 'updateRenderings'
  | 'setRenderingsPersonalizationRules'
  | 'getRenderingPersonalizationRules'
  | 'moveRenderingWithinSamePlaceholder'
>;

export interface CanvasServicesImpl {
  readonly layout: CanvasLayoutServices;
}

/**
 * Services to communicate with the currently connected Canvas.
 * Use with caution, as even though service is always available,
 * it will start to fail if Canvas is not currently available (e.g. you are in Insights or Simulator views).
 */
@Injectable({ providedIn: 'root' })
export class CanvasServices {
  private readonly _chromeSelect$ = new BehaviorSubject<ChromeSelectEvent>({
    selection: undefined,
    eventSource: undefined,
  });
  readonly chromeSelect$ = this._chromeSelect$.asObservable();

  private readonly _canvasStyle$ = new BehaviorSubject<Record<string, string>>({});

  get canvasStyle$() {
    return this._canvasStyle$.asObservable();
  }

  get chromeSelect(): ChromeSelectEvent {
    return this._chromeSelect$.value;
  }

  private _canvasServices: CanvasServicesImpl | undefined;
  private get canvasService(): CanvasServicesImpl {
    if (!this._canvasServices) {
      throw new Error(`[BUG] Canvas services are not available now. Ensure you invoke it only while Canvas is shown.`);
    }

    return this._canvasServices;
  }

  private readonly nonCachingLayoutServices: CanvasLayoutServices;

  constructor() {
    // Proxy to ensure that we always get the latest PageLayout and never cache the object.
    // Otherwise client might preserve layout object and after Canvas reload there will be weird glitches,
    // as app is creating a new layout and abandon the old one altogether with related state.
    // Basically we expect nobody to access old layout after we reset/set new services impl.
    this.nonCachingLayoutServices = new Proxy(
      {},
      {
        get:
          (_target: {}, property: PropertyKey) =>
          (...args: any[]) => {
            const layout = this.canvasService.layout;
            return (layout as any)[property].apply(layout, args);
          },
      },
    ) as CanvasLayoutServices;
  }

  getCurrentLayout(): CanvasLayoutServices {
    return this.nonCachingLayoutServices;
  }

  setSelectedChrome(selection: ChromeSelectEvent) {
    this._chromeSelect$.next(selection);
  }

  setCanvasStyles(style: Record<string, string>) {
    this._canvasStyle$.next(style);
  }

  setCanvasServicesImpl(services: CanvasServicesImpl) {
    this._canvasServices = services;
  }

  resetCanvasServicesImpl() {
    this._canvasServices = undefined;
  }
}
