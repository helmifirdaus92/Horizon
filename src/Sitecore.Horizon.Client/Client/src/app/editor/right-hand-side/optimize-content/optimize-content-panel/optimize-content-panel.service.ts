/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OptimizeContentPanelService {
  private readonly _panelState$ = new BehaviorSubject<boolean>(false);
  readonly panelState$ = this._panelState$.asObservable();

  openPanel() {
    if (this._panelState$.value) {
      return;
    }

    this._panelState$.next(true);
  }

  closePanel() {
    if (!this._panelState$.value) {
      return;
    }

    this._panelState$.next(false);
  }
}
