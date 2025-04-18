/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule, InputLabelModule } from '@sitecore/ng-spd-lib';
import { LhsPanelComponent } from 'app/editor/lhs-panel/lhs-panel.component';
import { ContentTreeNode } from 'app/pages/content-tree/content-tree-node';
import { ContentTreeService, DISPLAY_NAME_FIELD_ID } from 'app/pages/content-tree/content-tree.service';
import { Context, ContextService } from 'app/shared/client-state/context.service';
import { ItemChangeService } from 'app/shared/client-state/item-change-service';
import { Item } from 'app/shared/graphql/item.interface';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { isSameGuid } from 'app/shared/utils/utils';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-page-rename',
  standalone: true,
  imports: [FormsModule, TranslateModule, ButtonModule, InputLabelModule],
  templateUrl: './page-rename.component.html',
  styleUrls: ['./page-rename.component.scss'],
})
export class PageRenamingComponent {
  private _context: Context;
  @Input() set context(val: Context) {
    this._context = val;
    this.updateComponentData();
  }
  get context() {
    return this._context;
  }

  itemName: string = '';
  displayName: string = '';

  private contextItem: Item;

  get canRename(): boolean {
    return this.contextItem?.permissions.canRename ?? false;
  }

  get canEditDisplayName(): boolean {
    return this.contextItem?.permissions.canWriteLanguage ?? false;
  }

  get isLocked(): boolean {
    return this.contextItem?.locking.isLocked ?? true;
  }

  get canDelete(): boolean {
    return this.contextItem?.permissions.canDelete ?? false;
  }

  get isLockedByCurrentUser(): boolean {
    return this.contextItem?.locking.lockedByCurrentUser ?? false;
  }

  constructor(
    private readonly contentTreeService: ContentTreeService,
    private readonly itemChangeService: ItemChangeService,
    private readonly translateService: TranslateService,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly contextService: ContextService,
    private readonly siteService: SiteService,
  ) {}

  closePanel() {
    LhsPanelComponent.show(null);
  }

  isStartItem(): boolean {
    const sites = this.siteService.getSites();
    const nodeId = this.contextItem?.id;
    return sites.some((site) => isSameGuid(site.startItemId, nodeId));
  }

  async triggerRename(): Promise<void> {
    if (
      !this.context ||
      !this.contextItem ||
      (this.itemName === this.contextItem.name && this.displayName === this.contextItem.displayName)
    ) {
      return;
    }
    const nodeId = this.contextItem?.id;

    const result = await firstValueFrom(
      this.contentTreeService.renamePage(
        {
          itemId: nodeId,
          newName: this.itemName,
        },
        {
          itemId: nodeId,
          language: this.contextItem.language,
          fields: [{ name: DISPLAY_NAME_FIELD_ID, value: this.displayName }],
        },
        this.context.language,
        this.context.siteName,
      ),
    ).catch(() => null);

    if (!result) {
      const errorText$ = this.translateService.get('EDITOR.RENAME.ERRORS.SAVE_ERROR');
      await this.timedNotificationsService.push('RenameItem', errorText$, 'error');
      return;
    }

    const updatedNode = this.updateTreeNode(nodeId, result);

    if (updatedNode) {
      this.itemChangeService.notifyChange(updatedNode.id, ['display-name', 'name']);
    }
  }

  private updateTreeNode(
    itemId: string,
    result: { renameItem: { name: string } | null; updateItem: { displayName: string } | null },
  ): ContentTreeNode | undefined {
    const node = this.contentTreeService.getTreeItem(itemId);
    if (!node) {
      return undefined;
    }
    if (result.renameItem?.name) {
      node.text = result.renameItem.name;
      this.itemName = result.renameItem.name;
    }

    if (result.updateItem?.displayName) {
      node.text = result.updateItem.displayName;
      this.displayName = result.updateItem.displayName;
    }

    return node;
  }

  private async updateComponentData(): Promise<void> {
    this.contextItem = await this.contextService.getItem();
    this.itemName = this.contextItem.name;
    this.displayName = this.contextItem.displayName;
  }
}
