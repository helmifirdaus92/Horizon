/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { ItemField } from 'app/shared/graphql/item.dal.service';
import { normalizeGuid } from 'app/shared/utils/utils';
import { extractAndNormalizeGuids, formatAndJoinGuids } from '../../data-view.utils';

@Component({
  selector: 'app-multilist-field',
  templateUrl: './multilist-field.component.html',
  styleUrl: './multilist-field.component.scss',
})
export class MultilistFieldComponent {
  private _currentValue: string;
  @Input() field: ItemField;
  @Input() fetchNextDsPage?: () => Promise<{ hasNextPage: boolean }>;

  @Input({ required: true }) set currentValue(val: string) {
    this._currentValue = val;
    this.mapSelectedValue = this.updateSectionFieldValues();
  }
  @Input() rearrangeItemTemplate?: TemplateRef<any>;

  mapSelectedValue: Array<{ displayName: string; itemId: string }> = [];

  get currentValue(): string {
    return this._currentValue;
  }

  @Output() selectedItemChange = new EventEmitter<{ rawValue: string }>();
  @Output() toggleRearrangeItems = new EventEmitter<Array<{ displayName: string; itemId: string }>>();
  @Output() resetToStandardValue = new EventEmitter();
  @Output() fetchNextDatasourceBatch = new EventEmitter();

  isChecklistItemSelected(itemId: string): boolean {
    return this.mapSelectedValue.some((item) => item.itemId === itemId);
  }

  onMultiListFieldValueChange(isAddAction: boolean, displayName: string, itemId: string) {
    const valueAlreadySelected = this.mapSelectedValue.find((item) => item.itemId === normalizeGuid(itemId));

    if (isAddAction && !valueAlreadySelected) {
      this.mapSelectedValue.push({ displayName: displayName, itemId });
    } else {
      this.mapSelectedValue = this.mapSelectedValue.filter((item) => item.itemId !== itemId);
    }
    const selectedFieldIds = this.mapSelectedValue.map((item) => item.itemId);
    const updatedValue = formatAndJoinGuids(selectedFieldIds);

    this.selectedItemChange.emit({ rawValue: updatedValue });
  }

  mapRearrangeItemList() {
    this.toggleRearrangeItems.emit(this.mapSelectedValue);
  }

  private updateSectionFieldValues(): Array<{ displayName: string; itemId: string }> {
    const selectedValues = extractAndNormalizeGuids(this.currentValue);
    if (!selectedValues.length) {
      return [];
    }
    return selectedValues
      .map((selectedIId) => this.field.templateField.dataSource.find((ds) => ds.itemId === selectedIId))
      .filter((item) => item)
      .map((item) => ({ displayName: item!.displayName, itemId: item!.itemId }));
  }
}
