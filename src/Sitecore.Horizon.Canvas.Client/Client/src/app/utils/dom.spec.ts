/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { setSizeAttribute } from './dom';

describe('dom utils', () => {
  describe('setSizeAttribute', () => {
    it('should set the given size', () => {
      const el = document.createElement('img');
      setSizeAttribute(el, 'width', 10);

      expect(el.hasAttribute('width')).toBe(true);
      expect(el.width).toBe(10);
    });

    describe('AND size is undefined', () => {
      it('should remove the size attribute', () => {
        const el = document.createElement('img');
        el.width = 10;
        setSizeAttribute(el, 'width');

        expect(el.hasAttribute('width')).toBe(false);
      });
    });
  });
});
