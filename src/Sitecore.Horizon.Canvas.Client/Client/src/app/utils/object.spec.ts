/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { pickDefinedProperties } from './object';

describe('pickDefinedProperties()', () => {
  it('should pick all defined properties of an object', () => {
    interface ABCD {
      a: string;
      b: number;
      c: boolean;
      // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
      d: unknown | null;
    }
    const testObj: Partial<ABCD> = { a: 'a', c: undefined, d: null };

    const resultObj = pickDefinedProperties(testObj, ['a', 'b', 'c', 'd']);

    expect(resultObj).toEqual({
      a: 'a',
      d: null,
    });
  });
});
