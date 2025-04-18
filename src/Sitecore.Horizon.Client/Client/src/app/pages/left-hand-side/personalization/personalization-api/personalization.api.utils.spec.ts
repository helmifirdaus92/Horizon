/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { formatFriendlyId } from './personalization.api.utils';

describe('personalization api utils', () => {
  describe('formatFriendlyId', () => {
    it('should return correct id when isEmbedded is true and personalizationScopeValue and renderingInstanceId are provided', () => {
      const result = formatFriendlyId(true, 'scope', 'itemId', 'instanceId', 'en');
      expect(result).toEqual('embedded_scope_itemid_instanceid_en');
    });

    it('should return correct id when isEmbedded is false and personalizationScopeValue and renderingInstanceId are provided', () => {
      const result = formatFriendlyId(false, 'scope', 'itemId', 'instanceId', 'en');
      expect(result).toMatch(/^component_scope_itemid_instanceid_en/);
    });

    it('should return correct id when isEmbedded is true and personalizationScopeValue is undefined', () => {
      const result = formatFriendlyId(true, undefined, 'itemId', 'instanceId', 'en');
      expect(result).toEqual('embedded_itemid_instanceid_en');
    });

    it('should return correct id when isEmbedded is true and renderingInstanceId is undefined', () => {
      const result = formatFriendlyId(true, 'scope', 'itemId', undefined, 'en');
      expect(result).toEqual('embedded_scope_itemid_en');
    });
  });
});
