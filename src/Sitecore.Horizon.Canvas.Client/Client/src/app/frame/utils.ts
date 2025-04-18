/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { RenderingChromeData } from '../chrome/read/chrome-data-types';
import { AbTestComponentConfigurationStatus } from '../messaging/horizon-canvas.contract.parts';
import { PageStateReader } from '../page-state-reader';
import { TranslationService } from '../services/translation.service';

export function getAbTestTooltipMessage(abTestConfigurationStatus: AbTestComponentConfigurationStatus): string {
  switch (abTestConfigurationStatus) {
    case 'notEnabledOnTenant':
      return TranslationService.get('PERSONALIZE_NOT_CONFIGURED_ON_TENANT_MESSAGE');
    case 'noPOSIdentifierForSite':
      return TranslationService.get('NO_POS_IDENTIFIER_MESSAGE');
    case 'pagePersonalizationConfigured':
      return TranslationService.get('PERSONALIZE_CONFIGURE_ON_PAGE_MESSAGE');
    default:
      return TranslationService.get('PERSONALIZE_COMPONENT');
  }
}

export function resolveRenderingDisplayName(chromeData: RenderingChromeData): string {
  return chromeData.custom.appliedPersonalizationActions.includes('SetRenderingAction') || !chromeData.custom.FEaasComponentName
    ? chromeData.displayName
    : chromeData.custom.FEaasComponentName;
}

export function getIsoLanguage() {
  try {
    return PageStateReader.getPageState().language.split('-')[0] || 'en';
  } catch {
    return 'en';
  }
}
