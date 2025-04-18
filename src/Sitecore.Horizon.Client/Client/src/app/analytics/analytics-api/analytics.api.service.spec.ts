/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient, HttpClientModule, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import {
  getDefaultSiteAnalytics,
  getDefaultVariantPageAnalytics,
  getPageAnalyticsForVariant1,
} from 'app/testing/analytics-test-data';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { of } from 'rxjs';
import { AnalyticsFilterOptions, PageAnalytics, SiteAnalytics, SiteAnalyticsFilterOptions } from '../analytics.types';
import { AnalyticsApiServiceConnected } from './analytics.api.service';

const cdpApiUrl = 'http://cdp.com';
const cdpApiRelativeUrl = '/v2/realTimeAnalytics/';
describe(AnalyticsApiServiceConnected.name, () => {
  let sut: AnalyticsApiServiceConnected;

  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [
        {
          provide: HttpClient,
          useValue: jasmine.createSpyObj<HttpClient>({ get: undefined }),
        },
        AnalyticsApiServiceConnected,
      ],
    });

    httpClientSpy = TestBedInjectSpy(HttpClient);
    ConfigurationService.cdpTenant = {
      id: '123',
      name: 'tenant',
      displayName: 'tenant1',
      organizationId: 'org1',
      apiUrl: 'http://cdp.com',
      appUrl: 'http://cdpapp.com',
      analyticsAppUrl: '',
    };
    sut = TestBed.inject(AnalyticsApiServiceConnected);
  });

  afterEach(() => {
    ConfigurationService.xmCloudTenant = null;
    ConfigurationService.cdpTenant = null;
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('siteMetrics endpoint', () => {
    it('should fetch site analytics', async () => {
      // Arrange
      const siteAnalytics = getDefaultSiteAnalytics();
      const siteAnalyticsFilter: SiteAnalyticsFilterOptions = {
        duration: '1hr',
        pointOfSale: 'sale',
        timezoneOffset: 1.5,
      };

      const createOkResponse = new HttpResponse<SiteAnalytics>({
        body: siteAnalytics,
        status: 200,
        statusText: 'OK',
        headers: new HttpHeaders(),
        url: 'api.com',
      });

      httpClientSpy.get.and.returnValue(of(createOkResponse));

      // Act
      const actual = await sut.loadSiteAnalytics(siteAnalyticsFilter);

      // Assert
      expect(actual).not.toBeNull();
      expect(httpClientSpy.get.calls.mostRecent().args[0]).toBe(
        `${cdpApiUrl}${cdpApiRelativeUrl}siteMetrics?pointOfSale=sale&duration=1hr&timezoneOffset=1.5`,
      );

      expect(actual).toEqual({
        apiIsBroken: false,
        requestIsInvalid: false,
        data: siteAnalytics,
        httpStatus: 200,
      });
    });

    it('should handle site analytics api error', async () => {
      // Arrange
      const siteAnalyticsFilter: SiteAnalyticsFilterOptions = {
        duration: '1hr',
        pointOfSale: 'sale',
        timezoneOffset: 1.5,
      };

      const createErrorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'OK',
        headers: new HttpHeaders(),
        url: 'api.com',
      });

      httpClientSpy.get.and.returnValue(of(createErrorResponse));

      // Act
      const actual = await sut.loadSiteAnalytics(siteAnalyticsFilter);

      // Assert
      expect(httpClientSpy.get.calls.mostRecent().args[0]).toBe(
        `${cdpApiUrl}${cdpApiRelativeUrl}siteMetrics?pointOfSale=sale&duration=1hr&timezoneOffset=1.5`,
      );

      expect(actual).toEqual({
        apiIsBroken: true,
        requestIsInvalid: false,
        data: null,
        httpStatus: 500,
      });
    });

    it('should only add filters that are set', async () => {
      // Arrange
      const siteAnalytics = getDefaultSiteAnalytics();
      const siteAnalyticsFilter: SiteAnalyticsFilterOptions = {
        duration: '3hr',
        timezoneOffset: 1.5,
      };

      const createOkResponse = new HttpResponse<SiteAnalytics>({
        body: siteAnalytics,
        status: 200,
        statusText: 'OK',
        headers: new HttpHeaders(),
        url: 'api.com',
      });

      httpClientSpy.get.and.returnValue(of(createOkResponse));

      // Act
      const actual = await sut.loadSiteAnalytics(siteAnalyticsFilter);

      // Assert
      expect(actual).not.toBeNull();
      expect(httpClientSpy.get.calls.mostRecent().args[0]).toBe(
        `${cdpApiUrl}${cdpApiRelativeUrl}siteMetrics?duration=3hr&timezoneOffset=1.5`,
      );

      expect(actual).toEqual({
        apiIsBroken: false,
        requestIsInvalid: false,
        data: siteAnalytics,
        httpStatus: 200,
      });
    });
  });

  describe('pageMetrics endpoints', () => {
    it('should fetch default variant pageAnalytics if no other variant is passed to filter options', async () => {
      // Arrange
      const pageAnalyticsFilter: AnalyticsFilterOptions = {
        duration: '1hr',
        pointOfSale: 'sale',
        pageVariantId: 'default',
      };

      const pageAnalyticsForDefaultVariant = getDefaultVariantPageAnalytics();

      const createOkResponse = new HttpResponse<PageAnalytics>({
        body: pageAnalyticsForDefaultVariant,
        status: 200,
        statusText: 'OK',
        headers: new HttpHeaders(),
        url: 'api.com',
      });

      httpClientSpy.get.and.returnValue(of(createOkResponse));

      // Act
      const actual = await sut.loadPageAnalytics(pageAnalyticsFilter);

      // Assert
      expect(actual).not.toBeNull();

      expect(httpClientSpy.get.calls.mostRecent().args[0]).toContain(
        `${cdpApiUrl}${cdpApiRelativeUrl}pageMetrics?pointOfSale=sale&duration=1hr&pageVariantId=default`,
      );

      expect(actual).toEqual({
        apiIsBroken: false,
        requestIsInvalid: false,
        data: pageAnalyticsForDefaultVariant,
        httpStatus: 200,
      });
    });

    it('should fetch pageAnalytics based on variantId set in the filter options', async () => {
      // Arrange
      const pageAnalyticsFilter: AnalyticsFilterOptions = {
        duration: '3hr',
        pointOfSale: 'sale',
        pageVariantId: 'variant1',
      };
      const pageAnalyticsForVariant1 = getPageAnalyticsForVariant1();

      const createOkResponse = new HttpResponse<PageAnalytics>({
        body: pageAnalyticsForVariant1,
        statusText: 'OK',
        headers: new HttpHeaders(),
        url: 'api.com',
      });

      httpClientSpy.get.and.returnValue(of(createOkResponse));

      // Act
      const actual = await sut.loadPageAnalytics(pageAnalyticsFilter);

      // Assert
      expect(actual).not.toBeNull();
      expect(httpClientSpy.get.calls.mostRecent().args[0]).toBe(
        `${cdpApiUrl}${cdpApiRelativeUrl}pageMetrics?pointOfSale=sale&duration=3hr&pageVariantId=variant1`,
      );

      expect(actual).toEqual({
        apiIsBroken: false,
        requestIsInvalid: false,
        data: pageAnalyticsForVariant1,
        httpStatus: 200,
      });
    });

    it('should handle page analytics api error', async () => {
      // Arrange
      const pageAnalyticsFilter: AnalyticsFilterOptions = {
        duration: '3hr',
        pointOfSale: 'sale',
        pageVariantId: 'variant1',
      };

      const createErrorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'OK',
        headers: new HttpHeaders(),
        url: 'api.com',
      });

      httpClientSpy.get.and.returnValue(of(createErrorResponse));

      // Act
      const actual = await sut.loadPageAnalytics(pageAnalyticsFilter);

      // Assert
      expect(httpClientSpy.get.calls.mostRecent().args[0]).toBe(
        `${cdpApiUrl}${cdpApiRelativeUrl}pageMetrics?pointOfSale=sale&duration=3hr&pageVariantId=variant1`,
      );

      expect(actual).toEqual({
        apiIsBroken: true,
        requestIsInvalid: false,
        data: null,
        httpStatus: 500,
      });
    });
  });
});
