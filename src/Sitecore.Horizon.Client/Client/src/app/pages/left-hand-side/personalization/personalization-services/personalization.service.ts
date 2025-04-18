/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';
import { PersonalizationVariant } from '../personalization.types';

@Injectable({ providedIn: 'root' })
export class PersonalizationService {
  private _activeVariant: PersonalizationVariant | null = null;
  private readonly _isPersonalizationMode = new BehaviorSubject<boolean>(false);

  readonly isPersonalizationMode$: Observable<boolean> = this._isPersonalizationMode
    .asObservable()
    .pipe(distinctUntilChanged());

  getIsInPersonalizationMode(): boolean {
    return this._isPersonalizationMode.value;
  }

  setIsInPersonalizationMode(value: boolean): void {
    this._isPersonalizationMode.next(value);
  }

  getActiveVariant(): PersonalizationVariant | null {
    return this._activeVariant;
  }

  setActiveVariant(value: PersonalizationVariant | null) {
    this._activeVariant = value;
  }

  isDefaultVariant(): boolean {
    return this._activeVariant === null || this._activeVariant === undefined;
  }
}
