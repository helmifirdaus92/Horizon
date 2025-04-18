/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TranslationSource } from '../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../messaging/messaging-service';

export function findTranslationInSource(key: string, source?: TranslationSource): string {
  if (!source || !key) {
    return key;
  }

  const wholeKeyResult = source[key];
  if (typeof wholeKeyResult === 'string') {
    return wholeKeyResult;
  }

  const keys = key.split('.');
  let result = key;
  let tmpSource = source;

  keys.forEach((level, index) => {
    const currentLevelResult = tmpSource[level];

    if (!currentLevelResult) {
      return;
    }

    if (typeof currentLevelResult === 'string' && index + 1 === keys.length) {
      result = currentLevelResult;
    } else {
      tmpSource = currentLevelResult as TranslationSource;
    }
  });

  return result;
}

export class TranslationService {
  private static source?: TranslationSource;

  constructor(private readonly messaging: MessagingService) {}

  static get(key: string): string {
    return findTranslationInSource(key, TranslationService.source);
  }

  async init() {
    await this.fetchSource();
  }

  private async fetchSource() {
    TranslationService.source = await this.messaging.translationChannel.rpc.getTranslations();
  }
}
