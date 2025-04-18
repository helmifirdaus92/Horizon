/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter as rxFilter } from 'rxjs/operators';
import { normalizeGuid } from '../utils/utils';
import { ContextService } from './context.service';

export const ItemChangeScopeList = [
  'data-fields',
  'layout',
  'name',
  'display-name',
  'workflow',
  'versions',
  'layoutEditingKind',
] as const;

export type ItemChangeScope = typeof ItemChangeScopeList[number];

export interface ItemChange {
  readonly itemId: string;
  readonly scopes: readonly ItemChangeScope[];
}

@Injectable({ providedIn: 'root' })
export class ItemChangeService {
  private readonly _changes$ = new Subject<ItemChange>();

  constructor(private readonly context: ContextService) {}

  watchForChanges(filter?: { itemId?: string; scopes?: ItemChangeScope[] }): Observable<ItemChange> {
    let filterItemId: string | undefined;
    if (filter?.itemId !== undefined) {
      filterItemId = normalizeGuid(filter.itemId);
    }

    return this._changes$.pipe(
      rxFilter((change) => {
        if (filterItemId !== undefined && change.itemId !== filterItemId) {
          return false;
        }

        if (filter && filter.scopes !== undefined && !filter.scopes.some((scope) => change.scopes.includes(scope))) {
          return false;
        }

        return true;
      }),
    );
  }

  notifyChange(itemId: string, scopes: readonly ItemChangeScope[]): void {
    // it is important to notify context service before notifying others
    // Context service will fetch page update state and dependent services can use it on change push
    this.context.notifyItemStateUpdate(itemId, scopes);

    this._changes$.next({ itemId: normalizeGuid(itemId), scopes });
  }
}
