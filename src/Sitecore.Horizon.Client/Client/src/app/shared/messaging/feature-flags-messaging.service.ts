/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { EnvironmentFeatureFlagsService } from 'app/feature-flags/environment-feature-flag.service';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { RenderingHostFeaturesService } from '../rendering-host/rendering-host-features.service';
import { MessagingService } from './messaging.service';

@Injectable({
  providedIn: 'root',
})
export class FeatureFlagsMessagingService {
  constructor(
    private readonly messagingService: MessagingService,
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly environmentFeatureFlagsService: EnvironmentFeatureFlagsService,
    private readonly renderingHostFeaturesService: RenderingHostFeaturesService,
  ) {}

  async init() {
    const channel = this.messagingService.getFeatureFlagsChannel();

    channel.setRpcServicesImpl({
      getFeatureFlags: async () => [
        ...this.featureFlagsService.featureFlagsList,
        ...(await this.environmentFeatureFlagsService.getFeatureFlags()),
        ...(await this.renderingHostFeaturesService.getFeatureFlags()),
      ],
    });
  }
}
