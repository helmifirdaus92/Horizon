/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';

import { SitecoreUser, TokenCustomClaimKeysEnum } from 'app/authentication/library/types';
import { FeatureFlagsModule } from 'app/feature-flags/feature-flags.module';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { GainsightService, GAINSIGHT_SCRIPT_ID } from './gainsight.service';

describe(GainsightService.name, () => {
  let sut: GainsightService;
  let featureFlagsServiceSpy: jasmine.SpyObj<FeatureFlagsService>;

  const aptrinsicSpy = jasmine.createSpy('aptrinsic');
  const user: Partial<SitecoreUser> = {
    email: 'user@email.com',
    given_name: 'given_name',
    family_name: 'family_name',
    lastLogin: Date.now,
    signUpDate: Date.now,
    [TokenCustomClaimKeysEnum.ORG_ID]: 'ORG_ID',
    [TokenCustomClaimKeysEnum.ORG_DISPLAY_NAME]: 'ORG_DISPLAY_NAME',
    [TokenCustomClaimKeysEnum.ORG_TYPE]: 'ORG_TYPE',
    [TokenCustomClaimKeysEnum.ROLES]: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StaticConfigurationServiceStubModule, FeatureFlagsModule],
      providers: [
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>(['isFeatureEnabled']),
        },
        GainsightService,
      ],
    });

    featureFlagsServiceSpy = TestBedInjectSpy(FeatureFlagsService);
    featureFlagsServiceSpy.isFeatureEnabled.and.returnValue(true);

    (window as any).aptrinsic = aptrinsicSpy;
    sut = TestBed.inject(GainsightService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should inject the gainsight script', () => {
    sut.init(user as SitecoreUser);
    const script = document.getElementById(GAINSIGHT_SCRIPT_ID);

    expect(script?.textContent).toContain('https://web-sdk-eu.aptrinsic.com/api/aptrinsic.js');
  });

  it('should set gainsight identify fields', () => {
    (window as any).identifyInitialized = false;

    sut.init(user as SitecoreUser);

    const expectedUserFields = {
      id: user.email,
      email: user.email,
      lastLogin: new Date(user.lastLogin).valueOf(),
      signUpDate: new Date(user.created).valueOf(),
    };
    const expectedAccountFields = { id: user[TokenCustomClaimKeysEnum.ORG_ACC_ID] };

    expect(aptrinsicSpy).toHaveBeenCalledWith('identify', expectedUserFields, expectedAccountFields);
    expect((window as any).identifyInitialized).toBe(true);
  });

  it('should set gainsight global context', () => {
    sut.init(user as SitecoreUser);

    const expectedGlobalContext = {
      OrganizationID: user[TokenCustomClaimKeysEnum.ORG_ID],
      'Organization DisplayName': user[TokenCustomClaimKeysEnum.ORG_DISPLAY_NAME],
      'Organization Role': '',
      'Organization Type': user[TokenCustomClaimKeysEnum.ORG_TYPE] ?? '',
      'App Hostname': window.location.hostname,
    };

    expect(aptrinsicSpy).toHaveBeenCalledWith('set', 'globalContext', expectedGlobalContext);
  });

  it('should not init gainsight when the feature is disabled', () => {
    featureFlagsServiceSpy.isFeatureEnabled.and.returnValue(false);
    sut.init(user as SitecoreUser);
    const script = document.getElementById(GAINSIGHT_SCRIPT_ID);

    expect(script).toBeFalsy();
    expect((window as any).identifyInitialized).toBe(false);
  });
});
