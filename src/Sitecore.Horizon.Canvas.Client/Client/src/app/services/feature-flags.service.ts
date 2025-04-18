/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { FeatureFlags } from '../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../messaging/messaging-service';

export class FeatureFlagsService {
  private static featureFlagsList?: FeatureFlags[];

  constructor(private readonly messaging: MessagingService) {}

  static isFeatureEnabled(feature: string): boolean {
    return this.featureFlagsList?.some((flag) => flag.name.toLowerCase() === feature.toLowerCase() && flag.enabled) ?? false;
  }

  async init() {
    FeatureFlagsService.featureFlagsList = await this.messaging.featureFlagsMessagingChannel.rpc.getFeatureFlags();
  }
}
