/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ItemResponse } from 'app/page-design/page-templates.types';
import { map, Observable } from 'rxjs';
import { SearchPagingInput } from './content-tree-search.dal.service';

export interface TreeSearchResult {
  state: 'hasMoreItems' | 'fetchedAllItems' | 'canceled' | 'error';
  items: ItemResponse[];
}

export class SearchPaginationOperation {
  private readonly pageSize = 20;

  private totalFetchedCount = 0;
  private totalMatchItemsCount: number | undefined = undefined;

  private _state: 'hasMoreItems' | 'fetchedAllItems' | 'canceled' | 'error' = 'hasMoreItems';
  get state(): typeof this._state {
    return this._state;
  }

  constructor(
    private readonly searchFunc: (
      paging: SearchPagingInput,
    ) => Observable<{ isSuccessful: boolean; totalCount: number; items: ItemResponse[] }>,
  ) {}

  cancel() {
    this._state = 'canceled';
  }

  searchNext(): Observable<ItemResponse[]> {
    const paging: SearchPagingInput = {
      pageSize: this.pageSize,
      skip: this.totalFetchedCount,
    };

    return this.searchFunc(paging).pipe(
      map((result) => {
        if (this._state === 'canceled') {
          return [];
        }

        if (!result.isSuccessful) {
          this._state = 'error';
          return [];
        }

        this.totalMatchItemsCount = this.totalMatchItemsCount ?? result.totalCount;
        this.totalFetchedCount += result.items.length;

        if (this.totalFetchedCount >= this.totalMatchItemsCount) {
          this._state = 'fetchedAllItems';
        }

        return result.items;
      }),
    );
  }
}
