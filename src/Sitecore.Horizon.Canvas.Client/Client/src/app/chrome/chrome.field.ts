/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingReconnectableP2PConnection } from '@sitecore/horizon-messaging';
import { EventEmitter, EventSource } from '../messaging/event-emitter';
import { FieldChromeInfo, FieldRawValue, FieldValue } from '../messaging/horizon-canvas.contract.parts';
import { findClosestParentRendering } from '../utils/chrome';
import { Debouncer } from '../utils/debouncer';
import { ElementDimensions } from '../utils/dom';
import { Chrome } from './chrome';
import { ChromeItemContext } from './chrome-item-context';

export interface FieldHandler {
  readonly onSizeChange: EventSource;
  readonly onSelect: EventSource;
  readonly onChange: EventSource<{ value: FieldRawValue; debounce: boolean; requireSSR?: boolean }>;
  readonly onAction?: EventSource<{ actionType: 'selectParentChrome' }>;

  readonly onBeforeSave?: (rawValue: string) => string;

  init(): Promise<void>;
  getDimensions(): ElementDimensions;
  select(): void;
  getValue(): FieldRawValue;
  setValue(value: FieldRawValue): void;
}

export type RhsFieldEditorMessaging = Pick<MessagingReconnectableP2PConnection, 'getChannel'>;

const DEFAULT_DEBOUNCE_TIMEOUT = 1000;

export class FieldChrome extends Chrome {
  private readonly _onChange = new EventEmitter<{ value: FieldValue; requireSSR: boolean }>();
  readonly onChange = this._onChange.asSource();

  private valueDebouncer: Debouncer<{ value: FieldRawValue; requireSSR: boolean }>;
  private lastEmittedChange: FieldRawValue;
  private _standardValue: string | undefined = undefined;

  private _isPersonalized: boolean | undefined = undefined;

  constructor(
    chromeId: string,
    readonly element: HTMLElement,
    readonly fieldId: string,
    readonly fieldType: string,
    readonly containsStandardValue: boolean,
    readonly itemContext: ChromeItemContext,
    private readonly fieldHandler: FieldHandler,
    displayName: string,
    rhsMessaging: MessagingReconnectableP2PConnection,
  ) {
    super(chromeId, displayName, [], rhsMessaging);

    this.lastEmittedChange = fieldHandler.getValue();
    this._standardValue = containsStandardValue ? this.lastEmittedChange.rawValue : undefined;
    this.valueDebouncer = new Debouncer(({ value, requireSSR }) => this.emitFieldChange(value, requireSSR), DEFAULT_DEBOUNCE_TIMEOUT);

    this._onSizeChange.subscribe(fieldHandler.onSizeChange);

    this._onSelect.subscribe(fieldHandler.onSelect);

    fieldHandler.onChange.on(({ value, debounce, requireSSR }) =>
      this.valueDebouncer.putValue({ value, requireSSR: !!requireSSR }, debounce),
    );

    fieldHandler.onAction?.on(({ actionType: message }) => {
      if (message === 'selectParentChrome') {
        this.parentChrome?.select();
      }
    });
  }

  getDimensions(): ElementDimensions {
    return this.fieldHandler.getDimensions();
  }

  getIsPersonalized(): boolean {
    if (this._isPersonalized !== undefined) {
      return this._isPersonalized;
    }

    const parentRendering = findClosestParentRendering(this);
    this._isPersonalized = !!parentRendering
      ? parentRendering.appliedPersonalizationActions?.some((action) => action === 'SetDataSourceAction')
      : false;
    return this._isPersonalized;
  }

  getChromeInfo(): FieldChromeInfo {
    return {
      chromeType: 'field',
      chromeId: this.chromeId,
      displayName: this.displayName,
      fieldId: this.fieldId,
      fieldType: this.fieldType,
      contextItem: this.itemContext,
      isPersonalized: this.getIsPersonalized(),
      parentRenderingChromeInfo: findClosestParentRendering(this)?.getChromeInfo(),
    };
  }

  select(): void {
    this.fieldHandler.select();
  }

  getValue(): FieldRawValue {
    return this.fieldHandler.getValue();
  }

  setValue(value: FieldRawValue, isStandardValue: boolean): void {
    this._standardValue = isStandardValue ? value.rawValue : undefined;

    this.fieldHandler.setValue(value);
  }

  flushChanges(): void {
    this.valueDebouncer.flush();
  }

  sortMoveUp() {}
  sortMoveDown() {}

  private emitFieldChange(value: FieldRawValue, requireSSR: boolean): void {
    if (this.lastEmittedChange.rawValue === value.rawValue) {
      return;
    }

    if (this.fieldHandler.onBeforeSave) {
      value.rawValue = this.fieldHandler.onBeforeSave(value.rawValue);
    }

    this.lastEmittedChange = value;
    const reset = this._standardValue === value.rawValue;

    this._onChange.emit({
      value: {
        itemId: this.itemContext.id,
        itemVersion: this.itemContext.version,
        fieldId: this.fieldId,
        value,
        reset,
      },
      requireSSR,
    });
  }
}

export function isFieldChrome(chrome: Chrome): chrome is FieldChrome {
  return chrome instanceof FieldChrome;
}
