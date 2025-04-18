/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';

export const FORM_WRAPPER_RENDERING_ID = '62DD1639-9F28-4040-8738-C886480B2127'.toLowerCase();

export function isFormWrapperRendering(chromeInfo: ChromeInfo | undefined) {
  if (!chromeInfo || chromeInfo.chromeType !== 'rendering') {
    return false;
  }

  return chromeInfo.renderingDefinitionId.toLowerCase() === FORM_WRAPPER_RENDERING_ID;
}
