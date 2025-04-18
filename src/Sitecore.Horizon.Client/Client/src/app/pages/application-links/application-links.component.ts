/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, OnInit } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { SiteSwitcherService } from 'app/editor/shared/site-language-switcher/site-language-switcher.service';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { StaticConfigurationService } from 'app/shared/configuration/static-configuration.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { getDashboardAppUrl } from 'app/shared/utils/utils';
import { environment } from 'environments/environment';
import { map } from 'rxjs';

@Component({
  selector: 'app-application-links',
  styleUrls: ['./application-links.component.scss'],
  templateUrl: './application-links.component.html',
})
export class ApplicationLinksComponent implements OnInit {
  dashboardSettingUrl = this.domSanitizer.bypassSecurityTrustUrl(
    getDashboardAppUrl(this.staticConfigurationService.dashboardAppBaseUrl, 'sites'),
  );
  isDevMode = !environment.production;

  pocketNavigation = {
    environment: this.staticConfigurationService.environment
      .replace('pre-production', 'preprod')
      .replace('production', 'prod'),
    tenant: ConfigurationService.tenantName,
    organization: ConfigurationService.organization,
    environmentId: ConfigurationService.xmCloudTenant?.environmentId,
    projectId: ConfigurationService.xmCloudTenant?.projectId,
    isEnabledAndValid:
      this.featureFlagsService.isFeatureEnabled('pages_pocket-navigation') &&
      !environment.localXmCloudUrl &&
      !!ConfigurationService.tenantName &&
      !!ConfigurationService.organization &&
      ConfigurationService.xmCloudTenant,
  };

  private readonly lifetime = new Lifetime();

  constructor(
    private readonly staticConfigurationService: StaticConfigurationService,
    private readonly domSanitizer: DomSanitizer,
    private readonly titleService: Title,
    private readonly siteSwitcherService: SiteSwitcherService,
    private readonly siteService: SiteService,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {}

  ngOnInit() {
    this.siteSwitcherService.site
      .pipe(
        takeWhileAlive(this.lifetime),
        map(
          (activeSite) =>
            this.siteService.getSites().find((s) => s.name.toLocaleLowerCase() === activeSite.toLocaleLowerCase())
              ?.displayName ?? activeSite,
        ),
      )
      .subscribe((siteName) => {
        const title = `${this.isDevMode ? 'Local | ' : ''}Edit: ${siteName + ' '}- XM Cloud`;

        this.titleService.setTitle(title);
      });
  }
}
