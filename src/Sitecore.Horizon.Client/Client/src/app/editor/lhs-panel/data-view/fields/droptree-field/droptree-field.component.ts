/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DroplistComponent } from '@sitecore/ng-spd-lib';
import { ContextService } from 'app/shared/client-state/context.service';
import { DatasourcePickerService } from 'app/shared/dialogs/datasource-picker/datasource-picker.service';
import { BaseItemDalService, ItemField, ItemFieldDataSource } from 'app/shared/graphql/item.dal.service';
import { TreeNode } from 'app/shared/item-tree/item-tree.component';
import { isSameGuid } from 'app/shared/utils/utils';
import { firstValueFrom, Observable } from 'rxjs';
import { TREE_NODE_ROOT_ID } from '../../data-view.utils';

@Component({
  selector: 'app-droptree-field',
  templateUrl: './droptree-field.component.html',
  styleUrls: ['./droptree-field.component.scss'],
})
export class DroptreeFieldComponent {
  private _currentValue: string;
  @Input() field: ItemField;

  @Input() size: 'sm' | 'lg' = 'lg';

  @Input({ required: true }) set currentValue(val: string) {
    if (this.selectedItemId && isSameGuid(val, this.selectedItemId)) {
      return;
    }
    this._currentValue = val;
    this.syncFieldSelectedValues();
  }

  get currentValue(): string {
    return this._currentValue;
  }

  data: TreeNode[] = [];
  mapSelectedValue: { itemPath: string; itemId: string } | null = null;
  selectedItemId = '';
  isLoading = false;

  @Output() selectedValueChange = new EventEmitter<{ rawValue: string }>();
  @ViewChild('droplist') droplist!: DroplistComponent;

  constructor(
    private readonly itemDalService: BaseItemDalService,
    private readonly dsPickerService: DatasourcePickerService,
    private readonly contextService: ContextService,
  ) {}

  async setTreeData() {
    this.isLoading = true;
    if (this.field.templateField.dataSource.length === 0) {
      this.data = await firstValueFrom(this.fetchChildren(TREE_NODE_ROOT_ID));
    } else {
      this.data = this.field.templateField.dataSource.map((item) => this.mapItemToTreeNode(item));
    }
    this.isLoading = false;
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

  onSelectionChange(id: string, path?: string): void {
    const isExistedValue = this.mapSelectedValue?.itemId === id;
    if (isExistedValue) {
      return;
    } else {
      this.mapSelectedValue = { itemPath: path || '', itemId: id };
    }
    this.selectedItemId = `{${id.toUpperCase()}}`;
    this.selectedValueChange.emit({ rawValue: this.selectedItemId });
    this.droplist.onCloseSelection(new Event(''));
  }

  private fetchChildren(itemId: string): Observable<TreeNode[]> {
    return this.dsPickerService.fetchRawItemChildren(itemId);
  }

  private async syncFieldSelectedValues(): Promise<void> {
    if (!this.currentValue) {
      this.mapSelectedValue = null;
      return;
    }
    const path = await firstValueFrom(
      this.itemDalService.getItemPath(this.currentValue, this.contextService.language, this.contextService.siteName),
    );
    this.mapSelectedValue = { itemPath: path, itemId: this.currentValue };
  }

  private mapItemToTreeNode(item: ItemFieldDataSource): TreeNode {
    return {
      id: item.itemId,
      displayName: item.displayName,
      isFolder: !item.hasPresentation,
      isSelectable: true,
      hasChildren: item.hasChildren,
      path: item.path,
    };
  }
}
