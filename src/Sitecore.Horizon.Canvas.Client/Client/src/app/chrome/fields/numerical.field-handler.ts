/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingP2PChannel, MessagingP2PChannelDefFromChannel } from '@sitecore/horizon-messaging';
import { EventEmitter } from '../../messaging/event-emitter';
import { FieldRawValue } from '../../messaging/horizon-canvas.contract.parts';
import { TranslationService } from '../../services/translation.service';
import { calculateMaxDimensions, ElementDimensions } from '../../utils/dom';
import { FieldHandler, RhsFieldEditorMessaging } from '../chrome.field';

const CHROME_ADDITIONAL_WIDTH = 10;

export type RhsChannel = MessagingP2PChannel<
  // Inbound events
  {},
  // Outbound events
  {
    'value:change': string | null;
  },
  // Remote RPC services
  {},
  // Provided RPC services
  {
    getValue(): string | null;
    setValue(value: string): void;
  }
>;

export const RhsChannelDef: MessagingP2PChannelDefFromChannel<RhsChannel> = {
  name: 'general',
};

export class NumericalFieldHandler implements FieldHandler {
  readonly onSizeChange = new EventEmitter();
  readonly onSelect = new EventEmitter();
  readonly onChange = new EventEmitter<{ value: FieldRawValue; debounce: boolean }>();
  private readonly messaging: RhsChannel;

  constructor(
    private readonly element: HTMLElement,
    private rawValueHolder: HTMLInputElement,
    rhsMessaging: RhsFieldEditorMessaging,
    private readonly abortController: AbortController,
  ) {
    this.element = element;
    this.element.contentEditable = 'false';
    this.element.tabIndex = 0;

    this.messaging = rhsMessaging.getChannel(RhsChannelDef);

    // Platform might render watermark, so we reset already rendered value to normalize control state.
    if (rawValueHolder.value === '') {
      this.element.innerHTML = '';
    }
  }

  async init() {
    this.initApplyFieldStyles();
    this.initAttachEvents();
    this.setWatermarkIfEmpty();
    this.initRhsEditorMessages();
  }

  getDimensions(): ElementDimensions {
    const result = calculateMaxDimensions([this.element]);
    result.width += CHROME_ADDITIONAL_WIDTH;
    return result;
  }

  select(): void {
    this.element.focus();
  }

  getValue(): FieldRawValue {
    return { rawValue: this.rawValueHolder.value };
  }

  setValue(value: FieldRawValue): void {
    this.rawValueHolder.value = value.rawValue;
    this.element.innerHTML = value.rawValue;
    this.setWatermarkIfEmpty();

    this.onSizeChange.emit();

    this.onChange.emit({ value, debounce: false });
    this.messaging.emit('value:change', value.rawValue);
  }

  private initApplyFieldStyles() {
    const element = this.element;
    element.style.cursor = 'pointer';
    element.style.minWidth = '0.5em';
    element.style.minHeight = '1em';
    element.style.display = 'inline-block';
    element.style.outline = 'none';
  }

  private initAttachEvents() {
    this.element.addEventListener('focus', () => this.onSelect.emit(), { signal: this.abortController.signal });
  }

  private initRhsEditorMessages() {
    this.messaging.setRpcServicesImpl({
      getValue: () => {
        const value = this.rawValueHolder.value;
        return value ? value : null;
      },
      setValue: (value) => this.setValue({ rawValue: value }),
    });
  }

  private setWatermarkIfEmpty() {
    if (this.element.innerText.trim() === '') {
      this.element.innerText = TranslationService.get('NO_TEXT_IN_FIELD');
    }
  }
}
