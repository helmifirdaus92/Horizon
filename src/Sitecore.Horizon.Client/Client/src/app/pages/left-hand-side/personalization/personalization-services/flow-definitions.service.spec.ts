/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { Context } from 'app/shared/client-state/context.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { RenderingHostFeaturesService } from 'app/shared/rendering-host/rendering-host-features.service';
import {
  StaticConfigurationServiceStub,
  StaticConfigurationServiceStubModule,
} from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy, nextTick } from 'app/testing/test.utils';
import { PersonalizationAPIService } from '../personalization-api/personalization.api.service';
import { BXPersonalizationFlowDefinition } from '../personalization.types';
import { FlowDefinitionsService } from './flow-definitions.service';

const INITIAL_CONTEXT: Context = {
  itemId: 'foo',
  itemVersion: 1,
  variant: undefined,
  language: 'en',
  siteName: 'test.com',
};

const personalizationFlowDefinition: BXPersonalizationFlowDefinition = {
  siteId: 'e1d1a1a5-728d-4a5d-82a2-c2dd356af043',
  ref: 'ref',
  archived: false,
  businessProcess: 'interactive_v1',
  name: 'morning visitor',
  friendlyId: 'embedded_scope_foo1bar2baz30000aaaabbbbcccc1234_en_gb',
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

describe(FlowDefinitionsService.name, () => {
  let sut: FlowDefinitionsService;
  let personalizationApiServiceSpy: jasmine.SpyObj<PersonalizationAPIService>;
  let featureFlagsServiceSpy: jasmine.SpyObj<FeatureFlagsService>;
  let context: ContextServiceTesting;
  let rhFeatureService: jasmine.SpyObj<RenderingHostFeaturesService>;
  let staticConfigurationServiceStub: StaticConfigurationServiceStub;

  beforeEach(() => {
    const personalizationApiSpy = jasmine.createSpyObj('PersonalizationAPIService', ['getPageFlowDefinitions']);

    TestBed.configureTestingModule({
      imports: [ContextServiceTestingModule, StaticConfigurationServiceStubModule],
      providers: [
        FlowDefinitionsService,
        { provide: PersonalizationAPIService, useValue: personalizationApiSpy },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>(['isFeatureEnabled']),
        },
        {
          provide: RenderingHostFeaturesService,
          useValue: jasmine.createSpyObj<RenderingHostFeaturesService>(['isFeatureEnabled']),
        },
      ],
    });

    personalizationApiServiceSpy = TestBedInjectSpy(PersonalizationAPIService);
    featureFlagsServiceSpy = TestBedInjectSpy(FeatureFlagsService);
    featureFlagsServiceSpy.isFeatureEnabled.and.returnValue(true);
    rhFeatureService = TestBedInjectSpy(RenderingHostFeaturesService);
    rhFeatureService.isFeatureEnabled.and.returnValue(Promise.resolve(true));
    staticConfigurationServiceStub = TestBed.inject(StaticConfigurationServiceStub);

    personalizationApiSpy.getPageFlowDefinitions.and.resolveTo({
      context: { itemId: 'foo1bar2baz30000aaaabbbbcccc1234', language: 'lang001' },
      flows: [personalizationFlowDefinition],
    });
    context = TestBed.inject(ContextServiceTesting);
    context.provideTestValue(INITIAL_CONTEXT);

    ConfigurationService.cdpTenant = {
      id: '123',
      name: 'tenant',
      displayName: 'tenant1',
      organizationId: 'org1',
      apiUrl: 'http://cdp.com',
      appUrl: 'http://cdpapp.com',
      analyticsAppUrl: '',
    };
    sut = TestBed.inject(FlowDefinitionsService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('getPageFlowDefinitions', () => {
    it('should invoke getPageFlowDefinitions with the correct parameters', async () => {
      staticConfigurationServiceStub.isStagingEnvironment = true;
      // Arrange
      const itemId = 'foo';
      const language = 'en-GB';
      const forceRefetch = false;
      await nextTick();

      // Act
      sut.getPageFlowDefinitions(itemId, language, forceRefetch);

      // Assert
      expect(personalizationApiServiceSpy.getPageFlowDefinitions).toHaveBeenCalledWith(itemId);
    });

    it('should return the promise from fetchPageFlowDefinitions', async () => {
      // Arrange
      const itemId = 'foo';
      const language = 'en-GB';
      const forceRefetch = false;
      const testResult = { items: [personalizationFlowDefinition], limit: 1000, offset: 0 };

      const mockHandleAPIResponse = { apiIsBroken: false, requestIsInvalid: false, data: testResult };

      personalizationApiServiceSpy.getPageFlowDefinitions.and.resolveTo({
        apiIsBroken: false,
        requestIsInvalid: false,
        data: testResult,
      });
      spyOn<any>(sut, 'handleAPIResponse').and.returnValue(mockHandleAPIResponse);
      await nextTick();

      const expectedResponse = { context: { itemId, language }, flows: testResult['items'] };

      // Act
      const result = await sut.getPageFlowDefinitions(itemId, language, forceRefetch);

      // Assert
      expect(result).toEqual(expectedResponse);
    });

    it('should return empty array if failed to fetch page flow definitions', async () => {
      // Arrange
      const itemId = 'foo';
      const language = 'en-GB';
      const forceRefetch = false;
      const mockHandleAPIResponse = { apiIsBroken: true, requestIsInvalid: false, data: null };

      personalizationApiServiceSpy.getPageFlowDefinitions.and.resolveTo({
        apiIsBroken: true,
        requestIsInvalid: false,
        data: null,
      });
      spyOn<any>(sut, 'handleAPIResponse').and.returnValue(mockHandleAPIResponse);
      await nextTick();

      // Act
      const result = await sut.getPageFlowDefinitions(itemId, language, forceRefetch);

      // Assert
      expect(result).toEqual({ context: { itemId, language }, flows: [] });
    });
  });
});
