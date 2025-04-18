/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, OnInit } from '@angular/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';
import { DatasourcePickerService } from 'app/shared/dialogs/datasource-picker/datasource-picker.service';
import { ItemFieldDataSource } from 'app/shared/graphql/item.dal.service';
import { TreeNode } from 'app/shared/item-tree/item-tree.component';
import { isSameGuid } from 'app/shared/utils/utils';
import { firstValueFrom, Observable } from 'rxjs';
import { TREE_NODE_ROOT_ID } from '../../../data-view.utils';

export interface TreeItem {
  displayName: string;
  itemId: string;
}
@Component({
  selector: 'app-treelistex-item-picker',
  templateUrl: './treelistEx-item-picker.component.html',
  styleUrls: ['./treelistEx-item-picker.component.scss'],
})
export class TreelistExItemPickerComponent implements OnInit {
  currentValue: TreeItem[] = [];

  private _dataSource: ItemFieldDataSource[] = [];
  set dataSource(value: ItemFieldDataSource[]) {
    const newItems = value.filter((item) => !this.data.some((existingNode) => existingNode.id === item.itemId));
    const newNodes = newItems.map((item) => this.mapItemToTreeNode(item));
    this.data = [...this.data, ...newNodes];
    this._dataSource = value;
  }

  isLoading = false;
  data: TreeNode[] = [];

  readonly onSelect = new EventEmitter<TreeItem[]>();
  readonly onFetchNextDsBatch = new EventEmitter<void>();

  constructor(
    private readonly closeHandle: DialogCloseHandle,
    private readonly dsPickerService: DatasourcePickerService,
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    if (this._dataSource.length === 0) {
      this.data = await firstValueFrom(this.fetchChildren(TREE_NODE_ROOT_ID));
    } else {
      this.data = this._dataSource.map((item) => this.mapItemToTreeNode(item));
    }

    this.isLoading = false;
  }

  close() {
    this.onSelect.complete();
    this.closeHandle.close();
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

  private fetchChildren(itemId: string): Observable<TreeNode[]> {
    return this.dsPickerService.fetchRawItemChildren(itemId);
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

  addItem(itemId: string, displayName: string): void {
    const isExistingValue = this.currentValue.some((value) => isSameGuid(value.itemId, itemId));
    if (isExistingValue) {
      return;
    }
    this.currentValue = [...this.currentValue, { displayName, itemId }];
  }

  removeItem(itemId: string): void {
    this.currentValue = this.currentValue.filter((value) => !isSameGuid(value.itemId, itemId));
  }

  saveNewValue(): void {
    this.onSelect.next(this.currentValue);
    this.close();
  }
}
