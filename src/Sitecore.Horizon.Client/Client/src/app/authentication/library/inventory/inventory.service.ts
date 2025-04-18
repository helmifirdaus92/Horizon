/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { makeAbsoluteUrl } from 'app/shared/utils/url.utils';
import { RestApiService } from '../rest-api/rest-api.service';
import { ApiResponse, handleResponse } from '../rest-api/rest-api.util';
import { Tenant, TenantsAnnotation } from '../tenant/tenant.types';
import { GetTenantsRequest, GetTenantsResponse } from './inventory.types';

export const DEFAULT_INVENTORY_PAGESIZE = 100;

export class InventoryApiService {
  inventoryTenantEndPoint = makeAbsoluteUrl('api/inventory/v1/tenants', this.inventoryApiBaseUrl);

  constructor(
    private readonly inventoryApiBaseUrl: string,
    private readonly http: RestApiService,
  ) {}

  async getFirstTenant(
    request: GetTenantsRequest,
    token$: Promise<string>,
  ): Promise<ApiResponse<{ firstTenant: Tenant | null; tenants: Tenant[] | null }>> {
    let currentPageNumber = 0;
    let getTenantsResponse: GetTenantsResponse | null;

    let fetchTenantsResponse: ApiResponse<GetTenantsResponse>;

    let firstTenant: Tenant | null = null;
    let tenants: Tenant[] = [];

    const pagesize = request.pageSize ?? DEFAULT_INVENTORY_PAGESIZE;

    const requestWithoutTenantName = Object.assign({}, request);
    delete requestWithoutTenantName.name;

    do {
      currentPageNumber++;
      requestWithoutTenantName.pageNumber = currentPageNumber;

      fetchTenantsResponse = await this.fetchTenants(requestWithoutTenantName, token$);

      getTenantsResponse = fetchTenantsResponse.data;
      if (getTenantsResponse !== null) {
        const tenantsFromCurrentFetch = getTenantsResponse.data ?? [];
        tenants = [...tenants, ...tenantsFromCurrentFetch];
      }
    } while (
      !fetchTenantsResponse.apiIsBroken &&
      getTenantsResponse !== null &&
      getTenantsResponse.totalCount > currentPageNumber * pagesize
    );

    const validTenant = request.name
      ? tenants.find((t) => t.annotations[TenantsAnnotation.url] && t.name === request.name)
      : undefined;

    if (validTenant) {
      firstTenant = validTenant;
    }

    return {
      apiIsBroken: fetchTenantsResponse.apiIsBroken,
      data: { firstTenant, tenants },
      requestIsInvalid: fetchTenantsResponse.requestIsInvalid,
    };
  }

  async getTenantById(tenantId: string, token$: Promise<string>): Promise<ApiResponse<Tenant>> {
    try {
      const requestUrl = this.inventoryTenantEndPoint + '/' + tenantId;
      const response = await this.http.get(requestUrl, token$);

      return handleResponse<Tenant>(response);
    } catch {
      return {
        apiIsBroken: true,
        data: null,
        requestIsInvalid: true,
      };
    }
  }

  // Make this method public in order to mock it in tests
  private async fetchTenants(
    filter: GetTenantsRequest,
    token$: Promise<string>,
  ): Promise<ApiResponse<GetTenantsResponse>> {
    const requestUrl = this.buildInventoryRequest(this.inventoryTenantEndPoint, filter);

    const response = await this.http.get(requestUrl, token$);
    const result = await handleResponse<GetTenantsResponse>(response);

    return result;
  }

  private buildInventoryRequest(inventoryApiEndPoint: string, filter: Partial<GetTenantsRequest>): string {
    const queryString = new URLSearchParams();
    if (filter.organizationId) {
      queryString.set('organizationId', filter.organizationId);
    }
    if (filter.systemId) {
      queryString.set('systemId', filter.systemId);
    }
    if (filter.name) {
      queryString.set('name', filter.name);
    }
    if (filter.State) {
      queryString.set('state', filter.State);
    }

    queryString.set('pagenumber', filter?.pageNumber?.toString() ?? '1');
    queryString.set('pagesize', filter?.pageSize?.toString() ?? '100');

    return `${inventoryApiEndPoint}?${queryString.toString()}`;
  }
}
