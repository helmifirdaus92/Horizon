/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import { FeatureFlagsChannelDef } from '../messaging/horizon-canvas.contract.defs';
import {
  FeatureFlags,
  FeatureFlagsCanvasEvents,
  FeatureFlagsCanvasRpcServices,
  FeatureFlagsHorizonEvents,
  FeatureFlagsHorizonRpcServices,
} from '../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../messaging/messaging-service';
import { FeatureFlagsService } from './feature-flags.service';

describe(FeatureFlagsService.name, () => {
  let sut: FeatureFlagsService;

  let getFeatureFlagsSpy: jasmine.Spy;
  let messaging: TestMessagingP2PChannel<
    FeatureFlagsHorizonEvents,
    FeatureFlagsCanvasEvents,
    FeatureFlagsHorizonRpcServices,
    FeatureFlagsCanvasRpcServices
  >;

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

  beforeEach(() => {
    getFeatureFlagsSpy = jasmine.createSpy('getFeatureFlagsSpy');
    getFeatureFlagsSpy.and.callFake(async () => featureFlagsList);
    messaging = makeTestMessagingP2PChannelFromDef(FeatureFlagsChannelDef, {
      getFeatureFlags: getFeatureFlagsSpy,
    });

    sut = new FeatureFlagsService({ featureFlagsMessagingChannel: messaging } as unknown as MessagingService);
  });

  describe('init', () => {
    it('should fetch feature flags list', async () => {
      await sut.init();

      expect(getFeatureFlagsSpy).toHaveBeenCalled();
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return true when feature is enabled', async () => {
      await sut.init();

      expect(FeatureFlagsService.isFeatureEnabled('feature1')).toBeTrue();
    });

    it('should return false when feature is disabled', async () => {
      await sut.init();

      expect(FeatureFlagsService.isFeatureEnabled('feature2')).toBeFalse();
    });

    it('should return false when feature name is not in the feature flag list', async () => {
      await sut.init();

      expect(FeatureFlagsService.isFeatureEnabled('feature2')).toBeFalse();
    });
  });
});
