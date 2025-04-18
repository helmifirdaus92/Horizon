/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContextMenuState, TreeNode } from 'app/shared/item-tree/item-tree.component';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { isSameGuid } from 'app/shared/utils/utils';

export interface ContextMenuActionInvoke {
  actionType: 'CreateNew' | 'Delete' | 'Duplicate';
  node: TreeNode;
}

@Component({
  selector: 'app-datasource-picker-context-menu',
  templateUrl: './datasource-picker-context-menu.component.html',
  styleUrls: ['./datasource-picker-context-menu.component.scss'],
})
export class DatasourcePickerContextMenuComponent {
  @Input() node: TreeNode;

  @Output() invokeAction = new EventEmitter<ContextMenuActionInvoke>();

  @Output() contextMenuStateChange = new EventEmitter<ContextMenuState>();

  isStartOrRootItem = (): boolean => {
    return this.sites.some((site) => isSameGuid(site.startItemId, this.node.id) || isSameGuid(site.id, this.node.id));
  };

  private sites = this.siteService.getSites();

  constructor(private readonly siteService: SiteService) {}

  createDatasource() {
    this.invokeAction.emit({ actionType: 'CreateNew', node: this.node });
  }

  duplicateDatasource() {
    this.invokeAction.emit({ actionType: 'Duplicate', node: this.node });
  }
}
