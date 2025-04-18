/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ReversePipe } from './reverse.pipe';

describe(ReversePipe.name, () => {
  let sut: ReversePipe;

  const arr = [{ name: 'name', lastname: 'lastname' }, [1, 2, 3], 'test'];
  const originalArray = arr;
  const expectedReversedArr = ['test', [1, 2, 3], { name: 'name', lastname: 'lastname' }];

  beforeEach(() => {
    sut = new ReversePipe();
  });

  it('should return null if array is null', () => {
    expect(sut.transform(null)).toBe(null);
  });

  it('should return undefined if array is undefined', () => {
    expect(sut.transform(undefined)).toBe(undefined);
  });

  it('should reverse the order of the elements in an array', () => {
    const actualReversedArr = sut.transform(originalArray);
    expect(actualReversedArr).toEqual(expectedReversedArr);
  });

  it('should not overwrites the original array', () => {
    const actualReversedArr = sut.transform(originalArray);
    expect(originalArray).toEqual(arr);
    expect(actualReversedArr).not.toEqual(originalArray);
  });
});
