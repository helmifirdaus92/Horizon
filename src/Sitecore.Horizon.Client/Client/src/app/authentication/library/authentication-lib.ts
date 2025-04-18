/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Auth0Client, Auth0ClientOptions, createAuth0Client } from '@auth0/auth0-spa-js';
import { ApmAuthRedirectReporterService } from 'app/apm/apm-auth-redirect-reporter.service';
import { InventoryApiService } from './inventory/inventory.service';
import { RestApiService } from './rest-api/rest-api.service';
import { Tenant, TenantsAnnotation } from './tenant/tenant.types';
import { AuthErrorType, IdentityParams, SitecoreUser, TokenCustomClaimKeysEnum } from './types';
import {
  clearRedirectQueryParams,
  persistParams,
  restoreParams,
  withoutRedirectQueryParams,
  withTenantQueryParams,
} from './utils/utils';

interface AuthorizationParams {
  organization_id: string | undefined;
  tenant_name: string | undefined;
  system_id: string | undefined;
  audience: string;
  redirect_uri: string;
}

export class AuthenticationLibService {
  user?: SitecoreUser;
  private isRedirectQS = 'isRedirect';

  private readonly _inventory = new InventoryApiService(this.inventoryApiBaseUrl, new RestApiService());
  private get inventory(): InventoryApiService {
    return this._inventory;
  }

  private readonly auth0Client: Promise<Auth0Client>;

  private organizationId: IdentityParams['organization'] = null;
  private tenantName: IdentityParams['tenantName'] = null;

  private xmCloudActiveTenant: Tenant | null = null;
  private cdpActiveTenant: Tenant | null = null;
  private streamActiveTenant: Tenant | null = null;

  constructor(
    private authorizeType: 'organizationOnly' | 'organizationAndTenant',
    private readonly domain: string,
    private readonly clientId: string,
    private readonly audience: string,
    private readonly systemId: string,
    private readonly redirectUri: string = window.location.origin,
    private readonly inventoryApiBaseUrl: string,
    private readonly apmAuthRedirectReporterService: ApmAuthRedirectReporterService,
  ) {
    const { organization, tenantName } = restoreParams();
    this.organizationId = organization;
    this.tenantName = tenantName;

    this.auth0Client = this.createLibAuth0Client({
      domain: this.domain,
      clientId: this.clientId,
      useRefreshTokens: true,
      useCookiesForTransactions: true,
      legacySameSiteCookie: true,
      cacheLocation: 'memory',
    });
  }

  async getToken(cacheMode: 'on' | 'off' | 'cache-only' = 'on'): Promise<string> {
    return (await this.auth0Client)
      .getTokenSilently({
        authorizationParams: this.buildAuthorizationParams(false),
        cacheMode,
      })
      .catch(() => '');
  }

  async getTokenClaims() {
    return (await this.auth0Client).getIdTokenClaims();
  }

  async changeAuthParams(params: IdentityParams, authorizeType?: typeof this.authorizeType) {
    if (!params.organization && !params.tenantName) {
      return;
    }

    persistParams({ organization: null, tenantName: null });
    this.organizationId = params.organization;
    this.tenantName = params.tenantName;

    this.authorizeType = authorizeType ?? this.authorizeType;

    const auth = await this.auth0Client;
    this.requestAuthorize(auth, undefined);
  }

  async logout(returnTo?: string) {
    persistParams({ organization: null, tenantName: null });
    (await this.auth0Client).logout({ logoutParams: { returnTo: returnTo ?? this.redirectUri } });
  }

  async authenticate(returnUrl?: string): Promise<{ returnUrl: string; errors: AuthErrorType[]; user?: SitecoreUser }> {
    const authClient = await this.auth0Client;

    // eslint-disable-next-line prefer-const
    let { user, appStateReturnUrl } = await this.tryHandleRedirectCallback(authClient);
    if (!user) {
      this.apmAuthRedirectReporterService.reportPageLoadAuthRedirect();

      await this.requestAuthorize(authClient, returnUrl);
      return { returnUrl: '', errors: [] };
    }

    this.user = user;

    if (!user[TokenCustomClaimKeysEnum.ORG_ID]) {
      return { returnUrl: returnUrl ?? '', errors: ['noOrganization'] };
    }

    this.organizationId = user[TokenCustomClaimKeysEnum.ORG_ID];
    persistParams({ organization: this.organizationId, tenantName: null });

    appStateReturnUrl = withTenantQueryParams(
      appStateReturnUrl,
      user[TokenCustomClaimKeysEnum.TENANT_NAME] ?? null,
      user[TokenCustomClaimKeysEnum.ORG_ID] ?? null,
    );

    return { returnUrl: appStateReturnUrl, errors: [], user: this.user };
  }

  async resolveTenant(): Promise<{
    xmCloudTenant: Tenant | null;
    cdpTenant: Tenant | null;
    streamTenant: Tenant | null;
    errors: AuthErrorType[];
    tenants: Tenant[] | null;
  }> {
    let errors: AuthErrorType[] = [];
    let tenantsResult: Tenant[] | null = null;
    if (this.authorizeType === 'organizationAndTenant') {
      const { firstTenant, tenants } = await this.resolveXmCloudTenant(this.user);
      this.xmCloudActiveTenant = firstTenant;
      tenantsResult = tenants;
      this.tenantName = this.xmCloudActiveTenant?.name ?? null;
      persistParams({ organization: this.organizationId, tenantName: this.tenantName });
      errors = this.xmCloudActiveTenant ? errors : errors.concat(['noXmCloudTenant']);

      this.cdpActiveTenant = await this.resolveCdpTenant();
      errors = this.cdpActiveTenant ? errors : errors.concat(['noCdpTenant']);

      this.streamActiveTenant = await this.resolveStreamTenant();
      errors = this.streamActiveTenant ? errors : errors.concat(['noStreamTenant']);
    }

    return {
      xmCloudTenant: this.xmCloudActiveTenant,
      cdpTenant: this.cdpActiveTenant,
      streamTenant: this.streamActiveTenant,
      errors,
      tenants: tenantsResult,
    };
  }

  private async requestAuthorize(auth: Auth0Client, returnUrl: string | undefined) {
    clearRedirectQueryParams();

    const authorizationParams = this.buildAuthorizationParams();
    if (this.authorizeType === 'organizationOnly') {
      delete authorizationParams.system_id;
      delete authorizationParams.tenant_name;
    }

    await auth.loginWithRedirect({
      appState: {
        returnUrl: returnUrl ?? this.redirectUri ?? encodeURI(window.location.pathname + window.location.search),
      },
      authorizationParams,
    });

    // stop application - with next tick application will be redirected to external service to authenticate
    const neverResolvingPromise = new Promise(() => {});
    await neverResolvingPromise;
  }

  private async tryHandleRedirectCallback(auth0Client: Auth0Client) {
    let appStateReturnUrl = '';
    try {
      const result = await auth0Client.handleRedirectCallback();
      appStateReturnUrl = withoutRedirectQueryParams(result.appState?.returnUrl);

      clearRedirectQueryParams();
    } catch {
      if (new URLSearchParams(window.location.search).has(this.isRedirectQS)) {
        persistParams({ organization: null, tenantName: null });
        this.organizationId = null;
        this.tenantName = null;

        clearRedirectQueryParams();
      }
    }

    const user = await auth0Client.getUser<SitecoreUser>();
    return { user, appStateReturnUrl };
  }

  private createLibAuth0Client(authClientOptions: Auth0ClientOptions) {
    return createAuth0Client(authClientOptions);
  }

  private async resolveXmCloudTenant(
    user: SitecoreUser | undefined,
  ): Promise<{ firstTenant: Tenant | null; tenants: Tenant[] | null }> {
    const result = await this.inventory.getFirstTenant(
      {
        name: user ? user[TokenCustomClaimKeysEnum.TENANT_NAME] : '',
        systemId: this.systemId,
        State: 'Active',
        organizationId: this.organizationId ?? undefined,
      },
      this.getToken(),
    );
    if (result.apiIsBroken || !result.data || result.requestIsInvalid) {
      persistParams({ organization: null, tenantName: null });
      return { firstTenant: null, tenants: null };
    }
    return result.data;
  }

  private async resolveCdpTenant(): Promise<Tenant | null> {
    const cdpEmbeddedTenantId = this.xmCloudActiveTenant?.annotations?.[TenantsAnnotation.cdpEmbeddedTenantId];
    if (!cdpEmbeddedTenantId) {
      return null;
    }

    const cdpTenantInfoResponse = await this.inventory.getTenantById(cdpEmbeddedTenantId, this.getToken());
    if (cdpTenantInfoResponse.apiIsBroken || cdpTenantInfoResponse.requestIsInvalid) {
      return null;
    }

    return cdpTenantInfoResponse.data;
  }

  private async resolveStreamTenant(): Promise<Tenant | null> {
    const aiEmbeddedTenantID = this.xmCloudActiveTenant?.annotations?.[TenantsAnnotation.aiEmbeddedTenantID];
    if (!aiEmbeddedTenantID) {
      return null;
    }

    const tenantInfoResponse = await this.inventory.getTenantById(aiEmbeddedTenantID, this.getToken());
    if (tenantInfoResponse.apiIsBroken || tenantInfoResponse.requestIsInvalid) {
      return null;
    }

    return tenantInfoResponse.data;
  }

  private buildAuthorizationParams(addIsRedirect = true): AuthorizationParams {
    const redirectUri = addIsRedirect ? `${this.redirectUri}&${this.isRedirectQS}=1` : this.redirectUri;
    const result: AuthorizationParams = {
      organization_id: this.organizationId ?? undefined,
      tenant_name: this.tenantName ?? undefined,
      system_id: this.systemId ?? undefined,
      audience: this.audience,
      redirect_uri: redirectUri,
    };

    if (!result.organization_id) {
      delete result.organization_id;
    }
    if (!result.system_id) {
      delete result.system_id;
    }
    if (!result.tenant_name) {
      delete result.tenant_name;
    }

    return result;
  }
}
