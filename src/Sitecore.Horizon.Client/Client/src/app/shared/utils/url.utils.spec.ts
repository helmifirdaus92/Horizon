/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { parseParameterFromQueryString, setParameterIntoQueryString } from './url.utils';

describe('URL utils', () => {
  describe(parseParameterFromQueryString.name, () => {
    it('should parse language case #1', () => {
      expect(parseParameterFromQueryString('sc_lang=en', 'sc_lang')).toBe('en');
    });

    it('should parse language case #2', () => {
      expect(parseParameterFromQueryString('?sc_lang=en', 'sc_lang')).toBe('en');
    });

    it('should parse language case #3', () => {
      expect(parseParameterFromQueryString('another_param=value&sc_lang=en&another_param=value', 'sc_lang')).toBe('en');
    });

    describe('WHEN value is not a query', () => {
      it('should return null case #1', () => {
        expect(parseParameterFromQueryString()).toBeNull();
      });

      it('should return null case #2', () => {
        expect(parseParameterFromQueryString('')).toBeNull();
      });

      it('should return null case #4', () => {
        expect(parseParameterFromQueryString('http://my-url.co?sc_lang=en')).toBeNull();
      });

      it('should return null case #5', () => {
        expect(parseParameterFromQueryString('http://my-url.co?sc_lang=en', 'sc_lang')).toBeNull();
      });
    });
  });

  describe(setParameterIntoQueryString.name, () => {
    it('should set language parameter case #1', () => {
      expect(setParameterIntoQueryString('', 'sc_lang', 'en')).toBe('sc_lang=en');
    });

    it('should set language parameter case #2', () => {
      expect(setParameterIntoQueryString('param=val', 'sc_lang', 'en')).toBe('param=val&sc_lang=en');
    });

    describe('WHEN language is null', () => {
      it('should remove language parameter case #1', () => {
        expect(setParameterIntoQueryString('param=val', 'sc_lang', null)).toBe('param=val');
      });

      it('should remove language parameter case #2', () => {
        expect(setParameterIntoQueryString('param=val&sc_lang=en', 'sc_lang', null)).toBe('param=val');
      });
    });
  });
});
