/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CdpTenantInfo, StreamTenantInfo, XmCloudTenantInfo } from './library/tenant/tenant.types';
import {
  parseCdpCloudTenantAnnotations,
  parseStreamTenant,
  parseXmCloudTenantAnnotations,
} from './library/tenant/tenant.utils';

export function getXMCloutTenantMock(
  systemId: string,
  organizationId: string,
  url: string,
  gqlPath: string,
  cdpTenantId: string,
): XmCloudTenantInfo | null {
  return parseXmCloudTenantAnnotations(
    {
      id: 'test-tenant-id',
      name: 'local-xm-cloud-instance',
      displayName: 'Local XM Cloud instance',
      organizationId,
      systemId,
      annotations: {
        URL: url,
        'XMCloud.ProjectName': 'SampleProjectName',
        'XMCloud.ProjectId': 'SampleProjectId',
        'XMCloud.EnvironmentName': 'SampleEnvironment',
        'XMCloud.CustomerEnvironmentType': 'nonprod',
        'XMCloud.CDPEmbeddedTenantID': cdpTenantId,
      },
      labels: {
        CustomerEnvironmentType: 'nonprod',
        Environment: 'dev',
        ProductCode: 'XMCloud',
        Region: 'West-Europe',
      },
      state: 'Active',
    },
    gqlPath,
  );
}

export function getCDPTenantMock(): CdpTenantInfo | null {
  return parseCdpCloudTenantAnnotations({
    id: 'cdp-tenant-id',
    systemId: 'a0725c5c-05a4-4c2f-a784-f53b2781f84a',
    name: 'pages-eu-dev',
    displayName: 'Pages Demo Organization DEV',
    organizationId: 'org_FzUOtp4HjfZYw1Hv',
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
  });
}

export function getStreamTenantMock(): StreamTenantInfo | null {
  return parseStreamTenant({
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
  });
}
