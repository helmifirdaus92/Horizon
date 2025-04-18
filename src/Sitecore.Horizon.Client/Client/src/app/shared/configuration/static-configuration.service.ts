/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { ConfigurationService } from './configuration.service';

export type StaticConfigurationErrorType = 'noOrganization' | 'noTenant' | '';

export interface Auth0 {
  domain: string;
  clientId: string;
  audience: string;
}

interface GenAiApiUrls {
  baseUrl: string;
}

export interface HostConfig {
  authority: string;
  dashboardBaseUrl: string;
  portalBaseUrl: string;
  formsApiBaseUrl: string;
  edgePlatformBaseUrl: string;
  inventoryApiBaseUrl: string;
  xmCloudSystemId: string;
  featureFlagsBaseUrl: string;
  environment: string;
  auth0Settings: Auth0;
  xmDeployAppApiBaseUrl: string;
  xmDeployAppBaseUrl: string;
  xmAppsApiBaseUrl: string;
  explorerAppBaseUrl: string;
  apmServerBaseUrl: string;
  gainsightProductKey: string;
  genAiApiUrls: GenAiApiUrls;
  analyticsBaseUrl: string;
  analyticsRegionsMapper: string;
  brandManagementBaseUrl: string;
}

@Injectable({ providedIn: 'root' })
export class StaticConfigurationService {
  private _dashboardAppBaseUrl!: string;
  get dashboardAppBaseUrl(): string {
    return this._dashboardAppBaseUrl;
  }

  private _portalBaseUrl!: string;
  get portalBaseUrl(): string {
    return this._portalBaseUrl;
  }

  private _formsApiBaseUrl!: string;
  get formsApiBaseUrl(): string {
    return this._formsApiBaseUrl?.replace('{region}', ConfigurationService.xmCloudTenant?.regionCode || '');
  }

  private _inventoryApiBaseUrl!: string;
  get inventoryApiBaseUrl(): string {
    return this._inventoryApiBaseUrl;
  }

  private _edgePlatformBaseUrl!: string;
  get edgePlatformBaseUrl(): string {
    return this._edgePlatformBaseUrl;
  }

  private _xMCloudSystemId!: string;
  get xMCloudSystemId(): string {
    return this._xMCloudSystemId;
  }

  private _featureFlagsBaseUrl!: string;
  get featureFlagsBaseUrl(): string {
    return this._featureFlagsBaseUrl;
  }

  private _xMDeployAppApiBaseUrl!: string;
  get xMDeployAppApiBaseUrl(): string {
    return this._xMDeployAppApiBaseUrl;
  }

  private _xMDeployAppBaseUrl!: string;
  get xMDeployAppBaseUrl(): string {
    return this._xMDeployAppBaseUrl;
  }

  private _xMAppsApiBaseUrl!: string;
  get xMAppsApiBaseUrl(): string {
    return this._xMAppsApiBaseUrl;
  }

  private _explorerAppBaseUrl!: string;
  get explorerAppBaseUrl(): string {
    return this._explorerAppBaseUrl;
  }

  private _apmServerBaseUrl!: string;
  get apmServerBaseUrl(): string {
    return this._apmServerBaseUrl;
  }

  private _environment!: string;
  get environment(): string {
    return this._environment;
  }

  private _auth0Settings!: Auth0;
  get auth0Settings(): Auth0 {
    return this._auth0Settings;
  }

  private _genAiApiUrls!: GenAiApiUrls;
  get genAiApiUrls(): GenAiApiUrls {
    return this._genAiApiUrls;
  }

  private _gainsightProductKey!: string;
  get gainsightProductKey(): string {
    return this._gainsightProductKey;
  }

  private _analyticsRegionsMapper!: { [key: string]: string };
  get analyticsRegionsMapper(): { [key: string]: string } {
    return this._analyticsRegionsMapper;
  }

  private _analyticsBaseUrl!: string;
  get analyticsBaseUrl(): string {
    const regionKey =
      this._analyticsRegionsMapper[ConfigurationService.xmCloudTenant?.regionCode || 'Default'] ??
      this._analyticsRegionsMapper.Default;

    return this._analyticsBaseUrl?.replace('{region}', regionKey);
  }

  private _brandManagementBaseUrl!: string;
  get brandManagementBaseUrl(): string {
    return this._brandManagementBaseUrl?.replace('{region}', ConfigurationService.streamTenant?.regionCode || '');
  }

  get isStagingEnvironment(): boolean {
    return this._environment === 'staging';
  }

  get genAiApiBaseUrl(): string {
    return this._genAiApiUrls?.baseUrl?.replace('{region}', ConfigurationService.streamTenant?.regionCode || '');
  }

  constructor() {
    const hostConfigElement = document.getElementById('horizon-host-config');
    if (!hostConfigElement) {
      throw Error('Host config is missing in markup. App is broken.');
    }

    const config = JSON.parse(hostConfigElement.innerHTML) as HostConfig;
    this._dashboardAppBaseUrl = config.dashboardBaseUrl;
    this._portalBaseUrl = config.portalBaseUrl;
    this._formsApiBaseUrl = config.formsApiBaseUrl;
    this._edgePlatformBaseUrl = config.edgePlatformBaseUrl;
    this._inventoryApiBaseUrl = config.inventoryApiBaseUrl;
    this._xMCloudSystemId = config.xmCloudSystemId;
    this._featureFlagsBaseUrl = config.featureFlagsBaseUrl;
    this._xMDeployAppApiBaseUrl = config.xmDeployAppApiBaseUrl;
    this._xMDeployAppBaseUrl = config.xmDeployAppBaseUrl;
    this._xMAppsApiBaseUrl = config.xmAppsApiBaseUrl;
    this._explorerAppBaseUrl = config.explorerAppBaseUrl;
    this._apmServerBaseUrl = config.apmServerBaseUrl;
    this._environment = config.environment;
    this._gainsightProductKey = config.gainsightProductKey;
    this._genAiApiUrls = config.genAiApiUrls;
    this._analyticsBaseUrl = config.analyticsBaseUrl;
    this._analyticsRegionsMapper = this.parseAnalyticsRegions(config.analyticsRegionsMapper);
    this._brandManagementBaseUrl = config.brandManagementBaseUrl;
    if (!config.auth0Settings) {
      throw Error('Auth config is missing in markup. App is broken.');
    }
    this._auth0Settings = config.auth0Settings;
  }

  private parseAnalyticsRegions(analyticsPerformanceRegions: string): Record<string, string> {
    if (!analyticsPerformanceRegions?.trim()) {
      return {};
    }

    return analyticsPerformanceRegions
      .split(';')
      .map((region) => region.split('=').map((item) => item.trim()))
      .filter(([key, value]) => key && value)
      .reduce<Record<string, string>>((result, [key, value]) => {
        result[key] = value;
        return result;
      }, {});
  }
}
