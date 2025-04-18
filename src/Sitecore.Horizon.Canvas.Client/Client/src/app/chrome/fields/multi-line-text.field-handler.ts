/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { EventEmitter } from '../../messaging/event-emitter';
import { FieldRawValue } from '../../messaging/horizon-canvas.contract.parts';
import { TranslationService } from '../../services/translation.service';
import { calculateMaxDimensions, ElementDimensions } from '../../utils/dom';
import { FieldHandler } from '../chrome.field';
import style from './watermark.scss';

const CHROME_ADDITIONAL_WIDTH = 10;
const TAB_KEY_CODE = 9;

export class MultiLineTextFieldHandler implements FieldHandler {
  private isFocused = false;
  private isTabNavigation = false;

  readonly fieldWatermarkText = TranslationService.get('NO_TEXT_IN_FIELD');

  readonly onSizeChange = new EventEmitter();
  readonly onSelect = new EventEmitter();
  readonly onChange = new EventEmitter<{ value: FieldRawValue; debounce: boolean }>();

  constructor(
    private readonly element: HTMLElement,
    private readonly rawValueHolder: HTMLInputElement,
    private readonly abortController: AbortController,
  ) {
    const rawValue = rawValueHolder.value;
    // Platform might render watermark, so we reset already rendered value to normalize control state.
    if (rawValue === '') {
      this.element.innerHTML = '';
    }
  }

async init() {
    this.setNoTextIfEmpty();
    this.initApplyFieldStyles();
    this.initAttachEvents();

    // https://stackoverflow.com/questions/34354085/clicking-outside-a-contenteditable-div-stills-give-focus-to-it
    // Webkit browsers have tricky behavior with 'contenteditable' elements:
    // on click:
    //   find nearest text node within clicked element;
    //   if text node is editable:
    //     add insertion point;
    // Instead of this:
    // on click:
    //   if clicked element is editable:
    //     find nearest text node within clicked element;
    //     add insertion point;
    //
    // Manual changing of 'contenteditable' state is used to prevent such behavior.
    this.disableEditing();
  }

  private initApplyFieldStyles() {
    const element = this.element;

    element.style.cursor = 'text';
    element.style.minWidth = '0.5em';
    element.style.minHeight = '1em';
    element.style.display = 'inline-block';
    element.style.outline = 'none';
  }

  private initAttachEvents() {
    const element = this.element;

    element.addEventListener('paste', (e) => this.removeFormattingOnPastedText(e), { signal: this.abortController.signal });
    element.addEventListener('focus', () => this.onSelect.emit(), { signal: this.abortController.signal });

    document.body.addEventListener(
      'keydown',
      (event: KeyboardEvent) => {
        const keyCode = event.which || event.keyCode;

        this.isTabNavigation = keyCode === TAB_KEY_CODE;

        if (this.isTabNavigation && event.target !== element) {
          this.enableEditing();
        }
      },
      { signal: this.abortController.signal },
    );

    element.addEventListener(
      'input',
      () => {
        this.dispatchChangeAndSyncRawValue({ debounce: true });
        this.dispatchResize();
      },
      { signal: this.abortController.signal },
    );
    element.addEventListener(
      'mouseenter',
      () => {
        this.enableEditing();
      },
      { signal: this.abortController.signal },
    );
    element.addEventListener(
      'mouseleave',
      () => {
        if (!this.isFocused) {
          this.disableEditing();
        }
      },
      { signal: this.abortController.signal },
    );
    element.addEventListener(
      'focus',
      () => {
        this.isFocused = true;
        this.element.classList.add(style['sc-watermark']);

        if (this.isTabNavigation) {
          this.setEmptyIfNoText();
        }
      },
      { signal: this.abortController.signal },
    );

    element.addEventListener(
      'blur',
      () => {
        this.isFocused = false;
        this.element.classList.remove(style['sc-watermark']);

        this.dispatchChangeAndSyncRawValue({ debounce: false });
        this.disableEditing();
        this.setNoTextIfEmpty();
      },
      { signal: this.abortController.signal },
    );

    element.addEventListener(
      'click',
      () => {
        this.isFocused = true;
        this.isTabNavigation = false;

        this.setEmptyIfNoText();
      },
      { signal: this.abortController.signal },
    );
  }

  getDimensions(): ElementDimensions {
    const dimensions = calculateMaxDimensions([this.element]);
    dimensions.width += CHROME_ADDITIONAL_WIDTH;
    return dimensions;
  }

  select(): void {
    this.enableEditing();
    this.element.focus();
  }

  getValue(): FieldRawValue {
    return { rawValue: this.getNakedValue() };
  }

  setValue(value: FieldRawValue): void {
    if (value.rawValue === this.getNakedValue()) {
      return;
    }

    this.element.innerText = value.rawValue;

    this.dispatchChangeAndSyncRawValue({ debounce: false });
    this.dispatchResize();
    this.setNoTextIfEmpty();
  }

  private getNakedValue(): string {
    if (this.isWatermark()) {
      return '';
    }

    return this.element.innerText || '';
  }

  private removeFormattingOnPastedText(event: ClipboardEvent) {
    event.preventDefault();
    event.stopPropagation();

    const clipboardData = event.clipboardData || (window as any).clipboardData;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const plainText = clipboardData.getData('text/plain');

    // Inserts the given plain text at the insertion point (deletes selection).
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    document.execCommand('insertText', false, plainText);
  }

  private dispatchChangeAndSyncRawValue({ debounce }: { debounce: boolean }) {
    this.onChange.emit({ value: this.getValue(), debounce });
    this.onSizeChange.emit();

    this.rawValueHolder.value = this.getNakedValue();
  }

  private dispatchResize() {
    this.onSizeChange.emit();
  }

  private enableEditing() {
    this.element.contentEditable = 'true';
  }

  private disableEditing() {
    this.element.contentEditable = 'false';
  }

  private isWatermark(): boolean {
    return this.element.innerText === this.fieldWatermarkText;
  }

  private isEmpty(): boolean {
    return this.element.innerText.trim() === '';
  }

  private setEmptyIfNoText() {
    if (this.isWatermark()) {
      // Delay changing the text to empty to keep the input active
      setTimeout(() => (this.element.innerText = ''), 0);
      this.dispatchResize();
    }
  }

  private setNoTextIfEmpty() {
    if (this.isEmpty()) {
      this.element.innerText = this.fieldWatermarkText;
      this.dispatchResize();
    }
  }
}
