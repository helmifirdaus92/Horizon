/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { MessagingP2PChannel, MessagingP2PChannelDefFromChannel } from '@sitecore/horizon-messaging';
import { Blot } from 'parchment/dist/src/blot/abstract/blot';
import Quill, { RangeStatic } from 'quill';
import { EventEmitter } from '../../../messaging/event-emitter';
import { FieldRawValue } from '../../../messaging/horizon-canvas.contract.parts';
import { ConfigurationService } from '../../../services/configuration.service';
import { TranslationService } from '../../../services/translation.service';
import { ElementDimensions, calculateMaxDimensions } from '../../../utils/dom';
import { isAbsoluteUrl, isXmcMediaRelativeUrl, makeAbsoluteUrl } from '../../../utils/url';
import { FieldHandler, RhsFieldEditorMessaging } from '../../chrome.field';
import style from '../watermark.scss';
import { HrzRichTextHtml5Video } from './rich-text-html5-video';
import { HrzRichTextImage } from './rich-text-image';
import { HrzRichTextLineBreak, lineBreakMatcher, removeExtraneousLineBreak } from './rich-text-line-break';
import { HrzRichTextLink } from './rich-text-link';
import { readEditorHTML } from './rich-text-read-html';
import { ScrollOverride } from './rich-text-scroll';

const CHROME_ADDITIONAL_WIDTH = 10;

export type RhsChannel = MessagingP2PChannel<
  // Inbound events
  {},
  // Outbound events
  {
    'selection:change': {
      format: Record<string, any>;
      hasSelection: boolean;
    };
  },
  // Remote RPC services
  {},
  // Provided RPC services
  {
    getSelection(): {
      format: Record<string, any>;
      hasSelection: boolean;
    };
    setFormatting(options: Record<string, any>): void;
    clearFormatting(): void;
    insertHtmlAtCaretPos(html: string): void;
    getValue(): string;
    setValue(rawValue: string): void;
  }
>;

export const RhsChannelDef: MessagingP2PChannelDefFromChannel<RhsChannel> = {
  name: 'general',
};

// Copied from Quill to be able to operate with linkRange
// https://github.com/quilljs/quill/blob/develop/core/selection.js
class Range {
  constructor(
    public readonly index: number,
    public readonly length = 0,
  ) {}
}

// Inspired by Quill => theme Snow => Tooltip
// We need to have access to the selection parent link.
// https://github.com/quilljs/quill/blob/develop/themes/snow.js#L46
// https://github.com/quilljs/parchment/blob/master/src/blot/abstract/container.ts
//
// `descendant` works as a matcher and returns "parent" link if selection/cursor is within an existed link
// When click or select not a link, it will return [null, -1]
interface ExtendedBlot extends Blot {
  descendant: (arg0: typeof HrzRichTextLink, arg1: number) => [HrzRichTextLink, number];
}

// eslint-disable-next-line max-classes-per-file
export class RichTextFieldHandler implements FieldHandler {
  private static isQuillCustomized = false;

  readonly onEnter = new EventEmitter();
  readonly onLeave = new EventEmitter();
  readonly onSizeChange = new EventEmitter();
  readonly onSelect = new EventEmitter();
  readonly onChange = new EventEmitter<{ value: FieldRawValue; debounce: boolean }>();

  private parser = new DOMParser();

  private readonly messaging: RhsChannel;

  private richTextEditor: Quill;

  private linkRange?: Range;

  private static customizeQuill(): void {
    if (RichTextFieldHandler.isQuillCustomized) {
      return;
    }
    RichTextFieldHandler.isQuillCustomized = true;

    Quill.debug('error');

    // Needed to enable 'left' option and setting custom prefixes to block formats
    const Aligns = Quill.import('formats/align');
    Aligns.whitelist = ['left', ...Aligns.whitelist];
    Aligns.keyName = 'rte-align';
    Quill.register(Aligns, true);

    const Indents = Quill.import('formats/indent');
    Indents.keyName = 'rte-indent';
    Quill.register(Indents, true);

    // Extend link attributes
    Quill.register(HrzRichTextLink);

    // Add support for HTML5 video tag
    Quill.register(HrzRichTextHtml5Video);

    // Preserve style attribute
    Quill.register(HrzRichTextImage);

    // Prevent quill to format <br> tags
    Quill.register(HrzRichTextLineBreak);
  }

  constructor(
    private readonly element: Element,
    private readonly rawValueHolder: HTMLInputElement,
    rhsMessaging: RhsFieldEditorMessaging,
    private readonly abortController: AbortController,
  ) {
    // temp workaround to convert relative xmc urls to absolute
    // will be fixed soon by layout service
    // remove next block once fixed
    try {
      const currentHost = window.location.host;
      const xmcHost = new URL(ConfigurationService.xmCloudTenantUrl).host;
      if (currentHost !== xmcHost) {
        element.innerHTML = this.convertXmcUrlsToAbsolute(element.innerHTML);
      }
    } catch {}

    RichTextFieldHandler.customizeQuill();

    // Platform might contain placeholder text, so we need to kill it before going further.
    if (!rawValueHolder.value) {
      element.innerHTML = '';
    }

    // QuillJS creates another contenteditable field inside our element coming from platform
    element.removeAttribute('contenteditable');

    try {
      this.richTextEditor = this.initRTE(element);
    } catch {
      try {
        // Fix issues when Quill crashes with exception " Cannot read properties of undefined (reading 'mutations')"
        // https://sitecore.atlassian.net/browse/PGS-1932
        // https://github.com/decidim/decidim/pull/7999
        Quill.register(ScrollOverride);
        this.richTextEditor = this.initRTE(element);
      } catch {
        this.richTextEditor = this.initRTE(element, false);
      }
    }

    // Remove extraneous new lines added by lineBreakMatcher
    removeExtraneousLineBreak(this.richTextEditor);

    this.messaging = rhsMessaging.getChannel(RhsChannelDef);
  }

  private initRTE(element: Element, overwriteBR = true) {
    return new Quill(element, {
      placeholder: TranslationService.get('NO_TEXT_IN_FIELD'),
      modules: {
        clipboard: {
          matchers: overwriteBR ? [['BR', lineBreakMatcher]] : undefined,
          matchVisual: false,
        },
      },
    });
  }

  onBeforeSave(rawValue: string) {
    return this.convertXmcUrlsToRelative(rawValue);
  }

  async init(): Promise<void> {
    this.initQuill();
    this.initRhsMessaging();
  }

  private initQuill() {
    // Removes browser default outline for focus
    this.richTextEditor.root.style.outline = 'none';
    this.richTextEditor.root.style.cursor = 'text';
    this.richTextEditor.root.style.minWidth = '0.5em';
    this.richTextEditor.root.style.minHeight = '1em';
    this.richTextEditor.root.classList.add(style['sc-watermark']);

    const clipboardField = this.element.querySelector('.ql-clipboard') as HTMLElement;
    clipboardField.style.left = '-100000px';
    clipboardField.style.height = '1px';
    clipboardField.style.overflowY = 'hidden';
    clipboardField.style.position = 'absolute';
    clipboardField.style.top = '50%';

    this.richTextEditor.on('text-change', (delta, _, source) => {
      const hasFormattingChanges = !!delta.ops?.find((op) => !!op.attributes);

      // If field was changed via formatting, we want to dispatch select event
      // this is to update UI buttons when formatting changes
      if (hasFormattingChanges) {
        this.messaging.emit('selection:change', this.getSelectionAndFormatting());
      }

      if (source !== 'silent') {
        const debounce = source === 'user';
        this.dispatchChangeAndSyncRawValue({ debounce });
      }

      this.onSizeChange.emit();
    });

    this.richTextEditor.on('selection-change', (range) => {
      // field was deselected, and we do not wish to call onSelect callback
      if (!range) {
        this.dispatchChangeAndSyncRawValue({ debounce: false });
        return;
      }

      this.updateLinkRange(range);

      this.messaging.emit('selection:change', this.getSelectionAndFormatting());
    });

    // Save value on focus lost
    // Use better API once this feature is implemented: https://github.com/quilljs/quill/issues/1951.\
    this.richTextEditor.root.addEventListener('focus', () => this.onSelect.emit(), { signal: this.abortController.signal });
    this.richTextEditor.root.addEventListener('blur', () => this.dispatchChangeAndSyncRawValue({ debounce: false }), {
      signal: this.abortController.signal,
    });

    this.richTextEditor.root.addEventListener(
      'click',
      (event: MouseEvent) => {
        this.handleLinkNavigation(event);
        this.enableImageSelection(event);
      },
      {
        signal: this.abortController.signal,
      },
    );
  }

  private updateLinkRange(range: RangeStatic) {
    // Logic here is inspired by Quill Snow theme.
    // https://github.com/quilljs/quill/blob/develop/themes/snow.js#L46

    // When user clicks on a link we assume it wants to edit the whole link, but not an empty string on a current cursor position
    if (range) {
      // In Quill Snow them they use `quill as any` conversion to get an access to a nested `descendant`.
      // This method is not presented in `Quill` type, but it is apperentally existed with following "if" conditions.
      const richTextEditorScroll = this.richTextEditor.scroll as ExtendedBlot;

      if (richTextEditorScroll.descendant) {
        const [link, offset] = richTextEditorScroll.descendant(HrzRichTextLink, range.index);

        if (link) {
          this.linkRange = new Range(range.index - offset, link.length());

          return;
        }
      }
    }

    // If does not satisfy any of previous conditions reset `linkRange`
    delete this.linkRange;
  }

  private initRhsMessaging() {
    this.messaging.setRpcServicesImpl({
      getSelection: () => this.getSelectionAndFormatting(),
      setFormatting: (formatting) => {
        Object.keys(formatting).forEach((format) => this.applyFormat(format, formatting[format]));
      },
      clearFormatting: () => {
        const selection = this.richTextEditor.getSelection(true);
        this.richTextEditor.removeFormat(selection.index, selection.length, 'api');
      },
      insertHtmlAtCaretPos: (html) => {
        const valueWithAbsoluteXmcUrls = this.convertXmcUrlsToAbsolute(html);
        const selection = this.richTextEditor.getSelection(true);
        this.richTextEditor.clipboard.dangerouslyPasteHTML(selection.index, valueWithAbsoluteXmcUrls, 'api');
      },
      getValue: () => {
        return this.getValue().rawValue;
      },
      setValue: (rawValue: string) => {
        this.setValue({ rawValue });
      },
    });
  }

  private applyFormat(format: string, value: string | undefined) {
    // Only apply the format which has been changed
    if (value === undefined) {
      return;
    }

    // When user clicks on a link we assume it wants to edit the whole link, but not an empty string on a current cursor position
    if (format === 'link' && this.linkRange) {
      this.richTextEditor.formatText(this.linkRange, format, value, 'api');
    } else {
      this.richTextEditor.format(format, value, 'api');
    }
  }

  getDimensions(): ElementDimensions {
    const dimensions = calculateMaxDimensions([this.element]);
    dimensions.width += CHROME_ADDITIONAL_WIDTH;
    return dimensions;
  }

  select(): void {
    this.richTextEditor.focus();
  }

  getValue(): FieldRawValue {
    const valueWithRelativeUrls = this.convertXmcUrlsToRelative(readEditorHTML(this.richTextEditor));
    return { rawValue: valueWithRelativeUrls };
  }

  setValue(value: FieldRawValue): void {
    const currentValue = readEditorHTML(this.richTextEditor);
    if (currentValue === value.rawValue) {
      return;
    }
    // This will also trigger editor text-change event where the final value is read from the editor
    const valueWithAbsoluteXmcUrls = this.convertXmcUrlsToAbsolute(value.rawValue);
    this.richTextEditor.clipboard.dangerouslyPasteHTML(valueWithAbsoluteXmcUrls, 'api');
  }

  private dispatchChangeAndSyncRawValue({ debounce }: { debounce: boolean }) {
    this.onChange.emit({ value: this.getValue(), debounce });
    this.rawValueHolder.value = readEditorHTML(this.richTextEditor);
  }

  private getSelectionAndFormatting() {
    const selection = this.richTextEditor.getSelection();

    const hasSelection = selection ? !!selection.length : false;
    const format = this.richTextEditor.getFormat(this.richTextEditor.getSelection(true));

    return { format, hasSelection };
  }

  private handleLinkNavigation(event: MouseEvent): void {
    const link = event.target as HTMLAnchorElement;
    if (!link || !link.href) {
      return;
    }

    if (!event.ctrlKey) {
      link.removeAttribute('contentEditable');
      return;
    }

    if (link.target === '_blank') {
      link.contentEditable = 'false';
      setTimeout(() => link.removeAttribute('contentEditable'), 0);
    } else {
      // target '_self' requires manual processing, because CTRL+CLICK opens page in a new tab regardless of 'target' value
      event.preventDefault();
      event.stopImmediatePropagation();

      window.location.href = link.href;
    }
  }

  // Enable select image support for chrome browsers.
  // The logic here is inspired by: https://github.com/quilljs/quill/issues/1258

  private enableImageSelection(event: MouseEvent): void {
    const Parchment = Quill.import('parchment');
    const img = Parchment.find(event.target);

    if (img instanceof HrzRichTextImage) {
      this.richTextEditor.setSelection(img.offset(this.richTextEditor.scroll), 1, 'user');
    }
  }

  private convertXmcUrlsToRelative(fieldRawValue: string): string {
    if (!fieldRawValue.toLowerCase().includes(ConfigurationService.xmCloudTenantUrl?.toLowerCase())) {
      return fieldRawValue;
    }

    const document = this.parser.parseFromString(fieldRawValue, 'text/html');
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      const url = img.getAttribute('src');
      if (url && url.toLowerCase().startsWith(ConfigurationService.xmCloudTenantUrl?.toLowerCase())) {
        const relativeUrl = new URL(url).pathname.replace(/^\//, '');
        img.setAttribute('src', relativeUrl);
      }
    });

    return document.body.innerHTML;
  }

  private convertXmcUrlsToAbsolute(fieldRawValue: string): string {
    let isModified = false;
    const document = this.parser.parseFromString(fieldRawValue, 'text/html');
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      const url = img.getAttribute('src');
      if (url && !isAbsoluteUrl(url) && isXmcMediaRelativeUrl(url)) {
        isModified = true;
        const absoluteUrl = makeAbsoluteUrl(url, ConfigurationService.xmCloudTenantUrl);
        img.setAttribute('src', absoluteUrl);
      }
    });

    return isModified ? document.body.innerHTML : fieldRawValue;
  }
}
