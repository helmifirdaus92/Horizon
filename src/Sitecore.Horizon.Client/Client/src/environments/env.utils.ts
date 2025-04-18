/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export function restoreConnectedModeFromStorage() {
  return !localStorage.getItem('Sitecore.Horizon.DisconnectedMode');
}

export function restoreSiteSwitcherModeFromStorage() {
  return !localStorage.getItem('Sitecore.Horizon.SiteSwitcherDevMode');
}

export function restoreInventoryConnectedModeFromStorage() {
  return !localStorage.getItem('Sitecore.Horizon.InventoryDisconnectedMode');
}

export function restoreLocalXmCloudUrlFromStorage() {
  return localStorage.getItem('Sitecore.Pages.LocalXmCloudUrl');
}

export function restoreIsLocalXMSettingsFromStorage() {
  return !!localStorage.getItem('Sitecore.Pages.IsLocalXM');
}

export function restoreGainsightDisabledFromStorage() {
  return !!localStorage.getItem('Sitecore.Pages.GainsightDisabled');
}

export function restoreElasticApmDisabledFromStorage() {
  return !!localStorage.getItem('Sitecore.Pages.ElasticApmDisabled');
}

export function restoreFEaaSDisabledStagingFromStorage() {
  return !!localStorage.getItem('Sitecore.Pages.FeaaSDisabled');
}

export function restoreSettingsNavigationEnabledFromStorage() {
  return !!localStorage.getItem('Sitecore.Pages.SettingsNavigationEnabled');
}

export function restoreCustomExtensionCatalog() {
  return localStorage.getItem('Sitecore.Pages.CustomExtensions');
}

export function restoreSitesApiEnabled() {
  return !!localStorage.getItem('Sitecore.Pages.SitesAPIEnabled');
}
