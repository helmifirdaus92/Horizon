/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';

import { ApmAuthRedirectReporterService } from 'app/apm/apm-auth-redirect-reporter.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { environment } from 'environments/environment';
import { AuthenticationService, HORIZON_GQL_ENDPOINT_PATH } from './authentication.service';
import { AuthenticationLibService as AuthLibService } from './library/authentication-lib';
import { Tenant } from './library/tenant/tenant.types';
import { IdentityParams } from './library/types';

const tenant: Tenant = {
  id: 'test-tenant-id',
  name: 'test-tenant-name',
  displayName: 'test-tenant-displayName',
  organizationId: 'test-organizationId',
  labels: {},
  annotations: {
    URL: 'https://test-cm.com',
    'XMCloud.CDPEmbeddedTenantID': 'test-cdp-tenant-id',
    'XMCloud.ProjectId': 'test-project-id',
  },
  systemId: 'system-id',
  state: 'Active',
};
const cdpActiveTenant: Tenant = {
  id: 'test-cdp-tenant-id',
  name: 'cdp-test-tenant-name',
  displayName: 'cdp-test-tenant-displayName',
  organizationId: 'test-organizationId',
  labels: {},
  annotations: { apiURL: 'https://cdp-api.com', URL: 'https://cdp-app.com' },
  systemId: 'system-id',
  state: 'Active',
};

const streamActiveTenant: Tenant = {
  id: 'stream-tenant-id',
  systemId: 'a0725c5c-05a4-4c2f-a784-f53b2781f84a',
  name: 'pages-stream-eu-dev',
  displayName: 'Pages Demo Organization DEV',
  organizationId: 'org_FzUOtp4HjfZYw1Hv',
  annotations: {
    url: 'https://stream-dev.sitecore-staging.cloud',
  },
  state: 'Active',
  labels: {
    AccountId: '0000DEMOACCOUNTID0',
    'ai.CustomerEnvironmentType': 'nonprod',
    'ai.edition': 'free',
    'ai.infraVersion': '0.1.25',
    'ai.tier': 'T1',
    CustomerEnvironmentType: 'nonprod',
    Environment: 'staging',
    ProductCode: 'ai',
    RegionCode: 'euw',
    Region: 'euw',
    SellableProductCode: 'stream',
    SubscriptionId: 'internal',
  },
};

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

describe(AuthenticationService.name, () => {
  let sut: AuthenticationService;
  let authServiceSpy: jasmine.SpyObj<AuthLibService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, StaticConfigurationServiceStubModule, TranslateServiceStubModule],
      providers: [
        {
          provide: AuthLibService,
          useValue: jasmine.createSpyObj<AuthLibService>(
            AuthLibService.name,
            {
              getToken: undefined,
              authenticate: undefined,
              resolveTenant: Promise.resolve({
                xmCloudTenant: tenant,
                cdpTenant: cdpActiveTenant,
                streamTenant: streamActiveTenant,
                tenants: mockTenants,
                errors: [],
              }),
              changeAuthParams: undefined,
              logout: undefined,
            },
            {},
          ),
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj<Router>({
            navigateByUrl: Promise.resolve(true),
          }),
        },
        {
          provide: ApmAuthRedirectReporterService,
          useValue: jasmine.createSpyObj<ApmAuthRedirectReporterService>(['reportPageLoadAuthRedirect']),
        },
      ],
    });

    authServiceSpy = TestBedInjectSpy(AuthLibService);
    sut = TestBed.inject(AuthenticationService);

    environment.inventoryConnectedMode = true;
    spyOn(sut, 'setupAuthLibrary').and.callFake(() => {
      sut.authProvider = authServiceSpy;
    });
  });

  afterEach(() => {
    ConfigurationService.xmCloudTenant = null;
    ConfigurationService.cdpTenant = null;
    environment.localXmCloudUrl = null;
  });

  describe('authentication', () => {
    it('should init authService with correct params and register callbacks', async () => {
      // Act
      authServiceSpy.authenticate.and.returnValue(Promise.resolve({ returnUrl: 'abc', errors: [] }));
      await sut.authenticate();

      // Assert
      expect(sut.setupAuthLibrary).toHaveBeenCalledWith(
        true,
        'https://pages.sitecore-test.cloud',
        '123',
        'https://audience.sitecore-test.cloud',
        'https://inventory-api-url.com/',
        '321',
      );
    });

    it('should populate and expose tenant info through configuration service in inventory connected mode', async () => {
      // Act
      authServiceSpy.authenticate.and.returnValue(
        Promise.resolve({ isRedirect: true, errors: [], returnUrl: 'https://testReturnURL' }),
      );
      environment.inventoryConnectedMode = true;

      await sut.authenticate();
      await sut.resolveTenant();

      // Assert
      expect(ConfigurationService.organization).toBe(tenant.organizationId);
      expect(ConfigurationService.tenantId).toBe(tenant.id);
      expect(ConfigurationService.tenantName).toBe(tenant.name);

      expect(ConfigurationService.xmCloudTenant).not.toBeNull();
      expect(ConfigurationService.xmCloudTenant!.url).toBe(tenant.annotations.URL + '/');
      expect(ConfigurationService.xmCloudTenant!.id).toBe(tenant.id);
      expect(ConfigurationService.xmCloudTenant!.name).toBe(tenant.name);
      expect(ConfigurationService.xmCloudTenant!.displayName).toBe(tenant.displayName);
      expect(ConfigurationService.xmCloudTenant!.organizationId).toBe(tenant.organizationId);
      expect(ConfigurationService.xmCloudTenant!.gqlEndpointUrl!).toBe(
        tenant.annotations.URL + HORIZON_GQL_ENDPOINT_PATH,
      );
      expect(ConfigurationService.xmCloudTenant!.cdpEmbeddedTenantId).toBe('test-cdp-tenant-id');

      expect(ConfigurationService.cdpTenant).not.toBeNull();
      expect(ConfigurationService.cdpTenant!.apiUrl).toBe(cdpActiveTenant.annotations.apiURL);
      expect(ConfigurationService.cdpTenant!.appUrl).toBe(cdpActiveTenant.annotations.URL);
      expect(ConfigurationService.cdpTenant!.id).toBe(cdpActiveTenant.id);
      expect(ConfigurationService.cdpTenant!.name).toBe(cdpActiveTenant.name);
      expect(ConfigurationService.cdpTenant!.displayName).toBe(cdpActiveTenant.displayName);
      expect(ConfigurationService.cdpTenant!.organizationId).toBe(cdpActiveTenant.organizationId);
    });

    it('should populate and expose tenant info through configuration service in inventory disconnected mode', async () => {
      // Arrange
      authServiceSpy.authenticate.and.returnValue(
        Promise.resolve({ isRedirect: true, errors: [], returnUrl: 'https://testreturnURL2' }),
      );
      environment.inventoryConnectedMode = false;

      // Act
      await sut.authenticate();
      await sut.resolveTenant();

      // Assert
      expect(ConfigurationService.organization).toBe(tenant.organizationId);
      expect(ConfigurationService.tenantId).toBe(tenant.id);
      expect(ConfigurationService.tenantName).toBe('local-xm-cloud-instance');

      expect(ConfigurationService.xmCloudTenant).not.toBeNull();
      expect(ConfigurationService.xmCloudTenant!.url).toBe('https://xmcloudcm.localhost/');
      expect(ConfigurationService.xmCloudTenant!.id).toBe(tenant.id);
      expect(ConfigurationService.xmCloudTenant!.name).toBe('local-xm-cloud-instance');
      expect(ConfigurationService.xmCloudTenant!.displayName).toBe('Local XM Cloud instance');
      expect(ConfigurationService.xmCloudTenant!.organizationId).toBe(tenant.organizationId);
      expect(ConfigurationService.xmCloudTenant!.gqlEndpointUrl!).toBe(
        'https://xmcloudcm.localhost/sitecore' + HORIZON_GQL_ENDPOINT_PATH,
      );
      expect(ConfigurationService.xmCloudTenant!.cdpEmbeddedTenantId).toBe('3f2207c7-0589-4a02-35b0-08da17b7eea0');

      expect(ConfigurationService.cdpTenant).not.toBeNull();
      expect(ConfigurationService.cdpTenant!.apiUrl).toBe('https://api-engage-dev.sitecorecloud.io');
      expect(ConfigurationService.cdpTenant!.appUrl).toBe('https://dev-app.boxever.com');
      expect(ConfigurationService.cdpTenant!.id).toBe('cdp-tenant-id');
      expect(ConfigurationService.cdpTenant!.name).toBe('pages-eu-dev');
      expect(ConfigurationService.cdpTenant!.displayName).toBe('Pages Demo Organization DEV');
      expect(ConfigurationService.cdpTenant!.organizationId).toBe('org_FzUOtp4HjfZYw1Hv');
    });

    it('should allow using Local XM cloud custom url', async () => {
      // Arrange
      authServiceSpy.authenticate.and.returnValue(
        Promise.resolve({ isRedirect: true, errors: [], returnUrl: 'https://testReturnURL3' }),
      );

      environment.inventoryConnectedMode = false;
      const localXmCloudUrl = 'https://mylocalxmcloud001/';
      environment.localXmCloudUrl = localXmCloudUrl;

      // Act
      await sut.authenticate();
      await sut.resolveTenant();

      // Assert
      expect(ConfigurationService.organization).toBe(tenant.organizationId);
      expect(ConfigurationService.xmCloudTenant!.url).toBe(localXmCloudUrl);
      expect(ConfigurationService.xmCloudTenant!.cdpEmbeddedTenantId).toBe('');
    });

    it('should return token from the authService', async () => {
      // Arrange
      authServiceSpy.authenticate.and.returnValue(Promise.resolve({ returnUrl: 'ghi', errors: [] }));
      authServiceSpy.getToken.and.returnValue(Promise.resolve('test'));

      // Act
      await sut.authenticate();
      const result = await sut.getBearerToken();

      // Assert
      expect(result).toBe('test');
    });

    it('should call changeAuthParams with correct params', async () => {
      // Arrange
      authServiceSpy.authenticate.and.returnValue(Promise.resolve({ returnUrl: 'jkl', errors: [] }));
      authServiceSpy.getToken.and.returnValue(Promise.resolve('test'));

      const identityParams: IdentityParams = {
        organization: 'org',
        tenantName: 'tenant-name',
      };

      // Act
      await sut.authenticate();
      sut.changeAuthParams(identityParams);

      // Assert
      expect(authServiceSpy.changeAuthParams).toHaveBeenCalledOnceWith(identityParams);
    });

    it('should call logout', async () => {
      // Arrange
      authServiceSpy.authenticate.and.returnValue(Promise.resolve({ returnUrl: 'lmn', errors: [] }));

      // Act
      await sut.authenticate();
      sut.logout();

      // Assert
      expect(authServiceSpy.logout).toHaveBeenCalled();
    });

    it('should save tenants to the ConfigurationService after tenant resolution', async () => {
      authServiceSpy.authenticate.and.returnValue(
        Promise.resolve({ isRedirect: true, errors: [], returnUrl: 'https://testReturnURL' }),
      );

      // Act
      await sut.authenticate();
      await sut.resolveTenant();

      // Assert
      expect(ConfigurationService.organization).toBe(tenant.organizationId);
      expect(ConfigurationService.tenantId).toBe(tenant.id);
      expect(ConfigurationService.tenantName).toBe(tenant.name);

      expect(ConfigurationService.xmCloudTenant).not.toBeNull();
      expect(ConfigurationService.xmCloudTenant!.name).toBe(tenant.name);
      expect(ConfigurationService.cdpTenant!.name).toEqual(cdpActiveTenant.name);
      expect(ConfigurationService.tenants).toEqual(mockTenants);
    });

    it('should not save tenants to ConfigurationService if errors exist', async () => {
      // Arrange
      authServiceSpy.authenticate.and.returnValue(
        Promise.resolve({ isRedirect: true, errors: [], returnUrl: 'https://testReturnURL' }),
      );
      authServiceSpy.resolveTenant.and.returnValue(
        Promise.resolve({
          xmCloudTenant: null,
          cdpTenant: null,
          streamTenant: null,
          tenants: null,
          errors: ['noXmCloudTenant'],
        }),
      );

      // Act
      await sut.authenticate();
      await sut.resolveTenant();

      // Assert
      expect(authServiceSpy.resolveTenant).toHaveBeenCalled();
      expect(ConfigurationService.xmCloudTenant).toBeNull();
      expect(ConfigurationService.cdpTenant).toBeNull();
      expect(ConfigurationService.tenants).toBeNull();
    });
  });
});
