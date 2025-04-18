/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { BehaviorSubject } from 'rxjs';
import { EnvironmentFeatureFlagsService } from './environment-feature-flag.service';
import { FeatureFlags } from './feature-flags.types';

describe('EnvironmentFeatureFlagsService', () => {
  let service: EnvironmentFeatureFlagsService;
  let testConfiguration$: BehaviorSubject<any>;
  let configurationServiceSpy: jasmine.SpyObj<ConfigurationService>;

  beforeEach(() => {
    testConfiguration$ = new BehaviorSubject({ environmentFeatures: [] });
    const spy = jasmine.createSpyObj('ConfigurationService', [], { configuration$: testConfiguration$ });
    spy.configuration$ = testConfiguration$.asObservable();

    TestBed.configureTestingModule({
      // Provide both the service-to-test and its (spy) dependency
      providers: [EnvironmentFeatureFlagsService, { provide: ConfigurationService, useValue: spy }],
    });
    // Inject both the service-to-test and its (spy) dependency
    service = TestBed.inject(EnvironmentFeatureFlagsService);
    configurationServiceSpy = TestBed.inject(ConfigurationService) as jasmine.SpyObj<ConfigurationService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return true if feature is enabled', async () => {
    const testFeatures: FeatureFlags[] = [
      { name: 'feature1', enabled: true },
      { name: 'feature2', enabled: false },
    ];
    testConfiguration$.next({ environmentFeatures: testFeatures });

    const featureEnabled = await service.isFeatureEnabled('feature1');
    expect(featureEnabled).toBeTrue();
  });

  it('should return false if feature is disabled', async () => {
    const testFeatures: FeatureFlags[] = [
      { name: 'feature1', enabled: false },
      { name: 'feature2', enabled: true },
    ];
    testConfiguration$.next({ environmentFeatures: testFeatures });

    const featureEnabled = await service.isFeatureEnabled('feature1');
    expect(featureEnabled).toBeFalse();
  });

  it('should return false if feature does not exist', async () => {
    const testFeatures: FeatureFlags[] = [
      { name: 'feature1', enabled: true },
      { name: 'feature2', enabled: true },
    ];
    testConfiguration$.next({ environmentFeatures: testFeatures });

    const featureEnabled = await service.isFeatureEnabled('feature3');
    expect(featureEnabled).toBeFalse();
  });

  it('getFeatureFlags should return the list of feature flags from ConfigurationService', async () => {
    const testFeatures: FeatureFlags[] = [
      { name: 'feature1', enabled: true },
      { name: 'feature2', enabled: false },
    ];
    testConfiguration$.next({ environmentFeatures: testFeatures });

    const features = await service.getFeatureFlags();
    expect(features).toEqual(testFeatures);
  });
});
