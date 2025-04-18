/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StaticConfigurationService } from './static-configuration.service';

@Component({
  template: `<div [innerHTML]="config"></div>`,
})
class TestingComponent {
  config: SafeHtml | null = this.sanitizer.bypassSecurityTrustHtml(`
   <script id="horizon-host-config">
     {
      "inventoryApiBaseUrl": "https://platform-inventory-staging.sitecore-staging.cloud/",
      "xmCloudSystemId": "8db0ad22-445f-43fb-8d8e-f23c9396c974",
      "dashboardBaseUrl": "https://dashboard-app",
      "portalBaseUrl": "https://portal-app-url.com",
      "formsApiBaseUrl": "https://forms-app-url.com",
      "xmDeployAppApiBaseUrl": "https://xmclouddeploy-api-staging.sitecore-staging.cloud",
      "xmAppsApiBaseUrl": "https://sites-api-url.com",
      "analyticsBaseUrl": "https://engage-analytics{region}production.boxever.com",
      "analyticsRegionsMapper": "euw=-eu-west-1-;use=.us-east-1.;usw=.us-east-1.;jpe=.ap-northeast-1.;aue=-ap-southeast-2-;sg=-ap-southeast-2-;Default=-eu-west-1-",
      "auth0Settings": {
        "domain": "https://pages-staging.sitecore-staging.cloud/",
        "clientId": "clientId",
        "audience": "https://api-staging.sitecore-staging.cloud"
      },
      "genAiApiUrls": {
        "baseUrl": "https://ai.sitecore-test.cloud"
      },
      "brandManagementBaseUrl": "https://brand-management-api-test.cloud"
    }
   </script>
   `);

  configWithNoAuthSettings = this.sanitizer.bypassSecurityTrustHtml(`
   <script id="horizon-host-config">
     {
       "dashboardBaseUrl": "https://dashboard-app",
       "portalBaseUrl": "https://portal-app-url.com",
       "formsApiBaseUrl": "https://forms-app-url.com",
       "xmAppsApiBaseUrl": "https://sites-api-url.com",
       "inventoryApiBaseUrl": "https://platform-inventory-staging.sitecore-staging.cloud/",
       "xmCloudSystemId": "8db0ad22-445f-43fb-8d8e-f23c9396c974"
      }
   </script>
   `);
  constructor(private readonly sanitizer: DomSanitizer) {}
}

describe(StaticConfigurationService.name, () => {
  let sut: StaticConfigurationService;
  let fixture: ComponentFixture<TestingComponent>;
  let testComponent: TestingComponent;

  beforeEach(() => {
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TestingComponent],
        providers: [StaticConfigurationService],
      });
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestingComponent);
    testComponent = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should be created', () => {
    sut = new StaticConfigurationService();

    expect(sut).toBeTruthy();
  });

  it('should parse config', () => {
    sut = new StaticConfigurationService();

    expect(sut.dashboardAppBaseUrl).toBe('https://dashboard-app');
    expect(sut.portalBaseUrl).toBe('https://portal-app-url.com');
    expect(sut.formsApiBaseUrl).toBe('https://forms-app-url.com');
    expect(sut.xMAppsApiBaseUrl).toBe('https://sites-api-url.com');
    expect(sut.auth0Settings.audience).toBe('https://api-staging.sitecore-staging.cloud');
    expect(sut.auth0Settings.clientId).toBe('clientId');
    expect(sut.auth0Settings.domain).toBe('https://pages-staging.sitecore-staging.cloud/');
    expect(sut.xMCloudSystemId).toBe('8db0ad22-445f-43fb-8d8e-f23c9396c974');
    expect(sut.genAiApiUrls.baseUrl).toBe('https://ai.sitecore-test.cloud');
    expect(sut.analyticsBaseUrl).toBe('https://engage-analytics-eu-west-1-production.boxever.com');
    expect(sut.brandManagementBaseUrl).toBe('https://brand-management-api-test.cloud');
    expect(sut.analyticsRegionsMapper).toEqual({
      euw: '-eu-west-1-',
      use: '.us-east-1.',
      usw: '.us-east-1.',
      jpe: '.ap-northeast-1.',
      aue: '-ap-southeast-2-',
      sg: '-ap-southeast-2-',
      Default: '-eu-west-1-',
    });
  });

  describe(`Error handling`, () => {
    it(`should throw an error IF there's no config`, () => {
      testComponent.config = null;
      fixture.detectChanges();

      expect(() => new StaticConfigurationService()).toThrow(
        new Error('Host config is missing in markup. App is broken.'),
      );
    });

    it(`should throw an error IF auth settings are missing`, () => {
      testComponent.config = testComponent.configWithNoAuthSettings;
      fixture.detectChanges();

      expect(() => new StaticConfigurationService()).toThrow(
        new Error('Auth config is missing in markup. App is broken.'),
      );
    });
  });
});
