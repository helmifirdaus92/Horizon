/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { BaseSaveDalService, SaveDalService } from './graphql/save.dal.service';
import { SaveRestDalService } from './rest/save.rest.dal.service';

export function saveDalServiceFactory(featureFlagsService: FeatureFlagsService) {
  if (featureFlagsService.isXmAppsRestApiEnabledAndSupported()) {
    return new SaveRestDalService();
  }

  return new SaveDalService();
}

export const saveDalServiceProvider = {
  provide: BaseSaveDalService,
  useFactory: saveDalServiceFactory,
  deps: [FeatureFlagsService],
};
