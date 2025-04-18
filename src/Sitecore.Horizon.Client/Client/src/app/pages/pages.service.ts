/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { shareReplayLatest } from 'app/shared/utils/rxjs/rxjs-custom';
import { Subject } from 'rxjs';
import { PageUIContract } from 'sdk/contracts/pages-ui.contract';

@Injectable({
  providedIn: 'root',
})
export class PagesService {
  private _rhsStateChange$ = new Subject<'open' | 'close' | 'toggle'>();
  readonly rhsStateChange$ = this._rhsStateChange$.pipe(shareReplayLatest());

  constructor(private globalMessaging: NgGlobalMessaging) {
    this.globalMessaging.createRpc(PageUIContract, {
      openRHS: () => this.openRHS(),
      closeRHS: () => this.closeRHS(),
      toggleRHS: () => this.toggleRHS(),
    });
  }
  toggleRHS() {
    this._rhsStateChange$.next('toggle');
  }
  openRHS() {
    this._rhsStateChange$.next('open');
  }
  closeRHS() {
    this._rhsStateChange$.next('close');
  }
}
