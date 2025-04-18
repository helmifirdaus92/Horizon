/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingReconnectableP2PConnection } from '@sitecore/horizon-messaging';
import { FieldChromeInfo } from '../messaging/horizon-canvas.contract.parts';
import { findClosestParentRendering } from '../utils/chrome';
import { calculateMaxDimensions, ElementDimensions } from '../utils/dom';
import { Chrome } from './chrome';
import { ChromeItemContext } from './chrome-item-context';

export class NonEditableFieldChrome extends Chrome {
  private _isPersonalized: boolean | undefined = undefined;

  constructor(
    chromeId: string,
    readonly element: HTMLElement,
    readonly fieldId: string,
    readonly fieldType: string,
    readonly itemContext: ChromeItemContext,
    displayName: string,
    rhsMessaging: MessagingReconnectableP2PConnection,
  ) {
    super(chromeId, displayName, [], rhsMessaging);
  }

  getDimensions(): ElementDimensions {
    return calculateMaxDimensions([this.element]);
  }

  getIsPersonalized(): boolean {
    if (this._isPersonalized !== undefined) {
      return this._isPersonalized;
    }

    const parentRendering = findClosestParentRendering(this);
    this._isPersonalized = !!parentRendering
      ? parentRendering.appliedPersonalizationActions?.some((action) => action === 'SetDataSourceAction')
      : false;
    return this._isPersonalized;
  }

  getChromeInfo(): FieldChromeInfo {
    return {
      chromeType: 'field',
      chromeId: this.chromeId,
      displayName: this.displayName,
      fieldId: this.fieldId,
      fieldType: this.fieldType,
      contextItem: this.itemContext,
      isPersonalized: this.getIsPersonalized(),
      parentRenderingChromeInfo: findClosestParentRendering(this)?.getChromeInfo(),
    };
  }

  select(): void {}

  sortMoveUp() {}
  sortMoveDown() {}
}
