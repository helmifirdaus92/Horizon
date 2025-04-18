/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ItemDalRestService } from '../rest/item/item.dal.rest.service';
import { BaseItemDalService, ItemDalService } from './item.dal.service';

export function itemDalServiceFactory(featureFlagsService: FeatureFlagsService) {
  if (featureFlagsService.isXmAppsRestApiEnabledAndSupported()) {
    return new ItemDalRestService();
  }
  return new ItemDalService();
}

export const itemDalServiceProvider = {
  provide: BaseItemDalService,
  useFactory: itemDalServiceFactory,
  deps: [FeatureFlagsService],
};
