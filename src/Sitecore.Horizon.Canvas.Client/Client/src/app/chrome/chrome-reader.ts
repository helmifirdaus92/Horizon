/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeType } from '../messaging/horizon-canvas.contract.parts';
import { Chrome, chromeInitSetId, chromeInitSetParent } from './chrome';
import { FieldChrome } from './chrome.field';
import { MarkupChrome } from './read/chrome-data-types';
import { ChromeParser } from './read/chrome-parser';

export class ChromeReader<TChromeParser extends ChromeParser> {
  private static readonly chromeSelector: string = 'code[type="text/sitecore"], .scChromeData';

  constructor(private readonly chromeParser: TChromeParser) {}

  public static buildChromeId(uniqueIdentifier: string, chromeType: ChromeType) {
    let chromeId = '';
    switch (chromeType) {
      case 'placeholder':
        chromeId = 'PLACEHOLDER_' + uniqueIdentifier;
        break;
      case 'rendering':
        chromeId = 'RENDERING_' + ChromeReader.normalizeGuid(uniqueIdentifier);
        break;
      case 'field':
        chromeId = 'FIELD_' + ChromeReader.normalizeGuid(uniqueIdentifier);
        break;
    }
    return chromeId;
  }

  private static normalizeGuid(guid: string) {
    return guid.replace('{', '').replace('}', '').toLowerCase();
  }

  private static isSupportedChrome(element: Element): boolean {
    // Check if it's an Edit Frame. We don't support those and competely skip them from Chrome hierarchy.
    if (
      element.classList.contains('scChromeData') &&
      !element.previousElementSibling &&
      element.parentElement &&
      element.parentElement.classList.contains('scLooseFrameZone')
    ) {
      return false;
    }

    return true;
  }

  private static parseMarkupChrome(element: Element): MarkupChrome {
    // Don't handle incorrect chromes. Suppose that known and valid chromes are present on the page only.

    let kind: 'open' | 'close' | 'inline';

    if (element.classList.contains('scChromeData')) {
      kind = 'inline';
    } else {
      kind = element.getAttribute('kind') as 'open' | 'close';
    }

    const chromeType = (element.getAttribute('chromeType') || 'field') as 'placeholder' | 'rendering' | 'field';

    return {
      kind,
      chromeType,
      element,
    };
  }

  public static printDiagChromeInfo(chrome: MarkupChrome) {
    const attributes = Array.from(chrome.element.getAttributeNames())
      .map((attrName) => `${attrName}='${chrome.element.getAttribute(attrName)}'`)
      .join(', ');

    return `<${chrome.element.tagName.toLowerCase()} ${attributes}>`;
  }

  async readChromes(root: Element): Promise<Chrome[]> {
    const allChromes = Array.from(root.querySelectorAll(ChromeReader.chromeSelector))
      .filter(ChromeReader.isSupportedChrome)
      .map(ChromeReader.parseMarkupChrome);

    const result: Chrome[] = [];
    const openChromesStack: { chrome: MarkupChrome; childChromes: Chrome[] }[] = [];

    const addParsedChrome = (chrome: Chrome) => {
      result.push(chrome);
      if (openChromesStack.length > 0) {
        openChromesStack[openChromesStack.length - 1].childChromes.push(chrome);
      }
    };

    for (const chrome of allChromes) {
      switch (chrome.kind) {
        case 'inline': {
          if (chrome.chromeType !== 'field') {
            throw Error(`[Chrome parsing] Inline chrome must be of 'field' type. Chrome: ${ChromeReader.printDiagChromeInfo(chrome)}`);
          }
          const parsedChrome = await this.chromeParser.parseFieldChrome(chrome);
          addParsedChrome(parsedChrome);

          break;
        }

        case 'open':
          openChromesStack.push({ chrome, childChromes: [] });
          break;

        case 'close': {
          const openChrome = openChromesStack.pop();
          if (!openChrome) {
            throw Error(`[Chrome parsing] Unable to find matching open chrome. Chrome: ${ChromeReader.printDiagChromeInfo(chrome)}`);
          }

          if (openChrome.chrome.chromeType !== chrome.chromeType) {
            const openChDiag = ChromeReader.printDiagChromeInfo(openChrome.chrome);
            const closeChDiag = ChromeReader.printDiagChromeInfo(chrome);
            throw Error(`[Chrome parsing] Close chrome mismatches the Open one. Open chrome: ${openChDiag}, Close chrome: ${closeChDiag}`);
          }

          // There could be scenarios when one field is nested inside other field.
          // For example, for a link field customer could use other field (e.g. text/image) as link content.
          // Canvas and Horizon app does not currently support this scenario and expects fields to be leave chromes only.
          // Therefore if we find that such a scenario occurs, we simply omit parent field chrome allowing client to interact
          // with the most nested chrome only.
          // If user clicks on the parent field, them will be interacting with the parent chrome (most likely the rendering).
          if (chrome.chromeType === 'field' && openChrome.childChromes.length > 0) {
            // If stack is not empty (i.e. there is a parent chrome for current chrome), move lift up our children.
            // This way our nested field will belong directly to the parent chrome (most likely the rendering).
            if (openChromesStack.length > 0) {
              openChromesStack[openChromesStack.length - 1].childChromes.push(...openChrome.childChromes);
            }

            break;
          }

          const parsedChrome = await this.parseOpenCloseChrome(openChrome.chrome, chrome, openChrome.childChromes);
          addParsedChrome(parsedChrome);
          break;
        }
      }
    }

    if (openChromesStack.length > 0) {
      throw Error(`[Chrome parsing] Not all the open chromes are matched.`);
    }

    // Wire up child-parent relations.
    for (const chrome of result) {
      chrome.childChromes.forEach((childChrome) => chromeInitSetParent(childChrome, chrome));
    }

    // For fields set ID relative to parent rendering, as field ID is not unique across page.
    // Additionally add a counter for cases when there is more than one occurance of same field within a rendering.
    // We cannot really know it's the same field after reload, but at least we can distinguish between them if rendering is not changed.
    const fldSeqCounter = new Map<string, number>();
    for (const chrome of result) {
      if (chrome instanceof FieldChrome) {
        const chromeId = `${chrome.parentChrome?.chromeId}/${chrome.chromeId}`;
        const seq = fldSeqCounter.get(chromeId) ?? 0;
        fldSeqCounter.set(chromeId, seq + 1);

        chromeInitSetId(chrome, `${chromeId}_${seq}`);
      }
    }

    return result;
  }

  private async parseOpenCloseChrome(
    openChrome: MarkupChrome,
    closeChrome: MarkupChrome,
    childChromes: readonly Chrome[],
  ): Promise<Chrome> {
    switch (closeChrome.chromeType) {
      case 'placeholder':
        return this.chromeParser.parsePlaceholderChrome(openChrome, closeChrome, childChromes);

      case 'rendering':
        return await this.chromeParser.parseRenderingChrome(openChrome, closeChrome, childChromes);

      case 'field':
        if (childChromes.length > 0) {
          const openChDiag = ChromeReader.printDiagChromeInfo(openChrome);
          const closeChDiag = ChromeReader.printDiagChromeInfo(closeChrome);
          throw Error(`Field chrome is not expected to have child chromes. Open chrome: ${openChDiag}, Close chrome: ${closeChDiag}`);
        }

        return this.chromeParser.parseFieldChrome(openChrome, closeChrome);
    }
  }
}
