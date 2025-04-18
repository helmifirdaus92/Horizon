/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export interface AppEnvironment {
  production: boolean;
  systemLang: string;
  personalizationIntegrationConnectedMode: boolean;
  analyticsIntegrationConnectedMode: boolean;
  inventoryConnectedMode: boolean;
  localXmCloudUrl: string | null;
  isLocalXM: boolean;
  gainsightDisabled: boolean;
  elasticApmDisabled: boolean;
  feaaSDisabled: boolean;
  settingsNavigationEnabled: boolean;
  customExtensions: string | null;
  sitesApiEnabled: boolean;
}
