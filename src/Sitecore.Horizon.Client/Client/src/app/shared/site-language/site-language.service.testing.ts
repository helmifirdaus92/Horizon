/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NgModule } from '@angular/core';
import { CONTEXT_SERVICE_SCHEDULER } from 'app/shared/client-state/context.service';
import { DEFAULT_TEST_CONTEXT } from 'app/shared/client-state/context.service.testing';
import {
  Language,
  LanguageService,
  Site,
  SiteCollection,
  SiteService,
} from 'app/shared/site-language/site-language.service';
import { MaybeObservable, resolveMaybeObservables, shareReplayLatest } from 'app/shared/utils/rxjs/rxjs-custom';
import { BehaviorSubject, Observable, of, queueScheduler } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Interface } from '../utils/lang.utils';

export const dummySites: Site[] = [
  {
    id: '227bc0ff-6237-42b6-851f-49e68c1998e8',
    hostId: 'hostId 1',
    name: 'website',
    displayName: 'website-displayName',
    language: 'language',
    appName: 'appName',
    layoutServiceConfig: 'layoutServiceConfig',
    renderingEngineEndpointUrl: 'renderingEngineEndpointUrl',
    renderingEngineApplicationUrl: 'renderingEngineApplicationUrl',
    pointOfSale: [{ language: '*', name: 'pointOfSale' }],
    startItemId: 'startItemId1',
    supportedLanguages: ['en'],
    collectionId: 'collectionId',
    properties: {
      isSxaSite: true,
      tagsFolderId: 'id001',
      isLocalDatasourcesEnabled: true,
    },
  },
  {
    id: '337bc0ff-6237-42b6-851f-49e68c1998e8',
    hostId: 'hostId 2',
    name: 'site two',
    displayName: 'site two displayName',
    language: 'language2',
    appName: 'appName',
    layoutServiceConfig: 'layoutServiceConfig2',
    renderingEngineEndpointUrl: 'renderingEngineEndpointUrl2',
    renderingEngineApplicationUrl: 'renderingEngineApplicationUrl2',
    pointOfSale: [{ language: '*', name: 'pointOfSale2' }],
    startItemId: 'startItemId2',
    supportedLanguages: ['en', 'da'],
    collectionId: 'collectionId',
    properties: {
      isSxaSite: true,
      tagsFolderId: 'id001',
      isLocalDatasourcesEnabled: true,
    },
  },
];
export const dummySelectedSite = 'website';
export const dummyLanguages: Language[] = [
  { name: 'en', displayName: 'English', nativeName: 'English', iso: 'en', englishName: 'English' },
  { name: 'cat', displayName: 'Catalan', nativeName: 'català', iso: 'cat', englishName: 'Catalan (Catalan)' },
];

export const dummyLanguagesWithoutDisplayName: Language[] = [
  { name: 'en', displayName: 'English', nativeName: 'English', iso: 'en', englishName: null },
  { name: 'cat', displayName: 'Catalan', nativeName: 'català', iso: 'cat', englishName: null },
];
export const dummySelectedLanguage = 'en';

export class SiteServiceStub implements Interface<SiteService> {
  getSiteLanguages(_name: string): Language[] {
    return dummyLanguages;
  }
  getSiteByName(_name: string): Site | undefined {
    return dummySites[0];
  }
  isRootStartItem(_name: string): boolean {
    return false;
  }
  getContextSite(): Site {
    throw new Error('Method not implemented.');
  }
  getSites(): Site[] {
    return dummySites;
  }
  getSiteCollections(): SiteCollection[] {
    return [];
  }

  async getPointOfSale(): Promise<string | null> {
    return (dummySites[0].pointOfSale && dummySites[0].pointOfSale[0].name) ?? null;
  }

  init(): Promise<void> {
    return Promise.resolve();
  }

  defaultSiteContext: Site = { name: 'name', id: 'id' } as Site;

  getValidSiteName = (siteName: MaybeObservable<string | null>): Observable<string> => {
    return resolveMaybeObservables(siteName).pipe(
      switchMap(([site]) => {
        return !site || !this.getSites().filter((item) => item.name === site).length
          ? of(DEFAULT_TEST_CONTEXT.siteName)
          : of(site);
      }),
      shareReplayLatest(),
    );
  };

  getStartItem = (_name: string, _language: string) => {
    return of({ id: dummySites[0].id, version: 1 });
  };

  getDefaultSite = (_name: string, _language: string) => {
    return of(this.defaultSiteContext);
  };
}

export class LanguageServiceStub implements Interface<LanguageService> {
  init(): Promise<void> {
    return Promise.resolve();
  }

  languages$ = new BehaviorSubject<Language[]>(dummyLanguages);
  language = of(dummySelectedLanguage);

  getLanguages = () => {
    return this.languages$;
  };

  getValidLanguage = (languageName: MaybeObservable<string | null>): Observable<string> => {
    return resolveMaybeObservables(languageName, this.languages$).pipe(
      switchMap(([language, languages]) => {
        return !language || !languages.filter((item) => item.name === language).length
          ? of(DEFAULT_TEST_CONTEXT.language)
          : of(language);
      }),
      shareReplayLatest(),
    );
  };

  getLanguageIsoFormat(languageName: string): Observable<string> {
    return this.languages$.pipe(
      map((languages) => languages.find((l) => l.name === languageName)?.iso ?? languageName.split('-')?.[0]),
    );
  }

  getDefinedLanguages(): Language[] {
    return dummyLanguages;
  }
}

@NgModule({
  providers: [
    { provide: SiteServiceStub, useClass: SiteServiceStub },
    { provide: SiteService, useExisting: SiteServiceStub },

    { provide: LanguageServiceStub, useClass: LanguageServiceStub },
    { provide: LanguageService, useExisting: LanguageServiceStub },

    { provide: CONTEXT_SERVICE_SCHEDULER, useValue: queueScheduler },
  ],
})
export class SiteLanguageServiceTestingModule {}
