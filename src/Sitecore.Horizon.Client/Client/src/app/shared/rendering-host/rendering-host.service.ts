/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { RenderingHostFeaturesService } from './rendering-host-features.service';

@Injectable({ providedIn: 'root' })
export class RenderingHostService {
  constructor(
    private readonly featureFlagService: FeatureFlagsService,
    private readonly rhFeatureFlagService: RenderingHostFeaturesService,
  ) {}

  async isDirectIntegrationEnabled(): Promise<boolean> {
    return (
      this.featureFlagService.isFeatureEnabled('pages_rendering-host-flip') &&
      (await this.rhFeatureFlagService.isFeatureEnabled('rh_use-shallow-chromes'))
    );
  }

  async isShallowChromeMetadataEnabled(): Promise<boolean> {
    return (
      this.featureFlagService.isFeatureEnabled('pages_shallow-chromes') &&
      (await this.rhFeatureFlagService.isFeatureEnabled('rh_use-shallow-chromes'))
    );
  }

  async isAngularRenderingHost(): Promise<boolean> {
    return await this.rhFeatureFlagService.isFeatureEnabled('rh_angular_rendering-host');
  }

  async isReactRenderingHost(): Promise<boolean> {
    return await this.rhFeatureFlagService.isFeatureEnabled('rh_react_rendering-host');
  }
}
