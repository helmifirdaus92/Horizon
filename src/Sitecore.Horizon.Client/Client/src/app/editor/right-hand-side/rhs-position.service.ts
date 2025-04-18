/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { shareReplayLatest } from 'app/shared/utils/rxjs/rxjs-custom';
import { BehaviorSubject } from 'rxjs';

export type GetFieldSourcesError = 'InvalidTemplateSource';

@Injectable({ providedIn: 'root' })
export class RhsPositionService {
  private _isDocked$ = new BehaviorSubject<boolean>(true);
  isDocked$ = this._isDocked$.pipe(shareReplayLatest());

  toggleDock() {
    this._isDocked$.next(!this._isDocked$.value);
  }

  setDockState(value: boolean) {
    this._isDocked$.next(value);
  }
}
