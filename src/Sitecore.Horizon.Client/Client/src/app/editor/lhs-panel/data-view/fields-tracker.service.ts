/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Field } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { FieldState } from 'sdk/contracts/editing-shell.contract';

export type EditingMode = 'persist' | 'draft' | 'loading';

@Injectable({ providedIn: 'root' })
export class FieldsTrackerService {
  private _savedState$: BehaviorSubject<FieldState[]> = new BehaviorSubject<FieldState[]>([]);
  private _state$: BehaviorSubject<FieldState[]> = new BehaviorSubject<FieldState[]>([]);
  private _editingMode$: BehaviorSubject<EditingMode> = new BehaviorSubject<EditingMode>('persist');

  private _initialState$ = new BehaviorSubject<Field[]>([]);

  watchFieldsValueChange(): Observable<FieldState[]> {
    return this._state$.asObservable().pipe(filter((fields) => fields.length > 0));
  }

  notifyFieldValueChange(fields: FieldState[]) {
    this._state$.next(fields);
  }

  watchFieldsSaved(): Observable<FieldState[]> {
    return this._savedState$.asObservable().pipe(filter((fields) => fields.length > 0));
  }

  notifyFieldsSaved(fields: FieldState[]) {
    this._savedState$.next(fields);
  }

  watchInitialItemFieldsState() {
    return this._initialState$.asObservable().pipe(filter((fields) => fields.length > 0));
  }

  notifyInitialItemFieldsState(fields: Field[]) {
    this._initialState$.next(fields);
  }

  setEditingMode(mode: EditingMode) {
    this._editingMode$.next(mode);
  }

  watchEditingMode() {
    return this._editingMode$.asObservable();
  }
}
