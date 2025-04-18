/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Tenant } from '../tenant/tenant.types';

export interface GetXmTenantRequest {
  organizationId: string;
  tenantName?: string;
}
export interface GetTenantsRequest {
  pageNumber?: number;
  pageSize?: number;
  organizationId?: string;
  systemId: string;
  name?: string;
  State: 'Active' | 'InActive';
}
export interface GetTenantsResponse {
  totalCount: number;
  pageSize: number;
  pageNumber: number;
  data: Tenant[];
}
