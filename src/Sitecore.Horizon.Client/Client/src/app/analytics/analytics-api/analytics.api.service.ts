/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable max-classes-per-file */

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { ApiResponse, handleHttpErrorResponse, handleHttpResponse } from 'app/shared/utils/utils';
import { environment } from 'environments/environment.dev';
import { firstValueFrom } from 'rxjs';
import { buildAnalyticsQueryString } from '../analytics-util/analytics-utils';
import { AnalyticsFilterOptions, PageAnalytics, SiteAnalytics, SiteAnalyticsFilterOptions } from '../analytics.types';
import { AnalyticsApiServiceDisconnected } from './analytics.api.disconnected';

export const TimeAnalyticsApiRelativePath = '/v2/realTimeAnalytics/';

export function AnalyticsApiServiceFactory(httpClient: HttpClient) {
  if (environment.analyticsIntegrationConnectedMode) {
    return new AnalyticsApiServiceConnected(httpClient);
  } else {
    return new AnalyticsApiServiceDisconnected();
  }
}

export abstract class AnalyticsApiService {
  constructor() {}

  public abstract loadSiteAnalytics(filter: SiteAnalyticsFilterOptions): Promise<ApiResponse<SiteAnalytics>>;
  public abstract loadPageAnalytics(filter: AnalyticsFilterOptions): Promise<ApiResponse<PageAnalytics>>;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsApiServiceConnected {
  cdpApiBaseUrl = ConfigurationService.cdpTenant?.apiUrl + '/v2/realTimeAnalytics/';

  constructor(private readonly httpClient: HttpClient) {}

  public async loadSiteAnalytics(filter: SiteAnalyticsFilterOptions): Promise<ApiResponse<SiteAnalytics>> {
    const requestUrl = this.cdpApiBaseUrl + buildAnalyticsQueryString('siteMetrics', filter);
    try {
      const response = await firstValueFrom(
        this.httpClient.get<SiteAnalytics>(requestUrl, {
          observe: 'response',
        }),
      );
      return handleHttpResponse<SiteAnalytics>(response);
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        return handleHttpErrorResponse(error);
      }
    }
    return {
      apiIsBroken: true,
      requestIsInvalid: true,
      data: null,
    };
  }

  public async loadPageAnalytics(filter: AnalyticsFilterOptions): Promise<ApiResponse<PageAnalytics>> {
    const requestUrl = this.cdpApiBaseUrl + buildAnalyticsQueryString('pageMetrics', filter);
    try {
      const response = await firstValueFrom(
        this.httpClient.get<PageAnalytics>(requestUrl, {
          observe: 'response',
        }),
      );
      return handleHttpResponse<PageAnalytics>(response);
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        return handleHttpErrorResponse(error);
      }
    }
    return {
      apiIsBroken: true,
      requestIsInvalid: true,
      data: null,
    };
  }
}
