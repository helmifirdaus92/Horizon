/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { of } from 'rxjs';
import { SiteDalService } from '../graphql/sites/solutionSite.dal.service';
import { Site } from './site-language.service';
import { SiteRepositoryService } from './site-repository.service';

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
  {
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
  },
  {
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
  },
];

describe(SiteRepositoryService.name, () => {
  let sut: SiteRepositoryService;
  let siteDalService: jasmine.SpyObj<SiteDalService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SiteDalService,
          useValue: jasmine.createSpyObj<SiteDalService>('SiteDalService', [
            'getSites',
            'getDefaultSite',
            'getStartItem',
            'getCollections',
          ]),
        },
        SiteRepositoryService,
      ],
    });

    sut = TestBed.inject(SiteRepositoryService);
    siteDalService = TestBedInjectSpy(SiteDalService);

    siteDalService.getSites.and.returnValue(of(sites));
    siteDalService.getCollections.and.returnValue(of([]));
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('getSites()', () => {
    it('should fetch the list of sites from siteService', async () => {
      await sut.init();
      const result = sut.getSites();

      expect(result).toEqual(sites);
    });

    it('should sort sites alphabetically by site name', async () => {
      await sut.init();
      const result = sut.getSites();

      expect(result.length).toBe(3);
      expect(result[0].name).toBe('nice-cats');
      expect(result[1].name).toBe('no-pos-site');
      expect(result[2].name).toBe('website');
    });
  });

  describe('getSiteCollections()', () => {
    it('should fetch the list of site collections from siteService', async () => {
      const collections = [
        { id: '1', name: 'Collection 1', displayName: 'Collection 1 Display' },
        { id: '2', name: 'Collection 2', displayName: 'Collection 2 Display' },
      ];
      siteDalService.getCollections.and.returnValue(of(collections));

      await sut.init();
      const result = sut.getSiteCollections();

      expect(result).toEqual(collections);
    });

    it('should return an empty array if no collections are available', async () => {
      siteDalService.getCollections.and.returnValue(of([]));

      await sut.init();
      const result = sut.getSiteCollections();

      expect(result).toEqual([]);
    });
  });

  describe('getSiteByName()', () => {
    it('should return the site matching the given name', async () => {
      await sut.init();
      const result = sut.getSiteByName('nice-cats');

      expect(result).toEqual(sites[0]);
    });

    it('should return undefined if no site matches the given name', async () => {
      await sut.init();
      const result = sut.getSiteByName('non-existent-site');

      expect(result).toBeUndefined();
    });
  });

  describe('getStartItem()', () => {
    it('should fetch the start item for a given site ID, name, and language', () => {
      const startItem = { id: 'start-item-id', version: 1 };
      siteDalService.getStartItem.and.returnValue(of(startItem));

      const result$ = sut.getStartItem('site-id', 'site-name', 'en');

      result$.subscribe((result) => {
        expect(result).toEqual(startItem);
      });

      expect(siteDalService.getStartItem).toHaveBeenCalledWith('site-id', 'site-name', 'en');
    });
  });

  describe('getDefaultSite()', () => {
    it('should fetch the default site when no parameters are provided', () => {
      const defaultSite = { id: 'default-site-id', name: 'default-site' };
      siteDalService.getDefaultSite.and.returnValue(of(defaultSite));

      const result$ = sut.getDefaultSite();

      result$.subscribe((result) => {
        expect(result).toEqual(defaultSite);
      });

      expect(siteDalService.getDefaultSite).toHaveBeenCalledWith();
    });

    it('should fetch the default site with the provided parameters', () => {
      const defaultSite = { id: 'default-site-id', name: 'default-site' };
      siteDalService.getDefaultSite.and.returnValue(of(defaultSite));

      const result$ = sut.getDefaultSite('site-id', 'site-name', 'en');

      result$.subscribe((result) => {
        expect(result).toEqual(defaultSite);
      });

      expect(siteDalService.getDefaultSite).toHaveBeenCalledWith('site-id', 'site-name', 'en');
    });
  });

  describe('getSiteId()', () => {
    it('should return the site ID for a given site name', async () => {
      await sut.init();
      const result = sut.getSiteId('nice-cats');

      expect(result).toBe(sites[0].id);
    });

    it('should throw an error if the site name does not exist', async () => {
      await sut.init();

      expect(() => sut.getSiteId('non-existent-site')).toThrowError('site could not be found');
    });
  });
});
