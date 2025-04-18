/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export interface Tenant {
  id: string;
  name: string;
  displayName: string;
  organizationId: string;
  labels: TenantLabels;
  annotations: TenantsAnnotations;
  systemId: string;
  state: 'Activating' | 'Active' | 'InActive';
}
export interface TenantLabels {
  [key: string]: string;
}
export interface TenantsAnnotations {
  [key: string]: string;
}

export enum TenantsAnnotation {
  url = 'URL',
  cdpEmbeddedTenantId = 'XMCloud.CDPEmbeddedTenantID',
  aiEmbeddedTenantID = 'TenantClaims.AIEmbeddedTenantID',
  cdpApiURL = 'apiURL',
  cdpClientKey = 'TenantClaims.cdp_client_key',
  customerEnvironmentType = 'XMCloud.CustomerEnvironmentType',
  environmentId = 'XMCloud.EnvironmentId',
  environmentName = 'XMCloud.EnvironmentName',
  projectId = 'XMCloud.ProjectId',
  projectName = 'XMCloud.ProjectName',
}

export enum TenantsLabels {
  CustomerEnvironmentType = 'CustomerEnvironmentType',
  environment = 'Environment',
  productCode = 'ProductCode',
  Region = 'Region',
  RegionCode = 'RegionCode',
}

export enum StreamTenantsAnnotations {
  url = 'url',
}

export enum StreamTenantsLabels {
  aiType = 'ai.type',
  aiTier = 'ai.tier',
  aiEdition = 'ai.edition',
}

export interface TenantBasicInfo {
  id: string;
  name: string;
  displayName: string;
  organizationId: string;
}

export interface XmCloudTenantInfo extends TenantBasicInfo {
  url: string;
  gqlEndpointUrl: string;
  cdpEmbeddedTenantId?: string;
  aiEmbeddedTenantID?: string;
  customerEnvironmentType?: string;
  environmentId?: string;
  environmentName?: string;
  projectId: string;
  projectName?: string;
  regionCode?: string;
}

export interface CdpTenantInfo extends TenantBasicInfo {
  apiUrl: string;
  appUrl: string;
  analyticsAppUrl: string;
}

export interface StreamTenantInfo extends TenantBasicInfo {
  aiType: string;
  aiTier: string;
  aiEdition: string;
  url: string;
  regionCode: string;
}
