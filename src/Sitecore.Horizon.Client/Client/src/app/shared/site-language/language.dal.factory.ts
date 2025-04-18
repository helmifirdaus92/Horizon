/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { LanguageDalBaseService, LanguageDalService } from '../graphql/language.dal.service';
import { LanguageApiService } from '../rest/language/language.api.service';

export function languageDalServiceFactory(featureFlagsService: FeatureFlagsService) {
  if (featureFlagsService.isXmAppsSitesApiEnabledAndSupported()) {
    return new LanguageApiService();
  }
  return new LanguageDalService();
}

export const languageDalServiceProvider = {
  provide: LanguageDalBaseService,
  useFactory: languageDalServiceFactory,
  deps: [FeatureFlagsService],
};
