/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { parseInlineStyle, parsePadding, parseStyleValue, unitValueConverter } from './inline-style.utils';

describe('style utils', () => {
  describe('parseInlineStyle', () => {
    it('should parse a single style correctly', () => {
      const result = parseInlineStyle('color:red');
      expect(result).toEqual({ color: 'red' });
    });

    it('should parse multiple styles correctly', () => {
      const result = parseInlineStyle('color:red;background-color:blue');
      expect(result).toEqual({ color: 'red', 'background-color': 'blue' });
    });

    it('should ignore invalid styles', () => {
      const result = parseInlineStyle('color:red;invalid');
      expect(result).toEqual({ color: 'red' });
    });

    it('should handle empty string', () => {
      const result = parseInlineStyle('');
      expect(result).toEqual({});
    });

    it('should handle undefined', () => {
      const result = parseInlineStyle(undefined);
      expect(result).toEqual({});
    });

    it('should trim spaces around keys and values', () => {
      const result = parseInlineStyle(' color : red ');
      expect(result).toEqual({ color: 'red' });
    });
  });

  describe('parsePadding', () => {
    it('should parse single value correctly', () => {
      const result = parsePadding('10px');
      expect(result).toEqual({ value: { top: 10, right: 10, bottom: 10, left: 10 }, unit: 'px' });
    });

    it('should parse two values correctly', () => {
      const result = parsePadding('10px 20px');
      expect(result).toEqual({ value: { top: 10, right: 20, bottom: 10, left: 20 }, unit: 'px' });
    });

    it('should parse three values correctly', () => {
      const result = parsePadding('10px 20px 30px');
      expect(result).toEqual({ value: { top: 10, right: 20, bottom: 30, left: 20 }, unit: 'px' });
    });

    it('should parse four values correctly', () => {
      const result = parsePadding('10rem 20rem 30rem 40rem');
      expect(result).toEqual({ value: { top: 10, right: 20, bottom: 30, left: 40 }, unit: 'rem' });
    });

    it('should handle non-numeric values', () => {
      const result = parsePadding('10px abc 30px 40px');
      expect(result).toEqual({ value: { top: 10, right: 0, bottom: 30, left: 40 }, unit: 'px' });
    });

    it('should handle empty string', () => {
      const result = parsePadding('');
      expect(result).toEqual({ value: { top: 0, right: 0, bottom: 0, left: 0 }, unit: 'px' });
    });

    it('should handle undefined', () => {
      const result = parsePadding(undefined);
      expect(result).toEqual({ value: { top: 0, right: 0, bottom: 0, left: 0 }, unit: 'px' });
    });

    it('should parse the unit correctly', () => {
      const result = parsePadding('10rem');
      expect(result).toEqual({ value: { top: 10, right: 10, bottom: 10, left: 10 }, unit: 'rem' });
    });
  });

  describe('parseStyleValue', () => {
    it('should parse a style value correctly', () => {
      const result = parseStyleValue('10px');
      expect(result).toEqual({ value: '10', unit: 'px' });
    });

    it('should parse a style value with spaces correctly', () => {
      const result = parseStyleValue(' 10px ');
      expect(result).toEqual({ value: '10', unit: 'px' });
    });

    it('should parse a style value with rem unit correctly', () => {
      const result = parseStyleValue('10rem');
      expect(result).toEqual({ value: '10', unit: 'rem' });
    });

    it('should parse a style value with rem unit and spaces correctly', () => {
      const result = parseStyleValue(' 10rem ');
      expect(result).toEqual({ value: '10', unit: 'rem' });
    });

    it('should handle empty string', () => {
      const result = parseStyleValue('');
      expect(result).toEqual({ value: '', unit: 'px' });
    });

    it('should handle invalid value', () => {
      const result = parseStyleValue('invalid');
      expect(result).toEqual({ value: 'invalid', unit: 'px' });
    });
  });

  describe('unitValueConverter', () => {
    it('should convert px to rem correctly', () => {
      const result = unitValueConverter('rem', { value: 10, unit: 'px' }, 16);
      expect(result).toEqual(0.625);
    });

    it('should convert rem to px correctly', () => {
      const result = unitValueConverter('px', { value: 10, unit: 'rem' }, 16);
      expect(result).toEqual(160);
    });

    it('should return 0 if current value is 0', () => {
      const result = unitValueConverter('rem', { value: 0, unit: 'px' }, 16);
      expect(result).toEqual(0);
    });

    it('should not convert if the unit is the same', () => {
      const result = unitValueConverter('px', { value: 10, unit: 'px' }, 16);
      expect(result).toEqual(10);
    });
  });
});
