/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { getDefaultSiteAnalytics } from 'app/testing/analytics-test-data';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { AnalyticsApiService } from '../analytics-api/analytics.api.service';
import { AnalyticsContextService } from '../analytics-context.service';
import { SiteAnalyticsComponent } from './site-analytics.component';

@Component({
  selector: 'app-site-analytics-graphs',
  template: '',
})
class TestSiteAnalyticsGraphsComponent {
  @Input() siteAnalytics = null;
  @Input() isValidData = true;
  @Input() isLoading = false;
  @Input() duration = '';
}

describe(SiteAnalyticsComponent.name, () => {
  let sut: SiteAnalyticsComponent;
  let fixture: ComponentFixture<SiteAnalyticsComponent>;
  let context: ContextServiceTesting;
  let analyticsApiService: jasmine.SpyObj<AnalyticsApiService>;
  let analyticsContextService: jasmine.SpyObj<AnalyticsContextService>;
  let featureFlagsService: jasmine.SpyObj<FeatureFlagsService>;

  const bannerEl = () => fixture.debugElement.query(By.css('app-analytics-error-banner')).nativeElement;

  const whenInitialized = async () => {
    await Promise.resolve();
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.resolve();
    fixture.detectChanges();
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SiteAnalyticsComponent, TestSiteAnalyticsGraphsComponent],
      imports: [
        TranslateServiceStubModule,
        ContextServiceTestingModule,
        TranslateModule,
        CommonModule,
        StaticConfigurationServiceStubModule,
      ],
      providers: [
        DatePipe,
        {
          provide: AnalyticsApiService,
          useValue: jasmine.createSpyObj<AnalyticsApiService>('AnalyticsApiService', ['loadSiteAnalytics']),
        },
        {
          provide: AnalyticsContextService,
          useValue: jasmine.createSpyObj<AnalyticsContextService>('AnalyticsContextService', [
            'getSiteInformation',
            'watchDuration',
            'getPointOfSale',
          ]),
        },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>('FeatureFlagsService', ['isFeatureEnabled']),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    analyticsApiService = TestBedInjectSpy(AnalyticsApiService);
    analyticsContextService = TestBedInjectSpy(AnalyticsContextService);
    featureFlagsService = TestBedInjectSpy(FeatureFlagsService);
    context = TestBed.inject(ContextServiceTesting);
    context.provideDefaultTestContext();

    spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(180);

    analyticsApiService.loadSiteAnalytics.and.resolveTo({
      apiIsBroken: false,
      requestIsInvalid: false,
      data: getDefaultSiteAnalytics(),
    });

    ConfigurationService.cdpTenant = {
      id: '123',
      name: 'tenant',
      displayName: 'tenant1',
      organizationId: 'org1',
      apiUrl: 'http://cdp.com',
      appUrl: 'http://cdpapp.com',
      analyticsAppUrl: '',
    };

    fixture = TestBed.createComponent(SiteAnalyticsComponent);
    sut = fixture.componentInstance;

    analyticsContextService.getPointOfSale.and.returnValue(of('pointOfSale'));
    analyticsContextService.watchDuration.and.returnValue(of({ id: '7D', value: '7d' }));
  });

  afterEach(() => {
    ConfigurationService.xmCloudTenant = null;
    ConfigurationService.cdpTenant = null;
  });

  describe('WHEN cpdAppUrls is configured', () => {
    describe('AND POS is defined', () => {
      it('should load site analytics', async () => {
        await whenInitialized();

        expect(analyticsApiService.loadSiteAnalytics).toHaveBeenCalledWith({
          pointOfSale: 'pointOfSale',
          duration: '7d',
          timezoneOffset: -3,
        });
      });

      it('should update data bound property of [SiteAnalyticsGraphsComponent] respective to parent component properties', async () => {
        await whenInitialized();

        const graphCompEl = fixture.debugElement.query(
          By.directive(TestSiteAnalyticsGraphsComponent),
        ).componentInstance;
        expect(graphCompEl.siteAnalytics).toEqual(getDefaultSiteAnalytics());
        expect(graphCompEl.isValidData).toEqual(true);
        expect(graphCompEl.isLoading).toEqual(false);
        expect(graphCompEl.duration).toEqual('7d');
      });

      it('should show no data error banner if their is no data', async () => {
        analyticsApiService.loadSiteAnalytics.and.resolveTo({
          apiIsBroken: false,
          requestIsInvalid: false,
          data: null,
        });
        await whenInitialized();

        expect(bannerEl()).toBeDefined();
        expect(bannerEl().title).toEqual('ANALYTICS.SITE_ANALYTICS.NO_DATA_AVAILABLE');
        expect(bannerEl().text).toEqual('ANALYTICS.SITE_ANALYTICS.NO_DATA_MESSAGE');
      });
    });

    describe('AND POS is not defined', () => {
      describe('AND isFeatureEnabled() is enabled', () => {
        it('should show no-pos error banner with correct text', async () => {
          featureFlagsService.isFeatureEnabled.and.returnValue(true);
          analyticsContextService.getPointOfSale.and.returnValue(of(''));
          const mockSiteInfo = { collectionId: 'mockCollectionId', id: 'mockSiteId', hostId: 'mockHostId' };
          analyticsContextService.getSiteInformation.and.returnValue(of(mockSiteInfo));

          await whenInitialized();

          expect(analyticsContextService.getSiteInformation).toHaveBeenCalled();
          expect(bannerEl()).toBeDefined();
          expect(bannerEl().title).toEqual('ANALYTICS.NO_ANALITYCS_IDENTIFIER.HEADER');
          expect(bannerEl().text).toEqual('ANALYTICS.NO_ANALITYCS_IDENTIFIER.DESCRIPTION');
        });
      });

      describe('AND isFeatureEnabled() is not enabled', () => {
        it('should show no-pos error banner with correct text', async () => {
          featureFlagsService.isFeatureEnabled.and.returnValue(false);
          analyticsContextService.getPointOfSale.and.returnValue(of(''));

          await whenInitialized();

          expect(bannerEl()).toBeDefined();
          expect(bannerEl().title).toEqual('ANALYTICS.NO_POS_IDENTIFIER.HEADER');
          expect(bannerEl().text).toEqual('ANALYTICS.NO_POS_IDENTIFIER.DESCRIPTION');
        });
      });

      it('should not invoke call to fetch siteAnalytic data', async () => {
        analyticsContextService.getPointOfSale.and.returnValue(of(''));
        await whenInitialized();

        expect(analyticsApiService.loadSiteAnalytics).not.toHaveBeenCalled();
      });
    });
  });

  describe('WHEN cdpAppUrls is not configured', () => {
    it('should show cdp not configured error banner', async () => {
      sut.isCdpAppConfigured = false;
      await whenInitialized();

      expect(bannerEl()).toBeDefined();
      expect(bannerEl().title).toEqual('ANALYTICS.NO_CDP_APP_URL.HEADER');
      expect(bannerEl().text).toEqual('ANALYTICS.NO_CDP_APP_URL.DESCRIPTION');
    });

    it('should not invoke call to fetch siteAnalytic data', async () => {
      sut.isCdpAppConfigured = false;
      await whenInitialized();

      expect(analyticsApiService.loadSiteAnalytics).not.toHaveBeenCalled();
    });
  });

  describe('isFeatureEnabled()', () => {
    it('should return true when the feature is enabled', () => {
      // Arrange
      featureFlagsService.isFeatureEnabled.and.returnValue(true);

      // Act
      const result = sut.isFeatureEnabled();

      // Assert
      expect(featureFlagsService.isFeatureEnabled).toHaveBeenCalledWith('pages_site-analytics-identifier');
      expect(result).toBe(true);
    });

    it('should return false when the feature is disabled', () => {
      // Arrange
      featureFlagsService.isFeatureEnabled.and.returnValue(false);

      // Act
      const result = sut.isFeatureEnabled();

      // Assert
      expect(featureFlagsService.isFeatureEnabled).toHaveBeenCalledWith('pages_site-analytics-identifier');
      expect(result).toBe(false);
    });
  });
});
