/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';

import { VersionsDalRestService } from './rest/versions.dal.rest.service';
import { BaseVersionsDalService, VersionsDalService } from './versions.dal.service';

export function versionsDalFactory(featureFlagsService: FeatureFlagsService) {
  if (featureFlagsService.isXmAppsRestApiEnabledAndSupported()) {
    return new VersionsDalRestService();
  }
  return new VersionsDalService();
}

export const versionsDalServiceProvider = {
  provide: BaseVersionsDalService,
  useFactory: versionsDalFactory,
  deps: [FeatureFlagsService],
};
