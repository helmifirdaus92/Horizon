/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ItemField } from 'app/shared/graphql/item.dal.service';
import { normalizeGuid } from 'app/shared/utils/utils';
import { extractAndNormalizeGuids, formatAndJoinGuids } from '../../data-view.utils';

@Component({
  selector: 'app-checkbox-checklist-field',
  templateUrl: './checkbox-checklist-field.component.html',
  styleUrls: ['./checkbox-checklist-field.component.scss'],
})
export class CheckboxChecklistFieldComponent {
  private _selectedValues: string[] = [];

  @Input() fetchNextDsPage?: () => Promise<{ hasNextPage: boolean }>;
  @Input() set selectedValues(value: string) {
    this.isCheckboxSelected = value === '1';
    this._selectedValues = extractAndNormalizeGuids(value);
  }
  @Input({ required: true }) field: ItemField;

  @Input() size: 'sm' | 'lg' = 'lg';

  get selectedValues(): string[] {
    return this._selectedValues;
  }

  isCheckboxSelected = false;
  @Output() selectedItemChange = new EventEmitter<{ rawValue: string }>();
  @Output() fetchNextDatasourceBatch = new EventEmitter();

  onChecklistFieldValueChange(isChecked: boolean, itemId: string) {
    const normalizedItemId = normalizeGuid(itemId);
    if (isChecked && !this.selectedValues.includes(normalizedItemId)) {
      this.selectedValues.push(normalizedItemId);
    } else {
      this.selectedValues.splice(this.selectedValues.indexOf(normalizedItemId), 1);
    }

    const updatedValue = formatAndJoinGuids(this.selectedValues);

    this.selectedItemChange.emit({ rawValue: updatedValue });
  }

  onCheckboxFieldValueChange(isChecked: boolean) {
    const value = isChecked ? '1' : '';
    this.selectedItemChange.emit({ rawValue: value });
  }

  isChecklistItemSelected(itemId: string): boolean {
    return this.selectedValues.includes(normalizeGuid(itemId));
  }
}
