/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { DatasourcePickerService } from 'app/shared/dialogs/datasource-picker/datasource-picker.service';
import { BaseItemDalService, ItemField, ItemFieldDataSource } from 'app/shared/graphql/item.dal.service';
import { TreeNode } from 'app/shared/item-tree/item-tree.component';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { firstValueFrom, Observable } from 'rxjs';
import { extractAndNormalizeGuids, formatAndJoinGuids, getEmptyValue, TREE_NODE_ROOT_ID } from '../../data-view.utils';

@Component({
  selector: 'app-treelist-type-field',
  templateUrl: './treelist-type-field.component.html',
  styleUrls: ['./treelist-type-field.component.scss'],
})
export class TreelistTypeFieldComponent {
  private _currentValue: string;
  @Input() field: ItemField;
  @Input() size: 'sm' | 'lg' = 'lg';

  @Input({ required: true }) set currentValue(val: string) {
    this._currentValue = val;
    this.syncFieldSelectedValues();
  }
  private currentDataSourcesCount = 0;
  @Input() set datasourcesCount(count: number) {
    if (!this.isTreeDataSet || count === 0) {
      this.currentDataSourcesCount = count;
      return;
    }

    const newDataSourceItems = this.field.templateField.dataSource.slice(this.currentDataSourcesCount);
    const newNodes = newDataSourceItems.map((item) => this.mapItemToTreeNode(item));
    this.data = [...this.data, ...newNodes];

    this.currentDataSourcesCount = count;
  }

  @Input() rearrangeItemTemplate?: TemplateRef<any>;

  data: TreeNode[] = [];
  mapSelectedValue: Array<{ displayName: string; itemId: string }> = [];
  isAddMode = false;
  isLoading = false;
  isTreeDataSet = false;

  get currentValue(): string {
    return this._currentValue;
  }

  @Output() selectedValueChange = new EventEmitter<{ rawValue: string }>();
  @Output() toggleRearrangeItems = new EventEmitter<Array<{ displayName: string; itemId: string }>>();
  @Output() resetToStandardValue = new EventEmitter();
  @Output() fetchNextDatasourceBatch = new EventEmitter();

  constructor(
    private readonly contextService: ContextService,
    private readonly itemDalService: BaseItemDalService,
    private readonly siteService: SiteService,
    private readonly configurationService: ConfigurationService,
    private readonly dsPickerService: DatasourcePickerService,
  ) {}

  private async syncFieldSelectedValues(): Promise<void> {
    const selectedValues = extractAndNormalizeGuids(this.currentValue);
    if (!selectedValues.length) {
      this.mapSelectedValue = [];
      return;
    }
    this.updateSelectedValues(selectedValues);
  }

  async setTreeData() {
    this.isLoading = true;
    if (this.field.templateField.type === 'Treelist' && this.field.templateField.dataSource.length === 0) {
      // Fetch and return the root children if the data source is empty
      this.data = await firstValueFrom(this.fetchChildren(TREE_NODE_ROOT_ID));
    } else if (this.field.templateField.type === 'Taglist') {
      await this.setTagListTreeData();
    } else {
      this.data = this.field.templateField.dataSource.map((item) => this.mapItemToTreeNode(item));
    }
    this.isLoading = false;
    this.isTreeDataSet = true;
  }

  private async setTagListTreeData(): Promise<void> {
    const globalTagRootId = this.configurationService.globalTagsRepository ?? '';
    const tagRootFolderId = this.siteService.getContextSite().properties.tagsFolderId ?? '';

    if (!globalTagRootId && !tagRootFolderId) {
      this.data = [];
      return;
    }
    const tagsRootIds = [globalTagRootId, tagRootFolderId];

    this.data = await Promise.all(
      tagsRootIds
        .filter((id) => !!id)
        .map(async (id) => {
          const item = await firstValueFrom(
            this.itemDalService.getItem(
              id,
              this.contextService.language,
              this.contextService.siteName,
              this.contextService.itemVersion,
            ),
          );
          return {
            id: item.id,
            displayName: item.displayName,
            isFolder: item.isFolder,
            isSelectable: true,
            hasChildren: item.hasChildren,
          };
        }),
    );
  }

  private fetchChildren(itemId: string): Observable<TreeNode[]> {
    return this.dsPickerService.fetchRawItemChildren(itemId);
  }

  private async updateSelectedValues(currentValue: string[]): Promise<void> {
    if (currentValue.length > 0 && !this.isAddMode) {
      this.mapSelectedValue = await Promise.all(
        currentValue.map(async (id) => {
          const name = await firstValueFrom(
            this.itemDalService.getItemDisplayName(id, this.contextService.language, this.contextService.siteName),
          );
          return { displayName: name, itemId: id };
        }),
      );

      this.mapSelectedValue.sort((a, b) => currentValue.indexOf(a.itemId) - currentValue.indexOf(b.itemId));
    }
  }

  private mapItemToTreeNode(item: ItemFieldDataSource): TreeNode {
    return {
      id: item.itemId,
      displayName: item.displayName,
      isFolder: !item.hasPresentation,
      isSelectable: true,
      hasChildren: item.hasChildren,
    };
  }

  readonly getChildrenThisBound = (node: TreeNode) => {
    if (!node.hasChildren) {
      return [];
    }
    if (!!node.children?.length) {
      return node.children;
    }

    return this.fetchChildren(node.id);
  };

  onSelectionChange(id: string, itemName: string, addMode: boolean): void {
    this.isAddMode = addMode;
    const valueAlreadySelected = this.mapSelectedValue.some((item) => item.itemId === id);
    if (this.isAddMode) {
      if (valueAlreadySelected) {
        return;
      }
      this.mapSelectedValue.push({ displayName: itemName, itemId: id });
    } else {
      this.mapSelectedValue = this.mapSelectedValue.filter((item) => item.itemId !== id);
    }
    const selectedFieldIds = this.mapSelectedValue.map((item) => item.itemId);
    const updatedValue = formatAndJoinGuids(selectedFieldIds);
    this.selectedValueChange.emit({ rawValue: updatedValue });
  }

  mapRearrangeItemList() {
    this.toggleRearrangeItems.emit(this.mapSelectedValue);
  }

  removeAllValues(): void {
    this.mapSelectedValue = [];
    this.selectedValueChange.emit(getEmptyValue());
  }
}
