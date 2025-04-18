/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HorizonPageState, PageStateReader } from '../page-state-reader';
import { getIsoLanguage } from './utils';

describe('Utils', () => {
  describe('getIsoLanguage', () => {
    let getPageStateSpy: jasmine.Spy;
    const suites: [canvasLanguage: string, expectedResult: string][] = [
      ['ar-aa', 'ar'],
      ['en', 'en'],
      ['aa-bb-cc', 'aa'],
      [undefined as any, 'en'],
      ['', 'en'],
    ];

    beforeEach(() => {
      getPageStateSpy = spyOn(PageStateReader, 'getPageState');
    });
    afterEach(() => {
      getPageStateSpy.calls.reset();
    });

    suites.forEach((val, index) => {
      it(`should resolve value; case: #${index + 1}`, () => {
        getPageStateSpy.and.returnValue({ language: val[0] } as HorizonPageState);

        expect(getIsoLanguage()).toBe(val[1]);
      });
    });
  });
});
