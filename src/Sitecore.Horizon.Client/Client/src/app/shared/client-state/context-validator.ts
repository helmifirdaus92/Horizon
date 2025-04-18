/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseItemDalService } from '../graphql/item.dal.service';
import { LanguageDalBaseService } from '../graphql/language.dal.service';
import { LoggingService } from '../logging.service';
import { Site, SiteService } from '../site-language/site-language.service';
import { Context } from './context.service';

function hasNameInList(value: string, list: any[]): boolean {
  return list.some((lookupItem) => lookupItem?.name === value);
}

interface ResolvedValue {
  value: string | number;
  wasCoerced: boolean;
}

export interface ValidContextResult {
  context: Context;
  resolvedValues: { [K in keyof Context]: ResolvedValue };
}

export class EmptySitesError extends Error {}

@Injectable({ providedIn: 'root' })
export class ContextValidator {
  constructor(
    private readonly itemService: BaseItemDalService,
    private readonly languageService: LanguageDalBaseService,
    private readonly logger: LoggingService,
    private readonly siteService: SiteService,
  ) {}

  /**
   * Validate the given Context and return a trusted result:
   * - If the context has missing values it will try to fill in the gaps and validate
   * - If the context is complete it will validate that the values are compatible with each other
   * - If the given context is empty or validation fails it will fallback to default values from
   *   the default configured site.
   *
   * ex. Validation could fail if the `itemId` doesn't exist in `siteName`.
   */
  async getValidContext(untrustedOrIncompleteContext: Context): Promise<ValidContextResult> {
    const { itemId, itemVersion, language, siteName } = untrustedOrIncompleteContext;

    const resolvedSite = this.resolveSite(siteName, this.siteService.getSites());
    const resolvedLanguage = await firstValueFrom(this.resolveLanguage(language, resolvedSite.language));

    const resolvedItem = await firstValueFrom(
      this.resolveItem(itemId, resolvedLanguage.value.toString(), resolvedSite.value.toString(), itemVersion),
    );

    return {
      context: {
        itemId: resolvedItem.value.toString(),
        itemVersion: resolvedItem.itemVersion,
        language: resolvedLanguage.value.toString(),
        siteName: resolvedSite.value.toString(),
      },
      resolvedValues: {
        itemId: resolvedItem,
        itemVersion: { value: resolvedItem.itemVersion, wasCoerced: resolvedItem.wasCoerced },
        language: resolvedLanguage,
        siteName: resolvedSite,
      },
    };
  }

  private resolveLanguage(language: string, siteLanguage: string): Observable<ResolvedValue> {
    return this.languageService.fetchLanguages().pipe(
      map((languageList) => {
        if (languageList.length === 0) {
          this.logger.warn('List of languages is empty');

          if (siteLanguage) {
            return { value: siteLanguage, wasCoerced: !language };
          } else {
            throw Error('Cannot resolve language');
          }
        }

        const fallbackLanguage = hasNameInList(siteLanguage, languageList) ? siteLanguage : languageList[0].name;

        if (language === '') {
          return { value: fallbackLanguage, wasCoerced: false };
        }

        if (!hasNameInList(language, languageList)) {
          return { value: fallbackLanguage, wasCoerced: true };
        }

        return { value: language, wasCoerced: false };
      }),
    );
  }

  private resolveSite(
    siteName: string,
    definedSites: Array<Omit<Site, 'siteItem'>>,
  ): ResolvedValue & { language: string } {
    if (definedSites.length === 0) {
      throw new EmptySitesError('List of sites is empty');
    }

    if (siteName === '') {
      return { value: definedSites[0].name, wasCoerced: false, language: definedSites[0].language };
    }

    // Sitecore checks site Urls equality in case-insensitive mode, so we should be able to resolve it regardless of site Url case.
    const site = definedSites.find(
      (lookupItem) => lookupItem.name.toLocaleLowerCase() === siteName.toLocaleLowerCase(),
    );

    if (!site) {
      return { value: definedSites[0].name, wasCoerced: true, language: definedSites[0].language };
    }

    return { value: site.name, wasCoerced: false, language: site.language };
  }

  private resolveItem(
    itemId: string,
    language: string,
    siteName: string,
    itemVersion?: number,
  ): Observable<ResolvedValue & { itemVersion: number }> {
    if (itemId === '') {
      return this.getSiteStartItem(siteName, language).pipe(
        map(({ id, version }) => ({ value: id, wasCoerced: false, itemVersion: version })),
      );
    }

    const siteId = this.siteService.getSiteByName(siteName)?.id;
    if (!siteId) {
      throw Error('site could not be found');
    }

    return this.itemService.getItemType(itemId, language, siteName, siteId, itemVersion).pipe(
      map((item) => {
        if (item.kind !== 'Page') {
          throw Error('Invalid context item');
        }

        return { value: item.id, wasCoerced: false, itemVersion: item.version };
      }),
      // If item is not valid replace it with root item of valid site
      catchError(() => {
        return this.getSiteStartItem(siteName, language).pipe(
          map(({ id, version }) => ({ value: id, wasCoerced: true, itemVersion: version })),
        );
      }),
    );
  }

  private getSiteStartItem(siteName: string, language: string) {
    return this.siteService.getStartItem(siteName, language);
  }
}
