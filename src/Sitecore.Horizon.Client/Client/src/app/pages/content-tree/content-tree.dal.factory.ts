/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { BaseContentTreeDalService } from './content-tree.service';
import { ContentTreeDalService } from './graphql/content-tree.dal.service';
import { ContentTreeRestDalService } from './rest/content-tree.rest.dal.service';

export function contentTreeDalServiceFactory(featureFlagsService: FeatureFlagsService) {
  if (featureFlagsService.isXmAppsLhsTreeApiEnabledAndSupported()) {
    return new ContentTreeRestDalService();
  }
  return new ContentTreeDalService();
}

export const contentTreeDalServiceProvider = {
  provide: BaseContentTreeDalService,
  useFactory: contentTreeDalServiceFactory,
  deps: [FeatureFlagsService],
};
