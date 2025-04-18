/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ContextHelper } from './context.helper';
import { Context } from './context.service';

const emptyContext: Context = { itemId: '', siteName: '', language: '' };
const completeContext: Context = {
  itemId: 'foo',
  siteName: 'foo',
  language: 'foo',
};

const partialContexts: Context[] = [
  { itemId: 'foo', siteName: '', language: '' },
  { itemId: 'foo', siteName: 'foo', language: '' },
  { itemId: 'foo', siteName: '', language: 'foo' },
  { itemId: '', siteName: 'foo', language: '' },
  { itemId: '', siteName: 'foo', language: 'foo' },
  { itemId: '', siteName: '', language: 'foo' },
];

describe('ContextHelper', () => {
  describe('areEqual()', () => {
    it('should consider falsy fields to be equal', () => {
      const c1 = {} as Context;
      const c2: Context = { itemId: '', siteName: '', language: '' };
      expect(ContextHelper.areEqual(c1, c2)).toBe(true);
    });

    it('should return true when contexts are equal', () => {
      const c1: Context = { itemId: '', siteName: 'foo', language: 'bar' };
      const c2: Context = { itemId: '', siteName: 'foo', language: 'bar' };
      expect(ContextHelper.areEqual(c1, c2)).toBe(true);
    });

    it('should return true when contexts are equal including item version', () => {
      const c1: Context = { itemId: '', siteName: 'foo', language: 'bar', itemVersion: 1 };
      const c2: Context = { itemId: '', siteName: 'foo', language: 'bar', itemVersion: 1 };
      expect(ContextHelper.areEqual(c1, c2)).toBe(true);
    });

    it('should return true when contexts are equal including segement Id', () => {
      const c1: Context = { itemId: '', siteName: 'foo', language: 'bar', itemVersion: 1, variant: 'boxever' };
      const c2: Context = { itemId: '', siteName: 'foo', language: 'bar', itemVersion: 1, variant: 'boxever' };
      expect(ContextHelper.areEqual(c1, c2)).toBe(true);
    });

    it('should return false when contexts are different', () => {
      const c1: Context = { itemId: '', siteName: 'foo', language: 'bar' };
      const c2: Context = { itemId: '1', siteName: 'foo', language: 'bar' };
      const c3: Context = {
        itemId: '',
        siteName: 'different',
        language: 'bar',
      };
      expect(ContextHelper.areEqual(c1, c2)).toBe(false);
      expect(ContextHelper.areEqual(c2, c3)).toBe(false);
      expect(ContextHelper.areEqual(c1, c3)).toBe(false);
    });

    it('should return false when item versions are different', () => {
      const c1: Context = { itemId: '1', siteName: 'foo', language: 'bar', itemVersion: 1 };
      const c2: Context = { itemId: '1', siteName: 'foo', language: 'bar', itemVersion: 2 };
      const c3: Context = {
        itemId: '1',
        itemVersion: 3,
        siteName: 'foo',
        language: 'bar',
      };
      expect(ContextHelper.areEqual(c1, c2)).toBe(false);
      expect(ContextHelper.areEqual(c2, c3)).toBe(false);
      expect(ContextHelper.areEqual(c1, c3)).toBe(false);
    });

    it('should return false when variant names are different', () => {
      const c1: Context = { itemId: '1', siteName: 'foo', language: 'bar', itemVersion: 1, variant: 'A' };
      const c2: Context = { itemId: '1', siteName: 'foo', language: 'bar', itemVersion: 1, variant: 'B' };
      const c3: Context = {
        itemId: '1',
        itemVersion: 1,
        siteName: 'foo',
        language: 'bar',
        variant: 'C',
      };
      expect(ContextHelper.areEqual(c1, c2)).toBe(false);
      expect(ContextHelper.areEqual(c2, c3)).toBe(false);
      expect(ContextHelper.areEqual(c1, c3)).toBe(false);
    });
  });

  describe('isComplete()', () => {
    it('should return true when the supplied Context has a non-falsy value for all required fields', () => {
      expect(ContextHelper.isComplete(completeContext)).toBe(true);
    });

    it('should return false when the supplied Context is partial', () => {
      let casesChecked = 0;
      partialContexts.forEach((context) => {
        casesChecked++;
        expect(ContextHelper.isComplete(context)).toBe(false);
      });
      expect(casesChecked).toBeGreaterThan(0);
    });

    it('should return false when the supplied Context is empty', () => {
      expect(ContextHelper.isComplete(emptyContext)).toBe(false);
    });
  });

  describe('isEmpty()', () => {
    it('should return false when the supplied Context is complete', () => {
      expect(ContextHelper.isEmpty(completeContext)).toBe(false);
    });

    it('should return false when the supplied Context is partial', () => {
      let casesChecked = 0;
      partialContexts.forEach((context) => {
        casesChecked++;
        expect(ContextHelper.isEmpty(context)).toBe(false);
      });
      expect(casesChecked).toBeGreaterThan(0);
    });

    it('should return ture when the supplied Context is empty', () => {
      expect(ContextHelper.isEmpty(emptyContext)).toBe(true);
    });
  });

  describe('removeEmptyFields()', () => {
    it('should return a new partial context where the falsy fields are not present', () => {
      const result = ContextHelper.removeEmptyFields({
        itemId: 'foo',
        language: '',
        siteName: '',
        itemVersion: undefined,
        variant: undefined,
      });
      expect(result.hasOwnProperty('itemId')).toBe(true);
      expect(result.hasOwnProperty('language')).toBe(false);
      expect(result.hasOwnProperty('siteName')).toBe(false);
      expect(result.hasOwnProperty('deviceLayoutId')).toBe(false);
      expect(result.hasOwnProperty('itemVersion')).toBe(false);
      expect(result.hasOwnProperty('variant')).toBe(false);
    });
  });
});
