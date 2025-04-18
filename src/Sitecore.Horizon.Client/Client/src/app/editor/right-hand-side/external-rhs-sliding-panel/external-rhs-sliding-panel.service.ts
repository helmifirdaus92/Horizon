/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { MessagingEventsEmitterChannel } from '@sitecore/page-composer-sdk';
import { BehaviorSubject } from 'rxjs';
import { RhsPanelContext, RhsPanelCotract, RhsPanelEvents } from 'sdk/contracts/rhs-panel.contract';

export interface RhsPanelState {
  isOpen: boolean;
  header?: string;
  key: string;
}

@Injectable({ providedIn: 'root' })
export class ExternalRhsPanelService {
  private readonly _panelState$ = new BehaviorSubject<RhsPanelState>({
    isOpen: false,
    key: '',
  });
  readonly panelState$ = this._panelState$.asObservable();
  private readonly rhsPanelEmitter: MessagingEventsEmitterChannel<RhsPanelEvents>;

  constructor(private globalMessaging: NgGlobalMessaging) {
    this.globalMessaging.createRpc(RhsPanelCotract, {
      openPanel: (context: RhsPanelContext) => this.openPanel(context.key, context.header),
      closePanel: () => this.closePanel(),
    });

    this.rhsPanelEmitter = globalMessaging.createEventEmitter(RhsPanelCotract);
  }

  openPanel(key: string, header?: string) {
    if (this._panelState$.value.isOpen) {
      return;
    }

    this._panelState$.next({ isOpen: true, key, header });
    this.rhsPanelEmitter.emit('rhs-panel:open', { header, key });
  }

  closePanel() {
    const curState = this._panelState$.value;
    if (!this._panelState$.value.isOpen) {
      return;
    }

    this._panelState$.next({ isOpen: false, key: '' });
    this.rhsPanelEmitter.emit('rhs-panel:close', { header: curState.header, key: curState.key });
  }
}
