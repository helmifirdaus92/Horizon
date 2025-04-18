/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { RestApiService } from '../rest-api/rest-api.service';
import { Tenant } from '../tenant/tenant.types';
import { InventoryApiService } from './inventory.service';
import { GetTenantsRequest, GetTenantsResponse } from './inventory.types';

const inventoryApiBaseUrl = 'https://inventory-api-url.com/';
const inventoryApiUrl = 'api/inventory/v1/tenants';

describe(InventoryApiService.name, () => {
  let sut: InventoryApiService;
  let httpClientSpy: jasmine.SpyObj<RestApiService>;
  let token$: Promise<string>;

  beforeEach(() => {
    token$ = new Promise((resolve) => resolve('test-token'));
    httpClientSpy = jasmine.createSpyObj<RestApiService>(['get']);

    sut = new InventoryApiService(inventoryApiBaseUrl, httpClientSpy);
  });

  describe('validate all tenants', () => {
    it('should fetch all tenants across multiple pages', async () => {
      // Arrange
      const mockTenantsPage1: Tenant[] = [
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
        {
          name: 'Tenant3',
          annotations: {},
          id: '',
          displayName: '',
          organizationId: '',
          labels: {},
          systemId: '',
          state: 'InActive',
        },
        {
          name: 'Tenant4',
          annotations: {},
          id: '',
          displayName: '',
          organizationId: '',
          labels: {},
          systemId: '',
          state: 'InActive',
        },
      ];

      const mockResponsePage = {
        data: mockTenantsPage1,
        totalCount: 4,
      };

      const createOkResponse = new Response(JSON.stringify(mockResponsePage), {
        status: 200,
        statusText: 'OK',
        headers: {},
      });
      const getTenantRequest: GetTenantsRequest = {
        name: 'sample-xm-cloud-instance',
        systemId: '123',
        State: 'Active',
        organizationId: '321',
      };

      httpClientSpy.get.and.resolveTo(createOkResponse);

      // Act
      const resultPromise = await sut.getFirstTenant(getTenantRequest, token$);

      // Assert
      const result = resultPromise;
      expect(result.data?.tenants).toEqual([...mockTenantsPage1]);
      expect(result.data?.firstTenant).toBeNull(); // No specific tenant name requested
      expect(result.apiIsBroken).toBeFalse();
      expect(result.requestIsInvalid).toBeFalse();
    });

    it('should handle API errors and return apiIsBroken when API is broken', async () => {
      // Arrange
      const mockResponsePage = {
        data: [],
        totalCount: 0,
      };

      const apiIsBrokenResponse = new Response(JSON.stringify(mockResponsePage), {
        status: 500,
        statusText: 'Server Error',
        headers: {},
      });
      const getTenantRequest: GetTenantsRequest = {
        name: 'sample-xm-cloud-instance',
        systemId: '123',
        State: 'Active',
        organizationId: '321',
      };

      httpClientSpy.get.and.resolveTo(apiIsBrokenResponse);

      // Act
      const resultPromise = await sut.getFirstTenant(getTenantRequest, token$);

      // Assert
      const result = resultPromise;
      expect(result.apiIsBroken).toBeTrue();
    });
  });

  describe('fetch tenant from inventory', () => {
    // Arrange
    it('should get first tenant with XM cloud url by name from inventory', async () => {
      const tenant: Tenant = {
        id: 'bf0847c3-8f90-4b26-f781-08da2761db82',
        name: 'sample-xm-cloud-instance',
        displayName: 'Sample XM Cloud instance',
        organizationId: '',
        systemId: 'systemId',
        annotations: {
          URL: 'https://xmcloudcm.localhost/sitecore',
          'XMCloud.ProjectName': 'SampleProjectName',
          'XMCloud.EnvironmentName': 'SampleEnvironment',
          'XMCloud.CustomerEnvironmentType': 'nonprod',
          'XMCloud.CDPEmbeddedTenantID': '3f2207c7-0589-4a02-35b0-08da17b7eea0',
        },
        labels: {
          CustomerEnvironmentType: 'nonprod',
          Environment: 'dev',
          ProductCode: 'XMCloud',
          Region: 'West-Europe',
        },
        state: 'Active',
      };
      const tenantsResponse: GetTenantsResponse = {
        totalCount: 1,
        pageSize: 100,
        pageNumber: 1,
        data: [tenant],
      };
      const createOkResponse = new Response(JSON.stringify(tenantsResponse), {
        status: 200,
        statusText: 'OK',
        headers: {},
      });
      const getTenantRequest: GetTenantsRequest = {
        name: 'sample-xm-cloud-instance',
        systemId: '123',
        State: 'Active',
        organizationId: '321',
      };

      httpClientSpy.get.and.resolveTo(createOkResponse);

      // Act
      const actual = await sut.getFirstTenant(getTenantRequest, token$);

      // Assert
      expect(actual).not.toBeNull();
      expect(httpClientSpy.get.calls.mostRecent().args[0]).toBe(
        `${inventoryApiBaseUrl}${inventoryApiUrl}?organizationId=321&systemId=123&state=Active&pagenumber=1&pagesize=100`,
      );
    });
  });

  it('should navigate through pages and get first tenant with XM cloud url from inventory', async () => {
    // Arrange
    const tenantWithoutUrl: Tenant = {
      id: 'bf0847c3-8f90-4b26-f781-08da2761db82',
      name: 'sample-xm-cloud-instance',
      displayName: 'Sample XM Cloud instance',
      organizationId: 'org',
      systemId: 'systemId',
      annotations: {
        'XMCloud.ProjectName': 'SampleProjectName',
        'XMCloud.EnvironmentName': 'SampleEnvironment',
        'XMCloud.CustomerEnvironmentType': 'nonprod',
        'XMCloud.CDPEmbeddedTenantID': '3f2207c7-0589-4a02-35b0-08da17b7eea0',
      },
      labels: {},
      state: 'Active',
    };
    const tenantWithUrl: Tenant = {
      id: 'bf0847c3-8f90-4b26-f781-08da2761db82',
      name: 'sample-xm-cloud-instance',
      displayName: 'Sample XM Cloud instance',
      organizationId: 'org',
      systemId: 'systemId',
      annotations: {
        URL: 'https://xmcloudcm.localhost/sitecore',
        'XMCloud.ProjectName': 'SampleProjectName',
        'XMCloud.EnvironmentName': 'SampleEnvironment',
        'XMCloud.CustomerEnvironmentType': 'nonprod',
        'XMCloud.CDPEmbeddedTenantID': '3f2207c7-0589-4a02-35b0-08da17b7eea0',
      },
      labels: {
        CustomerEnvironmentType: 'nonprod',
        Environment: 'dev',
        ProductCode: 'XMCloud',
        Region: 'West-Europe',
      },
      state: 'Active',
    };

    const tenantsResponse: GetTenantsResponse = {
      totalCount: 1,
      pageSize: 1,
      pageNumber: 1,
      data: [tenantWithoutUrl, tenantWithUrl],
    };
    const createOkResponse = new Response(JSON.stringify(tenantsResponse), {
      status: 200,
      statusText: 'OK',
      headers: {},
    });
    const getTenantRequest: GetTenantsRequest = {
      systemId: '123',
      State: 'Active',
      organizationId: '321',
      pageSize: 1,
    };
    httpClientSpy.get.and.resolveTo(createOkResponse);

    // Act
    const actual = await sut.getFirstTenant(getTenantRequest, token$);

    // Assert
    expect(actual).not.toBeNull();
    expect(httpClientSpy.get.calls.mostRecent().args[0]).toBe(
      `${inventoryApiBaseUrl}${inventoryApiUrl}?organizationId=321&systemId=123&state=Active&pagenumber=1&pagesize=1`,
    );
  });

  it('should get tenant by id', async () => {
    // Arrange
    const tenant: Tenant = {
      id: '3f2207c7-0589-4a02-35b0-08da17b7eea0',
      systemId: 'a0725c5c-05a4-4c2f-a784-f53b2781f84a',
      name: 'pages-eu-dev',
      displayName: 'Pages Demo Organization DEV',
      organizationId: 'org_mYh9GjNHAZh0fYX2',
      annotations: {
        URL: 'https://dev-app.boxever.com',
        apiURL: 'https://api-engage-dev.sitecorecloud.io',
      },
      state: 'Active',
      labels: {
        clientKey: 'd93e798d145c6648192ce92606f7f952',
        CustomerEnvironmentType: 'nonprod',
        Environment: 'staging',
        ProductCode: 'PersonalizeEmbedded',
        Region: 'West Europe',
        tenantSize: 'S',
        tenantType: 'DEV',
      },
    };

    const createOkResponse = new Response(JSON.stringify(tenant), {
      status: 200,
      statusText: 'OK',
      headers: {},
    });

    httpClientSpy.get.and.resolveTo(createOkResponse);

    // Act
    const actual = await sut.getTenantById('3f2207c7-0589-4a02-35b0-08da17b7eea0', token$);

    // Assert
    expect(actual).not.toBeNull();
    expect(httpClientSpy.get.calls.mostRecent().args[0]).toBe(
      `${inventoryApiBaseUrl}${inventoryApiUrl}/3f2207c7-0589-4a02-35b0-08da17b7eea0`,
    );
    expect(actual.data).toEqual(tenant);
  });
});
