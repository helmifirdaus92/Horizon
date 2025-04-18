/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { firstValueFrom, of } from 'rxjs';
import { SearchPaginationOperation } from './searh-pagination-operation';

describe(SearchPaginationOperation.name, () => {
  it('should cancel search operation', async () => {
    const searchFn = () => of({ isSuccessful: true, totalCount: 0, items: [] });
    const searchOperation = new SearchPaginationOperation(searchFn);

    searchOperation.cancel();
    const result = await firstValueFrom(searchOperation.searchNext());

    expect(searchOperation.state).toBe('canceled');
    expect(result).toEqual([]);
  });

  it('should handle not successful search request', async () => {
    const searchFn = () => of({ isSuccessful: false, totalCount: 0, items: [] });
    const searchOperation = new SearchPaginationOperation(searchFn);

    const result = await firstValueFrom(searchOperation.searchNext());

    expect(searchOperation.state).toBe('error');
    expect(result).toEqual([]);
  });

  it('should fetch by batches', async () => {
    const searchFnSpy = jasmine.createSpy();
    searchFnSpy.and.returnValue(of({ isSuccessful: true, totalCount: 4, items: [{}, {}] as any }));
    const searchOperation = new SearchPaginationOperation(searchFnSpy);

    let result = await firstValueFrom(searchOperation.searchNext());
    expect(searchOperation.state).toBe('hasMoreItems');
    expect(result.length).toBe(2);
    expect(searchFnSpy.calls.mostRecent().args[0]).toEqual({
      pageSize: 20,
      skip: 0,
    });

    result = await firstValueFrom(searchOperation.searchNext());
    expect(searchOperation.state).toBe('fetchedAllItems');
    expect(result.length).toBe(2);
    expect(searchFnSpy.calls.mostRecent().args[0]).toEqual({
      pageSize: 20,
      skip: 2,
    });
  });
});
