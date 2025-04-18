/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DroplistComponent } from '@sitecore/ng-spd-lib';
import { DatasourcePickerService } from 'app/shared/dialogs/datasource-picker/datasource-picker.service';
import { ItemField } from 'app/shared/graphql/item.dal.service';
import { firstValueFrom } from 'rxjs';
import { ItemGroup } from '../../data-view.utils';

@Component({
  selector: 'app-grouped-droplist-field',
  templateUrl: './grouped-droplist-field.component.html',
  styleUrls: ['./grouped-droplist-field.component.scss'],
})
export class GroupedDroplistFieldComponent {
  private _currentValue: string;
  @Input({ required: true }) field: ItemField;
  @Input({ required: true }) set currentValue(value: string) {
    this._currentValue = value;
  }

  @Input() size: 'sm' | 'lg' = 'lg';

  get currentValue(): string {
    return this._currentValue;
  }

  isLoading = false;
  groupedDropListItems: ItemGroup[] = [];

  @Output() selectedValueChange = new EventEmitter<{ rawValue: string }>();
  @ViewChild('droplist') droplist!: DroplistComponent;

  constructor(private readonly dsPickerService: DatasourcePickerService) {}

  async getGroupedItems(): Promise<void> {
    this.isLoading = true;
    const dataSources = this.field.templateField.dataSource;
    if (dataSources.length) {
      this.groupedDropListItems = await Promise.all(
        dataSources.map(async (dataSource) => {
          const children = await firstValueFrom(this.dsPickerService.fetchRawItemChildren(dataSource.itemId));
          return {
            displayName: dataSource.displayName,
            itemId: dataSource.itemId,
            children: children?.map((child) => {
              return {
                displayName: child.displayName,
                itemId: child.id,
                children: [],
              };
            }),
          };
        }),
      );
    }
    this.isLoading = false;
  }

  onSelectionChange(item: ItemGroup): void {
    if (item.displayName === this.currentValue) {
      return;
    }
    this.selectedValueChange.emit({ rawValue: item.displayName });
    this.droplist.onCloseSelection(new Event(''));
  }
}
