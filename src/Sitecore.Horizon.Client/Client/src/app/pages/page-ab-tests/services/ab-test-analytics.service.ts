/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { StaticConfigurationService } from 'app/shared/configuration/static-configuration.service';
import { HostingEnvironmentService } from 'app/shared/hosting-environment/hosting-environment.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { abTestAnalyticsUrl } from 'app/shared/utils/utils';

@Injectable({
  providedIn: 'root',
})
export class AbTestAnalyticsService {
  constructor(
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly contextService: ContextService,
    private readonly staticConfigurationService: StaticConfigurationService,
    private readonly hostingEnvironmentService: HostingEnvironmentService,
    private readonly siteService: SiteService,
  ) {}

  async openAnalytics(friendlyId: string): Promise<void> {
    const siteId = this.siteService.getContextSite().id;
    const itemName = (await this.contextService.getItem()).name;
    const url =
      abTestAnalyticsUrl(
        friendlyId,
        itemName,
        siteId,
        this.featureFlagsService.isFeatureEnabled('pages_pocket-navigation'),
        this.staticConfigurationService.dashboardAppBaseUrl,
      ) + this.hostingEnvironmentService.addEnvironmentInfo();

    window.open(url, '_blank');
  }
}
