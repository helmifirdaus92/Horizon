/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import { CKEditorInline } from '../../../../../ckeditor5/build/ckeditor';
import { getIsoLanguage } from '../../../frame/utils';
import { EventEmitter } from '../../../messaging/event-emitter';
import { FieldRawValue } from '../../../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../../../messaging/messaging-service';
import { ConfigurationService } from '../../../services/configuration.service';
import { TranslationService } from '../../../services/translation.service';
import { calculateMaxDimensions, ElementDimensions } from '../../../utils/dom';
import { normalizeIdWithoutDash } from '../../../utils/id';
import { isAbsoluteUrl, isXmcMediaRelativeUrl, makeAbsoluteUrl } from '../../../utils/url';
import { FieldHandler } from '../../chrome.field';

const CHROME_ADDITIONAL_WIDTH = 10;
const CK_EDITOR_CONTENT_CLASS_NAME = 'ck-content';

export class RichTextCkEditorFieldHandler implements FieldHandler {
  constructor(
    private readonly element: Element,
    private readonly rawValueHolder: HTMLInputElement,
    private readonly messaging: MessagingService,
    private readonly abortController: AbortController,
  ) {
    this.mainElement = this.element;
    // Platform might contain placeholder text, so we need to kill it before going further.
    if (!rawValueHolder.value) {
      element.innerHTML = '';
    }

    // Unwrap HTML and rawValue before initializing CKE to prevent double wrapping
    rawValueHolder.value = this.unwrapHtmlWithClass(rawValueHolder.value);
    element.innerHTML = this.unwrapHtmlWithClass(element.innerHTML);
  }
  private xmcTenantUrl = ConfigurationService.xmCloudTenantUrl.toLowerCase() || '';
  private parser = new DOMParser();

  private resizeWithDebounce = this.debounce(() => this.syncToolbarWidth(), 100);
  private resizeListener = () => this.resizeWithDebounce();
  private blurListener = () => this.dispatchChange(false);
  private clickListener = (event: MouseEvent) => this.handleLinkNavigation(event);
  private mouseDownListener = (event: MouseEvent) => event.stopPropagation();

  readonly onEnter = new EventEmitter();
  readonly onLeave = new EventEmitter();
  readonly onSizeChange = new EventEmitter();
  readonly onSelect = new EventEmitter();
  readonly onChange = new EventEmitter<{ value: FieldRawValue; debounce: boolean }>();
  readonly onAction = new EventEmitter<{ actionType: 'selectParentChrome' }>();

  private richTextEditor: CKEditorInline | undefined;
  private readonly mainElement: Element;

  private hasCustomWrapper = false;
  private debounceNextChange = true;

  async init(): Promise<void> {
    const editorPlaceholder = this.mainElement as HTMLElement;

    // When dealing with Chrome's re-discovery behavior, it's essential to perform manual cleanup of editor instances.
    // This action is required to resolve the "editor-source-element-already-used" issue.
    // https://github.dev/ckeditor/ckeditor5/blob/master/packages/ckeditor5-core/src/editor/utils/securesourceelement.ts#L36
    this.clearEditorInstanceIfExists();

    this.richTextEditor = await CKEditorInline.create(editorPlaceholder, {
      language: {
        content: getIsoLanguage(),
      },
      placeholder: TranslationService.get('NO_TEXT_IN_FIELD'),
      link: {
        defaultProtocol: 'https://',
        decorators: {
          openInNewTab: {
            mode: 'manual',
            label: TranslationService.get('EDITOR_OPEN_LINK_NEW_TAB'),
            attributes: {
              target: '_blank',
            },
          },
        },
      },
    });

    if (!this.richTextEditor) {
      // eslint-disable-next-line no-console
      console.warn('Editor is not defined');
      return;
    }

    // We don't start with the element itself, because CKE always sets .ck-content class to the editing element.
    this.hasCustomWrapper = !!this.element.parentElement?.closest('.' + CK_EDITOR_CONTENT_CLASS_NAME);

    this.syncToolbarWidth();
    this.registerEventListeners();

    // temp workaround to convert relative xmc urls to absolute
    // will be fixed soon by layout service
    // remove next block once fixed
    try {
      const currentHost = window.location.host;
      const xmcHost = new URL(ConfigurationService.xmCloudTenantUrl).host;
      if (currentHost !== xmcHost) {
        this.setValue({ rawValue: this.readEditorHtml() });
      }
    } catch {}
  }

  getDimensions(): ElementDimensions {
    const dimensions = calculateMaxDimensions([this.element]);
    dimensions.width += CHROME_ADDITIONAL_WIDTH;
    return dimensions;
  }

  select(): void {
    this.richTextEditor?.editing.view.focus();
  }

  getValue(): FieldRawValue {
    return { rawValue: this.normalizeValue(this.readEditorHtml()) };
  }

  setValue(value: FieldRawValue): void {
    this.debounceNextChange = false;
    const valueWithAbsoluteXmcUrls = this.convertXmcUrlsToAbsolute(value.rawValue);
    this.richTextEditor?.setData(this.unwrapHtmlWithClass(valueWithAbsoluteXmcUrls));
  }

  destructor() {
    this.removeEventListeners();
    this.richTextEditor?.destroy();
  }

  private registerEventListeners() {
    this.richTextEditor?.model.document.on('change:data', () => {
      const debounce = this.debounceNextChange;
      this.debounceNextChange = true;
      this.dispatchChange(debounce);
    });

    this.registerPluginEvents();

    window.addEventListener('resize', this.resizeListener, { signal: this.abortController.signal });
    this.richTextEditor?.ui.view.toolbar.element?.addEventListener('mousedown', this.mouseDownListener, {
      signal: this.abortController.signal,
    });
    this.mainElement.addEventListener('blur', this.blurListener, {
      signal: this.abortController.signal,
    });
    this.mainElement.parentElement?.addEventListener('click', this.clickListener, { signal: this.abortController.signal });
  }

  private registerPluginEvents() {
    this.richTextEditor?.on('horizon-edit-source-code', async () => {
      const result = await this.messaging.editingChannel.rpc.editSourceCode(this.richTextEditor?.getData() || '');
      if (result.status === 'OK') {
        this.setValue({ rawValue: result.value });
      }
    });

    this.richTextEditor?.on('horizon-reset-field-value', async () => {
      this.setValue({ rawValue: '' });
    });

    this.richTextEditor?.on('horizon-media-selection', async () => {
      const result = await this.messaging.editingChannel.rpc.selectMedia();
      const editor = this.richTextEditor;
      if (editor && result.status === 'OK') {
        const html = this.convertXmcUrlsToAbsolute(result.selectedValue.embeddedHtml ?? '');

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const element = doc.body.firstElementChild;
        if (element instanceof HTMLAnchorElement) {
          editor.execute('internalLink', element.href, element.text);
        } else if (element instanceof HTMLImageElement) {
          this.richTextEditor?.execute('insertImage', {
            source: [
              {
                src: result.selectedValue.src,
                alt: result.selectedValue.alt,
              },
            ],
          });
        } else {
          const viewFragment = editor.data.processor.toView(html);
          const modelFragment = editor.data.toModel(viewFragment);
          editor.model.insertContent(modelFragment);
        }
      }
    });

    this.richTextEditor?.on('horizon-go-to-parent', () => {
      this.onAction.emit({ actionType: 'selectParentChrome' });
      (document.activeElement as HTMLElement).blur();
    });

    this.richTextEditor?.ui.focusTracker.on('change:isFocused', (_evt, _data, isFocused) => {
      if (isFocused) {
        this.onSelect.emit();
        return;
      }
    });

    this.richTextEditor?.on('horizon-add-phone', async () => {
      const result = await this.messaging.editingChannel.rpc.addPhoneNumber();
      if (result.status === 'OK') {
        this.richTextEditor?.execute('phoneLink', result.value);
      }
    });

    this.richTextEditor?.on('horizon-insert-internal-link', async () => {
      const editor = this.richTextEditor;
      const result = await this.messaging.editingChannel.rpc.promptSelectPage();
      if (!editor || !result.id) {
        return;
      }

      const path = `~/link.aspx?_id=${normalizeIdWithoutDash(result.id)}&_z=z`;
      const displayName = result.displayName;
      editor.execute('internalLink', path, displayName);
    });
  }

  removeEventListeners() {
    this.richTextEditor?.stopListening();
    this.richTextEditor?.ui.view.toolbar.element?.removeEventListener('blur', this.blurListener);
    this.mainElement.removeEventListener('blur', this.blurListener);
    window.removeEventListener('resize', this.resizeListener);
    this.richTextEditor?.ui.view.toolbar.element?.removeEventListener('mousedown', this.mouseDownListener);
    this.mainElement.parentElement?.removeEventListener('click', this.clickListener);
  }

  private dispatchChange(debounce: boolean) {
    if (debounce) {
      this.dispatchWithDebounce();
    } else {
      this.dispatch();
    }
  }

  private dispatchWithDebounce = this.debounce(() => this.dispatch(), 1000);

  private dispatch() {
    const value = this.getValue();
    value.rawValue = this.normalizeValue(value.rawValue);
    this.onChange.emit({ value, debounce: false });
    this.rawValueHolder.value = this.readEditorHtml();
  }

  private syncToolbarWidth() {
    if (this.richTextEditor?.ui.view.editable.element?.parentElement && this.richTextEditor.ui.view.toolbar.element) {
      const documentWidth = document.documentElement.clientWidth;
      this.richTextEditor.ui.view.toolbar.element.style.maxWidth = Math.floor(documentWidth) + 'px';
    }
  }

  private readEditorHtml() {
    const html = this.richTextEditor?.getData();
    // If value is empty, do not wrap it into a container, so Reset Field value will not produce an empty container.
    return html === undefined || html === '' ? '' : this.wrapHtmlWithClass(this.richTextEditor?.getData() ?? '');
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

  private clearEditorInstanceIfExists() {
    const ckeditorElement = this.mainElement as HTMLElement & { ckeditorInstance: CKEditorInline };
    if (ckeditorElement) {
      // CKE adds many utility attributes.
      // When we need to reset CKE (e.g. while chrome rediscovery),
      // we need to reset editor innerHTML to the raw value to remove all the utility attributes.
      this.mainElement.innerHTML = this.rawValueHolder.value;

      ckeditorElement.ckeditorInstance?.destroy();
    }
  }

  private wrapHtmlWithClass(html: string): string {
    html = this.unwrapHtmlWithClass(html);

    if (this.hasCustomWrapper) {
      return html;
    }

    const wrappedHtml = `<div class="${CK_EDITOR_CONTENT_CLASS_NAME}">${html}</div>`;
    return wrappedHtml;
  }

  private unwrapHtmlWithClass(html: string): string {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = html;

    const rootElement = tempElement.querySelector(`.${CK_EDITOR_CONTENT_CLASS_NAME}`);
    if (rootElement && rootElement === tempElement.firstElementChild) {
      return rootElement.innerHTML;
    }

    return html;
  }

  private normalizeValue(fieldRawValue: string): string {
    let newValue = this.convertXmcUrlsToRelative(fieldRawValue);
    newValue = this.processLinks(newValue);
    return newValue;
  }

  private processLinks(fieldRawValue: string): string {
    if (!this.xmcTenantUrl) {
      return fieldRawValue;
    }

    const valueDocument = this.parser.parseFromString(fieldRawValue, 'text/html');
    const linkElements = Array.from(valueDocument.querySelectorAll('[target=_blank]'));

    linkElements.forEach((link) => {
      // set title attribute as XMC validation requires it
      if (!link.getAttribute('title') && link.textContent) {
        link.setAttribute('title', link.textContent);
      }
    });
    return valueDocument.body.innerHTML;
  }

  private convertXmcUrlsToRelative(fieldRawValue: string): string {
    if (!this.xmcTenantUrl || !fieldRawValue.toLowerCase().includes(this.xmcTenantUrl)) {
      return fieldRawValue;
    }

    const toRelativeUrl = (rtValueDocument: Document, attribute: string) => {
      const elements = Array.from(rtValueDocument.querySelectorAll(`[${attribute}]`)).filter((element) =>
        element.getAttribute(attribute)?.toLowerCase().startsWith(this.xmcTenantUrl),
      );
      elements.forEach((element) => {
        const url = element.getAttribute(attribute);
        if (url && url.toLowerCase().startsWith(this.xmcTenantUrl)) {
          const relativeUrl = new URL(url).pathname.replace(/^\//, '');
          element.setAttribute(attribute, relativeUrl);
        }
      });
    };
    const valueDocument = this.parser.parseFromString(fieldRawValue, 'text/html');
    toRelativeUrl(valueDocument, 'src');
    toRelativeUrl(valueDocument, 'href');

    return valueDocument.body.innerHTML;
  }

  private convertXmcUrlsToAbsolute(fieldRawValue: string): string {
    let isModified = false;
    const toAbsoluteUrl = (rtValueDocument: Document, attribute: string) => {
      const elements = Array.from(rtValueDocument.querySelectorAll(`[${attribute}]`));
      elements.forEach((element) => {
        const url = element.getAttribute(attribute);
        if (url && !isAbsoluteUrl(url) && isXmcMediaRelativeUrl(url)) {
          isModified = true;
          const absoluteUrl = makeAbsoluteUrl(url, this.xmcTenantUrl);
          element.setAttribute(attribute, absoluteUrl);
        }
      });
    };
    const valueDocument = this.parser.parseFromString(fieldRawValue, 'text/html');
    toAbsoluteUrl(valueDocument, 'src');
    toAbsoluteUrl(valueDocument, 'href');

    return isModified ? valueDocument.body.innerHTML : fieldRawValue;
  }

  private debounce(func: () => void, delay: number): () => void {
    let timerId: any;

    return (...args) => {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  }
}
