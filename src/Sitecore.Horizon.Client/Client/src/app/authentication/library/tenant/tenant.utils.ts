/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import {
  CdpTenantInfo,
  StreamTenantInfo,
  StreamTenantsAnnotations,
  StreamTenantsLabels,
  Tenant,
  TenantsAnnotation,
  TenantsLabels,
  XmCloudTenantInfo,
} from './tenant.types';

export function parseXmCloudTenantAnnotations(
  xmCloudTenant: Tenant | null,
  gqlServiceUri: string = '',
): XmCloudTenantInfo | null {
  if (!xmCloudTenant) {
    return null;
  }
  const url = xmCloudTenant.annotations[TenantsAnnotation.url];
  const projectId = xmCloudTenant.annotations[TenantsAnnotation.projectId];
  if (!url || !projectId) {
    return null;
  }

  return {
    id: xmCloudTenant.id,
    name: xmCloudTenant.name,
    displayName: xmCloudTenant.displayName,
    organizationId: xmCloudTenant.organizationId,
    url: new URL(url).origin.toString() + '/',
    gqlEndpointUrl: url + gqlServiceUri,
    cdpEmbeddedTenantId: xmCloudTenant.annotations[TenantsAnnotation.cdpEmbeddedTenantId],
    aiEmbeddedTenantID: xmCloudTenant.annotations[TenantsAnnotation.aiEmbeddedTenantID],
    customerEnvironmentType: xmCloudTenant.annotations[TenantsAnnotation.customerEnvironmentType],
    environmentId: xmCloudTenant.annotations[TenantsAnnotation.environmentId],
    environmentName: xmCloudTenant.annotations[TenantsAnnotation.environmentName],
    projectId,
    projectName: xmCloudTenant.annotations[TenantsAnnotation.projectName],
    regionCode: xmCloudTenant.labels[TenantsLabels.RegionCode],
  };
}

export function parseCdpCloudTenantAnnotations(cdpTenant: Tenant | null): CdpTenantInfo | null {
  if (!cdpTenant) {
    return null;
  }

  const apiUrl = cdpTenant.annotations[TenantsAnnotation.cdpApiURL];
  const appUrl = cdpTenant.annotations[TenantsAnnotation.url];

  if (!apiUrl || !appUrl) {
    return null;
  }

  return {
    id: cdpTenant.id,
    name: cdpTenant.name,
    displayName: cdpTenant.displayName,
    organizationId: cdpTenant.organizationId,
    apiUrl,
    appUrl,
    analyticsAppUrl: appUrl.replace('app-personalize', 'analytics'),
  };
}

export function parseStreamTenant(streamTenant: Tenant | null): StreamTenantInfo | null {
  if (!streamTenant) {
    return null;
  }

  return {
    id: streamTenant.id,
    name: streamTenant.name,
    displayName: streamTenant.displayName,
    organizationId: streamTenant.organizationId,
    url: streamTenant.annotations[StreamTenantsAnnotations.url],
    aiEdition: streamTenant.labels[StreamTenantsLabels.aiEdition] ?? 'free',
    aiType: streamTenant.labels[StreamTenantsLabels.aiType],
    aiTier: streamTenant.labels[StreamTenantsLabels.aiTier],
    regionCode: streamTenant.labels[TenantsLabels.RegionCode],
  };
}
