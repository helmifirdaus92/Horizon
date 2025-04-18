/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { convertDateToSitecoreIsoFormat, formatDate } from 'app/editor/right-hand-side/date-field/date-field.utils';
import { ItemFieldType } from 'app/shared/graphql/item.dal.service';

@Component({
  selector: 'app-datetime-field',
  templateUrl: './datetime-field.component.html',
  styleUrls: ['./datetime-field.component.scss'],
})
export class DatetimeFieldComponent implements OnDestroy {
  private _fieldInputState: { rawValue: string; fieldType: ItemFieldType };

  @Input({ required: true }) set fieldInputState(val: { rawValue: string; fieldType: ItemFieldType }) {
    this._fieldInputState = val;
    this.currentValue = formatDate(val.rawValue, val.fieldType);
    this.lastSavedValue = this.currentValue;
  }

  @Input() size: 'sm' | 'lg' = 'lg';

  @Output() valueChange = new EventEmitter<{ rawValue: string }>();

  currentValue = '';
  lastSavedValue: string | null = null;

  get fieldInputState(): { rawValue: string; fieldType: ItemFieldType } {
    return this._fieldInputState;
  }

  get dateFieldType(): Extract<ItemFieldType, 'Date' | 'Datetime'> {
    return this._fieldInputState.fieldType as 'Date' | 'Datetime';
  }

  ngOnDestroy(): void {
    this.emitValueChange();
  }

  emitValueChange() {
    if (this.currentValue === this.lastSavedValue) {
      return;
    }
    this.lastSavedValue = this.currentValue;
    const formattedValue = convertDateToSitecoreIsoFormat(this.currentValue);
    this.valueChange.emit({ rawValue: formattedValue });
  }
}
