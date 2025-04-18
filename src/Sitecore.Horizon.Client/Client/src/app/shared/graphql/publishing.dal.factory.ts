/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { PublishingRestDalService } from '../rest/publishing/publishing.rest.dal.service';
import { BasePublishingDalService, PublishingDalService } from './publishing.dal.service';

export function publishingDalServiceFactory(featureFlagsService: FeatureFlagsService) {
  if (featureFlagsService.isXmAppsRestApiEnabledAndSupported()) {
    return new PublishingRestDalService();
  }
  return new PublishingDalService();
}

export const publishingDalServiceProvider = {
  provide: BasePublishingDalService,
  useFactory: publishingDalServiceFactory,
  deps: [FeatureFlagsService],
};
