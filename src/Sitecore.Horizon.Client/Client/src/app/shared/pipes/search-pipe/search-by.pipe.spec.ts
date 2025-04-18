/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { SearchByPipe } from './search-by.pipe';

describe(SearchByPipe.name, () => {
  let sut: SearchByPipe;
  let searchTerm: string;
  let fieldName: string;
  let searchResult: any[] | null | undefined;

  const items = [
    { f1: 'obj1 field1', f2: 'obj1 test value1' },
    { f1: 'obj2 field1', f2: 2, f3: 'obj2 field3' },
    { f1: 'obj3 field1', f2: 'obj2 test value2' },
    { f1: 'obj4 field1', f3: 'obj4 field3' },
  ];

  beforeEach(() => {
    sut = new SearchByPipe();
  });

  it('should return null if array is null', () => {
    expect(sut.transform(null, 'fieldname', 'query')).toBe(null);
  });

  it('should return undefined if array is undefined', () => {
    expect(sut.transform(undefined, 'fieldname', 'query')).toBe(undefined);
  });

  it('should filter items', () => {
    // Case 1
    searchTerm = 'field1';
    fieldName = 'f1';
    searchResult = sut.transform(items, fieldName, searchTerm);
    expect(searchResult?.length).toBe(4);

    // Case 2
    searchTerm = 'obj3';
    fieldName = 'f1';
    searchResult = sut.transform(items, fieldName, searchTerm);
    expect(searchResult?.length).toBe(1);

    // Case 3
    searchTerm = 'test';
    fieldName = 'f1';
    searchResult = sut.transform(items, fieldName, searchTerm);
    expect(searchResult?.length).toBe(0);

    // Case 4
    searchTerm = 'test';
    fieldName = 'f2';
    searchResult = sut.transform(items, fieldName, searchTerm);
    expect(searchResult?.length).toBe(2);

    // Case 5
    searchTerm = 'test';
    fieldName = 'f4';
    searchResult = sut.transform(items, fieldName, searchTerm);
    expect(searchResult?.length).toBe(0);
  });
});
