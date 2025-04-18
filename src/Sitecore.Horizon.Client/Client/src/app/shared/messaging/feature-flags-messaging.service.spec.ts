/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { EnvironmentFeatureFlagsService } from 'app/feature-flags/environment-feature-flag.service';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { FeatureFlags } from 'app/feature-flags/feature-flags.types';
import { RenderingHostFeaturesService } from '../rendering-host/rendering-host-features.service';
import { FeatureFlagsMessagingService } from './feature-flags-messaging.service';
import { MessagingService } from './messaging.service';

describe(FeatureFlagsMessagingService.name, () => {
  let sut: FeatureFlagsMessagingService;
  let messagingService: jasmine.SpyObj<MessagingService>;

  let setRpcServicesImplSpy: jasmine.Spy;

  let featureFlagsService: jasmine.SpyObj<FeatureFlagsService>;
  let environmentFeatureFlagsService: jasmine.SpyObj<EnvironmentFeatureFlagsService>;
  let renderingHostFeaturesService: jasmine.SpyObj<RenderingHostFeaturesService>;

  const featureFlagsList: FeatureFlags[] = [
    {
      name: 'feature1',
      enabled: true,
    },
    {
      name: 'feature2',
      enabled: false,
    },
  ];

  const envvironmentFlagList: FeatureFlags[] = [
    {
      name: 'environemntFeature1',
      enabled: true,
    },
    {
      name: 'environemntFeature2',
      enabled: false,
    },
  ];

  const rhFlagList: FeatureFlags[] = [
    {
      name: 'rhf1',
      enabled: true,
    },
    {
      name: 'rhf2',
      enabled: false,
    },
  ];

  beforeEach(() => {
    featureFlagsService = jasmine.createSpyObj<FeatureFlagsService>(
      {
        featureFlagsList: undefined,
      },
      { featureFlagsList },
    );

    environmentFeatureFlagsService = jasmine.createSpyObj<EnvironmentFeatureFlagsService>(['getFeatureFlags']);
    environmentFeatureFlagsService.getFeatureFlags.and.returnValue(Promise.resolve(envvironmentFlagList));

    renderingHostFeaturesService = jasmine.createSpyObj<RenderingHostFeaturesService>(['getFeatureFlags']);
    renderingHostFeaturesService.getFeatureFlags.and.returnValue(Promise.resolve(rhFlagList));

    setRpcServicesImplSpy = jasmine.createSpy();
    messagingService = jasmine.createSpyObj<MessagingService>(['getFeatureFlagsChannel']);

    messagingService.getFeatureFlagsChannel.and.callFake((() => {
      return { setRpcServicesImpl: setRpcServicesImplSpy };
    }) as any);

    sut = new FeatureFlagsMessagingService(
      messagingService,
      featureFlagsService,
      environmentFeatureFlagsService,
      renderingHostFeaturesService,
    );
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('init', () => {
    it('should set implementation for getFeatureFlags method', async () => {
      await sut.init();

      const [implementation] = setRpcServicesImplSpy.calls.mostRecent().args;
      expect(await implementation.getFeatureFlags()).toEqual([...featureFlagsList, ...envvironmentFlagList, ...rhFlagList]);
    });
  });
});
