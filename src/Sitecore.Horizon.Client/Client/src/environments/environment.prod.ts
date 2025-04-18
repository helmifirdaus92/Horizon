/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { AppEnvironment } from './app-environment.interface';
import {
  restoreConnectedModeFromStorage,
  restoreCustomExtensionCatalog,
  restoreElasticApmDisabledFromStorage,
  restoreFEaaSDisabledStagingFromStorage,
  restoreGainsightDisabledFromStorage,
  restoreInventoryConnectedModeFromStorage,
  restoreIsLocalXMSettingsFromStorage,
  restoreLocalXmCloudUrlFromStorage,
  restoreSettingsNavigationEnabledFromStorage,
  restoreSitesApiEnabled,
} from './env.utils';

export const environment: AppEnvironment = {
  production: true,
  systemLang: 'en',
  personalizationIntegrationConnectedMode: restoreConnectedModeFromStorage(),
  analyticsIntegrationConnectedMode: restoreConnectedModeFromStorage(),
  inventoryConnectedMode: restoreInventoryConnectedModeFromStorage(),
  localXmCloudUrl: restoreLocalXmCloudUrlFromStorage(),
  isLocalXM: restoreIsLocalXMSettingsFromStorage(),
  gainsightDisabled: restoreGainsightDisabledFromStorage(),
  elasticApmDisabled: restoreElasticApmDisabledFromStorage(),
  feaaSDisabled: restoreFEaaSDisabledStagingFromStorage(),
  settingsNavigationEnabled: restoreSettingsNavigationEnabledFromStorage(),
  customExtensions: restoreCustomExtensionCatalog(),
  sitesApiEnabled: restoreSitesApiEnabled(),
};
