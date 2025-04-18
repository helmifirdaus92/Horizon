/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { ChromeInfo } from '../messaging/horizon-canvas.contract.parts';
import { Context, ContextChangeOptions } from './context.service';

@Injectable({ providedIn: 'root' })
export class PageInteractionsGuardService {
  private _onBeforeContextChange?: (
    update: Partial<Context>,
    options: ContextChangeOptions,
  ) => Promise<{ update: Partial<Context>; options: ContextChangeOptions }>;
  private _onBeforeChromeSelectionChange?: (newChrome: ChromeInfo | undefined) => Promise<{ isAborted: boolean }>;

  onBeforeContextChange(
    update: Partial<Context>,
    options: ContextChangeOptions,
  ): Promise<{ update: Partial<Context>; options: ContextChangeOptions }> {
    if (!this._onBeforeContextChange) {
      return Promise.resolve({ update, options });
    }

    return this._onBeforeContextChange(update, options);
  }

  onBeforeChromeSelectionChange(newChrome: ChromeInfo | undefined): Promise<{ isAborted: boolean }> {
    if (!this._onBeforeChromeSelectionChange) {
      return Promise.resolve({ isAborted: false });
    }

    return this._onBeforeChromeSelectionChange(newChrome);
  }

  injectGuard(
    onBeforeContextChange: (
      update: Partial<Context>,
      options: ContextChangeOptions,
    ) => Promise<{ update: Partial<Context>; options: ContextChangeOptions }>,
    onBeforeChromeSelectionChange: (newChrome: ChromeInfo | undefined) => Promise<{ isAborted: boolean }>,
  ) {
    this._onBeforeContextChange = onBeforeContextChange;
    this._onBeforeChromeSelectionChange = onBeforeChromeSelectionChange;
  }

  releaseGuard() {
    this._onBeforeContextChange = undefined;
    this._onBeforeChromeSelectionChange = undefined;
  }
}
