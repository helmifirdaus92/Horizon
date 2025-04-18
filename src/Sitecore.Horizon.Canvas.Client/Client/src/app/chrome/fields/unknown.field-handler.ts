/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { EventEmitter } from '../../messaging/event-emitter';
import { FieldRawValue } from '../../messaging/horizon-canvas.contract.parts';
import { calculateMaxDimensions, ElementDimensions } from '../../utils/dom';
import { FieldHandler } from '../chrome.field';

export class UnknownFieldHandler implements FieldHandler {
  readonly onSizeChange = new EventEmitter();
  readonly onSelect = new EventEmitter();
  readonly onChange = new EventEmitter<{ value: FieldRawValue; debounce: boolean }>();

  constructor(
    private readonly element: HTMLElement,
    private readonly rawValueHolder: HTMLInputElement,
    private readonly abortController: AbortController,
  ) {
    element.contentEditable = 'false';
    element.tabIndex = 0;

    element.addEventListener('focus', () => this.onSelect.emit(), { signal: this.abortController.signal });
  }

  async init() {}

  getDimensions(): ElementDimensions {
    return calculateMaxDimensions([this.element]);
  }

  select(): void {
    this.element.focus();
  }

  getValue(): FieldRawValue {
    return { rawValue: this.rawValueHolder.value };
  }
  setValue(_value: FieldRawValue): void {}
}
