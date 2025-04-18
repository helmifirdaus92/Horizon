/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { BXHistogram, BXHistogramDataCurrent } from '../analytics.types';

export function variantIdToName(
  data: BXHistogramDataCurrent,
  pageVariants: Array<{ variantName: string | null; variantId: 'default' | string }>,
  defaultVariantDisplayName: string,
): BXHistogramDataCurrent {
  if (!data || !pageVariants?.length) {
    return data;
  }

  return {
    name:
      pageVariants.find((item) => {
        const matched = data.name.endsWith('_' + item.variantId);

        if (matched && item.variantId === 'default') {
          item.variantName = defaultVariantDisplayName;
        }

        return matched;
      })?.variantName ?? data.name,
    value: data.value,
  };
}

@Pipe({
  name: 'variantIdToName',
})
export class VariantIdToNamePipe implements PipeTransform {
  constructor(private readonly translateService: TranslateService) {}

  async transform(
    value: BXHistogram | null | undefined,
    pageVariants: Array<{ variantName: string | null; variantId: 'default' | string }>,
  ): Promise<BXHistogram | null | undefined> {
    if (!value || !pageVariants?.length) {
      return value;
    }

    const result = { ...value };
    const defaultVariantDisplayName = await firstValueFrom(this.translateService.get('COMMON.DEFAULT'));

    result.data.current = result.data.current.map((item) =>
      variantIdToName(item, pageVariants, defaultVariantDisplayName),
    );
    result.data.historic = result.data.historic.map((item) =>
      variantIdToName(item, pageVariants, defaultVariantDisplayName),
    );

    return result;
  }
}
