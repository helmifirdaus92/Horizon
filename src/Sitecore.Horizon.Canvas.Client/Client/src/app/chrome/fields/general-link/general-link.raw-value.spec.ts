/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import {
  AnchorGeneralLink,
  ExternalGeneralLink,
  InternalGeneralLink,
  JavascriptGeneralLink,
  MailGeneralLink,
  MediaGeneralLink,
} from './general-link-value.type';
import { buildGeneralLinkRawValue, parseGeneralLinkRawValue } from './general-link.raw-value';

describe('general-link raw-value', () => {
  describe('external link', () => {
    it('should read back same value', () => {
      const value: ExternalGeneralLink = {
        linktype: 'external',
        url: 'http://example.com',
        text: '<SOME "TEXT">',
        class: undefined,
        target: undefined,
        title: undefined,
      };

      const result = parseGeneralLinkRawValue(buildGeneralLinkRawValue(value), value.url, 'SOME TEXT');

      expect(result).toEqual(value);
    });

    it('should serialize optional properties', () => {
      const value: ExternalGeneralLink = {
        linktype: 'external',
        url: 'http://example.com',
      };

      const result = buildGeneralLinkRawValue(value);

      expect(result).toContain(`target=""`);
      expect(result).toContain(`text=""`);
      expect(result).toContain(`title=""`);
      expect(result).toContain(`class=""`);
    });
  });

  describe('internal link', () => {
    it('should read back same value', () => {
      const value: InternalGeneralLink = {
        linktype: 'internal',
        item: { id: 'TEST_ID', url: 'http://TEST_ID_URL', displayName: 'TEST ITEM' },
        anchor: undefined,
        querystring: undefined,
        text: undefined,
        class: undefined,
        target: undefined,
        title: undefined,
      };

      const result = parseGeneralLinkRawValue(buildGeneralLinkRawValue(value), value.item.url, value.item.displayName);

      expect(result).toEqual(value);
    });

    it('should serialize optional properties', () => {
      const value: InternalGeneralLink = {
        linktype: 'internal',
        item: { id: 'TEST_ID', url: 'http://TEST_ID_URL', displayName: 'TEST ITEM' },
      };

      const result = buildGeneralLinkRawValue(value);

      expect(result).toContain(`anchor=""`);
      expect(result).toContain(`querystring=""`);
      expect(result).toContain(`target=""`);
      expect(result).toContain(`text=""`);
      expect(result).toContain(`title=""`);
      expect(result).toContain(`class=""`);
    });
  });

  describe('media link', () => {
    it('should read back same value', () => {
      const value: MediaGeneralLink = {
        linktype: 'media',
        item: { id: 'TEST_MEDIA_ID', url: 'http://TEST_MEDIA_ID_URL', displayName: 'TEST MEDIA ITEM' },
        text: undefined,
        class: undefined,
        target: undefined,
        title: undefined,
      };

      const result = parseGeneralLinkRawValue(buildGeneralLinkRawValue(value), value.item.url, value.item.displayName);

      expect(result).toEqual(value);
    });

    it('should serialize optional properties', () => {
      const value: MediaGeneralLink = {
        linktype: 'media',
        item: { id: 'TEST_MEDIA_ID', url: 'http://TEST_MEDIA_ID_URL', displayName: 'TEST MEDIA ITEM' },
      };

      const result = buildGeneralLinkRawValue(value);

      expect(result).toContain(`target=""`);
      expect(result).toContain(`text=""`);
      expect(result).toContain(`title=""`);
      expect(result).toContain(`class=""`);
    });
  });

  describe('anchor link', () => {
    it('should read back same value', () => {
      const value: AnchorGeneralLink = {
        linktype: 'anchor',
        anchor: 'ANCH',
        text: '<SOME "TEXT">',
        class: undefined,
        title: undefined,
      };

      const result = parseGeneralLinkRawValue(buildGeneralLinkRawValue(value), value.anchor, 'SOME TEXT');

      expect(result).toEqual(value);
    });

    it('should serialize optional properties', () => {
      const value: AnchorGeneralLink = {
        linktype: 'anchor',
        anchor: 'ANCH',
      };

      const result = buildGeneralLinkRawValue(value);

      expect(result).toContain(`text=""`);
      expect(result).toContain(`title=""`);
      expect(result).toContain(`class=""`);
    });
  });

  describe('mail link', () => {
    it('should read back same value', () => {
      const value: MailGeneralLink = {
        linktype: 'mailto',
        url: 'example@mail.com',
        text: '<SOME "TEXT">',
        class: undefined,
        title: undefined,
      };

      const result = parseGeneralLinkRawValue(buildGeneralLinkRawValue(value), value.url, 'SOME TEXT');

      expect(result).toEqual(value);
    });

    it('should serialize optional properties', () => {
      const value: MailGeneralLink = {
        linktype: 'mailto',
        url: 'example@mail.com',
      };

      const result = buildGeneralLinkRawValue(value);

      expect(result).toContain(`text=""`);
      expect(result).toContain(`title=""`);
      expect(result).toContain(`class=""`);
    });
  });

  describe('javascript link', () => {
    it('should read back same value', () => {
      const value: JavascriptGeneralLink = {
        linktype: 'javascript',
        url: 'alert("hello")',
        text: '<SOME "TEXT">',
        class: undefined,
        title: undefined,
      };

      const result = parseGeneralLinkRawValue(buildGeneralLinkRawValue(value), '', 'SOME TEXT');

      expect(result).toEqual(value);
    });

    it('should serialize optional properties', () => {
      const value: JavascriptGeneralLink = {
        linktype: 'javascript',
        url: 'alert("hello")',
      };

      const result = buildGeneralLinkRawValue(value);

      expect(result).toContain(`text=""`);
      expect(result).toContain(`title=""`);
      expect(result).toContain(`class=""`);
    });
  });
});
