/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingReconnectableP2PConnection } from '@sitecore/horizon-messaging';
import { RenderingChromeInfo } from '../messaging/horizon-canvas.contract.parts';
import { calculateMaxDimensions, ElementDimensions, getElementsInBetween } from '../utils/dom';
import { Chrome } from './chrome';

export class UnknownPlaceholderChrome extends Chrome {
  constructor(
    chromeId: string,
    readonly startElement: Element,
    readonly endElement: Element,
    readonly placeholderName: string,
    displayName: string,
    childChromes: readonly Chrome[],
    rhsMessaging: MessagingReconnectableP2PConnection,
  ) {
    super(chromeId, displayName, childChromes, rhsMessaging);
  }

  getDimensions(): ElementDimensions {
    return calculateMaxDimensions(getElementsInBetween(this.startElement, this.endElement));
  }
  getIsPersonalized(): boolean {
    return false;
  }
  getChromeInfo(): RenderingChromeInfo {
    throw new Error(`Can't get chrome info for unknown placeholder chrome with ${this.placeholderName}`);
  }
  select(): void {}
  sortMoveUp?(): void {}
  sortMoveDown?(): void {}
}
