/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { buildXmlElement, parseXmlElement } from './xml';

describe('xml utils', () => {
  describe('parseXmlElement', () => {
    it('should read all attributes', () => {
      const xml = `<elem attr1="val1" attr2="12" attr3="true" />`;

      const result = parseXmlElement(xml);

      expect(result.attr1).toBe('val1');
      expect(result.attr2).toBe('12');
      expect(result.attr3).toBe('true');
      expect(result.nonExistingAttribute).toBeUndefined();
    });

    it('should read attribute case sensitive', () => {
      const xml = `<elem aTtR="val" />`;

      const result = parseXmlElement(xml);

      expect(result['aTtR']).toBe('val');
    });

    it('should ignore nested nodes', () => {
      const xml = `
          <elem>
            <nested attr1="val" />
          </elem>
      `;

      const result = parseXmlElement(xml);

      expect(Object.getOwnPropertyNames(result).length).toBe(0);
    });
  });

  describe('buildXmlElement', () => {
    it('should build xml node', () => {
      const attributes = {
        attr1: 'val1',
        'attr-2': '12',
        attr3: 'true',
      };

      const result = buildXmlElement('elem', attributes);

      expect(result).toBe(`<elem attr1="val1" attr-2="12" attr3="true"/>`);
    });

    it('should not serialize undefined properties', () => {
      const attributes = {
        attr1: '',
        attr2: undefined,
      };

      const result = buildXmlElement('elem', attributes);

      expect(result).toBe(`<elem attr1=""/>`);
    });
  });
});
