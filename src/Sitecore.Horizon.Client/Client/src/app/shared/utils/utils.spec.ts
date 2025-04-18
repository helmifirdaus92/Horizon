/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { ConfigurationService } from '../configuration/configuration.service';
import { appendQueryString, getSearchParams, isSameUrl, makeAbsoluteUrl } from './url.utils';
import {
  abTestAnalyticsUrl,
  getAnalyticsIdentifierUrl,
  getDashboardAppUrl,
  getExplorerAppUrl,
  handleHttpErrorResponse,
  handleHttpResponse,
  isEqualObject,
  isSameGuid,
  mapErrorMessageToCode,
  moveItemInArray,
  normalizeGuid,
  parseSingleXmlTag,
  round10,
  sitesAbTestsOverviewUrl,
} from './utils';

const success = new HttpResponse<string>({
  body: 'test1',
  status: 200,
  statusText: 'OK',
  headers: new HttpHeaders(),
  url: 'api.com',
});

const clientError = new HttpResponse<string>({
  body: 'test2',
  status: 400,
  statusText: 'error',
  headers: new HttpHeaders(),
  url: 'api.com',
});

const authenticationError = new HttpResponse<string>({
  body: 'test3',
  status: 401,
  statusText: 'unAuthorized',
  headers: new HttpHeaders(),
  url: 'api.com',
});

const resourceNotFoundError = new HttpResponse<string>({
  body: 'test4',
  status: 404,
  statusText: 'notFound',
  headers: new HttpHeaders(),
  url: 'api.com',
});

const serverError = new HttpResponse<string>({
  body: 'test5',
  status: 500,
  statusText: 'serverError',
  headers: new HttpHeaders(),
  url: 'api.com',
});

const multipleResponse = new HttpResponse<string>({
  body: 'test6',
  status: 300,
  statusText: 'multipleResponse',
  headers: new HttpHeaders(),
  url: 'api.com',
});

const clientErrorResponse = new HttpErrorResponse({
  status: 400,
  statusText: 'error',
  headers: new HttpHeaders(),
  url: 'api.com',
});

const authenticationErrorResponse = new HttpErrorResponse({
  status: 401,
  statusText: 'unAuthorized',
  headers: new HttpHeaders(),
  url: 'api.com',
});

const resourceNotFoundErrorResponse = new HttpErrorResponse({
  status: 404,
  statusText: 'notFound',
  headers: new HttpHeaders(),
  url: 'api.com',
});

const serverErrorResponse = new HttpErrorResponse({
  status: 500,
  statusText: 'serverError',
  headers: new HttpHeaders(),
  url: 'api.com',
});

describe('Utils', () => {
  describe('round10', () => {
    (
      [
        [0.14 * 100, -2, '14'],
        [0.0014 * 100, -2, '0.14'],
        [0.0028 * 100, -1, '0.3'],
        [0.1345 * 100, -2, '13.45'],
      ] as Array<[number, number, string]>
    ).forEach(([value, exp, expectedResult]) => {
      it(`should correctly round number (value: "${value}", exp: "${exp}", expected: "${expectedResult}")`, () => {
        const result = round10(value, exp);

        expect(result.toString()).toBe(expectedResult);
      });
    });
  });

  describe('url', () => {
    describe('getSearchParams', () => {
      describe('given a valid path that contains search params', () => {
        it('should return instance of URLSearchParams with the search params present', () => {
          const result = getSearchParams('/example/path?bar=foo&value=42');
          expect(result.toString()).toBe('bar=foo&value=42');
          expect(result.get('bar')).toBe('foo');
          expect(result.get('value')).toBe('42');
        });
      });

      describe('given a valid path that does not contain search params', () => {
        it('should return instance of URLSearchParams without any search params', () => {
          const result = getSearchParams('/example/path');
          expect(result.toString()).toBe('');
        });
      });
    });

    describe('makeAbsoluteUrl', () => {
      it('should correctly concatenate values', () => {
        expect(makeAbsoluteUrl('/relative', 'http://base.com')).toBe('http://base.com/relative');
        expect(makeAbsoluteUrl('relative', 'http://base.com/')).toBe('http://base.com/relative');
        expect(makeAbsoluteUrl('/relative', 'http://base.com/')).toBe('http://base.com/relative');
      });

      it('should preserve existing host', () => {
        expect(makeAbsoluteUrl('http://base.com/relative', 'http://other.com')).toBe('http://base.com/relative');
      });
    });

    describe('appendQueryString', () => {
      it('should append all parameters', () => {
        const url = 'http://base.com/relative';

        const result = appendQueryString(url, [
          ['first', '1'],
          ['second', '2'],
        ]);

        expect(result).toEqual('http://base.com/relative?first=1&second=2');
      });

      it('should append to relative url', () => {
        const result = appendQueryString('/relative', [['first', '1']]);

        expect(result).toEqual('/relative?first=1');
      });

      it('should append to the existing query string', () => {
        const result = appendQueryString('http://base.com/relative?first=1', [['second', '2']]);

        expect(result).toEqual('http://base.com/relative?first=1&second=2');
      });
    });

    describe('isSameUrl', () => {
      new Array<[string, string]>(
        ['http://example.com', 'http://example.com'],
        ['http://example.com', 'http://EXamPLe.com'],
        ['http://example.com', 'http://example.com/'],
        ['http://example.com', 'http://example.com:80'],
        ['http://example.com', 'http://example.com:80/'],
        ['/relative/path', '/relative/path'],
        ['/relative/path', 'relative/path'],
      ).forEach(([url1, url2]) =>
        it(`[url1: '${url1}', url2: '${url2}'] should be same urls`, () => {
          expect(isSameUrl(url1, url2)).toBeTrue();
        }),
      );

      new Array<[string, string]>(
        ['http://example.com', 'http://google.com'],
        ['http://example.com', 'https://example.com'],
        ['http://example.com', 'http://example.com:8080'],
        ['/relative/path', 'relative/different/path'],
        ['/relative/path', '/relative/path/'],
      ).forEach(([url1, url2]) =>
        it(`[url1: '${url1}', url2: '${url2}'] should be different urls`, () => {
          expect(isSameUrl(url1, url2)).toBeFalse();
        }),
      );
    });
  });

  describe('isSameGuid()', () => {
    it('should return true, when both inputs are the same, while ignoring case, curly-brackets and dashes', () => {
      expect(isSameGuid('foo1BAR2BaZ30000AAAAbbbbCCCC1234', '{foo1BAR2-BaZ3-0000-AAAA-bbbbCCCC1234}')).toBeTruthy();
    });

    it('should return false, when both inputs are not the same, while ignoring case, curly-brackets and dashes', () => {
      expect(isSameGuid('bar', '{foo1BAR2-BaZ3-0000-AAAA-bbbbCCCC1234}')).toBeFalsy();
    });

    it('should return true, when both inputs are falsy', () => {
      expect(isSameGuid('', undefined)).toBeTruthy();
    });

    it('should return false, when one input is truthy and the other is falsy', () => {
      expect(isSameGuid(undefined, 'foo')).toBeFalsy();
    });
  });

  describe('normalizeGuid()', () => {
    const result = 'foo1bar2-baz3-0000-aaaa-bbbbcccc1234';

    it('should return the normalized guid', () => {
      expect(normalizeGuid('{foo1BAR2-BaZ3-0000-AAAA-bbbbCCCC1234}')).toBe(result);
    });

    it('should return the normalized guid', () => {
      expect(normalizeGuid('foo1BAR2-BaZ3-0000-AAAA-bbbbCCCC1234')).toBe(result);
    });

    it('should return the normalized guid', () => {
      expect(normalizeGuid('foo1BAR2BaZ30000AAAAbbbbCCCC1234')).toBe(result);
    });

    it('should return the normalized guid', () => {
      expect(normalizeGuid('{foo1BAR2BaZ30000AAAAbbbbCCCC1234}')).toBe(result);
    });

    it('should return "" if given is ""', () => {
      expect(normalizeGuid('')).toBe('');
    });

    it('should not fail if its not a guid', () => {
      expect(() => normalizeGuid('hello you')).not.toThrowError();
    });
  });

  describe('parseSingleXmlTag', () => {
    it('should read all attributes', () => {
      const value = `<tag name1="" name2="val" name3="42" />`;

      const result = parseSingleXmlTag(value);

      expect(result['name1']).toBe('');
      expect(result['name2']).toBe('val');
      expect(result['name3']).toBe('42');
      expect(result['unknown']).toBeUndefined();
      expect(result.unknown).toBeUndefined();
    });
  });

  describe('isEqualObject', () => {
    describe('WHEN at least one of values is not an object', () => {
      describe('AND values are equal as JavaScript means it', () => {
        it('should return true case #1', () => {
          expect(isEqualObject(100, 100)).toBeTrue();
        });

        it('should return true case #2', () => {
          expect(isEqualObject(100, '100')).toBeTrue();
        });

        it('should return true case #3', () => {
          expect(isEqualObject(null, null)).toBeTrue();
        });

        it('should return true case #4', () => {
          const obj = {
            name: 'name',
          };

          expect(isEqualObject(obj, obj)).toBeTrue();
        });
      });

      describe('AND values are NOT equal as JavaScript means it', () => {
        it('should return false case #1', () => {
          expect(isEqualObject(100, 1)).toBeFalse();
        });

        it('should return false case #2', () => {
          expect(isEqualObject(100, '1')).toBeFalse();
        });

        it('should return false case #3', () => {
          expect(isEqualObject(null, 0)).toBeFalse();
        });

        it('should return false case #4', () => {
          const obj = {
            name: 'name',
          };

          expect(isEqualObject(obj, 100)).toBeFalse();
        });

        it('should return false case #5', () => {
          const obj = {
            name: 'name',
          };

          expect(isEqualObject(null, obj)).toBeFalse();
        });
      });
    });

    describe('WHEN values are objects', () => {
      describe('AND values are equial', () => {
        it('should return true case #1', () => {
          const obj1 = {
            name: 'name',
          };
          const obj2 = {
            name: 'name',
          };

          expect(isEqualObject(obj1, obj2)).toBeTrue();
        });

        it('should return true case #2', () => {
          const obj1 = {
            name: 'name',
            id: 'id',
          };
          const obj2 = {
            id: 'id',
            name: 'name',
          };

          expect(isEqualObject(obj1, obj2)).toBeTrue();
        });

        describe(`AND value's properties contain nested objects`, () => {
          it('should return true case #1', () => {
            const obj1 = {
              name: 'name',
              id: 'id',
              obj: {
                name: 'name',
                id: 'id',
                obj: {
                  name: 'name',
                  id: 'id',
                },
              },
            };
            const obj2 = {
              name: 'name',
              id: 'id',
              obj: {
                name: 'name',
                id: 'id',
                obj: {
                  name: 'name',
                  id: 'id',
                },
              },
            };

            expect(isEqualObject(obj1, obj2)).toBeTrue();
          });
        });
      });

      describe('AND values are NOT equial', () => {
        it('should return false case #1', () => {
          const obj1 = {
            name: 'name',
            id: 'id',
          };
          const obj2 = {
            name: 'name',
            id: 'another id',
          };

          expect(isEqualObject(obj1, obj2)).toBeFalse();
        });

        it('should return false case #2', () => {
          const obj1 = {
            name: 'name',
            id: 'id',
            obj: {
              name: 'name',
              id: 'id',
              obj: {
                name: 'name',
                id: 'id',
              },
            },
          };
          const obj2 = {
            name: 'name',
            id: 'id',
            obj: {
              name: 'name',
              id: 'id',
              obj: {
                name: 'name',
                id: 'another id',
              },
            },
          };

          expect(isEqualObject(obj1, obj2)).toBeFalse();
        });
      });
    });
  });

  describe('moveItemInArray', () => {
    it('should return original array value IF its value is falsy', () => {
      expect(moveItemInArray(null as any, 0, 1)).toBe(null as any);
    });

    it('should return original array value IF positionFrom === positionTo', () => {
      expect(moveItemInArray(['a', 'b', 'c'], 1, 1)).toEqual(['a', 'b', 'c']);
      expect(moveItemInArray(['a', 'b', 'c'], 0, 0)).toEqual(['a', 'b', 'c']);
      expect(moveItemInArray(['a', 'b', 'c'], 2, 2)).toEqual(['a', 'b', 'c']);
    });

    it('should return original array value IF positionTo < 0', () => {
      expect(moveItemInArray(['a', 'b', 'c'], 0, -1)).toEqual(['a', 'b', 'c']);
      expect(moveItemInArray(['a', 'b', 'c'], 0, -2)).toEqual(['a', 'b', 'c']);
      expect(moveItemInArray(['a', 'b', 'c'], 0, -3)).toEqual(['a', 'b', 'c']);
    });

    it('should return original array value IF positionTo is our of array length', () => {
      expect(moveItemInArray(['a', 'b', 'c'], 0, 4)).toEqual(['a', 'b', 'c']);
      expect(moveItemInArray(['a', 'b', 'c'], 0, 5)).toEqual(['a', 'b', 'c']);
      expect(moveItemInArray(['a', 'b', 'c'], 0, 10000)).toEqual(['a', 'b', 'c']);
    });

    it('should return original array value IF positionFrom is our of array', () => {
      expect(moveItemInArray(['a', 'b', 'c'], 1000, 1)).toEqual(['a', 'b', 'c']);
      expect(moveItemInArray(['a', 'b', 'c'], -2, 1)).toEqual(['a', 'b', 'c']);
      expect(moveItemInArray(['a', 'b', 'c'], 5, 1)).toEqual(['a', 'b', 'c']);
    });

    it('should move item in array', () => {
      expect(moveItemInArray(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
      expect(moveItemInArray(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
      expect(moveItemInArray(['a', 'b', 'c'], 1, 0)).toEqual(['b', 'a', 'c']);
      expect(moveItemInArray(['a', 'b', 'c'], 1, 2)).toEqual(['a', 'c', 'b']);
    });
  });

  describe(getDashboardAppUrl.name, () => {
    it('should set URL base on base url and link type', () => {
      ConfigurationService.tenantName = 'test-tenant';

      expect(getDashboardAppUrl('myurl')).toBe('myurl?tab=sites&tenantName=test-tenant');
      expect(getDashboardAppUrl('')).toBe('?tab=sites&tenantName=test-tenant');
      expect(getDashboardAppUrl('myurl', 'sites')).toBe('myurl?tab=sites&tenantName=test-tenant');
      expect(getDashboardAppUrl('myurl', 'settings')).toBe('myurl?tab=settings&tenantName=test-tenant');
      expect(getDashboardAppUrl('myurl', 'tools')).toBe('myurl?tab=tools&tenantName=test-tenant');

      ConfigurationService.tenantName = '';

      expect(getDashboardAppUrl('myurl')).toBe('myurl?tab=sites&tenantName=');
    });

    it('should set URL to site specific path WHEN siteName is truthy and linkType is "settings"', () => {
      ConfigurationService.tenantName = 'test-tenant';

      expect(getDashboardAppUrl('myurl/', 'settings', 'mysite')).toBe(
        'myurl/sites/mysite/siteidentifiers?tenantName=test-tenant',
      );
    });
  });

  describe(getAnalyticsIdentifierUrl.name, () => {
    it('should set URL base on base url and link type', () => {
      ConfigurationService.tenantName = 'test-tenant';

      expect(getDashboardAppUrl('myurl')).toBe('myurl?tab=sites&tenantName=test-tenant');
      expect(getDashboardAppUrl('')).toBe('?tab=sites&tenantName=test-tenant');
      expect(getDashboardAppUrl('myurl', 'sites')).toBe('myurl?tab=sites&tenantName=test-tenant');
      expect(getDashboardAppUrl('myurl', 'settings')).toBe('myurl?tab=settings&tenantName=test-tenant');
      expect(getDashboardAppUrl('myurl', 'tools')).toBe('myurl?tab=tools&tenantName=test-tenant');

      ConfigurationService.tenantName = '';

      expect(getDashboardAppUrl('myurl')).toBe('myurl?tab=sites&tenantName=');
    });

    it('should set URL to site specific path WHEN rootItemId and id are truthy', () => {
      ConfigurationService.tenantName = 'test-tenant';
      ConfigurationService.organization = 'test-organization';
      expect(getAnalyticsIdentifierUrl('myurl/', 'mysiteCollectionId', 'mysiteRootItemId', 'mySiteId')).toBe(
        'myurl/collection/mysiteCollectionId/sites/mysiteRootItemId/settings/hosts/mySiteId/analytics-and-personalization?tenantName=test-tenant&organization=test-organization',
      );
    });
  });

  describe(getExplorerAppUrl.name, () => {
    it('should set Explorer App URL without version ', () => {
      ConfigurationService.tenantName = 'test-tenant';
      ConfigurationService.organization = 'test-organization';

      expect(getExplorerAppUrl('myurl', 'site-name', 'lang', 'item-id')).toBe(
        'myurl?organization=test-organization&tenantName=test-tenant&sc_lang=lang&sc_site=site-name&sc_itemid=item-id',
      );

      ConfigurationService.tenantName = '';
      ConfigurationService.organization = '';

      expect(getExplorerAppUrl('', '', '', '')).toBe('?organization=&tenantName=&sc_lang=&sc_site=&sc_itemid=');
    });

    it('should set Explorer Content URL with version ', () => {
      ConfigurationService.tenantName = 'test-tenant';
      ConfigurationService.organization = 'test-organization';

      expect(getExplorerAppUrl('myurl', 'site-name', 'lang', 'item-id', 1)).toBe(
        'myurl?organization=test-organization&tenantName=test-tenant&sc_lang=lang&sc_site=site-name&sc_itemid=item-id&sc_version=1',
      );

      ConfigurationService.tenantName = '';
      ConfigurationService.organization = '';

      expect(getExplorerAppUrl('', '', '', '', 1)).toBe(
        '?organization=&tenantName=&sc_lang=&sc_site=&sc_itemid=&sc_version=1',
      );
    });
  });

  describe('handleResponse', () => {
    it('should handle success response', () => {
      const result = handleHttpResponse(success);
      expect(result.apiIsBroken).toBe(false);
      expect(result.requestIsInvalid).toBe(false);
      expect(result.data).toBe('test1');
    });

    it('should handle client error response', () => {
      const result = handleHttpResponse(clientError);
      expect(result.apiIsBroken).toBe(false);
      expect(result.requestIsInvalid).toBe(true);
      expect(result.data).toBe(null);
    });

    it('should handle authentication error response', () => {
      const result = handleHttpResponse(authenticationError);
      expect(result.apiIsBroken).toBe(true);
      expect(result.requestIsInvalid).toBe(false);
      expect(result.data).toBe(null);
    });

    it('should handle resource not found error response', () => {
      const result = handleHttpResponse(resourceNotFoundError);
      expect(result.apiIsBroken).toBe(false);
      expect(result.requestIsInvalid).toBe(false);
      expect(result.data).toBe(null);
    });

    it('should handle server error response', () => {
      const result = handleHttpResponse(serverError);
      expect(result.apiIsBroken).toBe(true);
      expect(result.requestIsInvalid).toBe(false);
      expect(result.data).toBe(null);
    });

    it('should handle multiple response error', () => {
      const result = handleHttpResponse(multipleResponse);
      expect(result.apiIsBroken).toBe(false);
      expect(result.requestIsInvalid).toBe(false);
      expect(result.data).toBe(null);
    });
  });

  describe('handleHttpErrorResponse', () => {
    it('should handle client error response', () => {
      const result = handleHttpErrorResponse(clientErrorResponse);
      expect(result.apiIsBroken).toBe(false);
      expect(result.requestIsInvalid).toBe(true);
      expect(result.data).toBe(null);
    });

    it('should handle authentication error response', () => {
      const result = handleHttpErrorResponse(authenticationErrorResponse);
      expect(result.apiIsBroken).toBe(true);
      expect(result.requestIsInvalid).toBe(false);
      expect(result.data).toBe(null);
    });

    it('should handle resource not found error response', () => {
      const result = handleHttpErrorResponse(resourceNotFoundErrorResponse);
      expect(result.apiIsBroken).toBe(false);
      expect(result.requestIsInvalid).toBe(false);
      expect(result.data).toBe(null);
    });

    it('should handle server error response', () => {
      const result = handleHttpErrorResponse(serverErrorResponse);
      expect(result.apiIsBroken).toBe(true);
      expect(result.requestIsInvalid).toBe(false);
      expect(result.data).toBe(null);
    });
  });

  describe('abTestAnalyticsUrl', () => {
    beforeEach(() => {
      ConfigurationService.cdpTenant = { analyticsAppUrl: 'analyticsAppUrl' } as any;
      ConfigurationService.tenantId = 'tenantId';
      ConfigurationService.organization = 'org_OrgId';
    });
    afterEach(() => {
      ConfigurationService.cdpTenant = null;
      ConfigurationService.tenantId = null;
      ConfigurationService.organization = null;
    });
    it('should provide a correct Analytics app url to when Pocket navigation feature is disabled', () => {
      expect(abTestAnalyticsUrl('testName', 'itemName', 'siteName', false, 'dashboardAppBaseUrl')).toBe(
        'analyticsAppUrl/#/analytics/ab-tests?test=testName&tenantId=tenantId&organization=org_OrgId&page=itemName&site=siteName&enableFeature=abTestsAnalytics',
      );
    });

    it('should provide a correct Dashboard analytics tab url to when Pocket navigation feature is enabled', () => {
      expect(abTestAnalyticsUrl('testName', 'itemName', 'siteName', true, 'dashboardAppBaseUrl')).toBe(
        'dashboardAppBaseUrl/analytics?test=testName&tenantId=tenantId&organization=org_OrgId&page=itemName&site=siteName&enableFeature=abTestsAnalytics',
      );
    });
  });

  describe('sitesAbTestsOverviewUrl', () => {
    it('should provide a correct URL with both organization and tenantName', () => {
      expect(sitesAbTestsOverviewUrl('dashboardAppBaseUrl', 'siteId', 'collectionId', 'org_OrgId', 'tenantName')).toBe(
        'dashboardAppBaseUrl/collection/collectionId/sites/siteId/strategy/ab-tests?organization=org_OrgId&tenantName=tenantName',
      );
    });
  });

  describe('mapErrorMessageToCode', () => {
    it('should map "The item with such name is already defined on this level." to "DuplicateItemName"', () => {
      const result = mapErrorMessageToCode('The item with such name is already defined on this level.');
      expect(result).toBe('DuplicateItemName');
    });

    it('should map "The provided item name is not valid" to "InvalidItemName"', () => {
      const result = mapErrorMessageToCode('The provided item name is not valid');
      expect(result).toBe('InvalidItemName');
    });

    it('should return the original error message if it does not match any predefined cases', () => {
      const customErrorMessage = 'Custom error message';
      const result = mapErrorMessageToCode(customErrorMessage);
      expect(result).toBe(customErrorMessage);
    });

    it('should handle empty error messages gracefully', () => {
      const result = mapErrorMessageToCode('');
      expect(result).toBe('');
    });
  });
});
