/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */



import { SortPipe } from './sort.pipe';

describe(SortPipe.name, () => {
  let sut: SortPipe;

  function createTestArray(values: any[], length: number): any[] {
    return [...Array(length)].map((_, index) => {
      return {
        field1: 'value' + index,
        field2: typeof values[index] === 'number' ? 1000 + values[index] : values[index],
      };
    });
  }

  function assertArrayOrder(resultArray: any[], order: number[]): boolean {
    if (resultArray.length !== order.length) {
      return false;
    }
    let result = true;
    resultArray.forEach((item, index) => {
      if (item.field1 !== 'value' + order[index]) {
        result = false;
      }
    });
    return result;
  }
  const arr = createTestArray([0, 1, null], 3);

  beforeEach(() => {
    sut = new SortPipe();
  });

  it('should create an instance', () => {
    expect(sut).toBeTruthy();
  });

  it('should return original array if sortKey is undefined', () => {
    const resultArray = sut.transform([...arr], 'ASC', undefined);

    expect(assertArrayOrder(resultArray, [0, 1, 2])).toBe(true);
  });

  it('should return original array if sortOrder is undefined', () => {
    const resultArray = sut.transform([...arr], undefined, 'field1');

    expect(assertArrayOrder(resultArray, [0, 1, 2])).toBe(true);
  });

  it('should return empty array if it is null', () => {
    const originalArray = createTestArray([0, 1, null], 0);

    expect(sut.transform(originalArray, 'DESC', 'field1')).toEqual([]);
  });

  it('should return original array if it contains only one element', () => {
    const originalArray = createTestArray([0, 1, null], 1);

    expect(sut.transform(originalArray, 'ASC', 'field1')).toEqual(originalArray);
  });

  it('should sort the array based on string field in ASC order if sort key is string and sort order is [ASC]', () => {
    const resultAfterOrdering = sut.transform([...arr], 'ASC', 'field1');

    expect(assertArrayOrder(resultAfterOrdering, [0, 1, 2])).toBe(true);
  });

  it('should sort the array based on string field in DESC order if sort key is string and sort order is [DESC]', () => {
    const resultAfterOrdering = sut.transform([...arr], 'DESC', 'field1');

    expect(assertArrayOrder(resultAfterOrdering, [2, 1, 0])).toBe(true);
  });

  it('should sort the array based on number field in ASC order if sort key is number and sort order is [ASC]', () => {
    const originalArray = createTestArray([0, 1, 2], 3);
    const resultAfterOrdering = sut.transform(originalArray, 'ASC', 'field2');

    expect(assertArrayOrder(resultAfterOrdering, [0, 1, 2])).toBe(true);
  });

  it('should sort the array based on number field in DESC order if sort key is number and sort order is [DESC]', () => {
    const originalArray = createTestArray([0, 1, 2], 3);
    const resultAfterOrdering = sut.transform(originalArray, 'DESC', 'field2');

    expect(assertArrayOrder(resultAfterOrdering, [2, 1, 0])).toBe(true);
  });

  it('should have string field in last index in combine type field array when arrange in [ASC] order ', () => {
    const originalArray = createTestArray([0, 'value', 1], 3);
    const resultAfterOrdering = sut.transform(originalArray, 'ASC', 'field2');

    expect(resultAfterOrdering[2].field2).toBe('value');
  });

  it('should have string field in first index in combine field type arry when arrange in [DESC] order', () => {
    const originalArray = createTestArray([0, 'value', 1], 3);
    const resultAfterOrdering = sut.transform(originalArray, 'DESC', 'field2');

    expect(resultAfterOrdering[0].field2).toBe('value');
  });

  it('should have index value 0 for undefined field when arrange in [ASC] order', () => {
    const originalArray = createTestArray([0, 1, undefined], 3);
    const resultAfterOrdering = sut.transform(originalArray, 'ASC', 'field2');

    expect(resultAfterOrdering[0].field2).toBe(undefined);
  });

  it('should sort long-string', () => {
    const longStringArray = [{ string: 'test value for a long string' }, { string: 'test value for long string' }];
    const arraySortedDes = [{ string: 'test value for long string' }, { string: 'test value for a long string' }];

    const resultAfterOrdering = sut.transform(longStringArray, 'DESC', 'string');

    expect(resultAfterOrdering).toEqual(arraySortedDes);
  });

  it('should order by array', () => {
    const array = [{ values: [10, 0] }, { values: [1, 2] }, { values: [0, -1, 1] }];
    const arraySorted = [{ values: [0, -1, 1] }, { values: [1, 2] }, { values: [10, 0] }];

    const resultAfterOrdering = sut.transform(array, 'ASC', 'values');

    expect(resultAfterOrdering).toEqual(arraySorted);
  });
});
