/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { ApolloTestingModule } from 'apollo-angular/testing';
import {
  ContextServiceTesting,
  ContextServiceTestingModule,
  DEFAULT_TEST_CONTEXT,
} from 'app/shared/client-state/context.service.testing';
import { LanguageDalBaseService } from 'app/shared/graphql/language.dal.service';
import { TestBedInjectSpy, createSpyObserver } from 'app/testing/test.utils';
import { NEVER, of } from 'rxjs';
import { LanguageService, Site, SiteService } from './site-language.service';
import { LanguageServiceStub } from './site-language.service.testing';
import { SiteRepositoryService } from './site-repository.service';

const noPosSite: Site = {
  id: '447bc0ff-6237-42b6-851f-49e68c1998e8',
  hostId: 'hostId 3',
  collectionId: '667bc0ff-6237-42b6-851f-49e68c1998e8',
  name: 'no-pos-site',
  displayName: 'no-pos-site',
  language: 'ur-pk',
  appName: '',
  layoutServiceConfig: '',
  renderingEngineEndpointUrl: '',
  renderingEngineApplicationUrl: '',
  pointOfSale: [],
  startItemId: 'eb500343-273f-9837',
  supportedLanguages: ['en', 'da'],
  properties: {
    isSxaSite: true,
    tagsFolderId: 'id001',
    isLocalDatasourcesEnabled: true,
  },
};

const defaultSite: Site = {
  id: '227bc0ff-6237-42b6-851f-49e68c1998e8',
  hostId: 'hostId 1',
  collectionId: '337bc0ff-6237-42b6-851f-49e68c1998e8',
  name: 'website',
  displayName: 'website',
  language: 'en',
  appName: '',
  layoutServiceConfig: '',
  renderingEngineEndpointUrl: '',
  renderingEngineApplicationUrl: '',
  pointOfSale: [
    { language: '*', name: 'basic-site' },
    { language: 'en', name: 'basic-site-en' },
    { language: 'pt', name: 'basic-site-pt-br' },
    { language: 'uk', name: 'basic-site-uk' },
  ],
  startItemId: 'eb500343-273f-4037',
  supportedLanguages: ['en'],
  properties: {
    isSxaSite: true,
    tagsFolderId: 'id001',
    isLocalDatasourcesEnabled: true,
  },
};
const sites: Site[] = [
  {
    id: '337bc0ff-6237-42b6-851f-49e68c1998e8',
    hostId: 'hostId 2',
    collectionId: '337bc0ff-6237-42b6-851f-49e68c1998e8',
    name: 'nice-cats',
    displayName: 'nice-cats',
    language: 'uk-UA',
    appName: '',
    layoutServiceConfig: '',
    renderingEngineEndpointUrl: '',
    renderingEngineApplicationUrl: '',
    pointOfSale: [
      { language: '*', name: 'basic-site' },
      { language: 'en', name: 'basic-site-en' },
      { language: 'en-UK', name: 'pos-UK' },
    ],
    startItemId: 'eb500343-273f-5037',
    supportedLanguages: ['en', 'da'],
    properties: {
      isSxaSite: true,
      tagsFolderId: 'id001',
      isLocalDatasourcesEnabled: true,
    },
  },
  noPosSite,
  defaultSite,
];

const languages = [
  { name: 'uk-UA', displayName: 'Ukrainian', nativeName: 'Українська', iso: 'uk', englishName: 'Ukrainian (ukraine)' },
  { name: 'en', displayName: 'English', nativeName: 'English', iso: 'en', englishName: 'English' },
  { name: 'en-UK', displayName: 'English UK', nativeName: 'English UK', iso: 'en', englishName: 'English UK' },
  { name: 'foo', displayName: 'foo', nativeName: 'foo', iso: 'bar', englishName: 'foo (bar)' },
];

describe(SiteService.name, () => {
  let sut: SiteService;
  let siteRepositoryService: jasmine.SpyObj<SiteRepositoryService>;
  let contextService: ContextServiceTesting;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ContextServiceTestingModule, ApolloTestingModule],
      providers: [
        {
          provide: SiteRepositoryService,
          useValue: jasmine.createSpyObj<SiteRepositoryService>('SiteRepositoryService', [
            'init',
            'getSites',
            'getDefaultSite',
            'getStartItem',
            'getSiteCollections',
            'getSiteId',
            'getSiteByName',
          ]),
        },
        { provide: LanguageServiceStub, useClass: LanguageServiceStub },
        { provide: LanguageService, useExisting: LanguageServiceStub },
      ],
    });

    sut = TestBed.inject(SiteService);
    siteRepositoryService = TestBedInjectSpy(SiteRepositoryService);
    contextService = TestBedInjectSpy(ContextServiceTesting);

    contextService.provideDefaultTestContext();
    siteRepositoryService.getSites.and.returnValue(sites);
    siteRepositoryService.getSiteCollections.and.returnValue([]);
    siteRepositoryService.getSiteByName.and.returnValue(sites[0]);
    siteRepositoryService.getDefaultSite.and.returnValue(of(defaultSite));
    siteRepositoryService.getStartItem.and.returnValue(of({ id: 'id', version: 1 }));
    siteRepositoryService.getSiteId.and.returnValue(sites[1].id);
  });

  beforeEach(async () => {
    await sut.init();
    siteRepositoryService.getSites.calls.reset();
  });

  describe('getSites()', () => {
    it('should fetch the list of sites from siteService', () => {
      const result = sut.getSites();

      expect(result).toEqual(sites);
    });

    it('should sort sites alphabetically by site name', () => {
      const result = sut.getSites();

      expect(result.length).toBe(3);
      expect(result[0].name).toBe('nice-cats');
      expect(result[1].name).toBe('no-pos-site');
      expect(result[2].name).toBe('website');
    });
  });

  describe('getPointOfSale()', () => {
    it('should get pointOfSale from context site for context site and language when defined', async () => {
      contextService.setTestSite('website');
      contextService.setTestLang('en');

      const result = await sut.getPointOfSale();

      expect(result).toBe('basic-site-en');
    });

    it('should get pointOfSale from context site with locale that has locale code and region code format', async () => {
      siteRepositoryService.getSiteByName.and.returnValue(defaultSite);
      contextService.setTestSite('website');
      contextService.setTestLang('uk-UA');

      const result = await sut.getPointOfSale();

      expect(result).toBe('basic-site-uk');
    });

    it('should return default pointOfSale from context site when context language specific entry not found', async () => {
      siteRepositoryService.getSiteByName.and.returnValue(defaultSite);
      contextService.setTestSite('website');
      contextService.setTestLang('pt-br');
      const result = await sut.getPointOfSale();

      expect(result).toBe('basic-site-pt-br');
    });

    it('should return null as pointOfSale when pos not defined in context site', async () => {
      contextService.setTestSite('no-pos-site');
      siteRepositoryService.getSiteByName.and.returnValue(noPosSite);
      const result = await sut.getPointOfSale();

      expect(result).toBeNull();
    });

    it('should resolve POS of a same ISO language. Example: en vs en-UK', async () => {
      contextService.setTestSite('nice-cats');
      contextService.setTestLang('en-UK');

      const result = await sut.getPointOfSale();

      expect(result).toBe('pos-UK');
    });
  });

  describe('getValidSiteName()', () => {
    describe('WHEN site name is valid', () => {
      it('should pass valid site name back', () => {
        const spy = createSpyObserver();

        sut.getValidSiteName('website').subscribe(spy);

        expect(spy.next).toHaveBeenCalledWith('website');
      });
    });

    describe('WHEN site name is not valid', () => {
      it('should pass context site name back', () => {
        const spy = createSpyObserver();

        sut.getValidSiteName('xxxx').subscribe(spy);

        expect(spy.next).toHaveBeenCalledWith(DEFAULT_TEST_CONTEXT.siteName);
      });
    });

    describe('WHEN site name is null', () => {
      it('should pass context site name back AND do not call getSites()', () => {
        sut.getValidSiteName(null).subscribe();

        expect(siteRepositoryService.getSites).not.toHaveBeenCalled();
      });
    });
  });

  describe('getDefaultSiteContext()', () => {
    const dummySiteContext = {
      name: 'name',
    } as Site;

    it('should fetch default site context', () => {
      const siteId = '227bc0ff-6237-42b6-851f-49e68c1998e8';
      const siteName = 'website';
      const language = 'en';
      const spy = jasmine.createSpy();
      siteRepositoryService.getDefaultSite.and.returnValue(of(dummySiteContext));
      siteRepositoryService.getSiteByName.and.returnValue(defaultSite);

      sut.getDefaultSite(siteName, language).subscribe(spy);

      expect(siteRepositoryService.getDefaultSite).toHaveBeenCalledWith(siteId, siteName, language);
      expect(spy).toHaveBeenCalledWith(dummySiteContext);
    });

    describe('IF site and/or language are not set', () => {
      it('should use null value intead', () => {
        siteRepositoryService.getDefaultSite.and.returnValue(of(dummySiteContext));
        siteRepositoryService.getSiteByName.and.returnValue(undefined);
        sut.getDefaultSite().subscribe();

        expect(siteRepositoryService.getDefaultSite).toHaveBeenCalledWith();
      });
    });
  });

  describe('getSiteLanguages()', () => {
    it('should return supported languages for a site', () => {
      const result = sut.getSiteLanguages('website');
      expect(result).toEqual([
        { name: 'en', displayName: 'English', nativeName: 'English', englishName: 'English', iso: 'en' },
      ]);
    });
  });
});

describe(LanguageService.name, () => {
  let sut: LanguageService;
  let context: ContextServiceTesting;
  let languageServiceSpy: jasmine.SpyObj<LanguageDalBaseService>;

  beforeEach(() => {
    languageServiceSpy = jasmine.createSpyObj<LanguageDalBaseService>({
      fetchLanguages: NEVER,
    });

    TestBed.configureTestingModule({
      imports: [ContextServiceTestingModule],
      providers: [
        {
          provide: LanguageDalBaseService,
          useValue: languageServiceSpy,
        },
      ],
    });

    sut = TestBed.inject(LanguageService);
    context = TestBed.inject(ContextServiceTesting);

    languageServiceSpy.fetchLanguages.and.returnValue(of(languages));

    context.provideDefaultTestContext();
  });

  describe('getLanguages()', () => {
    it('should get values from the service', () => {
      const resultObserver = createSpyObserver();

      sut.getLanguages().subscribe(resultObserver);

      expect(languageServiceSpy.fetchLanguages).toHaveBeenCalled();
      expect(resultObserver.next).toHaveBeenCalledWith(languages);
    });

    it('should not re-fetch language from GQL on site change', () => {
      context.setTestSite('old-test-site-name');
      const resultObserver = createSpyObserver();
      sut.getLanguages().subscribe(resultObserver);

      context.setTestSite('new-test-site-name');

      expect(languageServiceSpy.fetchLanguages).toHaveBeenCalledTimes(1);
    });
  });

  describe('getValidLanguage()', () => {
    describe('WHEN language name is valid', () => {
      it('should pass valid language name back', () => {
        const spy = createSpyObserver();

        sut.getValidLanguage('en').subscribe(spy);

        expect(spy.next).toHaveBeenCalledWith('en');
      });
    });

    describe('WHEN language name is not valid', () => {
      it('should pass context language name back', () => {
        const spy = createSpyObserver();

        sut.getValidLanguage('xxxx').subscribe(spy);

        expect(spy.next).toHaveBeenCalledWith(DEFAULT_TEST_CONTEXT.language);
      });
    });

    describe('WHEN language name is null', () => {
      it('should pass context language name back AND do not call fetchLanguages()', () => {
        sut.getValidLanguage(null).subscribe();

        expect(languageServiceSpy.fetchLanguages).not.toHaveBeenCalled();
      });
    });
  });

  describe('getLanguageIsoFormat()', () => {
    it('should return valid iso format name back', () => {
      const spy = createSpyObserver();

      sut.getLanguageIsoFormat('foo').subscribe(spy);

      expect(spy.next).toHaveBeenCalledWith('bar');
    });

    it('should return valid fall back iso format name back', () => {
      const spy = createSpyObserver();

      sut.getLanguageIsoFormat('ja-JP').subscribe(spy);

      expect(spy.next).toHaveBeenCalledWith('ja');
    });

    it('should fall back to request locale if language list is empty', () => {
      languageServiceSpy.fetchLanguages.and.returnValue(of([]));
      const spy = createSpyObserver();

      sut.getLanguageIsoFormat('en-uk').subscribe(spy);

      expect(spy.next).toHaveBeenCalledWith('en');
    });
  });
});
