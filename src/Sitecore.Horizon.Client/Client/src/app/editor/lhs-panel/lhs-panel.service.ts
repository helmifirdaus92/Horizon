/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { shareReplayLatest } from 'app/shared/utils/rxjs/rxjs-custom';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LhsPanelStateService {
  private readonly _isExpanded = new BehaviorSubject(false);
  readonly isExpanded$ = this._isExpanded.asObservable().pipe(shareReplayLatest());

  toggleExpand(): void {
    this._isExpanded.next(!this._isExpanded.value);
  }

  setExpand(value: boolean): void {
    this._isExpanded.next(value);
  }

  isExpanded(): boolean {
    return this._isExpanded.value;
  }
}
