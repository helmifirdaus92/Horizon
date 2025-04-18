/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { resolveRenderingDisplayName } from '../../frame/utils';
import { MessagingService } from '../../messaging/messaging-service';
import { ensureFieldValueElementWrapped } from '../../utils/chrome';
import { Chrome } from '../chrome';
import { ChromeInlineEditorFactory } from '../chrome-inline-editor-factory';
import { ChromeReader } from '../chrome-reader';
import { FieldChrome } from '../chrome.field';
import { PlaceholderChrome } from '../chrome.placeholder';
import { RenderingChrome } from '../chrome.rendering';
import { UnknownPlaceholderChrome } from '../chrome.unknown-placeholder';
import { UnknownRenderingChrome } from '../chrome.unknown-rendering';
import { createFieldHandler } from '../fields/field-handler.factory';
import { FieldChromeData, MarkupChrome, PlaceholderChromeData, RenderingChromeData } from './chrome-data-types';
import { ChromeParser } from './chrome-parser';

export class InlineChromeParser extends ChromeParser {
  /**
   *
   */
  constructor(
    private readonly inlineEditorFactory: ChromeInlineEditorFactory,
    private readonly messaging: MessagingService,
    private readonly abortController: AbortController,
  ) {
    super();
  }

  async parseRenderingChrome(
    openChrome: MarkupChrome,
    closeChrome: MarkupChrome,
    childChromes: readonly Chrome[],
  ): Promise<RenderingChrome | UnknownRenderingChrome> {
    const chromeData = this.parseChromeData<RenderingChromeData>(openChrome);
    const rhsMessaging = this.createRhsMessaging();

    const inlineEditor = await this.inlineEditorFactory.createRenderingChromeEditor(
      openChrome.element,
      closeChrome.element,
      chromeData.custom.inlineEditor,
    );

    const displayName = resolveRenderingDisplayName(chromeData);

    return new RenderingChrome(
      ChromeReader.buildChromeId(this.normalizeGuid(chromeData.custom.renderingInstanceId), 'rendering'),
      openChrome.element,
      closeChrome.element,
      chromeData.custom.renderingInstanceId,
      chromeData.custom.renderingId,
      chromeData.custom.contextItem,
      chromeData.custom.appliedPersonalizationActions,
      chromeData.custom.compatibleRenderings,
      chromeData.custom.editable?.toLowerCase() === 'true',
      inlineEditor,
      displayName,
      childChromes,
      rhsMessaging,
      chromeData.custom.sxaSource,
    );
  }
  async parsePlaceholderChrome(
    openChrome: MarkupChrome,
    closeChrome: MarkupChrome,
    childChromes: readonly Chrome[],
  ): Promise<PlaceholderChrome | UnknownPlaceholderChrome> {
    const chromeData = this.parseChromeData<PlaceholderChromeData>(openChrome);
    const rhsMessaging = this.createRhsMessaging();

    return new PlaceholderChrome(
      ChromeReader.buildChromeId(chromeData.custom.placeholderKey, 'placeholder'),
      openChrome.element,
      closeChrome.element,
      chromeData.custom.placeholderKey,
      chromeData.custom.placeholderMetadataKeys ?? [],
      chromeData.custom.allowedRenderings ?? [],
      chromeData.custom.contextItem,
      chromeData.custom.editable?.toLowerCase() === 'true',
      chromeData.displayName,
      childChromes,
      rhsMessaging,
      this.abortController,
    );
  }

  async parseFieldChrome(openChrome: MarkupChrome, closeChrome?: MarkupChrome | undefined): Promise<FieldChrome> {
    if (openChrome.kind === 'open' && !!closeChrome) {
      return await this.parseWraplessFieldChrome(openChrome, closeChrome);
    }

    return await this.parseWrappedFieldChrome(openChrome);
  }

  private async parseWraplessFieldChrome(openChrome: MarkupChrome, closeChrome: MarkupChrome): Promise<FieldChrome> {
    const chromeData = this.parseChromeData<FieldChromeData>(openChrome);
    // Normalize value, so that rest application will not have to deal with casing.
    chromeData.custom.fieldType = chromeData.custom.fieldType.toLowerCase();

    const rawValueHolder = openChrome.element.previousElementSibling as HTMLInputElement;
    if (!rawValueHolder || !rawValueHolder.classList.contains('scFieldValue') || rawValueHolder.tagName.toLowerCase() !== 'input') {
      throw Error(`[Chrome parsing] Unable to find field value control. Chrome: ${ChromeReader.printDiagChromeInfo(openChrome)}`);
    }

    let valueElement = openChrome.element.nextElementSibling as HTMLElement;
    if (!valueElement || valueElement.nextElementSibling !== closeChrome.element) {
      throw Error(`[Chrome parsing] Unable to find field content element. Chrome: ${ChromeReader.printDiagChromeInfo(openChrome)}`);
    }
    valueElement = ensureFieldValueElementWrapped(chromeData.custom.fieldType, openChrome, closeChrome);

    const rhsMessaging = this.createRhsMessaging();
    const fieldHandler = createFieldHandler(
      chromeData.custom.fieldType,
      valueElement,
      rawValueHolder,
      rhsMessaging,
      this.messaging,
      this.abortController,
    );
    await fieldHandler.init();

    return new FieldChrome(
      ChromeReader.buildChromeId(this.normalizeGuid(chromeData.custom.fieldId), 'field'),
      valueElement,
      chromeData.custom.fieldId,
      chromeData.custom.fieldType,
      false,
      chromeData.custom.contextItem,
      fieldHandler,
      chromeData.displayName,
      rhsMessaging,
    );
  }

  private async parseWrappedFieldChrome(chrome: MarkupChrome) {
    const chromeData = this.parseChromeData<FieldChromeData>(chrome);
    // Normalize value, so that rest application will not have to deal with casing.
    chromeData.custom.fieldType = chromeData.custom.fieldType.toLowerCase();

    const rawValueHolder = chrome.element.previousElementSibling as HTMLInputElement;
    if (!rawValueHolder || !rawValueHolder.classList.contains('scFieldValue') || rawValueHolder.tagName.toLowerCase() !== 'input') {
      throw Error(`[Chrome parsing] Unable to find field value control. Chrome: ${ChromeReader.printDiagChromeInfo(chrome)}`);
    }

    const valueElement = chrome.element.nextElementSibling as HTMLElement;
    if (!valueElement || !valueElement.classList.contains('scWebEditInput')) {
      throw Error(`[Chrome parsing] Unable to find field content element. Chrome: ${ChromeReader.printDiagChromeInfo(chrome)}`);
    }

    const rhsMessaging = this.createRhsMessaging();
    const fieldHandler = createFieldHandler(
      chromeData.custom.fieldType,
      valueElement,
      rawValueHolder,
      rhsMessaging,
      this.messaging,
      this.abortController,
    );
    await fieldHandler.init();

    return new FieldChrome(
      `FIELD_${chromeData.custom.fieldId}`,
      valueElement,
      chromeData.custom.fieldId,
      chromeData.custom.fieldType,
      false,
      chromeData.custom.contextItem,
      fieldHandler,
      chromeData.displayName,
      rhsMessaging,
    );
  }
}
