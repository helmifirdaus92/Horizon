/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { isSameGuid } from '../utils/utils';
import { Context } from './context.service';

export class ContextHelper {
  static get empty(): Context {
    return { itemId: '', siteName: '', language: '', deviceLayoutId: '', variant: undefined };
  }

  static areEqual(c1: Context, c2: Context) {
    return (
      // Either both values are falsy or it's the same value
      ((!c1.deviceLayoutId && !c2.deviceLayoutId) || c1.deviceLayoutId === c2.deviceLayoutId) &&
      isSameGuid(c1.itemId, c2.itemId) &&
      ((!c1.language && !c2.language) || c1.language === c2.language) &&
      ((!c1.siteName && !c2.siteName) || c1.siteName === c2.siteName) &&
      ((!c1.itemVersion && !c2.itemVersion) || c1.itemVersion === c2.itemVersion) &&
      ((!c1.variant && !c2.variant) || c1.variant === c2.variant)
    );
  }

  static areDifferent(c1: Context, c2: Context) {
    return !ContextHelper.areEqual(c1, c2);
  }

  static isComplete(context: Context) {
    return !!(context.itemId && context.language && context.siteName);
  }

  static isEmpty(context: Context) {
    return !context.itemId && !context.language && !context.siteName;
  }

  static contextState(context: Context) {
    if (ContextHelper.isEmpty(context)) {
      return 'empty';
    } else if (ContextHelper.isComplete(context)) {
      return 'complete';
    }
    return 'partial';
  }

  static removeEmptyFields({
    itemId,
    itemVersion,
    language,
    siteName,
    deviceLayoutId,
    variant: variant,
  }: Context): Partial<Context> {
    return {
      ...(itemId ? { itemId } : {}),
      ...(itemVersion ? { itemVersion } : {}),
      ...(language ? { language } : {}),
      ...(siteName ? { siteName } : {}),
      ...(deviceLayoutId ? { deviceLayoutId } : {}),
      ...(variant ? { variant } : {}),
    };
  }

  /**
   * merge c1 and c2 where c1 has precedence.
   */
  static merge(c1: Context, c2: Context): Context {
    return {
      itemId: c1.itemId || c2.itemId,
      itemVersion: c1.itemVersion || c2.itemVersion,
      language: c1.language || c2.language,
      siteName: c1.siteName || c2.siteName,
      variant: c1.variant || c2.variant,
    };
  }
}
