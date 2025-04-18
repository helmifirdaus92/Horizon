/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { of } from 'rxjs';
import { LanguageItemsDalService } from '../language-items.dal.service';
import {
  GET_SITE_QUERY_BY_NAME,
  GET_SITES_QUERY,
  GET_START_ITEM_ID_QUERY_BY_NAME,
  SolutionSiteDalService,
  SupportedLanguage,
} from './solutionSite.dal.service';

const supportedLanguages: SupportedLanguage[] = [
  {
    itemId: '1',
    name: 'English',
  },
  {
    itemId: '2',
    name: 'Spanish',
  },
];

describe(SolutionSiteDalService.name, () => {
  let sut: SolutionSiteDalService;
  let controller: ApolloTestingController;
  let languageItemsDalService: jasmine.SpyObj<LanguageItemsDalService>;

  beforeEach(() => {
    languageItemsDalService = jasmine.createSpyObj<LanguageItemsDalService>({
      getSupportedLanguages: of(supportedLanguages),
    });

    TestBed.configureTestingModule({
      imports: [ApolloTestingModule.withClients(['global'])],
      providers: [
        {
          provide: SolutionSiteDalService,
          useClass: SolutionSiteDalService,
        },
        {
          provide: LanguageItemsDalService,
          useValue: languageItemsDalService,
        },
      ],
    });

    sut = TestBed.inject(SolutionSiteDalService);
    controller = TestBed.inject(ApolloTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('should be provided', () => {
    expect(sut).toBeTruthy();
  });

  describe('getSites', () => {
    it('should query the list of configured sites and emit the result', fakeAsync(() => {
      const spy = jasmine.createSpy();
      sut.getSites().subscribe(spy);

      const op = controller.expectOne(GET_SITES_QUERY);

      const sitesResponse = [
        {
          id: '227bc0ff-6237-42b6-851f-49e68c1998e8',
          name: 'website',
          siteCollection: {
            id: 'site-collection-id',
            name: 'site-collection-name',
          },
          language: {
            name: '',
          },
          posMappings: {
            language: 'en',
            name: 'pos',
          },
          renderingHost: {
            appName: 'app',
            layoutServiceConfiguration: 'confg',
            serverSideRenderingEngineEndpointUrl: 'http://render-host/api',
            serverSideRenderingEngineApplicationUrl: 'http://render-host/app',
          },
          startItem: {
            itemId: 'website-start-item-id',
          },
          settings: {
            supportedLanguages: {
              value: 'af58419145c9420187405409f4cf8bdd|3b66f23ad9d243a8ae62024fec4e96cf',
            },
          },
          properties: [
            {
              key: 'enableItemLanguageFallback',
              value: 'false',
            },
          ],
          rootItem: { itemId: '5061aef4-ea43-4a9c-bec4-f2d879429af7', displayName: { value: 'website' } },
        },
        {
          id: '337bc0ff-6237-42b6-851f-49e68c1998e8',
          name: 'site2',
          siteCollection: {
            id: 'site-collection-id',
            name: 'site-collection-name',
          },
          language: {
            name: '',
          },
          posMappings: {
            language: 'en',
            name: 'pos',
          },
          renderingHost: {
            appName: 'app',
            layoutServiceConfiguration: 'confg',
            serverSideRenderingEngineEndpointUrl: 'http://render-host/api',
            serverSideRenderingEngineApplicationUrl: 'http://render-host/app',
          },
          startItem: {
            itemId: 'site2-start-item-id',
          },
          settings: {
            supportedLanguages: {
              value: 'af58419145c9420187405409f4cf8bdd|3b66f23ad9d243a8ae62024fec4e96cf',
            },
          },
          properties: [
            {
              key: 'enableItemLanguageFallback',
              value: 'false',
            },
          ],
          rootItem: { itemId: '517e15c5-a0d3-4962-934a-b466c56fcd02', displayName: { value: 'site2' } },
        },
      ];

      const expectedSites = [
        {
          id: '5061aef4-ea43-4a9c-bec4-f2d879429af7',
          name: 'website',
          language: '',
          appName: 'app',
          layoutServiceConfig: 'confg',
          renderingEngineEndpointUrl: 'http://render-host/api',
          renderingEngineApplicationUrl: 'http://render-host/app',
          pointOfSale: { language: 'en', name: 'pos' },
          startItemId: 'website-start-item-id',
        },
        {
          id: '517e15c5-a0d3-4962-934a-b466c56fcd02',
          name: 'site2',
          language: '',
          appName: 'app',
          layoutServiceConfig: 'confg',
          renderingEngineEndpointUrl: 'http://render-host/api',
          renderingEngineApplicationUrl: 'http://render-host/app',
          pointOfSale: { language: 'en', name: 'pos' },
          startItemId: 'site2-start-item-id',
        },
      ];

      op.flush({ data: { solutionSites: sitesResponse } });
      tick();

      expect(spy).toHaveBeenCalledWith([
        jasmine.objectContaining(expectedSites[0]),
        jasmine.objectContaining(expectedSites[1]),
      ]);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(op.operation.variables).toEqual({ includeNonSxaSites: true });
      flush();
    }));
  });

  describe('getStartItem', () => {
    const siteId = '227bc0ff-6237-42b6-851f-49e68c1998e8';
    const language = 'test-language';
    const startItemId = 'teststart-item-id';
    const hostName = 'test-host-name';

    it('should get the start item id for the given site', fakeAsync(() => {
      const spy = jasmine.createSpy();
      sut.getStartItem(siteId, hostName, language).subscribe(spy);

      const op = controller.expectOne(GET_START_ITEM_ID_QUERY_BY_NAME);
      expect(op.operation.variables).toEqual({ name: 'test-host-name', includeNonSxaSites: true });

      const gqlResponse = {
        solutionSites: [
          {
            id: '227bc0ff-6237-42b6-851f-49e68c1998e8',
            startItem: {
              itemId: startItemId,
              versions: [
                {
                  language: { name: 'test-language' },
                  version: 2,
                },
              ],
            },
          },
        ],
      };
      op.flush({ data: gqlResponse });
      tick();

      expect(spy).toHaveBeenCalledWith({ id: startItemId, version: 2 });
      expect(spy).toHaveBeenCalledTimes(1);
      flush();
    }));

    it('should get the latest start item version for the given site', fakeAsync(() => {
      const spy = jasmine.createSpy();
      sut.getStartItem(siteId, hostName, language).subscribe(spy);

      const op = controller.expectOne(GET_START_ITEM_ID_QUERY_BY_NAME);
      expect(op.operation.variables).toEqual({ name: 'test-host-name', includeNonSxaSites: true });

      const gqlResponse = {
        solutionSites: [
          {
            id: '227bc0ff-6237-42b6-851f-49e68c1998e8',
            startItem: {
              itemId: startItemId,
              versions: [
                {
                  language: { name: 'test-language' },
                  version: 2,
                },
                {
                  language: { name: 'test-language' },
                  version: 3,
                },
              ],
            },
          },
        ],
      };
      op.flush({ data: gqlResponse });
      tick();

      expect(spy).toHaveBeenCalledWith({ id: startItemId, version: 3 });
      expect(spy).toHaveBeenCalledTimes(1);
      flush();
    }));

    it('should get 1 as the start item version when no version found for the language', fakeAsync(() => {
      const spy = jasmine.createSpy();
      sut.getStartItem(siteId, hostName, language).subscribe(spy);

      const op = controller.expectOne(GET_START_ITEM_ID_QUERY_BY_NAME);
      expect(op.operation.variables).toEqual({ name: 'test-host-name', includeNonSxaSites: true });
      const gqlResponse = {
        solutionSites: [
          {
            id: '227bc0ff-6237-42b6-851f-49e68c1998e8',
            startItem: {
              itemId: startItemId,
              versions: [
                {
                  language: { name: 'different-language' },
                  version: 2,
                },
              ],
            },
          },
        ],
      };
      op.flush({ data: gqlResponse });
      tick();

      expect(spy).toHaveBeenCalledWith({ id: startItemId, version: 1 });
      expect(spy).toHaveBeenCalledTimes(1);
      flush();
    }));
  });

  describe('getDefaultSite', () => {
    const siteId = '227bc0ff-6237-42b6-851f-49e68c1998e8';
    const hostName = 'test-host-name';

    it('should get the default site for a specific language', fakeAsync(() => {
      const spy = jasmine.createSpy();
      sut.getDefaultSite(siteId, hostName).subscribe(spy);

      const op = controller.expectOne(GET_SITE_QUERY_BY_NAME);
      expect(op.operation.variables).toEqual({ name: 'test-host-name', includeNonSxaSites: true });

      const gqlResponse = {
        solutionSites: [
          {
            id: siteId,
            name: 'Test Site',
            rootItem: {
              itemId: siteId,
              versions: [
                {
                  language: { name: 'test-language' },
                  version: 2,
                },
              ],
            },
          },
        ],
      };
      op.flush({ data: gqlResponse });
      tick();

      expect(spy).toHaveBeenCalledWith({ id: siteId, name: 'Test Site' });
      expect(spy).toHaveBeenCalledTimes(1);
      flush();
    }));

    it('should get the latest root item version for the given site', fakeAsync(() => {
      const spy = jasmine.createSpy();
      sut.getDefaultSite(siteId, hostName).subscribe(spy);

      const op = controller.expectOne(GET_SITE_QUERY_BY_NAME);
      expect(op.operation.variables).toEqual({ name: 'test-host-name', includeNonSxaSites: true });

      const gqlResponse = {
        solutionSites: [
          {
            id: siteId,
            name: 'Test Site',
            rootItem: {
              itemId: siteId,
              versions: [
                {
                  language: { name: 'test-language' },
                  version: 2,
                },
                {
                  language: { name: 'test-language' },
                  version: 3,
                },
              ],
            },
          },
        ],
      };
      op.flush({ data: gqlResponse });
      tick();

      expect(spy).toHaveBeenCalledWith({ id: siteId, name: 'Test Site' });
      expect(spy).toHaveBeenCalledTimes(1);
      flush();
    }));

    it('should get 1 as the root item version when no version found for the language', fakeAsync(() => {
      const spy = jasmine.createSpy();
      sut.getDefaultSite(siteId, hostName).subscribe(spy);

      const op = controller.expectOne(GET_SITE_QUERY_BY_NAME);
      expect(op.operation.variables).toEqual({ name: 'test-host-name', includeNonSxaSites: true });
      const gqlResponse = {
        solutionSites: [
          {
            id: siteId,
            name: 'Test Site',
            rootItem: {
              itemId: siteId,
              versions: [
                {
                  language: { name: 'different-language' },
                  version: 2,
                },
              ],
            },
          },
        ],
      };
      op.flush({ data: gqlResponse });
      tick();

      expect(spy).toHaveBeenCalledWith({ id: siteId, name: 'Test Site' });
      expect(spy).toHaveBeenCalledTimes(1);
      flush();
    }));
  });
});
