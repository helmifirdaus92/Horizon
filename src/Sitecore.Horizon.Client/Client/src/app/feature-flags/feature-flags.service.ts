/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StaticConfigurationService } from 'app/shared/configuration/static-configuration.service';
import { makeAbsoluteUrl } from 'app/shared/utils/url.utils';
import { environment } from 'environments/environment';
import { firstValueFrom } from 'rxjs';
import { AzureFeatureFlags, fallbackFeatureFlags, FeatureFlags } from './feature-flags.types';

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private _featureFlags: FeatureFlags[] = [];
  private _currentUrl = '';

  constructor(
    private readonly httpClient: HttpClient,
    private readonly staticConfigurationService: StaticConfigurationService,
  ) {}

  async init(url: string): Promise<void> {
    this._currentUrl = url;
    this._featureFlags = await this.fetchFeatureFlagsList();
  }

  isFeatureEnabled(feature: string): boolean {
    return this._featureFlags.some((flag) => flag.name.toLowerCase() === feature.toLowerCase() && flag.enabled);
  }

  isAngularRenderinghostFormsSupported(): boolean {
    return this.isFeatureEnabled('pages_angular-renderinghost-forms') && this.isConnectedMode();
  }

  isXmAppsSitesApiEnabledAndSupported(): boolean {
    return this.isFeatureEnabled('pages_use-xmapps-sites-api') && this.isConnectedMode();
  }

  isXmAppsLhsTreeApiEnabledAndSupported(): boolean {
    return this.isFeatureEnabled('pages_use-xmapps-api-for-lhs-tree') && this.isConnectedMode();
  }

  isXmAppsRestApiEnabledAndSupported(): boolean {
    return this.isFeatureEnabled('pages_use-xmapps-rest-api') && this.isConnectedMode();
  }

  get featureFlagsList(): FeatureFlags[] {
    return this._featureFlags;
  }

  private async fetchFeatureFlagsList() {
    const featureFlagsEndPoint = makeAbsoluteUrl(
      'api/featureflags/v1/flags',
      this.staticConfigurationService.featureFlagsBaseUrl,
    );
    const requestUrl = `${featureFlagsEndPoint}?key=pages&labelfilter=${this.staticConfigurationService.environment}`;

    const response = await firstValueFrom(this.httpClient.get<AzureFeatureFlags[]>(requestUrl)).catch(
      () => fallbackFeatureFlags,
    );
    let flags = response.map((f) => ({
      name: f.id,
      enabled: f.enabled,
    }));

    if (this.isDevEnabled()) {
      flags = this.overrideDevEnabledValues(flags);
    }

    return flags;
  }

  private isDevEnabled() {
    return new URL(this._currentUrl).search.includes('sc_dev=1');
  }

  overrideDevEnabledValues(flags: FeatureFlags[]) {
    for (let i = 0; i < window.localStorage.length; i++) {
      const storageKey = window.localStorage.key(i);
      if (
        storageKey &&
        flags.some((featureFlagKey) => featureFlagKey.name.toLowerCase() === storageKey.toLowerCase())
      ) {
        const devFeatureFlagValue = window.localStorage.getItem(storageKey) ?? '';
        flags.map((featureFlag) => {
          if (featureFlag.name === storageKey) {
            featureFlag.enabled = devFeatureFlagValue === 'true' || devFeatureFlagValue === '1';
          }
        });
      }
    }
    return flags;
  }

  private isConnectedMode(): boolean {
    // Remove trailing slash to support URLs with or without trailing slash
    // Append /sitecore to XM cloud URL
    const localXmCloudUrl = environment.localXmCloudUrl
      ? environment.localXmCloudUrl.replace(/\/$/, '') + '/sitecore'
      : environment.localXmCloudUrl;

    return environment.inventoryConnectedMode && !localXmCloudUrl;
  }
}
