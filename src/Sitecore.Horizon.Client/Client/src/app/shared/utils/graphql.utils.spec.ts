/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ErrorObserver } from 'rxjs';
import { extractGqlErrorCode } from './graphql.utils';

describe('graphql utils', () => {
  describe('handleGqlError', () => {
    let spy: jasmine.SpyObj<ErrorObserver<any>>;

    beforeEach(() => {
      spy = jasmine.createSpyObj<ErrorObserver<any>>('error spy', ['error']);
    });

    describe('AND error doesnt have graphQLError', () => {
      it(`should return an observable that throws an error equal to 'UnknownError'`, () => {
        extractGqlErrorCode({}).subscribe(spy);
        expect(spy.error).toHaveBeenCalledWith('UnknownError');
      });
    });

    describe('AND error contains a graphQLError', () => {
      it(`should return an observable that throws an error equal to the provided error code`, () => {
        const code = 'foo';
        const error = { graphQLErrors: [{ extensions: { code } }] };
        extractGqlErrorCode(error).subscribe(spy);
        expect(spy.error).toHaveBeenCalledWith(code);
      });
    });
  });
});
