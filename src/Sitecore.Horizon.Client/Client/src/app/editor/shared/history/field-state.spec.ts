/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { FieldState } from './field-state';

describe('FieldState', () => {
  describe('isSameField()', () => {
    it('should return false for same field on different items', () => {
      // arrange
      const fieldStateA = new FieldState('fieldIdA', 'itemA', { rawValue: 'valueA' }, false, 1);
      const fieldStateB = new FieldState('fieldIdA', 'itemB', { rawValue: 'valueA' }, false, 1);

      // act
      const res = fieldStateA.isSameField(fieldStateB);

      // assert
      expect(res).toBe(false);
    });

    it('should return true for same field on same item', () => {
      // arrange
      const fieldStateA = new FieldState('fieldIdA', 'itemA', { rawValue: 'valueA' }, false, 1);
      const fieldStateB = new FieldState('fieldIdA', 'itemA', { rawValue: 'valueA' }, false, 1);

      // act
      const res = fieldStateA.isSameField(fieldStateB);

      // assert
      expect(res).toBe(true);
    });

    it('should return false for different fields on same item', () => {
      // arrange
      const fieldStateA = new FieldState('fieldIdA', 'itemA', { rawValue: 'valueA' }, false, 1);
      const fieldStateB = new FieldState('fieldIdB', 'itemA', { rawValue: 'valueA' }, false, 1);

      // act
      const res = fieldStateA.isSameField(fieldStateB);

      // assert
      expect(res).toBe(false);
    });

    it('should return false for same field on different item versions', () => {
      // arrange
      const fieldStateA = new FieldState('fieldIdA', 'itemA', { rawValue: 'valueA' }, false, 1);
      const fieldStateB = new FieldState('fieldIdA', 'itemA', { rawValue: 'valueA' }, false, 2);

      // act
      const res = fieldStateA.isSameField(fieldStateB);

      // assert
      expect(res).toBe(false);
    });

    it('should return true for same field on same item if item version not provided', () => {
      // arrange
      const fieldStateA = new FieldState('fieldIdA', 'itemA', { rawValue: 'valueA' }, false);
      const fieldStateB = new FieldState('fieldIdA', 'itemA', { rawValue: 'valueA' }, false);

      // act
      const res = fieldStateA.isSameField(fieldStateB);

      // assert
      expect(res).toBe(true);
    });
  });

  describe('rawValue', () => {
    it('should return value.rawValue when value is a object', () => {
      const value = { rawValue: 'oats, granola and fruit' };
      const field = new FieldState('', '', value, false);
      expect(field.rawValue).toBe(value.rawValue);
    });

    it('should return empty string when value is falsy', () => {
      const field = new FieldState('', '', { rawValue: '' }, false);
      expect(field.rawValue).toBe('');
    });
  });
});
