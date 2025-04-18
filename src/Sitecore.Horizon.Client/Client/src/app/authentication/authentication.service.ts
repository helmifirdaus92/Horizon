/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { StaticConfigurationService } from 'app/shared/configuration/static-configuration.service';

import { TranslateService } from '@ngx-translate/core';
import { ApmAuthRedirectReporterService } from 'app/apm/apm-auth-redirect-reporter.service';
import { ErrorPageService } from 'app/error-page/error-page.service';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { environment } from 'environments/environment';
import { firstValueFrom } from 'rxjs';
import { getCDPTenantMock, getStreamTenantMock, getXMCloutTenantMock } from './disconnected-mode.mock';
import { AuthenticationLibService as AuthLibService } from './library/authentication-lib';
import { Tenant } from './library/tenant/tenant.types';
import {
  parseCdpCloudTenantAnnotations,
  parseStreamTenant,
  parseXmCloudTenantAnnotations,
} from './library/tenant/tenant.utils';
import { AuthErrorType, IdentityParams, SitecoreUser } from './library/types';

export const HORIZON_GQL_ENDPOINT_PATH = '/api/ssc/horizon/query/?sc_horizon=api&sc_headless_mode=api';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  authProvider!: AuthLibService;
  returnUrl = '';
  private errors: AuthErrorType[] = [];
  private xmCloudTenant: Tenant | null = null;
  private cdpTenant: Tenant | null = null;
  private streamTenant: Tenant | null = null;
  private tenants: Tenant[] | null = null;

  // Use factory in order to make these variables calculated dynamically at the moment of calling.
  // This makes calculations more predictable in complex scenarios.
  private inventoryConnectedMode = () => environment.inventoryConnectedMode;

  private localXmCloudUrl = () => {
    // Remove trailing slash to support Urls with or without trailing slash
    // Append /sitecore to XM cloud Url
    return environment.localXmCloudUrl
      ? environment.localXmCloudUrl.replace(/\/$/, '') + '/sitecore'
      : environment.localXmCloudUrl;
  };

  private isConnectedMode = () => this.inventoryConnectedMode() && !this.localXmCloudUrl();

  constructor(
    private readonly staticConfigurationService: StaticConfigurationService,
    private readonly errorPageService: ErrorPageService,
    private readonly router: Router,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly translateService: TranslateService,
    private readonly apmAuthRedirectReporterService: ApmAuthRedirectReporterService,
  ) {}

  async authenticate(): Promise<{ returnUrl: string; user?: SitecoreUser }> {
    this.setupAuthLibrary(
      this.isConnectedMode(),
      this.staticConfigurationService.auth0Settings.domain,
      this.staticConfigurationService.auth0Settings.clientId,
      this.staticConfigurationService.auth0Settings.audience,
      this.staticConfigurationService.inventoryApiBaseUrl,
      this.staticConfigurationService.xMCloudSystemId,
    );

    const _returnUrl = new URL(window.location.href).toString();

    const result = await this.authProvider.authenticate(_returnUrl);

    this.returnUrl = result.returnUrl || _returnUrl;
    this.errors = result.errors;

    return { returnUrl: this.returnUrl, user: result.user };
  }

  async resolveTenant(): Promise<void> {
    if (this.errors.length) {
      console.warn('Authentication process returned errors, tenant resolution is skipped');
      return;
    }

    const result = await this.authProvider.resolveTenant();
    this.xmCloudTenant = result.xmCloudTenant;
    this.tenants = result.tenants;
    this.cdpTenant = result.cdpTenant;
    this.streamTenant = result.streamTenant;
    this.errors.push(...result.errors);

    if (this.isConnectedMode()) {
      this.readAuthenticationParametersConnectedMode();
    } else if (!this.localXmCloudUrl()) {
      this.readAuthenticationParametersDisconnectedMode();
    } else {
      this.readAuthenticationParametersLocalXmCloudMode();
    }
  }

  async getBearerToken(): Promise<string> {
    const token = await this.authProvider.getToken();

    if (!token) {
      this.promptUserToReloadPage();

      // stop application - wait for the user to reload page
      const neverResolvingPromise = new Promise(() => {});
      await neverResolvingPromise;
    }

    return token;
  }

  async isSessionActive(): Promise<boolean> {
    return this.authProvider.getToken('cache-only').then((token) => !!token);
  }

  changeAuthParams(params: IdentityParams) {
    this.authProvider.changeAuthParams(params);
  }

  async logout() {
    await this.authProvider.logout();
  }

  setupAuthLibrary(
    inventoryConnectedMode: boolean,
    domain: string,
    clientId: string,
    audience: string,
    inventoryApiBaseUrl: string,
    xMCloudSystemId: string,
  ) {
    this.authProvider = new AuthLibService(
      inventoryConnectedMode ? 'organizationAndTenant' : 'organizationOnly',
      domain,
      clientId,
      audience,
      xMCloudSystemId,
      document.location.origin + '?',
      inventoryApiBaseUrl,
      this.apmAuthRedirectReporterService,
    );
  }

  private async readAuthenticationParametersConnectedMode() {
    ConfigurationService.xmCloudTenant = parseXmCloudTenantAnnotations(this.xmCloudTenant, HORIZON_GQL_ENDPOINT_PATH);
    ConfigurationService.cdpTenant = parseCdpCloudTenantAnnotations(this.cdpTenant);
    ConfigurationService.streamTenant = parseStreamTenant(this.streamTenant);
    ConfigurationService.organization = this.xmCloudTenant?.organizationId ?? null;
    ConfigurationService.tenantId = this.xmCloudTenant?.id ?? null;
    ConfigurationService.tenantName = this.xmCloudTenant?.name ?? null;

    ConfigurationService.tenants = this.tenants;
  }

  private async readAuthenticationParametersDisconnectedMode() {
    ConfigurationService.xmCloudTenant = getXMCloutTenantMock(
      this.staticConfigurationService.xMCloudSystemId,
      this.xmCloudTenant?.organizationId || 'org_FzUOtp4HjfZYw1Hv',
      'https://xmcloudcm.localhost/sitecore',
      HORIZON_GQL_ENDPOINT_PATH,
      '3f2207c7-0589-4a02-35b0-08da17b7eea0',
    );
    ConfigurationService.cdpTenant = getCDPTenantMock();
    ConfigurationService.streamTenant = getStreamTenantMock();
    ConfigurationService.organization = ConfigurationService.xmCloudTenant?.organizationId ?? null;
    ConfigurationService.tenantId = ConfigurationService.xmCloudTenant?.id ?? null;
    ConfigurationService.tenantName = ConfigurationService.xmCloudTenant?.name ?? null;
  }

  private async readAuthenticationParametersLocalXmCloudMode() {
    ConfigurationService.xmCloudTenant = getXMCloutTenantMock(
      this.staticConfigurationService.xMCloudSystemId,
      this.xmCloudTenant?.organizationId || 'org_FzUOtp4HjfZYw1Hv',
      this.localXmCloudUrl() || '',
      HORIZON_GQL_ENDPOINT_PATH,
      '',
    );
    ConfigurationService.cdpTenant = null;
    ConfigurationService.organization = ConfigurationService.xmCloudTenant?.organizationId ?? null;
    ConfigurationService.tenantId = ConfigurationService.xmCloudTenant?.id ?? null;
    ConfigurationService.tenantName = ConfigurationService.xmCloudTenant?.name ?? null;
  }

  public async navigateToReturnUrl() {
    if (this.errors.includes('noXmCloudTenant')) {
      this.errorPageService.goToErrorPage('noTenant');
      return;
    } else if (this.errors.includes('noOrganization')) {
      this.errorPageService.goToErrorPage('noOrganization');
      return;
    } else if (this.errors.includes('noCdpTenant')) {
      // handle no CDP tenant issue
    }

    if (!this.returnUrl) {
      return;
    }

    const url = new URL(this.returnUrl);
    const path = url.pathname;
    const params = Object.fromEntries(url.searchParams.entries());
    await this.router.navigate([path], { queryParams: params });
  }

  private async promptUserToReloadPage() {
    const text = await firstValueFrom(this.translateService.get('ERRORS.SESSION_EXPIRED_RELOAD_PAGE'));
    const actonTitle = await firstValueFrom(this.translateService.get('ERRORS.RELOAD_ERROR_ACTION_TITLE'));

    const notification = new TimedNotification('session-expired', text, 'error');
    notification.action = { run: () => window.location.reload(), title: actonTitle };
    this.timedNotificationsService.pushNotification(notification);
  }
}
