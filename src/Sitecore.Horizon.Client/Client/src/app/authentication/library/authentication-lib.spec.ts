/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Auth0Client } from '@auth0/auth0-spa-js';
import { AuthenticationLibService } from './authentication-lib';
import { InventoryApiService } from './inventory/inventory.service';
import { ApiResponse } from './rest-api/rest-api.util';
import { Tenant, TenantsAnnotation } from './tenant/tenant.types';
import { TokenCustomClaimKeysEnum } from './types';
import { persistParams, restoreParams } from './utils/utils';

describe(AuthenticationLibService.name, () => {
  let createLibAuth0ClientFnSpy: jasmine.Spy<any>;
  let auth0ClientSpy: jasmine.SpyObj<Auth0Client>;
  let inventoryApiServiceSpy: jasmine.SpyObj<InventoryApiService>;

  let sut: AuthenticationLibService;
  let sutConstructorParams: {
    authorizeType: 'organizationOnly' | 'organizationAndTenant';
    domain: string;
    clientId: string;
    audience: string;
    systemId: string;
    redirectUri: string;
    inventoryApiBaseUrl: string;
  };
  const createSut = (params: typeof sutConstructorParams) =>
    (sut = new AuthenticationLibService(
      params.authorizeType,
      params.domain,
      params.clientId,
      params.audience,
      params.systemId,
      params.redirectUri,
      params.inventoryApiBaseUrl,
      { reportPageLoadAuthRedirect: () => {} } as any,
    ));

  beforeEach(() => {
    sutConstructorParams = {
      authorizeType: 'organizationAndTenant' as any,
      domain: 'authIdentityDomain',
      clientId: 'testClinetId',
      audience: 'testAudience',
      systemId: 'testSystemId',
      redirectUri: 'testRedirectUri',
      inventoryApiBaseUrl: 'testInventoryApiBaseUrl',
    };
    auth0ClientSpy = jasmine.createSpyObj<Auth0Client>({
      getTokenSilently: Promise.resolve('tokenABCD'),
      getIdTokenClaims: undefined,
      handleRedirectCallback: undefined,
      getUser: undefined,
      loginWithRedirect: undefined,
      logout: undefined,
    });

    inventoryApiServiceSpy = jasmine.createSpyObj<InventoryApiService>(['getFirstTenant', 'getTenantById']);

    createLibAuth0ClientFnSpy = spyOn<any>(AuthenticationLibService.prototype, 'createLibAuth0Client');
    createLibAuth0ClientFnSpy.and.resolveTo(auth0ClientSpy);

    persistParams({ organization: null, tenantName: null });
    createSut(sutConstructorParams);
  });

  describe('constructor', () => {
    it('createAuth0Client', () => {
      expect(createLibAuth0ClientFnSpy).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({
          domain: sutConstructorParams.domain,
          clientId: sutConstructorParams.clientId,
          useRefreshTokens: true,
          useCookiesForTransactions: true,
          legacySameSiteCookie: true,
          cacheLocation: 'memory',
        }),
      );
    });
  });

  describe('API', () => {
    it('getToken', async () => {
      createLibAuth0ClientFnSpy.calls.reset();
      const testOrgId = 'testOrgId001';
      const testTenantName = 'testTenantName001';
      persistParams({ organization: testOrgId, tenantName: testTenantName });

      createSut(sutConstructorParams);

      const token = 'test token 001';
      auth0ClientSpy.getTokenSilently.and.resolveTo(token);

      const actualToken = await sut.getToken();

      expect(actualToken).toBe(token);
      expect(auth0ClientSpy.getTokenSilently).toHaveBeenCalledOnceWith({
        authorizationParams: {
          organization_id: testOrgId,
          tenant_name: testTenantName,
          system_id: sutConstructorParams.systemId,
          audience: sutConstructorParams.audience,
          redirect_uri: sutConstructorParams.redirectUri,
        },
        cacheMode: 'on',
      });
    });

    it('getTokenClaims', async () => {
      const tokenClaims = { claim1: 'test claim 001' };
      auth0ClientSpy.getIdTokenClaims.and.resolveTo(tokenClaims as any);

      const actualTokenClaims = await sut.getTokenClaims();
      expect(actualTokenClaims).toBe(tokenClaims as any);
    });

    describe('logout', () => {
      it('logout', async () => {
        auth0ClientSpy.logout.and.resolveTo();
        persistParams({ organization: 'org', tenantName: 't name' });

        await sut.logout();

        const { organization, tenantName } = restoreParams();
        expect(organization).toBeNull();
        expect(tenantName).toBeNull();
        expect(auth0ClientSpy.logout).toHaveBeenCalledOnceWith({
          logoutParams: { returnTo: sutConstructorParams.redirectUri },
        });
      });

      it('logout and provide returnTo parameter', async () => {
        auth0ClientSpy.logout.and.resolveTo();

        const returnToParam = 'return to explicit url';
        await sut.logout(returnToParam);

        expect(auth0ClientSpy.logout).toHaveBeenCalledOnceWith({
          logoutParams: { returnTo: returnToParam },
        });
      });
    });

    describe('authenticate - resolveXmCloudTenant', () => {
      it('resolve tenant - should set tenant details', async () => {
        const mockXmTenant: Tenant = {
          name: 'XM Cloud Tenant',
          annotations: {},
          id: '',
          displayName: '',
          organizationId: '',
          labels: {},
          systemId: '',
          state: 'Active',
        };
        auth0ClientSpy.handleRedirectCallback.and.resolveTo({ appState: { returnUrl: 'returnUrl01}' } });
        auth0ClientSpy.getUser.and.resolveTo({
          [TokenCustomClaimKeysEnum.TENANT_NAME]: 'tenantName001',
          [TokenCustomClaimKeysEnum.ORG_ID]: 'ordId001',
        });

        sutConstructorParams.authorizeType = 'organizationAndTenant';
        createSut(sutConstructorParams);

        spyOnProperty<any>(sut, 'inventory', 'get').and.returnValue(inventoryApiServiceSpy);

        inventoryApiServiceSpy.getFirstTenant.and.resolveTo({
          apiIsBroken: false,
          requestIsInvalid: false,
          data: { firstTenant: mockXmTenant, tenants: [mockXmTenant] },
        });

        await sut.authenticate();
        const result = await sut.resolveTenant();

        expect(result.errors.length).toBe(2);
        expect(result.errors[0]).toBe('noCdpTenant');
        expect(result.errors[1]).toBe('noStreamTenant');

        expect(result.xmCloudTenant).toEqual(mockXmTenant);
      });

      describe('inventoryError', () => {
        const tenantResponseWithoutData: ApiResponse<{ firstTenant: Tenant | null; tenants: Tenant[] | null }> = {
          apiIsBroken: false,
          requestIsInvalid: false,
          data: undefined as any,
        };
        const tenantResponseWithApiBroken = {
          apiIsBroken: true,
          requestIsInvalid: false,
          data: {} as { firstTenant: Tenant | null; tenants: Tenant[] | null },
        };
        const tenantResponseWithRequestIsInvalid = {
          apiIsBroken: false,
          requestIsInvalid: true,
          data: {} as { firstTenant: Tenant | null; tenants: Tenant[] | null },
        };

        [tenantResponseWithoutData, tenantResponseWithApiBroken, tenantResponseWithRequestIsInvalid].forEach(
          (badTenantsResponse) => {
            it('inventoryError', async () => {
              auth0ClientSpy.handleRedirectCallback.and.resolveTo({ appState: { returnUrl: 'returnUrl01}' } });
              auth0ClientSpy.getUser.and.resolveTo({
                [TokenCustomClaimKeysEnum.TENANT_NAME]: 'tenantName001',
                [TokenCustomClaimKeysEnum.ORG_ID]: 'ordId001',
              });

              sutConstructorParams.authorizeType = 'organizationAndTenant';
              createSut(sutConstructorParams);

              // sut.onError(onErrorSpy);
              spyOnProperty<any>(sut, 'inventory', 'get').and.returnValue(inventoryApiServiceSpy);

              inventoryApiServiceSpy.getFirstTenant.and.resolveTo(badTenantsResponse);
              await sut.authenticate();
              const result = await sut.resolveTenant();

              expect(result.errors.length).toBe(3);
              expect(result.errors).toContain('noXmCloudTenant');
              expect(result.errors).toContain('noCdpTenant');
              expect(result.errors).toContain('noStreamTenant');
            });
          },
        );
      });
    });

    it('authenticate - resolveCdpTenant', async () => {
      auth0ClientSpy.handleRedirectCallback.and.resolveTo({ appState: { returnUrl: 'returnUrl01}' } });
      auth0ClientSpy.getUser.and.resolveTo({
        [TokenCustomClaimKeysEnum.TENANT_NAME]: 'tenantName001',
        [TokenCustomClaimKeysEnum.ORG_ID]: 'ordId001',
      });

      spyOnProperty<any>(sut, 'inventory', 'get').and.returnValue(inventoryApiServiceSpy);

      const tenantId = 't_id001';
      const tenantName = 't_name001';
      const tenant = { id: tenantId, name: tenantName, annotations: {} } as Tenant;
      const tenantResponseData: ApiResponse<Tenant> = {
        apiIsBroken: false,
        requestIsInvalid: false,
        data: tenant,
      };

      const mockXmTenant: Tenant = {
        name: 'XM Cloud Tenant',
        annotations: {},
        id: '',
        displayName: '',
        organizationId: '',
        labels: {},
        systemId: '',
        state: 'Active',
      };

      const mockCdpTenant: Tenant = {
        name: 'CDP Tenant',
        annotations: {},
        id: '',
        displayName: '',
        organizationId: '',
        labels: {},
        systemId: '',
        state: 'Active',
      };
      const mockCdpEmbeddedTenantId = 'test-cdp-id';
      tenantResponseData.data!.annotations[TenantsAnnotation.cdpEmbeddedTenantId] = 'cdp_tenant';
      (sut as any).xmCloudActiveTenant = {
        annotations: { [TenantsAnnotation.cdpEmbeddedTenantId]: mockCdpEmbeddedTenantId },
      };

      inventoryApiServiceSpy.getFirstTenant.and.resolveTo({
        apiIsBroken: false,
        requestIsInvalid: false,
        data: { firstTenant: mockXmTenant, tenants: [mockXmTenant] },
      });

      inventoryApiServiceSpy.getTenantById.and.resolveTo({
        apiIsBroken: false,
        requestIsInvalid: false,
        data: mockCdpTenant,
      });

      await sut.authenticate();
      const result = await (sut as any).resolveCdpTenant();

      expect(result).toEqual(mockCdpTenant);
      expect(inventoryApiServiceSpy.getTenantById).toHaveBeenCalledWith(mockCdpEmbeddedTenantId, jasmine.any(Promise));
    });
    it('authenticate - resolveStreamTenant', async () => {
      auth0ClientSpy.handleRedirectCallback.and.resolveTo({ appState: { returnUrl: 'returnUrl01}' } });
      auth0ClientSpy.getUser.and.resolveTo({
        [TokenCustomClaimKeysEnum.TENANT_NAME]: 'tenantName001',
        [TokenCustomClaimKeysEnum.ORG_ID]: 'ordId001',
      });

      spyOnProperty<any>(sut, 'inventory', 'get').and.returnValue(inventoryApiServiceSpy);

      const tenantId = 't_id001';
      const tenantName = 't_name001';
      const tenant = { id: tenantId, name: tenantName, annotations: {} } as Tenant;
      const tenantResponseData: ApiResponse<Tenant> = {
        apiIsBroken: false,
        requestIsInvalid: false,
        data: tenant,
      };

      const mockXmTenant: Tenant = {
        name: 'XM Cloud Tenant',
        annotations: {},
        id: '',
        displayName: '',
        organizationId: '',
        labels: {},
        systemId: '',
        state: 'Active',
      };

      const mockStreamTenant: Tenant = {
        name: 'Stream Tenant',
        annotations: {},
        id: '',
        displayName: '',
        organizationId: '',
        labels: {},
        systemId: '',
        state: 'Active',
      };
      const mockStreamTenantId = 'test-stream-id';
      tenantResponseData.data!.annotations[TenantsAnnotation.aiEmbeddedTenantID] = 'stream_tenant';
      (sut as any).xmCloudActiveTenant = {
        annotations: { [TenantsAnnotation.aiEmbeddedTenantID]: mockStreamTenantId },
      };

      inventoryApiServiceSpy.getFirstTenant.and.resolveTo({
        apiIsBroken: false,
        requestIsInvalid: false,
        data: { firstTenant: mockXmTenant, tenants: [mockXmTenant] },
      });

      inventoryApiServiceSpy.getTenantById.and.resolveTo({
        apiIsBroken: false,
        requestIsInvalid: false,
        data: mockStreamTenant,
      });

      await sut.authenticate();
      const result = await (sut as any).resolveStreamTenant();

      expect(result).toEqual(mockStreamTenant);
      expect(inventoryApiServiceSpy.getTenantById).toHaveBeenCalledWith(mockStreamTenantId, jasmine.any(Promise));
    });
  });

  describe('validate if all tenants are passed from invertory to consumer', () => {
    it('should pass all tenants', async () => {
      // Arrange
      const mockTenants: Tenant[] = [
        {
          name: 'Tenant1',
          annotations: {},
          id: '',
          displayName: '',
          organizationId: '',
          labels: {},
          systemId: '',
          state: 'Active',
        },
        {
          name: 'Tenant2',
          annotations: {},
          id: '',
          displayName: '',
          organizationId: '',
          labels: {},
          systemId: '',
          state: 'InActive',
        },
      ];
      const mockFirstTenant: Tenant = {
        name: 'Tenant1',
        annotations: {},
        id: '',
        displayName: '',
        organizationId: '',
        labels: {},
        systemId: '',
        state: 'Active',
      };

      auth0ClientSpy.handleRedirectCallback.and.resolveTo({ appState: { returnUrl: 'returnUrl01}' } });
      auth0ClientSpy.getUser.and.resolveTo({
        [TokenCustomClaimKeysEnum.TENANT_NAME]: 'tenantName001',
        [TokenCustomClaimKeysEnum.ORG_ID]: 'ordId001',
      });

      sutConstructorParams.authorizeType = 'organizationAndTenant';
      createSut(sutConstructorParams);

      spyOnProperty<any>(sut, 'inventory', 'get').and.returnValue(inventoryApiServiceSpy);

      // Mock the resolveXmCloudTenant method to return tenants
      inventoryApiServiceSpy.getFirstTenant.and.returnValue(
        Promise.resolve({
          apiIsBroken: false,
          requestIsInvalid: false,
          data: { firstTenant: mockFirstTenant, tenants: mockTenants },
        }),
      );

      inventoryApiServiceSpy.getTenantById.and.returnValue(
        Promise.resolve({
          apiIsBroken: false,
          requestIsInvalid: false,
          data: mockFirstTenant,
        }),
      );

      // Act
      const result = await sut.resolveTenant();

      // Assert
      expect(inventoryApiServiceSpy.getFirstTenant).toHaveBeenCalled();
      expect(result.xmCloudTenant).toEqual(mockFirstTenant);
      expect(result.tenants).toEqual(mockTenants);
    });

    it('should return an error when no tenants are found in the inventory', async () => {
      auth0ClientSpy.handleRedirectCallback.and.resolveTo({ appState: { returnUrl: 'returnUrl01}' } });
      auth0ClientSpy.getUser.and.resolveTo({
        [TokenCustomClaimKeysEnum.TENANT_NAME]: 'tenantName001',
        [TokenCustomClaimKeysEnum.ORG_ID]: 'ordId001',
      });

      sutConstructorParams.authorizeType = 'organizationAndTenant';
      createSut(sutConstructorParams);

      spyOnProperty<any>(sut, 'inventory', 'get').and.returnValue(inventoryApiServiceSpy);

      // Arrange
      inventoryApiServiceSpy.getFirstTenant.and.returnValue(
        Promise.resolve({
          apiIsBroken: false,
          requestIsInvalid: false,
          data: { firstTenant: null, tenants: null },
        }),
      );

      // Act
      const result = await sut.resolveTenant();

      // Assert
      expect(inventoryApiServiceSpy.getFirstTenant).toHaveBeenCalled();
      expect(result.xmCloudTenant).toBeNull();
      expect(result.tenants).toBeNull();
      expect(result.errors.length).toBe(3);
      expect(result.errors).toContain('noXmCloudTenant');
      expect(result.errors).toContain('noCdpTenant');
      expect(result.errors).toContain('noStreamTenant');
    });
  });
});
