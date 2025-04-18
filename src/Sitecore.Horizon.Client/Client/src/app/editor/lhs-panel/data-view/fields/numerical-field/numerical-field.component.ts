/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgModel } from '@angular/forms';
import {
  INT_MAX_VALUE,
  INT_MIN_VALUE,
} from 'app/editor/right-hand-side/numerical-field/integer-field/integer-field.component';
import { ItemField } from 'app/shared/graphql/item.dal.service';

@Component({
  selector: 'app-numerical-field',
  templateUrl: './numerical-field.component.html',
  styleUrls: ['./numerical-field.component.scss'],
})
export class NumericalFieldComponent {
  maxIntegerValue = INT_MAX_VALUE;
  minIntegerValue = INT_MIN_VALUE;

  @Input({ required: true }) field!: ItemField;
  @Input({ required: true })
  set currentValue(value: string) {
    if (this.inputValue === value) {
      return;
    }
    this.inputValue = value;
  }

  @Input() size: 'sm' | 'lg' = 'lg';

  inputValue = '';

  @Output() valueChange = new EventEmitter<{ rawValue: string }>();
  @Output() fieldBlur = new EventEmitter<{ rawValue: string }>();

  isFieldValid(field: ItemField): boolean {
    return field.validation.every((rule) => rule.valid);
  }

  // Prevents the input of type="number" field from accepting scientific notation
  preventScientificNotation(event: KeyboardEvent): void {
    if (event.key === 'e' || event.key === 'E') {
      event.preventDefault();
    }
  }

  onInputChange(textModel: NgModel, debounce: boolean) {
    if (!textModel.dirty || textModel.errors || this.inputValue === this.field.value.rawValue) {
      return;
    }
    const newValue = (this.inputValue ?? '').toString();

    debounce ? this.valueChange.emit({ rawValue: newValue }) : this.fieldBlur.emit({ rawValue: newValue });
  }
}
