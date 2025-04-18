/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Context } from 'app/shared/client-state/context.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { PageApiService } from 'app/shared/rest/page/page.api.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { environment } from 'environments/environment';
import { BehaviorSubject, of } from 'rxjs';
import { BXComponentFlowDefinition } from '../personalization.types';
import { cdpSiteData, CdpSiteDataService } from './cdp-site-data.service';
import { VariantPublishedStatusService } from './variant-published-status.service';

const INITIAL_CONTEXT: Context = {
  itemId: 'foo',
  itemVersion: 1,
  variant: undefined,
  language: 'en',
  siteName: 'test.com',
};

const flowDefinition: BXComponentFlowDefinition = {
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
  variants: [
    {
      ref: '2b83749d-629a-404d-8c71-84bdcc4254b7',
      name: 'Variant B',
      isControl: false,
      tasks: [
        {
          implementation: 'templateRenderTask',
          input: {
            inputType: 'templateRenderTaskInput',
            type: 'application/json',
            template: '{"variantId":"02fb730a14b34b9ca533cbff0f74d5dd_2b83749d629a404d8c7184bdcc4254b7"}',
          },
        },
      ],
    },
  ],
  subtype: 'EXPERIENCE',
  transpiledVariants: [],
};

describe(VariantPublishedStatusService.name, () => {
  let sut: VariantPublishedStatusService;
  let pageApiServiceSpy: jasmine.SpyObj<PageApiService>;
  let context: ContextServiceTesting;
  let cdpSiteDataServiceSpy: jasmine.SpyObj<CdpSiteDataService>;
  let sdpSiteData$: BehaviorSubject<cdpSiteData>;
  beforeEach(() => {
    sdpSiteData$ = new BehaviorSubject<cdpSiteData>({
      hasPagePersonalization: () => true,
      hasPageWithAbTest: () => true,
      hasComponentAbTest: () => true,
    });

    TestBed.configureTestingModule({
      imports: [ContextServiceTestingModule],
      providers: [
        {
          provide: PageApiService,
          useValue: jasmine.createSpyObj<PageApiService>('PageApiService', ['getLivePageVariants']),
        },
        {
          provide: CdpSiteDataService,
          useValue: jasmine.createSpyObj<CdpSiteDataService>({
            watchCdpSiteData: sdpSiteData$,
          }),
        },

        VariantPublishedStatusService,
      ],
    });

    pageApiServiceSpy = TestBedInjectSpy(PageApiService);
    pageApiServiceSpy.getLivePageVariants.and.returnValue(of());

    cdpSiteDataServiceSpy = TestBedInjectSpy(CdpSiteDataService);

    context = TestBed.inject(ContextServiceTesting);
    context.provideTestValue(INITIAL_CONTEXT);
    sut = TestBed.inject(VariantPublishedStatusService);
    environment.inventoryConnectedMode = true;
  });

  afterEach(() => {
    sut.ngOnDestroy();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should call getLivePageVariants when itemId or language changes', fakeAsync(() => {
    const livePageVariants = ['variant1', 'variant2'];
    pageApiServiceSpy.getLivePageVariants.and.returnValue(of(livePageVariants));

    cdpSiteDataServiceSpy.watchCdpSiteData.and.returnValue(
      of({ hasPagePersonalization: () => true, hasPageWithAbTest: () => true } as any),
    );
    context.provideTestValue({ itemId: 'newitemid', language: 'da' });
    tick();

    const mostRecentCall = pageApiServiceSpy.getLivePageVariants.calls.mostRecent();
    expect(mostRecentCall.args).toEqual(['newitemid', 'da']);
    expect(sut.getLivePageVariants).toEqual(livePageVariants);
  }));

  it('should not call getLivePageVariants when page does not have a/b test', fakeAsync(() => {
    const callsBefore = pageApiServiceSpy.getLivePageVariants.calls.count();

    const livePageVariants = ['variant1', 'variant2'];
    pageApiServiceSpy.getLivePageVariants.and.returnValue(of(livePageVariants));
    sdpSiteData$.next({
      hasPagePersonalization: () => false,
      hasPageWithAbTest: () => false,
      hasComponentAbTest: () => false,
    });
    tick();

    sut.updateLivePageVariantsCheckStatus(true);
    tick();

    const callsAfter = pageApiServiceSpy.getLivePageVariants.calls.count();
    expect(callsBefore).toBe(callsAfter);
    expect(sut.getLivePageVariants).toEqual([]);
  }));

  it('should return true if flow status is PRODUCTION and page contains all variants', fakeAsync(() => {
    flowDefinition.status = 'PRODUCTION';
    const livePageVariants = ['02fb730a14b34b9ca533cbff0f74d5dd_2b83749d629a404d8c7184bdcc4254b7'];
    pageApiServiceSpy.getLivePageVariants.and.returnValue(of(livePageVariants));

    sut.updateLivePageVariantsCheckStatus(true);
    tick();

    const result = sut.isPagePublished(flowDefinition);

    expect(result).toBeTrue();
  }));

  it('should return false if flow status is PRODUCTION and page does not contain all flow variants', fakeAsync(() => {
    flowDefinition.status = 'PRODUCTION';
    const livePageVariants = ['non-existing-variant'];
    pageApiServiceSpy.getLivePageVariants.and.returnValue(of(livePageVariants));

    sut.updateLivePageVariantsCheckStatus(true);
    tick();

    const result = sut.isPagePublished(flowDefinition);

    expect(result).toBeFalse();
  }));

  it('should return true if flow status is COMPLETED and page has no variants', fakeAsync(() => {
    flowDefinition.status = 'COMPLETED';
    pageApiServiceSpy.getLivePageVariants.and.returnValue(of([]));

    sut.updateLivePageVariantsCheckStatus(true);
    tick();

    const result = sut.isPagePublished(flowDefinition);

    expect(result).toBeTrue();
  }));

  it('should return false if flow status is COMPLETED and page has some variants', fakeAsync(() => {
    flowDefinition.status = 'COMPLETED';
    const livePageVariants = ['02fb730a14b34b9ca533cbff0f74d5dd_2b83749d629a404d8c7184bdcc4254b7'];
    pageApiServiceSpy.getLivePageVariants.and.returnValue(of(livePageVariants));

    sut.updateLivePageVariantsCheckStatus(true);
    tick();

    const result = sut.isPagePublished(flowDefinition);

    expect(result).toBeFalse();
  }));
});
