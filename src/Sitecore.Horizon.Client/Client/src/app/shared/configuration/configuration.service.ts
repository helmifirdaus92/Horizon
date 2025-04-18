/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  CdpTenantInfo,
  StreamTenantInfo,
  Tenant,
  XmCloudTenantInfo,
} from 'app/authentication/library/tenant/tenant.types';
import { Observable, ReplaySubject, firstValueFrom } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';
import { Version } from '../utils/version.utils';
import { ConfigurationDalService } from './configuration.dal.service';

export interface Configuration {
  hostVerificationToken: string;
  contentRootItemId: string;
  clientLanguage: string;
  sessionTimeoutSeconds: number;
  integrationVersion: string;
  jssEditingSecret: string;
  personalizeScope: string | undefined;
  globalTagsRepository: string | undefined;
  environmentFeatures: Array<{
    name: string;
    enabled: boolean;
  }>;
}

@Injectable({ providedIn: 'root' })
export class ConfigurationService {
  static organization: string | null = null;
  static tenantName: string | null = null;
  static tenantId: string | null = null;
  static xmCloudTenant: XmCloudTenantInfo | null = null;
  static cdpTenant: CdpTenantInfo | null = null;
  static streamTenant: StreamTenantInfo | null = null;
  static tenants: Tenant[] | null = null;

  private readonly _configuration$ = new ReplaySubject<Configuration>(1);
  readonly configuration$: Observable<Configuration> = this._configuration$.asObservable();

  private _contentRootItemId!: string;
  get contentRootItemId(): string {
    if (!this._contentRootItemId) {
      throw new Error('Trying to access content Root Item before it was initialized');
    }
    return this._contentRootItemId;
  }

  private _clientLanguage!: string;
  get clientLanguage(): string {
    if (!this._clientLanguage) {
      throw new Error('Trying to access content client locale before it was initialized');
    }
    return this._clientLanguage;
  }

  private _xmCloudSessionTimeout!: number;
  get xmCloudSessionTimeout(): number {
    if (!this._xmCloudSessionTimeout) {
      throw new Error('Trying to access xmCloudSessionTimeout before it was initialized');
    }
    return this._xmCloudSessionTimeout;
  }

  private _integrationVersion!: string;
  get integrationVersion(): string {
    if (!this._integrationVersion) {
      throw new Error('Trying to access integrationVersion before it was initialized');
    }
    return this._integrationVersion;
  }

  private _jssEditingSecret!: string;
  get jssEditingSecret(): string {
    return this._jssEditingSecret;
  }

  private _globalTagsRepository: string | undefined;
  get globalTagsRepository(): string | undefined {
    return this._globalTagsRepository;
  }

  constructor(
    private readonly configurationDalService: ConfigurationDalService,
    private readonly router: Router,
  ) {}

  async init(): Promise<void> {
    let configuration: Configuration | null = await firstValueFrom(
      this.configurationDalService.fetchConfiguration().pipe(
        first(),
        tap((config) => {
          this._contentRootItemId = config.contentRootItemId;
          this._clientLanguage = config.clientLanguage;
          this._integrationVersion = config.integrationVersion;
          this._jssEditingSecret = config.jssEditingSecret;
          this._xmCloudSessionTimeout = config.sessionTimeoutSeconds;
        }),
        map((val) => ({ ...val, primaryPlatformUrl: ConfigurationService.xmCloudTenant?.url })),
      ),
    ).catch(() => null);

    if (configuration === null) {
      this.router.navigateByUrl('/error/no-organization');

      return;
    }

    if (this.isTenantSettingsAvailable()) {
      const tenantConfiguration = await firstValueFrom(this.configurationDalService.fetchTenantConfiguration());
      configuration = { ...configuration, ...tenantConfiguration };
    } else {
      configuration.environmentFeatures = [];
    }
    if (this.isGlobalTagsQuerySupported()) {
      const globalTagsRepository = await firstValueFrom(this.configurationDalService.fetchGlobalTagsConfiguration());
      this._globalTagsRepository = globalTagsRepository;
      configuration = { ...configuration, globalTagsRepository };
    }
    this._configuration$.next(configuration);
  }

  static isStreamPaidEdition(): boolean {
    return (
      !!ConfigurationService.streamTenant && ConfigurationService.streamTenant.aiEdition?.toLocaleLowerCase() !== 'free'
    );
  }

  isParametersPersonalizationEnabled() {
    return this.isEqualOrGreaterThan('8.1.55');
  }

  isDeleteItemContextFieldsAvailable() {
    return this.isEqualOrGreaterThan('8.1.136');
  }

  isTenantSettingsAvailable() {
    return this.isEqualOrGreaterThan('8.1.224');
  }

  isSiteParameterSupportedForSetLayoutType() {
    return this.isEqualOrGreaterThan('8.1.236');
  }

  isRenderingDefinitionIncludesBranchTemplate() {
    return this.isEqualOrGreaterThan('8.1.249');
  }

  isMediaQuerySupportsBaseTemplates() {
    return this.isEqualOrGreaterThan('8.1.615');
  }

  isGlobalTagsQuerySupported() {
    return this.isEqualOrGreaterThan('8.1.658');
  }

  private isEqualOrGreaterThan(featureVersionNumber: string): boolean {
    const version = new Version(this.integrationVersion);
    const featureVersion = new Version(featureVersionNumber);
    return version.isEqualOrGreaterThan(featureVersion);
  }
}
