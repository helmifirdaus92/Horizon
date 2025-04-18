/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgZone } from '@angular/core';
import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { getLocalStorageMock } from 'app/testing/local-storage-mock';
import {
  StaticConfigurationServiceStub,
  StaticConfigurationServiceStubModule,
} from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { of, throwError } from 'rxjs';
import { FeatureFlagsService } from './feature-flags.service';
import { AzureFeatureFlags, FeatureFlags } from './feature-flags.types';

const featureFlagsBaseUrl = 'https://feature-flags-api-url.com/';
const featureflagsApiUrl = 'api/featureflags/v1/flags';

const enabledFeature: AzureFeatureFlags = {
  id: 'demo-feature',
  enabled: true,
  displayName: 'Demo feature',
  description: 'Demo feature',
  conditions: {
    clientFilters: [],
  },
};
const disableFeature: AzureFeatureFlags = {
  id: 'main-feature',
  enabled: false,
  displayName: 'Main feature',
  description: 'Main feature',
  conditions: {
    clientFilters: [],
  },
};

describe(FeatureFlagsService.name, () => {
  let sut: FeatureFlagsService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let router: Router;
  let ngZone: NgZone;
  const localStorage = window.localStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, StaticConfigurationServiceStubModule],
      providers: [
        {
          provide: HttpClient,
          useValue: jasmine.createSpyObj<HttpClient>({ get: undefined, put: undefined, post: undefined }),
        },
        FeatureFlagsService,
      ],
    });

    httpClientSpy = TestBedInjectSpy(HttpClient);
    router = TestBed.inject(Router);
    ngZone = TestBed.inject(NgZone);
    httpClientSpy.get.and.returnValue(of([enabledFeature, disableFeature]));
    sut = TestBed.inject(FeatureFlagsService);

    Object.defineProperty(window, 'localStorage', {
      value: getLocalStorageMock(),
    });
  });

  afterEach(async () => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorage,
    });
  });

  describe('feature flags', () => {
    it('should return true if feature is enabled', async () => {
      await sut.init('https://test.url');
      const result = sut.isFeatureEnabled('demo-feature');

      // Assert
      expect(result).toBeTrue();
      expect(httpClientSpy.get.calls.mostRecent().args[0]).toBe(
        `${featureFlagsBaseUrl}${featureflagsApiUrl}?key=pages&labelfilter=production`,
      );
    });

    it('should use fall back feature flag list if fails to fetch from api', fakeAsync(() => {
      // Arrange
      httpClientSpy.get.and.returnValue(throwError(() => 'Error'));

      // Act
      sut = new FeatureFlagsService(httpClientSpy, StaticConfigurationServiceStub as any);
      tick();

      const result = sut.isFeatureEnabled('pages_gainsight');

      // Assert
      expect(result).toBeFalse();
      flush();
    }));

    it('should return false if feature is disable', () => {
      const result = sut.isFeatureEnabled('main-feature');

      // Assert
      expect(result).toBeFalse();
    });

    it('should return false if feature is not in the feature flags list', () => {
      const result = sut.isFeatureEnabled('non-exist-entry');

      // Assert
      expect(result).toBeFalse();
    });

    it('should not override feature toggle through local storage when dev mode not enabled', () => {
      window.localStorage.setItem('main-feature', 'true');

      // Act
      sut = new FeatureFlagsService(httpClientSpy, StaticConfigurationServiceStub as any);
      const result = sut.isFeatureEnabled('main-feature');

      // Assert
      expect(result).toBeFalse();
    });

    it('should return list of feature flags through through api', fakeAsync(async () => {
      const expectedFetureFlags: FeatureFlags[] = [
        { name: 'demo-feature', enabled: true },
        { name: 'main-feature', enabled: false },
      ];

      // Act
      await sut.init('https://test.url');
      const result = sut.featureFlagsList;

      // Assert
      expect(result).toEqual(expectedFetureFlags);
      expect(httpClientSpy.get.calls.mostRecent().args[0]).toBe(
        `${featureFlagsBaseUrl}${featureflagsApiUrl}?key=pages&labelfilter=production`,
      );
      flush();
    }));

    describe('override feature toggle', () => {
      it('should override feature toggle through local storage when dev mode enable', async () => {
        // Arrange
        httpClientSpy.get.and.returnValue(of([enabledFeature, disableFeature]));

        sut = new FeatureFlagsService(httpClientSpy, StaticConfigurationServiceStub as any);
        window.localStorage.setItem('main-feature', 'true');
        await sut.init('https://test.url?sc_dev=1');

        // Act
        const result = sut.isFeatureEnabled('main-feature');
        window.localStorage.clear();

        // Assert
        expect(result).toBeTrue();
      });
    });

    it('should not make another api call if feature flags are loaded from construtor', async () => {
      // Act
      await sut.init('https://test.url');

      // Assert
      expect(httpClientSpy.get).toHaveBeenCalledTimes(1);
    });
  });
});
