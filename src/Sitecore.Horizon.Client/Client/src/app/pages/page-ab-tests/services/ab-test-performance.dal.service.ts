/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BXComponentFlowDefinition } from 'app/pages/left-hand-side/personalization/personalization.types';
import { StaticConfigurationService } from 'app/shared/configuration/static-configuration.service';
import { ApiResponse } from 'app/shared/utils/utils';
import { catchError, map, Observable, of } from 'rxjs';
import { AbTestPerformance, AbTestPerformanceResponse } from './performance.types';

@Injectable({
  providedIn: 'root',
})
export class AbTestPerformanceDalService {
  private readonly AB_TEST_PERFORMANCE_ENDPOINT_URL = '/cubejs-api/v1/load?newFormat=1&query=';

  constructor(
    private readonly configurationService: StaticConfigurationService,
    private readonly httpClient: HttpClient,
    private datePipe: DatePipe,
  ) {}

  getAbTestPerformance(
    abTest: BXComponentFlowDefinition,
    startDate?: string,
    endDate?: string,
  ): Observable<ApiResponse<AbTestPerformanceResponse>> {
    if (!abTest.ref) {
      return this.invalidResponse();
    }

    const goalsFriendlyIds = [abTest.goals?.primary?.friendlyId];
    const testsIds = [abTest.ref];

    const performanceQuery = this.getAbTestPerformanceQuery(testsIds, goalsFriendlyIds, startDate, endDate);
    const performanceUrl =
      this.configurationService.analyticsBaseUrl + this.AB_TEST_PERFORMANCE_ENDPOINT_URL + performanceQuery;

    return this.httpClient.get<AbTestPerformanceResponse>(performanceUrl).pipe(
      map((data) => this.validResponse(data.data)),
      catchError((error) => {
        console.error('Error fetching AB test performance:', error);
        return this.brokenApiResponse();
      }),
    );
  }

  private getAbTestPerformanceQuery(
    flowReferenceIds: string[],
    goalIds: string[],
    startDate?: string,
    endDate?: string,
  ): string {
    if (!startDate) {
      startDate = this.datePipe.transform(
        new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        'yyyy-MM-dd',
      )!;
    }
    if (!endDate) {
      endDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd')!;
    }

    const query = {
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
          dateRange: [startDate, endDate],
        },
      ],
      order: {
        'SessionMetrics.flowexecutiontime': 'desc',
      },
      filters: [
        {
          dimension: 'SessionMetrics.flowref',
          operator: 'equals',
          values: flowReferenceIds,
        },
        {
          dimension: 'SessionMetrics.metric',
          operator: 'equals',
          values: goalIds,
        },
      ],
      dimensions: ['SessionMetrics.flowvariantref', 'SessionMetrics.flowref', 'SessionMetrics.metric'],
    };

    return encodeURIComponent(JSON.stringify(query));
  }

  private validResponse(performanceData: AbTestPerformance[]): ApiResponse<AbTestPerformanceResponse> {
    return {
      apiIsBroken: false,
      requestIsInvalid: false,
      data: { data: performanceData },
    };
  }

  private invalidResponse(): Observable<ApiResponse<AbTestPerformanceResponse>> {
    return of({
      apiIsBroken: false,
      requestIsInvalid: true,
      data: { data: [] },
    });
  }

  private brokenApiResponse(): Observable<ApiResponse<AbTestPerformanceResponse>> {
    return of({
      apiIsBroken: true,
      requestIsInvalid: false,
      data: { data: [] },
    });
  }
}
