/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { firstValueFrom, map } from 'rxjs';
import { FeatureFlags } from './feature-flags.types';

@Injectable({ providedIn: 'root' })
export class EnvironmentFeatureFlagsService {
  constructor(private readonly configurationService: ConfigurationService) {}

  async isFeatureEnabled(featureName: string): Promise<boolean> {
    const features = await this.getFeatureFlags();
    return features.some((feature) => feature.name === featureName && feature.enabled);
  }

  async getFeatureFlags(): Promise<FeatureFlags[]> {
    return firstValueFrom(this.configurationService.configuration$.pipe(map((config) => config.environmentFeatures)));
  }
}
