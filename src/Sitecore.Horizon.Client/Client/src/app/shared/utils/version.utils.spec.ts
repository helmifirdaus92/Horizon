/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Version } from './version.utils';

describe('Version utils', () => {
  describe('isLocalBuild', () => {
    it('should resolve isLocalBuild', () => {
      expect(new Version('1.1.1').isLocalBuild()).toBe(false);
      expect(new Version('0.1.1').isLocalBuild()).toBe(false);
      expect(new Version('1.0.1').isLocalBuild()).toBe(false);
      expect(new Version('1.1.0').isLocalBuild()).toBe(false);

      expect(new Version('1.not a number.1').isLocalBuild()).toBe(false);
      expect(new Version('not a number.1.1').isLocalBuild()).toBe(false);

      expect(new Version('0.0.0.0').isLocalBuild()).toBe(true);
      expect(new Version('not a number').isLocalBuild()).toBe(true);
      expect(new Version('').isLocalBuild()).toBe(true);
      expect(new Version(undefined as any).isLocalBuild()).toBe(true);
      expect(new Version(null as any).isLocalBuild()).toBe(true);
      expect(new Version([1, 2, 3] as any).isLocalBuild()).toBe(true);
      expect(new Version({ 1: 'a', 2: 'b' } as any).isLocalBuild()).toBe(true);
    });
  });

  describe('isEqualOrGreaterThan', () => {
    it('should resolve isEqualOrGreaterThan', () => {
      expect(new Version('1.1.1').isEqualOrGreaterThan(new Version('1.1.1'))).toBe(true);
      expect(new Version('2.0.0').isEqualOrGreaterThan(new Version('1.1.1'))).toBe(true);
      expect(new Version('1.2.0').isEqualOrGreaterThan(new Version('1.1.1'))).toBe(true);
      expect(new Version('1.1.2').isEqualOrGreaterThan(new Version('1.1.1'))).toBe(true);

      expect(new Version('0.2.2').isEqualOrGreaterThan(new Version('1.1.1'))).toBe(false);
      expect(new Version('1.0.2').isEqualOrGreaterThan(new Version('1.1.1'))).toBe(false);
      expect(new Version('1.1.0').isEqualOrGreaterThan(new Version('1.1.1'))).toBe(false);

      expect(new Version('not a number').isEqualOrGreaterThan(new Version('1.1.1'))).toBe(true);
      expect(new Version('1.1.1').isEqualOrGreaterThan(new Version('not a number'))).toBe(true);
      expect(new Version('').isEqualOrGreaterThan(new Version('1.1.1'))).toBe(true);
      expect(new Version('1.1.1').isEqualOrGreaterThan(new Version(''))).toBe(true);

      expect(new Version('1.not a number.1').isEqualOrGreaterThan(new Version('1.1.1'))).toBe(false);
      expect(new Version('not a number.1.1').isEqualOrGreaterThan(new Version('1.1.1'))).toBe(false);
      expect(new Version('1.1.not a number').isEqualOrGreaterThan(new Version('1.1.1'))).toBe(false);

      expect(new Version('1.1.1').isEqualOrGreaterThan(new Version('not a number'))).toBe(true);
      expect(new Version('1.1.1').isEqualOrGreaterThan(new Version('1.not a number.1'))).toBe(true);
      expect(new Version('1.1.1').isEqualOrGreaterThan(new Version('1.1.not a number'))).toBe(true);
      expect(new Version('1.1.1').isEqualOrGreaterThan(new Version('1.1.1-alpha'))).toBe(true);
      expect(new Version('1.1.1').isEqualOrGreaterThan(new Version('1.1.1+build007'))).toBe(true);
    });
  });
});
