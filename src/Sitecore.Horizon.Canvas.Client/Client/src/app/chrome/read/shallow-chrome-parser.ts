/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { resolveRenderingDisplayName } from '../../frame/utils';
import { MessagingService } from '../../messaging/messaging-service';
import { EditingDataService } from '../../services/editing-data.service';
import { ensureFieldValueElementWrapped } from '../../utils/chrome';
import { Chrome } from '../chrome';
import { ChromeInlineEditorFactory } from '../chrome-inline-editor-factory';
import { ChromeReader } from '../chrome-reader';
import { FieldChrome } from '../chrome.field';
import { NonEditableFieldChrome } from '../chrome.non-editable-field';
import { PlaceholderChrome } from '../chrome.placeholder';
import { RenderingChrome } from '../chrome.rendering';
import { UnknownPlaceholderChrome } from '../chrome.unknown-placeholder';
import { UnknownRenderingChrome } from '../chrome.unknown-rendering';
import { createFieldHandler } from '../fields/field-handler.factory';
import { ContextItemInfo, MarkupChrome } from './chrome-data-types';
import { ChromeParser } from './chrome-parser';

// Matches a placeholder chrome id, which has "<String>_<GUID>" format,
// where <String> is placeholder name and <GUID> is parent rendering uid
// Example: "container_c38cccfe-f4e7-4cf4-81a3-fc3675a29fcd"
const PLACEHOLDER_CHROME_ID_REGEX =
  /(.*)_((\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}){1}$/m;

interface FieldChromeMetadata {
  fieldId: string;
  fieldType: string;
  rawValue: string;
  datasource: ContextItemInfo;
  title: string;
}

export class ShallowChromeParser extends ChromeParser {
  constructor(
    private readonly inlineEditorFactory: ChromeInlineEditorFactory,
    private readonly messaging: MessagingService,
    private readonly abortController: AbortController,
    private readonly editingDataService: EditingDataService,
  ) {
    super();
  }
  async parseRenderingChrome(
    openChrome: MarkupChrome,
    closeChrome: MarkupChrome,
    childChromes: readonly Chrome[],
  ): Promise<RenderingChrome | UnknownRenderingChrome> {
    const editingData = await this.editingDataService.getEditingData();
    const openChromeId = openChrome.element.getAttribute('id') ?? '';

    const editChromeInstance = editingData.renderings.find((r) => {
      return this.normalizeGuid(r.renderingUid) === this.normalizeGuid(openChromeId ?? '');
    });

    const rhsMessaging = this.createRhsMessaging();

    if (!editChromeInstance) {
      return new UnknownRenderingChrome(
        ChromeReader.buildChromeId(this.normalizeGuid(openChromeId), 'rendering'),
        openChrome.element,
        closeChrome.element,
        openChromeId,
        'Unknown rendering',
        childChromes,
        rhsMessaging,
      );
    }

    const chromeData = editChromeInstance.chromeData;

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
    const rhsMessaging = this.createRhsMessaging();
    const phChromeElementId = openChrome.element.getAttribute('id') ?? '';
    const matches = PLACEHOLDER_CHROME_ID_REGEX.exec(phChromeElementId);
    if (!matches || !matches[1] || !matches[2]) {
      return new UnknownPlaceholderChrome(
        ChromeReader.buildChromeId(this.normalizeGuid(phChromeElementId), 'rendering'),
        openChrome.element,
        closeChrome.element,
        phChromeElementId,
        `Unknown placeholder chrome with id ${phChromeElementId}`,
        childChromes,
        rhsMessaging,
      );
    }

    const placeholderName = matches[1];
    const parentRenderingUid = matches[2];

    const editingData = await this.editingDataService.getEditingData();
    const editChromeInstance = editingData.placeholders.find((ph) => {
      return ph.placeholderName === placeholderName && ph.renderingUid === parentRenderingUid;
    });

    if (!editChromeInstance) {
      return new UnknownPlaceholderChrome(
        ChromeReader.buildChromeId(this.normalizeGuid(phChromeElementId), 'rendering'),
        openChrome.element,
        closeChrome.element,
        placeholderName,
        'Unknown placeholder',
        childChromes,
        rhsMessaging,
      );
    }

    const chromeData = editChromeInstance.chromeData;

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

  async parseFieldChrome(openChrome: MarkupChrome, closeChrome?: MarkupChrome | undefined): Promise<FieldChrome | NonEditableFieldChrome> {
    const chromeData = this.parseChromeData<FieldChromeMetadata>(openChrome);
    // Normalize value, so that rest application will not have to deal with casing.
    chromeData.fieldType = chromeData.fieldType.toLowerCase();
    // Normalize guid fields
    chromeData.fieldId = this.normalizeGuid(chromeData.fieldId);
    chromeData.datasource.id = this.normalizeGuid(chromeData.datasource.id);

    const valueElement = ensureFieldValueElementWrapped(chromeData.fieldType, openChrome, closeChrome);
    const rhsMessaging = this.createRhsMessaging();

    const editingData = await this.editingDataService.getEditingData();
    const editableField = editingData.fields.find(
      (field) =>
        this.normalizeGuid(field.fieldId) === chromeData.fieldId &&
        this.normalizeGuid(field.itemId) === chromeData.datasource.id &&
        field.language === chromeData.datasource.language &&
        field.version === chromeData.datasource.version,
    );
    if (!editableField) {
      return new NonEditableFieldChrome(
        ChromeReader.buildChromeId(this.normalizeGuid(chromeData.fieldId), 'field'),
        valueElement,
        chromeData.fieldId,
        chromeData.fieldType,
        chromeData.datasource,
        chromeData.title,
        rhsMessaging,
      );
    }

    const rawValueHolder = document.createElement('input');
    rawValueHolder.value = editableField.rawValue;
    const fieldHandler = createFieldHandler(
      chromeData.fieldType,
      valueElement,
      rawValueHolder,
      rhsMessaging,
      this.messaging,
      this.abortController,
    );
    await fieldHandler.init();

    return new FieldChrome(
      ChromeReader.buildChromeId(this.normalizeGuid(chromeData.fieldId), 'field'),
      valueElement,
      chromeData.fieldId,
      chromeData.fieldType,
      editableField.containsStandardValue,
      chromeData.datasource,
      fieldHandler,
      chromeData.title,
      rhsMessaging,
    );
  }
}
