/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

// eslint-disable-next-line max-classes-per-file
import { createVirtualP2PConnection, MessagingReconnectableP2PConnection } from '@sitecore/horizon-messaging';
import { Chrome } from '../chrome';
import { ChromeReader } from '../chrome-reader';
import { FieldChrome } from '../chrome.field';
import { NonEditableFieldChrome } from '../chrome.non-editable-field';
import { PlaceholderChrome } from '../chrome.placeholder';
import { RenderingChrome } from '../chrome.rendering';
import { UnknownPlaceholderChrome } from '../chrome.unknown-placeholder';
import { UnknownRenderingChrome } from '../chrome.unknown-rendering';
import { MarkupChrome } from './chrome-data-types';

export abstract class ChromeParser {
  abstract parseRenderingChrome(
    openChrome: MarkupChrome,
    closeChrome: MarkupChrome,
    childChromes: readonly Chrome[],
  ): Promise<RenderingChrome | UnknownRenderingChrome>;
  abstract parsePlaceholderChrome(
    openChrome: MarkupChrome,
    closeChrome: MarkupChrome,
    childChromes: readonly Chrome[],
  ): Promise<PlaceholderChrome | UnknownPlaceholderChrome>;
  abstract parseFieldChrome(openChrome: MarkupChrome, closeChrome?: MarkupChrome): Promise<FieldChrome | NonEditableFieldChrome>;

  protected createRhsMessaging(): MessagingReconnectableP2PConnection {
    return createVirtualP2PConnection({
      onMessage: () => () => {},
      postMessage: () => {},
    });
  }

  protected normalizeGuid(guid: string) {
    return guid.replace('{', '').replace('}', '').toLowerCase();
  }

  protected parseChromeData<TChromeInfo>(chrome: MarkupChrome): TChromeInfo {
    const rawContent = chrome.element.textContent;
    if (!rawContent) {
      throw Error(`[Chrome parsing] Chrome data is absent. Chrome: ${ChromeReader.printDiagChromeInfo(chrome)}`);
    }

    return JSON.parse(rawContent) as TChromeInfo;
  }
}
