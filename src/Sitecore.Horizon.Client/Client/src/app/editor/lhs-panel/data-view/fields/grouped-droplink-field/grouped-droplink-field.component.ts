/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DroplistComponent } from '@sitecore/ng-spd-lib';
import { ContextService } from 'app/shared/client-state/context.service';
import { DatasourcePickerService } from 'app/shared/dialogs/datasource-picker/datasource-picker.service';
import { BaseItemDalService, ItemField } from 'app/shared/graphql/item.dal.service';
import { isSameGuid } from 'app/shared/utils/utils';
import { firstValueFrom } from 'rxjs';
import { ItemGroup } from '../../data-view.utils';

@Component({
  selector: 'app-grouped-droplink-field',
  templateUrl: './grouped-droplink-field.component.html',
  styleUrls: ['./grouped-droplink-field.component.scss'],
})
export class GroupedDroplinkFieldComponent {
  private _currentValue: string;
  @Input({ required: true }) field: ItemField;
  @Input({ required: true }) set currentValue(value: string) {
    if (this.selectedItemId && isSameGuid(value, this.selectedItemId)) {
      return;
    }
    this._currentValue = value;
    this.selectedItemDisplayName();
  }

  @Input() size: 'sm' | 'lg' = 'lg';

  get currentValue(): string {
    return this._currentValue;
  }

  isLoading = false;
  groupedDropLinkItems: ItemGroup[] = [];
  selectedItemName = '';
  selectedItemId = '';

  @Output() selectedValueChange = new EventEmitter<{ rawValue: string }>();
  @ViewChild('droplist') droplist!: DroplistComponent;

  constructor(
    private readonly itemDalService: BaseItemDalService,
    private readonly contextService: ContextService,
    private readonly dsPickerService: DatasourcePickerService,
  ) {}

  async getGroupedItems(): Promise<void> {
    this.isLoading = true;
    const dataSources = this.field.templateField.dataSource;
    if (dataSources.length) {
      this.groupedDropLinkItems = await Promise.all(
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

  isSelectedItem(itemId: string): boolean {
    return isSameGuid(this.currentValue, itemId);
  }

  onSelectionChange(item: ItemGroup): void {
    const isExistingValue = isSameGuid(this.currentValue, item.itemId);
    if (isExistingValue) {
      return;
    } else {
      this.selectedItemName = item.displayName;
    }
    this.selectedItemId = `{${item.itemId.toUpperCase()}}`;
    this.selectedValueChange.emit({ rawValue: this.selectedItemId });
    this.droplist.onCloseSelection(new Event(''));
  }

  private async selectedItemDisplayName(): Promise<void> {
    if (!this.currentValue) {
      this.selectedItemName = '';
      return;
    }
    this.selectedItemName = await firstValueFrom(
      this.itemDalService.getItemDisplayName(
        this.currentValue,
        this.contextService.language,
        this.contextService.siteName,
      ),
    );
  }
}
