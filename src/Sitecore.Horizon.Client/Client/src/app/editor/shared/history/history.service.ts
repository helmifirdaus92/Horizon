/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { isSameGuid } from 'app/shared/utils/utils';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { FieldState } from './field-state';
import { PageState } from './page-state';
import { PageStateHistory } from './page-state-history';

export const HISTORY_ENTRY_FACTORY = Symbol();

interface HistoryContext {
  pageId: string;
  pageVersion: number;
  activeVariant: string | undefined;
  language: string;
}

class HistoryMap<T> {
  private map: Array<[HistoryContext, T]> = [];

  set(pageId: string, pageVersion: number, activeVariant: string | undefined, language: string, value: T): void {
    const entry: [HistoryContext, T] = [{ pageId, pageVersion, activeVariant, language }, value];
    const index = this.map.findIndex(
      ([key]) =>
        isSameGuid(pageId, key.pageId) &&
        pageVersion === key.pageVersion &&
        activeVariant === key.activeVariant &&
        language === key.language,
    );
    if (index >= 0) {
      this.map[index] = entry;
    } else {
      this.map.push(entry);
    }
  }

  get(pageId: string, pageVersion: number, activeVariant: string | undefined, language: string): T | undefined {
    const entry = this.map.find(
      ([key]) =>
        isSameGuid(pageId, key.pageId) &&
        pageVersion === key.pageVersion &&
        activeVariant === key.activeVariant &&
        language === key.language,
    );
    return entry && entry[1];
  }

  clear(pageId: string, pageVersion: number, language: string): void {
    this.map = this.map.filter(
      ([key]) => !(isSameGuid(pageId, key.pageId) && pageVersion === key.pageVersion && language === key.language),
    );
  }
}

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly _isLatest$ = new BehaviorSubject(true);
  readonly isLatest$ = this._isLatest$.pipe(distinctUntilChanged());

  private readonly _isInitial$ = new BehaviorSubject(true);
  readonly isInitial$ = this._isInitial$.pipe(distinctUntilChanged());

  private readonly historyMap: HistoryMap<PageStateHistory> = new HistoryMap();

  // History for the current context.
  private _history?: PageStateHistory;

  private get history(): PageStateHistory {
    if (!this._history) {
      throw Error('There is no history entry for the current history context');
    }
    return this._history;
  }

  // For testing purposes
  [HISTORY_ENTRY_FACTORY] = () => new PageStateHistory();

  setContext(pageId: string, pageVersion: number, activeVariant: string | undefined, language: string): void {
    const pageHistory = this.historyMap.get(pageId, pageVersion, activeVariant, language);
    if (pageHistory) {
      this._history = pageHistory;
    } else {
      this._history = this.createHistoryEntry();
      this.historyMap.set(pageId, pageVersion, activeVariant, language, this.history);
    }

    this.updateHistoryState();
  }

  clear(pageId: string, pageVersion: number, language: string): void {
    this.historyMap.clear(pageId, pageVersion, language);
  }

  addState(state: PageState): void {
    this.history.addState(state);
    this.updateHistoryState();
  }

  addFieldUpdate(field: FieldState): void {
    this.history.addFieldUpdate(field);
    this.updateHistoryState();
  }

  undo(): PageState | undefined {
    const result = this.history.undo();
    this.updateHistoryState();
    return result;
  }

  redo(): PageState | undefined {
    const result = this.history.redo();
    this.updateHistoryState();
    return result;
  }

  private updateHistoryState() {
    this._isInitial$.next(this.history.isInitial);
    this._isLatest$.next(this.history.isInLatest);
  }

  private createHistoryEntry(): PageStateHistory {
    return this[HISTORY_ENTRY_FACTORY]();
  }
}
