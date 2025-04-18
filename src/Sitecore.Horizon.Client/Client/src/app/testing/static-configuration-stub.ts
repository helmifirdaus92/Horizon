/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable, NgModule } from '@angular/core';
import { Tenant } from 'app/authentication/library/tenant/tenant.types';
import { StaticConfigurationService } from 'app/shared/configuration/static-configuration.service';

export function getMockTenants(): Tenant[] {
  return [
    {
      name: 'Tenant1',
      annotations: {},
      id: 'Tenant1Id',
      displayName: 'Tenant1DisplayName',
      organizationId: 'sample-org',
      labels: {},
      systemId: '321',
      state: 'Active',
    },
    {
      name: 'Tenant2',
      annotations: {},
      id: 'Tenant2Id',
      displayName: 'Tenant2DisplayName',
      organizationId: 'sample-org',
      labels: {},
      systemId: '321',
      state: 'Active',
    },
    {
      name: 'Tenant3',
      annotations: {},
      id: 'Tenant3Id',
      displayName: 'Tenant3DisplayName',
      organizationId: 'sample-org',
      labels: {},
      systemId: '321',
      state: 'Active',
    },
  ];
}

@Injectable()
export class StaticConfigurationServiceStub implements Partial<StaticConfigurationService> {
  cdpApiUrl = 'https://sample-api-url.com/';
  cdpAppUrl = 'https://sample-app-url.com/';
  dashboardAppBaseUrl = 'https://dashboard-app-url.com/';
  portalBaseUrl = 'https://portal-app-url.com';
  formsApiBaseUrl = 'https://form-app-url.com';
  inventoryApiBaseUrl = 'https://inventory-api-url.com/';
  featureFlagsBaseUrl = 'https://feature-flags-api-url.com/';
  xMDeployAppApiBaseUrl = 'https://deploy-app-api-url.com/';
  xMDeployAppBaseUrl = 'https://deploy-app-url.com/';
  explorerAppBaseUrl = 'https://explorer-app-url.com/';
  xMAppsApiBaseUrl = 'https://sites-api-url.com/';
  analyticsBaseUrl = 'https://analytics.api.com';
  analyticsRegionsMapper = {
    euw: '-eu-west-1-',
    use: '.us-east-1.',
    usw: '.us-east-1.',
    jpe: '.ap-northeast-1.',
    aue: '-ap-southeast-2-',
    sg: '-ap-southeast-2-',
    Default: '-eu-west-1-',
  };
  environment = 'production';
  xMCloudSystemId = '321';
  auth0Settings = {
    domain: 'https://pages.sitecore-test.cloud',
    clientId: '123',
    audience: 'https://audience.sitecore-test.cloud',
  };
  genAiApiUrls = {
    baseUrl: 'https://ai.sitecore-test.cloud',
  };
  gainsightProductKey = 'AP-BR1SACAOWQ2G-2-4';
  organization = 'sample-org';
  isStagingEnvironment = false;
  genAiApiBaseUrl = 'https://ai.sitecore-test.cloud/';
  brandManagementBaseUrl = 'https://brand.sitecore-test.cloud/';
  init() {}
}

@NgModule({
  providers: [
    { provide: StaticConfigurationServiceStub, useClass: StaticConfigurationServiceStub },
    { provide: StaticConfigurationService, useExisting: StaticConfigurationServiceStub },
  ],
})
export class StaticConfigurationServiceStubModule {}
