/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { BXComponentVariant } from 'app/pages/left-hand-side/personalization/personalization.types';
import { VARIANT_REGEX, VARIANTS_VERSIONS } from './performance.types';

export function setVariantVersions<T extends BXComponentVariant>(variants: T[]): T[] {
  return variants
    .map((v) => ({
      ...v,
      version: v.isControl ? VARIANTS_VERSIONS[0] : v.name.match(VARIANT_REGEX)?.[0]?.toLowerCase() || '',
    }))
    .map((variant, _, allVariants) => {
      if (!variant.version) {
        for (let i = 1; i < setVariantVersions.length; i++) {
          if (!allVariants.find((v) => v.version === VARIANTS_VERSIONS[i])) {
            return { ...variant, version: VARIANTS_VERSIONS[i] };
          }
        }
      }
      return variant;
    })
    .sort((a, b) => a.version?.localeCompare(b.version || '') || 0);
}
