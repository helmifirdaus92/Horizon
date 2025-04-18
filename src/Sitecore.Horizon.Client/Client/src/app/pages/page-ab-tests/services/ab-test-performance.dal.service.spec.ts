/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { DatePipe } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BXComponentFlowDefinition } from 'app/pages/left-hand-side/personalization/personalization.types';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { AbTestPerformanceDalService } from './ab-test-performance.dal.service';
import { AbTestPerformanceResponse } from './performance.types';

const analyticsBaseUrl = 'https://analytics.api.com';
describe(AbTestPerformanceDalService.name, () => {
  let sut: AbTestPerformanceDalService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StaticConfigurationServiceStubModule, HttpClientTestingModule],
      providers: [AbTestPerformanceDalService, DatePipe],
    });

    sut = TestBed.inject(AbTestPerformanceDalService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should return invalid response when ref is not provided', () => {
    const abTest: BXComponentFlowDefinition = { ref: '', goals: { primary: { friendlyId: '' } } } as any;

    sut.getAbTestPerformance(abTest).subscribe((response) => {
      expect(response.data?.data).toEqual([]);
      expect(response.requestIsInvalid).toBeTrue();
      expect(response.apiIsBroken).toBeFalse();
    });

    httpMock.expectNone(() => true);
  });

  it('should fetch AB test performance data successfully', () => {
    const abTest: BXComponentFlowDefinition = { ref: 'testRef', goals: { primary: { friendlyId: 'goalId' } } } as any;
    const mockResponse: AbTestPerformanceResponse = {
      data: [
        {
          'SessionMetrics.flowvariantref': 'variant1',
          'SessionMetrics.flowref': 'flow1',
          'SessionMetrics.metric': 'conversionPerGuest',
          'SessionMetrics.conversionPerGuest': 0.1,
          'SessionMetrics.conversionPerSession': 0.2,
          'SessionMetrics.sampleStandardError': 0.01,
          'SessionMetrics.totalConversions': 10,
          'SessionMetrics.totalGuests': 100,
          'SessionMetrics.totalSessions': 50,
          'SessionMetrics.totalValue': 1000,
          'SessionMetrics.valuePerConversion': 100,
          'SessionMetrics.valuePerGuest': 10,
          'SessionMetrics.valuePerSession': 20,
        },
      ],
    };

    sut.getAbTestPerformance(abTest).subscribe((response) => {
      expect(response.data?.data).toEqual(mockResponse.data);
      expect(response.requestIsInvalid).toBeFalse();
      expect(response.apiIsBroken).toBeFalse();
    });

    const req = httpMock.expectOne(
      (request) => request.url.startsWith(analyticsBaseUrl) && request.url.includes('cubejs-api/v1/load'),
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle error when fetching AB test performance data', () => {
    const abTest: BXComponentFlowDefinition = { ref: 'testRef', goals: { primary: { friendlyId: 'goalId' } } } as any;

    sut.getAbTestPerformance(abTest).subscribe((response) => {
      expect(response.data?.data).toEqual([]);
      expect(response.requestIsInvalid).toBeFalse();
      expect(response.apiIsBroken).toBeTrue();
    });

    const req = httpMock.expectOne(
      (request) => request.url.startsWith(analyticsBaseUrl) && request.url.includes('cubejs-api/v1/load'),
    );
    expect(req.request.method).toBe('GET');
    req.flush('Error fetching data', { status: 500, statusText: 'Server Error' });
  });

  it('should include the correct query string in the request URL', () => {
    const abTest: BXComponentFlowDefinition = {
      ref: 'testRef',
      goals: { primary: { friendlyId: 'goalId' } },
    } as any;

    sut.getAbTestPerformance(abTest, '2023-12-22', '2024-12-22').subscribe();

    const req = httpMock.expectOne(
      (request) => request.url.startsWith(analyticsBaseUrl) && request.url.includes('cubejs-api/v1/load'),
    );
    expect(req.request.method).toBe('GET');

    const expectedQuery = encodeURIComponent(
      JSON.stringify({
        measures: [
          'SessionMetrics.conversionPerGuest',
          'SessionMetrics.conversionPerSession',
          'SessionMetrics.sampleStandardError',
          'SessionMetrics.totalConversions',
          'SessionMetrics.totalGuests',
          'SessionMetrics.totalSessions',
          'SessionMetrics.totalValue',
          'SessionMetrics.valuePerConversion',
          'SessionMetrics.valuePerGuest',
          'SessionMetrics.valuePerSession',
        ],
        timeDimensions: [
          {
            dimension: 'SessionMetrics.flowexecutiontime',
            granularity: null,
            dateRange: ['2023-12-22', '2024-12-22'],
          },
        ],
        order: {
          'SessionMetrics.flowexecutiontime': 'desc',
        },
        filters: [
          {
            dimension: 'SessionMetrics.flowref',
            operator: 'equals',
            values: ['testRef'],
          },
          {
            dimension: 'SessionMetrics.metric',
            operator: 'equals',
            values: ['goalId'],
          },
        ],
        dimensions: ['SessionMetrics.flowvariantref', 'SessionMetrics.flowref', 'SessionMetrics.metric'],
      }),
    );

    expect(req.request.url).toContain(expectedQuery);
  });
});
