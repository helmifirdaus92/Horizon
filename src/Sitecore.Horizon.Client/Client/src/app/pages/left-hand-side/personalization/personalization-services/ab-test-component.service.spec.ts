/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EditorWorkspaceService } from 'app/editor/editor-workspace/editor-workspace.service';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { Configuration, ConfigurationService } from 'app/shared/configuration/configuration.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { of, ReplaySubject, Subject } from 'rxjs';
import { LHSNavigationService } from '../../lhs-navigation.service';
import { PersonalizationAPIService } from '../personalization-api/personalization.api.service';
import { BXComponentFlowDefinition, BXPersonalizationFlowDefinition } from '../personalization.types';
import { AbTestComponentService } from './ab-test-component.service';
import { FlowDefinitionsService } from './flow-definitions.service';

const abTestFlowDefinition: BXPersonalizationFlowDefinition = {
  siteId: 'e1d1a1a5-728d-4a5d-82a2-c2dd356af043',
  ref: 'ref',
  archived: false,
  businessProcess: 'interactive_v1',
  name: 'morning visitor',
  friendlyId: 'component_scope_foo1bar2baz30000aaaabbbbcccc1234_renderinginstanceid_lang001_20240715t090123427z',
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

const personalizationFlowDefinition: BXPersonalizationFlowDefinition = {
  siteId: 'e1d1a1a5-728d-4a5d-82a2-c2dd356af043',
  ref: 'ref',
  archived: false,
  businessProcess: 'interactive_v1',
  name: 'morning visitor',
  friendlyId: 'embedded_scope_foo1bar2baz30000aaaabbbbcccc1234_lang001',
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

const personalizationComponentFlowDefinition: BXComponentFlowDefinition = {
  siteId: 'e1d1a1a5-728d-4a5d-82a2-c2dd356af043',
  ref: 'ref',
  archived: false,
  businessProcess: 'interactive_v1',
  name: 'morning visitor',
  friendlyId: 'embedded_foo1bar2baz30000aaaabbbbcccc1234_1',
  channels: ['WEB'],
  sampleSizeConfig: {
    baseValue: 0.15,
    minimumDetectableDifference: 0.02,
    confidenceLevel: 0.95,
  },
  traffic: {
    type: 'simpleTraffic',
    weightingAlgorithm: 'USER_DEFINED',
    modifiedAt: undefined,
    allocation: 100,
    splits: [],
    coupled: false,
  },
  goals: {
    primary: {
      type: 'pageViewGoal',
      name: '',
      friendlyId: '',
      ref: '',
      description: '',
      goalCalculation: {
        type: 'binary',
        calculation: 'INCREASE',
        target: 'conversionPerSession',
      },
      pageParameters: [
        {
          matchCondition: 'Equals',
          parameterString: '',
        },
      ],
    },
  },
  schedule: {
    type: 'simpleSchedule',
    startDate: '01/08/2021',
  },
  status: 'PRODUCTION',
  tags: [],
  triggers: [],
  type: 'INTERACTIVE_API_FLOW',
  variants: [{ ref: 'test', name: 'testVariant', isControl: false, tasks: [] }],
  subtype: 'EXPERIENCE',
  transpiledVariants: [],
};

describe(AbTestComponentService.name, () => {
  let sut: AbTestComponentService;
  let context: ContextServiceTesting;
  let personalizationAPI: jasmine.SpyObj<PersonalizationAPIService>;
  let flowDefinitionsService: jasmine.SpyObj<FlowDefinitionsService>;
  let featureFlagsServiceSpy: jasmine.SpyObj<FeatureFlagsService>;
  let siteService: jasmine.SpyObj<SiteService>;
  let lhsNavigationServiceSpy: jasmine.SpyObj<LHSNavigationService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let activeNavigation$: Subject<string>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ContextServiceTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        {
          provide: PersonalizationAPIService,
          useValue: jasmine.createSpyObj<PersonalizationAPIService>('PersonalizationAPIService', [
            'getPersonalizationScope',
            'getCurrentSiteFlowDefinitions',
            'updateComponentFlowDefinition',
          ]),
        },
        {
          provide: FlowDefinitionsService,
          useValue: jasmine.createSpyObj<FlowDefinitionsService>('FlowDefinitionsService', ['getPageFlowDefinitions']),
        },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>('FeatureFlagsService', ['isFeatureEnabled']),
        },
        {
          provide: ConfigurationService,
          useValue: jasmine.createSpyObj<ConfigurationService>(
            {},
            {
              configuration$: of({
                personalizeScope: '',
              } as Configuration),
            },
          ),
        },
        {
          provide: SiteService,
          useValue: jasmine.createSpyObj<SiteService>('SiteService', ['getPointOfSale']),
        },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>(['init', 'isFeatureEnabled']),
        },
        {
          provide: EditorWorkspaceService,
          useValue: jasmine.createSpyObj<EditorWorkspaceService>({
            watchCanvasLoadState: of({
              isLoading: false,
              itemId: 'foo1bar2baz30000aaaabbbbcccc1234',
              language: 'lang001',
            }),
          }),
        },
        {
          provide: LHSNavigationService,
          useValue: jasmine.createSpyObj<LHSNavigationService>('LHSNavigationService', ['watchRouteSegment']),
        },
        { provide: ActivatedRoute, useValue: activatedRoute },
        AbTestComponentService,
      ],
    });

    personalizationAPI = TestBedInjectSpy(PersonalizationAPIService);
    flowDefinitionsService = TestBedInjectSpy(FlowDefinitionsService);

    featureFlagsServiceSpy = TestBedInjectSpy(FeatureFlagsService);
    featureFlagsServiceSpy.isFeatureEnabled.and.returnValue(true);

    siteService = TestBedInjectSpy(SiteService);
    siteService.getPointOfSale.and.returnValue(Promise.resolve('pointOfSale'));

    activeNavigation$ = new ReplaySubject(1);
    lhsNavigationServiceSpy = TestBedInjectSpy(LHSNavigationService);
    lhsNavigationServiceSpy.watchRouteSegment.and.returnValue(activeNavigation$);
    personalizationAPI.getCurrentSiteFlowDefinitions.and.returnValue(
      Promise.resolve({ apiIsBroken: false, requestIsInvalid: false, data: [] }),
    );

    activeNavigation$.next('editor');

    sut = TestBed.inject(AbTestComponentService);

    context = TestBed.inject(ContextServiceTesting);
    context.provideDefaultTestContext();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('isComponentTestConfiguredOnPage', async () => {
    it('should return component tests configured on page', async () => {
      flowDefinitionsService.getPageFlowDefinitions.and.resolveTo({
        context: { itemId: 'foo1bar2baz30000aaaabbbbcccc1234', language: 'lang001' },
        flows: [abTestFlowDefinition],
      });

      personalizationAPI.getPersonalizationScope.and.resolveTo('scope');

      const result = await sut.getAbTestsConfiguredOnPage('foo1bar2baz30000aaaabbbbcccc1234', 'lang001');
      expect(result.length).toBe(1);
    });

    it('should return empty list when no component tests configured on page', async () => {
      flowDefinitionsService.getPageFlowDefinitions.and.resolveTo({
        context: { itemId: 'foo1bar2baz30000aaaabbbbcccc1234', language: 'lang001' },
        flows: [abTestFlowDefinition],
      });
      personalizationAPI.getPersonalizationScope.and.resolveTo('scope');

      const result = await sut.getAbTestsConfiguredOnPage('foo1bar2baz30000aaaabbbbcccc1233', 'lang001');
      expect(result.length).toBe(0);
    });
  });

  it('should return "notEnabledOnTenant" when CDP App is not configured', async () => {
    sut.isCdpAppConfigured = false;
    const status = await sut.getAbTestConfigStatus('foo1bar2baz30000aaaabbbbcccc1234', 'lang001');
    expect(status).toBe('notEnabledOnTenant');
  });

  it('should return "noPOSIdentifierForSite" when POS identifier is not defined', async () => {
    sut.isCdpAppConfigured = true;
    siteService.getPointOfSale.and.returnValue(Promise.resolve(null));
    const status = await sut.getAbTestConfigStatus('foo1bar2baz30000aaaabbbbcccc1234', 'lang001');
    expect(status).toBe('noPOSIdentifierForSite');
  });

  it('should return "pagePersonalizationConfigured" when page personalization is configured', async () => {
    sut.isCdpAppConfigured = true;
    siteService.getPointOfSale.and.returnValue(Promise.resolve('posIdentifier'));
    personalizationAPI.getPersonalizationScope.and.resolveTo('scope');
    flowDefinitionsService.getPageFlowDefinitions.and.resolveTo({
      context: { itemId: 'foo1bar2baz30000aaaabbbbcccc1234', language: 'lang001' },
      flows: [personalizationFlowDefinition],
    });
    const status = await sut.getAbTestConfigStatus('foo1bar2baz30000aaaabbbbcccc1234', 'lang001');
    expect(status).toBe('pagePersonalizationConfigured');
  });

  it('should return "readyForConfiguration" when no other conditions are met', async () => {
    sut.isCdpAppConfigured = true;
    siteService.getPointOfSale.and.returnValue(Promise.resolve('posIdentifier'));
    flowDefinitionsService.getPageFlowDefinitions.and.resolveTo({
      context: { itemId: 'foo1bar2baz30000aaaabbbbcccc1234', language: 'lang001' },
      flows: [],
    });
    const status = await sut.getAbTestConfigStatus('foo1bar2baz30000aaaabbbbcccc1234', 'lang001');
    expect(status).toBe('readyForConfiguration');
  });

  it('should return "modeNotSupported" when activeNavigation is "editpagedesign"', fakeAsync(async () => {
    activeNavigation$.next('editpagedesign');
    tick();

    const status = await sut.getAbTestConfigStatus('foo1bar2baz30000aaaabbbbcccc1234', 'lang001');

    expect(status).toBe('modeNotSupported');
  }));

  it('should return "modeNotSupported" when activeNavigation is "editpartialdesign"', fakeAsync(async () => {
    activeNavigation$.next('editpartialdesign');
    tick();

    const status = await sut.getAbTestConfigStatus('foo1bar2baz30000aaaabbbbcccc1234', 'lang001');

    expect(status).toBe('modeNotSupported');
  }));

  it('should return "modeNotSupported" when activeNavigation is "editpagebranch"', fakeAsync(async () => {
    activeNavigation$.next('editpagebranch');
    tick();

    const status = await sut.getAbTestConfigStatus('foo1bar2baz30000aaaabbbbcccc1234', 'lang001');

    expect(status).toBe('modeNotSupported');
  }));

  it('should not return "modeNotSupported" when activeNavigation is "editor"', fakeAsync(async () => {
    activeNavigation$.next('editor');
    tick();

    const status = await sut.getAbTestConfigStatus('foo1bar2baz30000aaaabbbbcccc1234', 'lang001');

    expect(status).not.toBe('modeNotSupported');
  }));

  describe('getCurrentSiteFlowDefinitions', () => {
    it('should fetch site flow definitions when CDP App is configured', fakeAsync(async () => {
      personalizationAPI.getCurrentSiteFlowDefinitions.and.resolveTo({
        apiIsBroken: false,
        data: [personalizationFlowDefinition],
        requestIsInvalid: false,
      });
      sut.isCdpAppConfigured = true;

      await sut.getCurrentSiteFlowDefinitions();

      expect(personalizationAPI.getCurrentSiteFlowDefinitions).toHaveBeenCalled();
    }));

    it('should not fetch site flow definitions when CDP App is not configured', async () => {
      ConfigurationService.cdpTenant = {
        id: '789',
        name: 'cdtenant',
        displayName: 'cdtenant1',
        organizationId: 'test-org',
        apiUrl: '',
        appUrl: '',
        analyticsAppUrl: '',
      };
      sut.isCdpAppConfigured = false;

      const callsBeforeCount = personalizationAPI.getCurrentSiteFlowDefinitions.calls.count();
      await sut.getCurrentSiteFlowDefinitions();
      const callsAfterCount = personalizationAPI.getCurrentSiteFlowDefinitions.calls.count();

      expect(callsAfterCount).toBe(callsBeforeCount);
    });
  });

  describe('updateComponentFlowDefinition', () => {
    it('it should not make call to `updateComponentFlowDefinition` when CDP App is not configured', async () => {
      sut.isCdpAppConfigured = false;

      spyOn(sut, 'updateComponentFlowDefinition').and.callThrough();

      expect(personalizationAPI.updateComponentFlowDefinition).not.toHaveBeenCalled();
    });

    it('it should make call to `updateComponentFlowDefinition` when CDP App is configured', async () => {
      sut.isCdpAppConfigured = true;
      personalizationAPI.updateComponentFlowDefinition.and.resolveTo({
        apiIsBroken: false,
        data: personalizationComponentFlowDefinition,
        requestIsInvalid: false,
      });

      await sut.updateComponentFlowDefinition(personalizationComponentFlowDefinition);

      expect(personalizationAPI.updateComponentFlowDefinition).toHaveBeenCalled();
      expect(personalizationAPI.updateComponentFlowDefinition).toHaveBeenCalledWith(
        personalizationComponentFlowDefinition,
      );
    });
  });
});
