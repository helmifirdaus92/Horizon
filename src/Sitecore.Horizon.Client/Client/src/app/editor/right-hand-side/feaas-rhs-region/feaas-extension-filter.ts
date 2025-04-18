/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';

export const FEAAS_RENDERING_ID = 'CAA0C742-F052-49FB-825B-A03494798DB7'.toLowerCase();
export const BYOC_RENDERING_ID = 'DDC43BE7-D77A-4CE3-9282-03DD036EEC6D'.toLowerCase();

export function isFeaasRendering(chromeInfo: ChromeInfo | undefined) {
  if (!chromeInfo || chromeInfo.chromeType !== 'rendering') {
    return false;
  }

  return (
    chromeInfo.renderingDefinitionId.toLowerCase() === FEAAS_RENDERING_ID ||
    chromeInfo.renderingDefinitionId.toLowerCase() === BYOC_RENDERING_ID
  );
}
