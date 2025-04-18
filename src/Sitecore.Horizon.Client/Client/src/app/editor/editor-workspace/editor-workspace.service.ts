/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { EditingMessagingChannel } from 'app/shared/messaging/horizon-canvas.contract.defs';
import { ChromeType } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { Observable, ReplaySubject } from 'rxjs';

export type PageLoadState = { isLoading: true } | { isLoading: false; itemId: string; language: string };

@Injectable({
  providedIn: 'root',
})
export class EditorWorkspaceService {
  private _iframeIsLoading$ = new ReplaySubject<PageLoadState>();
  private readonly editingChannel: EditingMessagingChannel;
  private _chromeToSelect: { id: string; chromeType: ChromeType; shouldScrollIntoView?: boolean } | null = null;

  constructor(private readonly messagingService: MessagingService) {
    this.editingChannel = this.messagingService.getEditingCanvasChannel();
  }

  setChromeToSelectOnPageLoad(chrome: typeof this._chromeToSelect) {
    this._chromeToSelect = chrome;
  }

  setCanvasLoadState(value: PageLoadState) {
    if (value.isLoading === false && this._chromeToSelect) {
      this.editingChannel.emit('chrome:select', {
        id: this._chromeToSelect.id,
        chromeType: this._chromeToSelect.chromeType,
        shouldScrollIntoView: this._chromeToSelect.shouldScrollIntoView,
      });

      this._chromeToSelect = null;
    }

    this._iframeIsLoading$.next(value);
  }

  watchCanvasLoadState(): Observable<PageLoadState> {
    return this._iframeIsLoading$.asObservable();
  }
}
