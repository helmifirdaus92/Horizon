/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';

export const LAYOUT_CONTAINER_RENDERING_ID = '2C3F134C-598D-4E2D-87F4-08B0EB0D5C3E'.toLowerCase();

export function isLayoutContainerRendering(chromeInfo: ChromeInfo | undefined) {
  if (!chromeInfo || chromeInfo.chromeType !== 'rendering') {
    return false;
  }

  return chromeInfo.renderingDefinitionId.toLowerCase() === LAYOUT_CONTAINER_RENDERING_ID;
}
