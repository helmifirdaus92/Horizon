/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { Configuration, ConfigurationService } from 'app/shared/configuration/configuration.service';
import { BaseItemDalService, ItemDalService } from 'app/shared/graphql/item.dal.service';
import { Item } from 'app/shared/graphql/item.interface';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { of, ReplaySubject } from 'rxjs';
import {
  BXFlowDefinitionBasicInfo,
  BXPersonalizationFlowDefinition,
  BXPersonalizationFlowDefinitionList,
  PersonalizationVariant,
} from '../personalization.types';
import { PersonalizationAPIServiceConnected } from './personalization.api.service';

const pageName = 'displayName';
const language = 'lang42';
const itemId = 'item42';
const itemVersion = 1;

const sampleVariant: PersonalizationVariant = {
  template: '{"variantId": "variant 1"}',
  variantId: 'variant 1',
  variantName: 'variant name 1',
  audienceName: 'audience',
  conditionGroups: [],
};

function getDefaultPersonalizationFlowDefinition(): BXPersonalizationFlowDefinition {
  return {
    siteId: 'e1d1a1a5-728d-4a5d-82a2-c2dd356af043',
    ref: 'ref',
    archived: false,
    businessProcess: 'interactive_v1',
    name: 'morning visitor',
    friendlyId: 'embedded_123_1',
    channels: ['WEB'],
    sampleSizeConfig: {
      baseValue: 0.15,
      minimumDetectableDifference: 0.02,
      confidenceLevel: 0.95,
    },
    schedule: {
      type: 'simpleSchedule',
      startDate: '01/08/2021',
    },
    status: 'PRODUCTION',
    tags: [],
    traffic: {
      type: 'audienceTraffic',
      weightingAlgorithm: 'USER_DEFINED',
      splits: [
        {
          variantId: 'a9af91ad-a9c3-46b4-b662-9cc37fdeab51_en_visitor_from_copenhagen',
          template: JSON.stringify({ variantId: 'a9af91ad-a9c3-46b4-b662-9cc37fdeab51_en_visitor_from_copenhagen' }),
          variantName: 'Visitor from Copenhagen',
          audienceName: 'User has visited all pages',
          conditionGroups: [
            {
              conditions: [
                {
                  templateId: 'page_views',
                  params: {
                    Visited: 'has',
                    'Page name': '/selectFlights',
                  },
                },
              ],
            },
          ],
        },
        {
          variantId: 'a9af91ad-a9c3-46b4-b662-9cc37fdeab51_en_visitor_from_oslo',
          template: JSON.stringify({ variantId: 'a9af91ad-a9c3-46b4-b662-9cc37fdeab51_en_visitor_from_oslo' }),
          variantName: 'Visitor from Oslo',
          audienceName: 'User has visited home page',
          conditionGroups: [
            {
              conditions: [
                {
                  templateId: 'page_views',
                  params: {
                    Visited: 'has',
                    'Page name': '/selectFlights',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    triggers: [],
    type: 'INTERACTIVE_API_FLOW',
    variants: [],
    subtype: 'EXPERIENCE',
    transpiledVariants: [],
  };
}

function flowDefinitionWithMappedVariantId(): BXPersonalizationFlowDefinition {
  return {
    siteId: 'e1d1a1a5-728d-4a5d-82a2-c2dd356af043',
    ref: 'ref',
    archived: false,
    businessProcess: 'interactive_v1',
    name: 'morning visitor',
    friendlyId: 'embedded_123_1',
    channels: ['WEB'],
    sampleSizeConfig: {
      baseValue: 0.15,
      minimumDetectableDifference: 0.02,
      confidenceLevel: 0.95,
    },
    schedule: {
      type: 'simpleSchedule',
      startDate: '01/08/2021',
    },
    status: 'PRODUCTION',
    tags: [],
    traffic: {
      type: 'audienceTraffic',
      weightingAlgorithm: 'USER_DEFINED',
      splits: [
        {
          variantId: 'a9af91ad-a9c3-46b4-b662-9cc37fdeab51_en_visitor_from_copenhagen',
          template: JSON.stringify({ variantId: 'a9af91ad-a9c3-46b4-b662-9cc37fdeab51_en_visitor_from_copenhagen' }),
          variantName: 'Visitor from Copenhagen',
          audienceName: 'User has visited all pages',
          conditionGroups: [
            {
              conditions: [
                {
                  templateId: 'page_views',
                  params: {
                    Visited: 'has',
                    'Page name': '/selectFlights',
                  },
                },
              ],
            },
          ],
        },
        {
          variantId: 'a9af91ad-a9c3-46b4-b662-9cc37fdeab51_en_visitor_from_oslo',
          template: JSON.stringify({ variantId: 'a9af91ad-a9c3-46b4-b662-9cc37fdeab51_en_visitor_from_oslo' }),
          variantName: 'Visitor from Oslo',
          audienceName: 'User has visited home page',
          conditionGroups: [
            {
              conditions: [
                {
                  templateId: 'page_views',
                  params: {
                    Visited: 'has',
                    'Page name': '/selectFlights',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    triggers: [],
    type: 'INTERACTIVE_API_FLOW',
    variants: [],
    subtype: 'EXPERIENCE',
    transpiledVariants: [],
  };
}

const cdpApiUrl = 'http://cdp.com/';

describe(PersonalizationAPIServiceConnected.name, () => {
  let sut: PersonalizationAPIServiceConnected;

  let itemDalServiceSpy: jasmine.SpyObj<ItemDalService>;
  let contextService: ContextServiceTesting;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let testConfiguration$: ReplaySubject<Configuration>;

  beforeEach(() => {
    testConfiguration$ = new ReplaySubject<Configuration>(1);

    TestBed.configureTestingModule({
      imports: [ContextServiceTestingModule],
      providers: [
        {
          provide: HttpClient,
          useValue: jasmine.createSpyObj<HttpClient>({ get: undefined, put: undefined, post: undefined }),
        },
        {
          provide: BaseItemDalService,
          useValue: jasmine.createSpyObj<BaseItemDalService>({
            getItemDisplayName: of('testDn'),
            getItem: of({} as Item),
          }),
        },
        {
          provide: ConfigurationService,
          useValue: jasmine.createSpyObj<ConfigurationService>({}, { configuration$: testConfiguration$ }),
        },
        {
          provide: SiteService,
          useValue: jasmine.createSpyObj<SiteService>({
            getContextSite: {
              id: 'e1d1a1a5-728d-4a5d-82a2-c2dd356af043',
            } as any,
          }),
        },

        PersonalizationAPIServiceConnected,
      ],
    });

    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideTestValue({ itemId, language, siteName: 'site42', itemVersion });

    itemDalServiceSpy = TestBedInjectSpy(BaseItemDalService);
    itemDalServiceSpy.getItemDisplayName.and.returnValue(of(pageName));

    httpClientSpy = TestBedInjectSpy(HttpClient);

    testConfiguration$.next({
      personalizeScope: undefined,
    } as Configuration);

    ConfigurationService.cdpTenant = {
      id: '789',
      name: 'cdtenant',
      displayName: 'cdtenant1',
      organizationId: 'test-org',
      apiUrl: 'http://cdp.com',
      appUrl: 'https://sample-app-url.com',
      analyticsAppUrl: '',
    };

    ConfigurationService.xmCloudTenant = {
      id: '123',
      name: 'tenant',
      displayName: 'tenant1',
      organizationId: 'test-org',
      url: 'http://cm.com',
      gqlEndpointUrl: 'http://cm.com/graph',
      cdpEmbeddedTenantId: '123',
      customerEnvironmentType: 'prd',
      environmentId: '321',
      environmentName: 'prodev',
      projectId: '12',
      projectName: 'proj',
    };

    sut = TestBed.inject(PersonalizationAPIServiceConnected);
  });

  afterEach(() => {
    ConfigurationService.xmCloudTenant = null;
    ConfigurationService.cdpTenant = null;
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('getAllFlowDefinitions', () => {
    it('should fetch all flow Definitions', async () => {
      // arrange
      const personalizationFlowDefinition = getDefaultPersonalizationFlowDefinition();

      const createOkResponse = new HttpResponse<BXPersonalizationFlowDefinitionList>({
        body: { items: [personalizationFlowDefinition], limit: 1000, offset: 0 },
        status: 200,
        statusText: 'OK',
        headers: new HttpHeaders(),
        url: 'api.com',
      });

      httpClientSpy.get.and.returnValue(of(createOkResponse));

      // act
      const actual = (await sut.getAllFlowDefinitions()) as any;

      // assert
      expect(httpClientSpy.get.calls.mostRecent().args[0]).toEqual(
        cdpApiUrl + 'v3/flowDefinitions/?flowType=embedded,component&limit=1000&offset=0&expand=true',
      );

      expect(actual).toEqual({
        apiIsBroken: false,
        requestIsInvalid: false,
        data: {
          items: [personalizationFlowDefinition],
          limit: 1000,
          offset: 0,
        },
        httpStatus: 200,
      });
      expect(actual.data?.items[0].traffic.splits[0].variantId).toBe(
        'a9af91ad-a9c3-46b4-b662-9cc37fdeab51_en_visitor_from_copenhagen',
      );
      expect(actual.data?.items[0].traffic.splits[1].variantId).toBe(
        'a9af91ad-a9c3-46b4-b662-9cc37fdeab51_en_visitor_from_oslo',
      );
    });

    it('should handle 404 error from api', async () => {
      // arrange
      const createErrorResponse = new HttpErrorResponse({
        status: 404,
        statusText: 'OK',
        headers: new HttpHeaders(),
        url: 'api.com',
      });

      httpClientSpy.get.and.returnValue(of(createErrorResponse));

      // act
      const actual = await sut.getAllFlowDefinitions();

      // assert
      expect(httpClientSpy.get.calls.mostRecent().args[0]).toEqual(
        cdpApiUrl + 'v3/flowDefinitions/?flowType=embedded,component&limit=1000&offset=0&expand=true',
      );

      expect(actual).toEqual({
        apiIsBroken: false,
        requestIsInvalid: false,
        data: null,
        httpStatus: 404,
      });
    });

    it('should return apiIsBroken true and requestIsInvalid false if api returns an known error reponse', async () => {
      // arrange
      const createErrorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'OK',
        headers: new HttpHeaders(),
        url: 'api.com',
      });

      httpClientSpy.get.and.returnValue(of(createErrorResponse));

      // act
      const actual = await sut.getAllFlowDefinitions();

      // assert
      expect(httpClientSpy.get.calls.mostRecent().args[0]).toEqual(
        cdpApiUrl + 'v3/flowDefinitions/?flowType=embedded,component&limit=1000&offset=0&expand=true',
      );

      expect(actual).toEqual({
        apiIsBroken: true,
        requestIsInvalid: false,
        data: null,
        httpStatus: 500,
      });
    });
  });

  describe('getCurrentSiteFlowDefinitions', () => {
    it('should fetch current site flow definitions', async () => {
      // Arrange
      const siteId = 'e1d1a1a5-728d-4a5d-82a2-c2dd356af043';
      const siteflows: BXFlowDefinitionBasicInfo[] = [
        { friendlyId: 'flow1', name: 'Flow 1', status: 'DRAFT' },
        { friendlyId: 'flow2', name: 'Flow 2', status: 'DRAFT' },
      ];
      const response: HttpResponse<BXFlowDefinitionBasicInfo[]> = new HttpResponse<BXFlowDefinitionBasicInfo[]>({
        body: siteflows,
        status: 200,
        statusText: 'OK',
        headers: new HttpHeaders(),
        url: 'api.com',
      });
      httpClientSpy.get.and.returnValue(of(response));

      // Act
      const result = await sut.getCurrentSiteFlowDefinitions();

      // Assert
      expect(httpClientSpy.get.calls.mostRecent().args[0]).toEqual(
        cdpApiUrl + `v3/flowDefinitions/sites/${siteId}?&limit=1000&offset=0&expand=true`,
      );
      expect(result).toEqual({
        apiIsBroken: false,
        requestIsInvalid: false,
        data: siteflows,
        httpStatus: 200,
      });
    });

    it('should handle error response from API', async () => {
      // Arrange
      const siteId = 'e1d1a1a5-728d-4a5d-82a2-c2dd356af043';
      const createErrorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'OK',
        headers: new HttpHeaders(),
        url: 'api.com',
      });

      httpClientSpy.get.and.returnValue(of(createErrorResponse));

      // Act
      const result = await sut.getCurrentSiteFlowDefinitions();

      // Assert
      expect(httpClientSpy.get.calls.mostRecent().args[0]).toEqual(
        cdpApiUrl + `v3/flowDefinitions/sites/${siteId}?&limit=1000&offset=0&expand=true`,
      );
      expect(result).toEqual({
        apiIsBroken: true,
        requestIsInvalid: false,
        data: null,
        httpStatus: 500,
      });
    });
  });

  describe('getActiveFlowDefinition', () => {
    it('should fetch FlowDefinition with mapped variant Id', async () => {
      // arrange
      const personalizationFlowDefinition = getDefaultPersonalizationFlowDefinition();

      const createOkResponse = new HttpResponse<BXPersonalizationFlowDefinition>({
        body: personalizationFlowDefinition,
        status: 200,
        statusText: 'OK',
        headers: new HttpHeaders(),
        url: 'api.com',
      });

      httpClientSpy.get.and.returnValue(of(createOkResponse));

      // act
      const actual = await sut.getActivePersonalizeFlowDefinition();

      // assert
      expect(httpClientSpy.get.calls.mostRecent().args[0]).toEqual(
        cdpApiUrl + 'v3/flowDefinitions/' + 'embedded_' + (itemId + '_' + language),
      );

      expect(actual).toEqual({
        apiIsBroken: false,
        requestIsInvalid: false,
        data: flowDefinitionWithMappedVariantId(),
        httpStatus: 200,
      });
      expect(actual.data?.traffic.splits[0].variantId).toBe(
        'a9af91ad-a9c3-46b4-b662-9cc37fdeab51_en_visitor_from_copenhagen',
      );
      expect(actual.data?.traffic.splits[1].variantId).toBe(
        'a9af91ad-a9c3-46b4-b662-9cc37fdeab51_en_visitor_from_oslo',
      );
    });
    it('should handle 404 error from api', async () => {
      // arrange
      const createErrorResponse = new HttpErrorResponse({
        status: 404,
        statusText: 'OK',
        headers: new HttpHeaders(),
        url: 'api.com',
      });

      httpClientSpy.get.and.returnValue(of(createErrorResponse));

      // act
      const actual = await sut.getActivePersonalizeFlowDefinition();

      // assert
      expect(httpClientSpy.get.calls.mostRecent().args[0]).toEqual(
        cdpApiUrl + 'v3/flowDefinitions/' + 'embedded_' + (itemId + '_' + language),
      );

      expect(actual).toEqual({
        apiIsBroken: false,
        requestIsInvalid: false,
        data: null,
        httpStatus: 404,
      });
    });

    it('should return apiIsBroken true and requestIsInvalid false if api returns an known error reponse', async () => {
      // arrange
      const createErrorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'OK',
        headers: new HttpHeaders(),
        url: 'api.com',
      });

      httpClientSpy.get.and.returnValue(of(createErrorResponse));

      // act
      const actual = await sut.getActivePersonalizeFlowDefinition();

      // assert
      expect(httpClientSpy.get.calls.mostRecent().args[0]).toEqual(
        cdpApiUrl + 'v3/flowDefinitions/' + 'embedded_' + (itemId + '_' + language),
      );

      expect(actual).toEqual({
        apiIsBroken: true,
        requestIsInvalid: false,
        data: null,
        httpStatus: 500,
      });
    });
  });

  describe('createFlowDefinition', () => {
    it('should send create flowDefinition request', fakeAsync(async () => {
      // arrange
      const personalizationFlowDefinition = getDefaultPersonalizationFlowDefinition();

      const name = `${pageName} ${language} - ${itemId}`;
      const friendlyId = `embedded_${itemId}_${language}`.replace(/-/g, '');

      const data: BXPersonalizationFlowDefinition = {
        siteId: 'e1d1a1a5-728d-4a5d-82a2-c2dd356af043',
        name,
        friendlyId,
        archived: false,
        businessProcess: 'interactive_v1',
        channels: ['WEB'],
        status: 'DRAFT',
        type: 'INTERACTIVE_API_FLOW',
        traffic: {
          type: 'audienceTraffic',
          weightingAlgorithm: 'USER_DEFINED',
          splits: [],
        },
        schedule: {
          type: 'simpleSchedule',
          startDate: new Date().toISOString(),
        },
        sampleSizeConfig: {
          baseValue: 0.15,
          minimumDetectableDifference: 0.02,
          confidenceLevel: 0.95,
        },
        tags: [],
        triggers: [],
        subtype: 'EXPERIENCE',
        variants: [],
      };

      const createOkResponse = new HttpResponse<BXPersonalizationFlowDefinition>({
        body: personalizationFlowDefinition,
        status: 200,
        statusText: 'OK',
        headers: new HttpHeaders(),
        url: 'api.com',
      });

      httpClientSpy.post.and.returnValue(of(createOkResponse));

      // act
      const actual = await sut.createPageFlowDefinition();

      // assert
      expect(httpClientSpy.post.calls.mostRecent().args[0]).toBe(`${cdpApiUrl}v3/flowDefinitions/`);

      expect(httpClientSpy.post.calls.mostRecent().args[1]).toEqual(data);

      expect(actual).toEqual({
        apiIsBroken: false,
        requestIsInvalid: false,
        data: personalizationFlowDefinition,
        httpStatus: 200,
      });
      flush();
    }));

    it('should send create flowDefinition request with personalization scope when defined', fakeAsync(async () => {
      // arrange
      const personalizationScopePrefix = 'dev';
      testConfiguration$.next({
        personalizeScope: personalizationScopePrefix,
      } as Configuration);

      const personalizationFlowDefinition = getDefaultPersonalizationFlowDefinition();

      const name = `${personalizationScopePrefix} ${pageName} ${language} - ${itemId}`;
      const friendlyId = `embedded_${personalizationScopePrefix}_${itemId}_${language}`.replace(/-/g, '');

      const data: BXPersonalizationFlowDefinition = {
        siteId: 'e1d1a1a5-728d-4a5d-82a2-c2dd356af043',
        name,
        friendlyId,
        archived: false,
        businessProcess: 'interactive_v1',
        channels: ['WEB'],
        status: 'DRAFT',
        type: 'INTERACTIVE_API_FLOW',
        traffic: {
          type: 'audienceTraffic',
          weightingAlgorithm: 'USER_DEFINED',
          splits: [],
        },
        schedule: {
          type: 'simpleSchedule',
          startDate: new Date().toISOString(),
        },
        sampleSizeConfig: {
          baseValue: 0.15,
          minimumDetectableDifference: 0.02,
          confidenceLevel: 0.95,
        },
        tags: [],
        triggers: [],
        subtype: 'EXPERIENCE',
        variants: [],
      };

      const createOkResponse = new HttpResponse<BXPersonalizationFlowDefinition>({
        body: personalizationFlowDefinition,
        status: 200,
        statusText: 'OK',
        headers: new HttpHeaders(),
        url: 'api.com',
      });

      httpClientSpy.post.and.returnValue(of(createOkResponse));

      // act
      const actual = await sut.createPageFlowDefinition();

      // assert
      expect(httpClientSpy.post.calls.mostRecent().args[0]).toBe(`${cdpApiUrl}v3/flowDefinitions/`);
      expect(httpClientSpy.post.calls.mostRecent().args[1]).toEqual(data);
      expect(actual).toEqual({
        apiIsBroken: false,
        requestIsInvalid: false,
        data: personalizationFlowDefinition,
        httpStatus: 200,
      });
      flush();
    }));
  });

  describe('deleteVariantFromFlowDefinition', () => {
    it('should send delete variant from FlowDefinition request', async () => {
      // arrange
      const personalizationFlowDefinition = getDefaultPersonalizationFlowDefinition();
      const sampleVariant2: PersonalizationVariant = {
        template: '{"variantId": "variant 2"}',
        variantId: 'variant 2',
        variantName: 'variant name 2',
        audienceName: 'audience',
        conditionGroups: [],
      };
      personalizationFlowDefinition.traffic.splits = [sampleVariant, sampleVariant2] as PersonalizationVariant[];
      const variantToBeDeleted = sampleVariant;

      const expectedPersonalizationFlowDefinition = {
        ...personalizationFlowDefinition,
        ...{ name: 'displayName lang42 - item42' },
      };

      const createOkResponse = new HttpResponse<BXPersonalizationFlowDefinition>({
        body: personalizationFlowDefinition,
        status: 200,
        statusText: 'OK',
        headers: new HttpHeaders(),
        url: 'api.com',
      });

      httpClientSpy.put.and.returnValue(of(createOkResponse));

      // act
      const actual = await sut.deleteVariantFromFlowDefinition(personalizationFlowDefinition, variantToBeDeleted);

      // assert
      expect(actual).not.toBeNull();
      expect(httpClientSpy.put.calls.mostRecent().args[0]).toBe(
        `${cdpApiUrl}v3/flowDefinitions/embedded_item42_lang42`,
      );
      expect(httpClientSpy.put.calls.mostRecent().args[1]).toEqual(expectedPersonalizationFlowDefinition);
    });

    it('should use personalization scope if defined in delete variant for delete flow definition request', async () => {
      // arrange
      const personalizationScopePrefix = 'dev';
      testConfiguration$.next({
        personalizeScope: personalizationScopePrefix,
      } as Configuration);

      const personalizationFlowDefinition = getDefaultPersonalizationFlowDefinition();
      const sampleVariant2: PersonalizationVariant = {
        template: '{"variantId": "variant 2"}',
        variantId: 'variant 2',
        variantName: 'variant name 2',
        audienceName: 'audience',
        conditionGroups: [],
      };
      personalizationFlowDefinition.traffic.splits = [sampleVariant, sampleVariant2] as PersonalizationVariant[];
      const variantToBeDeleted = sampleVariant;

      const createOkResponse = new HttpResponse<BXPersonalizationFlowDefinition>({
        body: personalizationFlowDefinition,
        status: 200,
        statusText: 'OK',
        headers: new HttpHeaders(),
        url: 'api.com',
      });
      httpClientSpy.put.and.returnValue(of(createOkResponse));

      // act
      const actual = await sut.deleteVariantFromFlowDefinition(personalizationFlowDefinition, variantToBeDeleted);

      // assert
      expect(actual).not.toBeNull();
      expect(httpClientSpy.put.calls.mostRecent().args[0]).toBe(
        `${cdpApiUrl}v3/flowDefinitions/embedded_${personalizationScopePrefix}_item42_lang42`,
      );
    });

    it('should set flowDefinition status to [PAUSED] if the removed variant is the last in the list', async () => {
      // arrange
      const personalizationFlowDefinition = getDefaultPersonalizationFlowDefinition();
      personalizationFlowDefinition.traffic.splits = [sampleVariant] as PersonalizationVariant[];
      const expectedPersonalizationFlowDefinition = {
        ...personalizationFlowDefinition,
        ...{ name: 'displayName lang42 - item42' },
      };

      const createOkResponse = new HttpResponse<BXPersonalizationFlowDefinition>({
        body: expectedPersonalizationFlowDefinition,
        status: 200,
        statusText: 'OK',
        headers: new HttpHeaders(),
        url: 'api.com',
      });

      httpClientSpy.put.and.returnValue(of(createOkResponse));

      // act
      const actual = await sut.deleteVariantFromFlowDefinition(personalizationFlowDefinition, sampleVariant);

      // assert
      expect(actual).not.toBeNull();
      expect(httpClientSpy.put.calls.mostRecent().args[0]).toBe(
        `${cdpApiUrl}v3/flowDefinitions/embedded_item42_lang42`,
      );
      expect(httpClientSpy.put.calls.mostRecent().args[1]).toEqual(jasmine.objectContaining({ status: 'PAUSED' }));
    });
  });

  describe('renamePageVariant', () => {
    it('should send request to update variant name', async () => {
      // arrange
      const personalizationFlowDefinition = getDefaultPersonalizationFlowDefinition();
      personalizationFlowDefinition.traffic.splits = [sampleVariant] as PersonalizationVariant[];
      const expectedPersonalizationFlowDefinition = {
        ...personalizationFlowDefinition,
        ...{ name: 'displayName lang42 - item42' },
      };

      const createOkResponse = new HttpResponse<BXPersonalizationFlowDefinition>({
        body: expectedPersonalizationFlowDefinition,
        status: 200,
        statusText: 'OK',
        headers: new HttpHeaders(),
        url: 'api.com',
      });

      httpClientSpy.put.and.returnValue(of(createOkResponse));

      // act
      const actual = await sut.renameVariantNameFromFlowDefinition(
        personalizationFlowDefinition,
        'variant 1',
        'new-name',
      );

      const trafficAfterVariantRename = {
        type: 'audienceTraffic',
        weightingAlgorithm: 'USER_DEFINED',
        splits: [
          {
            template: '{"variantId": "variant 1"}',
            variantId: 'variant 1',
            variantName: 'new-name',
            audienceName: 'audience',
            conditionGroups: [],
          },
        ],
      };
      // assert
      expect(actual).not.toBeNull();

      expect(httpClientSpy.put.calls.mostRecent().args[0]).toBe(
        `${cdpApiUrl}v3/flowDefinitions/embedded_item42_lang42`,
      );
      expect(httpClientSpy.put.calls.mostRecent().args[1]).toEqual(
        jasmine.objectContaining({ traffic: trafficAfterVariantRename }),
      );
    });

    it('should use personalization scope if defined in update flow definition requests', async () => {
      // arrange
      const personalizationScopePrefix = 'dev';
      testConfiguration$.next({
        personalizeScope: personalizationScopePrefix,
      } as Configuration);

      const personalizationFlowDefinition = getDefaultPersonalizationFlowDefinition();
      personalizationFlowDefinition.traffic.splits = [sampleVariant] as PersonalizationVariant[];

      const createOkResponse = new HttpResponse<BXPersonalizationFlowDefinition>({
        body: {
          ...personalizationFlowDefinition,
          ...{ name: 'displayName lang42 - item42' },
        },
        status: 200,
        statusText: 'OK',
        headers: new HttpHeaders(),
        url: 'api.com',
      });
      httpClientSpy.put.and.returnValue(of(createOkResponse));

      // act
      const actual = await sut.renameVariantNameFromFlowDefinition(
        personalizationFlowDefinition,
        'variant 1',
        'new-name',
      );

      // assert
      expect(actual).not.toBeNull();
      expect(httpClientSpy.put.calls.mostRecent().args[0]).toBe(
        `${cdpApiUrl}v3/flowDefinitions/embedded_${personalizationScopePrefix}_item42_lang42`,
      );
    });
  });

  describe('getPersonalizationScope', () => {
    it('should stripp non-alphanumeric characters from personalization scope value', async () => {
      const personalizationScopeValue = 'scope, #dev!123';
      testConfiguration$.next({
        personalizeScope: personalizationScopeValue,
      } as Configuration);

      const result = await sut.getPersonalizationScope();

      expect(result).toBe('scopedev123');
    });
  });
});
