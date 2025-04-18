/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { SiteDalService, SolutionSiteDalService } from '../graphql/sites/solutionSite.dal.service';
import { SiteApiService } from '../rest/site/site.api.service';

export function siteDalServiceFactory(featureFlagsService: FeatureFlagsService) {
  if (featureFlagsService.isXmAppsSitesApiEnabledAndSupported()) {
    return new SiteApiService();
  }
  return new SolutionSiteDalService();
}

export const siteDalServiceProvider = {
  provide: SiteDalService,
  useFactory: siteDalServiceFactory,
  deps: [FeatureFlagsService],
};
