/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { LanguageDalBaseService } from 'app/shared/graphql/language.dal.service';
import { MaybeObservable, resolveMaybeObservables } from 'app/shared/utils/rxjs/rxjs-custom';
import { Observable, firstValueFrom, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { isSameGuid } from '../utils/utils';
import { SiteRepositoryService } from './site-repository.service';

export interface Language {
  name: string | null;
  displayName: string;
  nativeName: string | null;
  englishName: string | null;
  iso: string | null;
}

export interface Site {
  id: string;
  hostId: string;
  collectionId?: string;
  name: string;
  displayName: string;
  language: string;
  appName?: string;
  layoutServiceConfig?: string;
  renderingEngineEndpointUrl?: string;
  renderingEngineApplicationUrl?: string;
  pointOfSale?: Array<{ language: string; name: string }>;
  startItemId: string;
  supportedLanguages: string[];
  brandKitId?: string;
  properties: {
    isSxaSite: boolean;
    isLocalDatasourcesEnabled: boolean;
    tagsFolderId: string;
  };
}

export interface SiteCollection {
  id: string;
  name: string;
  displayName: string;
}

@Injectable({ providedIn: 'root' })
export class SiteService {
  constructor(
    private readonly context: ContextService,
    private readonly languageService: LanguageService,
    private readonly siteRepository: SiteRepositoryService,
  ) {}

  async init() {
    await this.siteRepository.init();
  }

  getContextSite(): Site {
    const contextSite = this.siteRepository.getSiteByName(this.context.siteName);
    if (!contextSite) {
      throw Error('Site could not be found');
    }
    return contextSite;
  }

  // *=Basic-site&en=Basic-site-en&da=basic-site-da-dk&ja=basic-site-jp
  async getPointOfSale(): Promise<string | null> {
    const pointOfSale = this.getContextSite()?.pointOfSale;

    if (!pointOfSale) {
      return null;
    }

    const languageInIsoFormat = await firstValueFrom(this.languageService.getLanguageIsoFormat(this.context.language));
    const sitePosInCurrentLangByLanguageName = pointOfSale.find((p) => p.language === this.context.language)?.name;
    const sitePosInCurrentLangByIsoFormat = pointOfSale.find((p) => p.language === languageInIsoFormat)?.name;
    const fallbackPos = pointOfSale.find((p) => p.language === '*')?.name;

    return sitePosInCurrentLangByLanguageName ?? sitePosInCurrentLangByIsoFormat ?? fallbackPos ?? null;
  }

  getSites(): Site[] {
    return this.siteRepository.getSites();
  }

  getSiteCollections(): SiteCollection[] {
    return this.siteRepository.getSiteCollections();
  }

  /**
   * Verify if a string is a valid siteName, otherwise return a context site
   */
  getValidSiteName(siteName: MaybeObservable<string | null>): Observable<string> {
    return resolveMaybeObservables(siteName).pipe(
      map(([site]) => {
        if (!site) {
          return this.context.siteName;
        }

        return this.getSites().some((s) => s.name.toLocaleLowerCase() === site.toLocaleLowerCase())
          ? site
          : this.context.siteName;
      }),
    );
  }

  getStartItem(name: string, language: string): Observable<{ id: string; version: number }> {
    const site = this.siteRepository.getSiteByName(name);
    if (!site) {
      throw Error('site could not be found');
    }

    return this.siteRepository.getStartItem(site.id, name, language);
  }

  isRootStartItem(name: string): boolean {
    const site = this.siteRepository.getSiteByName(name);
    if (!site) {
      throw Error('site could not be found');
    }
    return isSameGuid(site.id, site.startItemId);
  }

  getDefaultSite(name?: string, language?: string): Observable<Pick<Site, 'id' | 'name'>> {
    const site = this.siteRepository.getSiteByName(name);
    if (!site) {
      console.warn('site could not be found');
      return this.siteRepository.getDefaultSite();
    }

    return this.siteRepository.getDefaultSite(site.id, site.name, language);
  }

  getSiteLanguages(siteName: string): Language[] {
    const definedLanguages: Language[] = this.languageService.getDefinedLanguages();
    const site = this.siteRepository.getSiteByName(siteName);

    // If the site is found and it has supported languages defined, filter the defined languages
    if (site && site.supportedLanguages.length > 0) {
      const supportedLanguagesSet = new Set(site.supportedLanguages);
      return definedLanguages.filter((language) => language.name && supportedLanguagesSet.has(language.name));
    }

    // If the site is not found or it has no supported languages defined, return all defined languages
    return definedLanguages;
  }

  getSiteByName(name?: string): Site | undefined {
    return this.siteRepository.getSiteByName(name);
  }
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private _definedLanguages: Language[] = [];

  constructor(
    private readonly languageDalService: LanguageDalBaseService,
    private readonly context: ContextService,
  ) {}

  /**
   * Initialize the service by fetching and caching the languages.
   */
  async init() {
    const languages = await firstValueFrom(this.languageDalService.fetchLanguages());
    this._definedLanguages = [...languages].sort((l1, l2) => l1.displayName.localeCompare(l2.displayName));
  }

  /**
   * Get the list of available languages.
   */
  getLanguages(): Observable<Language[]> {
    if (this._definedLanguages.length > 0) {
      return of(this._definedLanguages);
    } else {
      return this.languageDalService.fetchLanguages().pipe(
        map((languages) => {
          this._definedLanguages = languages.sort((l1, l2) => l1.displayName.localeCompare(l2.displayName));
          return this._definedLanguages;
        }),
      );
    }
  }

  /**
   * Verify if a string is a valid language, otherwise return a context language.
   */
  getValidLanguage(languageName: MaybeObservable<string | null>): Observable<string> {
    return resolveMaybeObservables(languageName).pipe(
      switchMap(([language]) => {
        if (!language) {
          return of(this.context.language);
        }

        return this.getLanguages().pipe(
          map((languages) => (languages.some((l) => l.name === language) ? language : this.context.language)),
        );
      }),
    );
  }

  /**
   * Get the ISO format of a language by name.
   */
  getLanguageIsoFormat(languageName: string): Observable<string> {
    return this.getLanguages().pipe(
      map((languages) => languages.find((l) => l.name === languageName)?.iso ?? languageName.split('-')?.[0]),
    );
  }

  /**
   * Get the list of languages from the in-memory cache.
   */
  getDefinedLanguages(): Language[] {
    return this._definedLanguages;
  }
}
