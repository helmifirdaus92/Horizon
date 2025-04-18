/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { Item } from 'app/shared/graphql/item.interface';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { findTreeNode } from 'app/shared/utils/tree.utils';
import { isSameGuid } from 'app/shared/utils/utils';
import { firstValueFrom, NEVER, Observable, Subject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { MoveNodePosition } from '../content-tree-container/content-tree-container.service';
import { ContentTreeLocking } from './content-tree-locking';
import { ContentTreeNode } from './content-tree-node';
import { ContentTreePermissions } from './content-tree-permissions';

export type RenameItemErrorCode =
  | 'ItemNotFound'
  | 'ItemIsLocked'
  | 'ItemIsReadOnly'
  | 'InsufficientLanguagePrivileges'
  | 'ItemIsFallback';
export type CreateItemErrorCode =
  | 'InvalidItemName'
  | 'DuplicateItemName'
  | 'InvalidParent'
  | 'InvalidTemplateId'
  | 'UnknownError';

export interface ChangeDisplayNameResult {
  id: string;
  displayName: string;
}

export interface DuplicateItemResult {
  id: string;
  path: string;
  displayName: string;
}

export interface CreatePageResult {
  id: string;
  displayName: string;
}

export interface CreateFolderResult {
  id: string;
  displayName: string;
}

export interface RenamResult {
  id: string;
  name: string;
}

export interface MutationResult<TItem> {
  item: TItem;
}

export interface ContentTreeItem {
  readonly templateId: string;
  readonly text: string;
  readonly isFolder: boolean;
  readonly parentId: string;
}

export interface DuplicateItemParameters {
  readonly sourceItemId: string;
  readonly text: string;
  readonly isFolder: boolean;
  readonly parentId: string;
  readonly hasChildren: boolean;
}

export interface UpdateItemInput {
  itemId: string;
  language: string;
  version?: number;
  fields: FieldValueInput[];
}

export interface UpdateItemOutput {
  itemId: string;
  version: number;
  revision: { value: string };
  field: {
    fieldId: string;
    value: string;
    containsStandardValue: boolean;
  };
}

export interface FieldValueInput {
  name: string;
  value: string;
  reset?: boolean;
}

export interface RenameItemInput {
  itemId: string;
  database?: string;
  newName: string;
}

export const DISPLAY_NAME_FIELD_ID = 'B5E02AD9-D56F-4C41-A065-A133DB87BDEB';

@Injectable({ providedIn: 'root' })
export abstract class BaseContentTreeDalService {
  protected readonly apollo = inject(Apollo);
  constructor() {}

  abstract deleteItem(itemId: string, site?: string, language?: string): Observable<unknown>;
  abstract addFolder(
    name: string,
    templateId: string,
    parentId: string,
    language: string,
    site: string,
  ): Observable<CreateFolderResult>;

  abstract addPage(
    name: string,
    templateId: string,
    parentId: string,
    language: string,
    site: string,
  ): Observable<CreatePageResult>;

  abstract duplicateItem(
    sourceItemId: string,
    newItemName: string,
    language: string,
    site: string,
  ): Observable<DuplicateItemResult>;

  abstract changeDisplayName(
    path: string,
    newDisplayName: string,
    language: string,
    site: string,
  ): Observable<ChangeDisplayNameResult>;

  abstract renamePage(
    renameItem: RenameItemInput | null,
    updateItem: UpdateItemInput | null,
    language: string,
    site: string,
  ): Observable<{ renameItem: RenamResult | null; updateItem: ChangeDisplayNameResult | null }>;

  abstract moveItem(
    itemId: string,
    targetId: string,
    site: string,
    position: MoveNodePosition,
  ): Observable<{ success: boolean }>;

  abstract fetchItemChildren(siteName: string, language: string, itemId: string): Observable<Item>;

  abstract getItemAncestors(siteName: string, language: string, itemId: string): Observable<Item>;
}

@Injectable({ providedIn: 'root' })
export class ContentTreeService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  static queries = require('graphql-tag/loader!./content-tree.graphql');

  deleteItem$ = new Subject<string>();
  itemToAdd$ = new Subject<ContentTreeItem>();
  itemToDuplicate$ = new Subject<DuplicateItemParameters>();
  get contentTreeRoots() {
    return this._contentTreeData.map((node) => node.id);
  }

  private _contentTreeData: ContentTreeNode[] = [];
  private readonly translationKeys = ['EDITOR.NEW_PAGE', 'EDITOR.NEW_FOLDER', 'EDITOR.COPY_OF'];
  private translations: any;

  constructor(
    private readonly translateService: TranslateService,
    private readonly contentTreeDalService: BaseContentTreeDalService,
    private readonly siteService: SiteService,
    private readonly timedNotificationsService: TimedNotificationsService,
  ) {
    this.translateService
      .get(this.translationKeys)
      .subscribe((translations: any) => (this.translations = translations));
  }

  getTreeItem(itemId: string): ContentTreeNode | undefined {
    const item = findTreeNode(itemId, this._contentTreeData);
    return item;
  }

  getContentTreeData(siteName: string, language: string, itemId: string): Observable<ContentTreeNode[]> {
    const isRootStartItem = this.siteService.isRootStartItem(siteName);

    return this.contentTreeDalService
      .getItemAncestors(siteName, language, itemId)
      .pipe(
        catchError(() => {
          // When getItemAncestors request fails, the LHS tree is getting stuck at the loading state
          // even though the Canvas will most likely be reloaded with the Home item.
          // We try to reset the tree to the Home item, or at least return NEVER, so it will not be resolved and it will not block further logic execution to avoid js error.
          // Bug report: https://sitecore.atlassian.net/browse/PGS-2480
          this.showGetItemErrorNotification();

          const startItemId = this.siteService.getSiteByName(siteName)?.startItemId;

          if (startItemId) {
            return this.contentTreeDalService.getItemAncestors(siteName, language, startItemId);
          }

          return NEVER;
        }),
      )
      .pipe(
        map((item) => this.mapItemAncestorsAndChildrenToContentTreeNodes(isRootStartItem, item)),
        tap((nodes) => {
          this._contentTreeData = nodes;
        }),
      );
  }

  getChildeNodes(siteName: string, language: string, itemId: string, node: ContentTreeNode) {
    return this.fetchItemChildren(siteName, language, itemId).pipe(
      map((item) => this.mapItemChildrenToContentTreeNodes(node, item)),
    );
  }

  fetchItemChildren(siteName: string, language: string, itemId: string) {
    return this.contentTreeDalService.fetchItemChildren(siteName, language, itemId);
  }

  deleteItem(itemId: string, site?: string, language?: string) {
    return this.contentTreeDalService.deleteItem(itemId, site, language).pipe(
      tap(() => {
        this.deleteItem$.next(itemId);
      }),
    );
  }

  addTempCreatedItem(templateId: string, kind: 'page' | 'folder', parentId: string): void {
    this.itemToAdd$.next({
      templateId,
      text: kind === 'folder' ? this.translations['EDITOR.NEW_FOLDER'] : this.translations['EDITOR.NEW_PAGE'],
      isFolder: kind === 'folder',
      parentId,
    });
  }

  addTempDuplicatedItem(
    sourceItemId: string,
    sourceItemName: string,
    isFolder: boolean,
    parentId: string,
    hasChildren: boolean,
  ): void {
    this.itemToDuplicate$.next({
      text: this.translations['EDITOR.COPY_OF'] + ` ${sourceItemName}`,
      sourceItemId,
      isFolder,
      parentId,
      hasChildren,
    });
  }

  addFolder(
    name: string,
    templateId: string,
    parentId: string,
    language: string,
    site: string,
  ): Observable<CreateFolderResult> {
    return this.contentTreeDalService.addFolder(name, templateId, parentId, language, site);
  }

  addPage(
    name: string,
    templateId: string,
    parentId: string,
    language: string,
    site: string,
  ): Observable<CreatePageResult> {
    return this.contentTreeDalService.addPage(name, templateId, parentId, language, site);
  }

  duplicateItem(
    sourceItemId: string,
    newItemName: string,
    language: string,
    site: string,
  ): Observable<DuplicateItemResult> {
    return this.contentTreeDalService.duplicateItem(sourceItemId, newItemName, language, site);
  }

  changeDisplayName(
    path: string,
    newDisplayName: string,
    language: string,
    site: string,
  ): Observable<ChangeDisplayNameResult> {
    return this.contentTreeDalService.changeDisplayName(path, newDisplayName, language, site);
  }

  renamePage(
    renameItem: RenameItemInput | null,
    updateItem: UpdateItemInput | null,
    language: string,
    site: string,
  ): Observable<{ renameItem: RenamResult | null; updateItem: ChangeDisplayNameResult | null }> {
    return this.contentTreeDalService.renamePage(renameItem, updateItem, language, site);
  }

  /**
   * Given an item with ancestors (a flat list of parents)
   * @param isStartRoot Only include root item if its the same as start item
   * @param item item to map
   */
  private mapItemAncestorsAndChildrenToContentTreeNodes(isStartRoot: boolean, item: Item) {
    const ancestors = item.ancestors.reduce<{ prev: ContentTreeNode | undefined; root: ContentTreeNode[] }>(
      (state, ancestor, index, list) => {
        // Map children of ancestor (with reference to prev found child)
        const children = this.mapItemChildrenToContentTreeNodes(state.prev, ancestor);

        const nodeOfFetchedItem = children.find((child) => isSameGuid(child.id, item.id));
        if (nodeOfFetchedItem) {
          nodeOfFetchedItem.updateChildren(this.mapItemChildrenToContentTreeNodes(nodeOfFetchedItem, item));
        }

        // Look ahead and find child who is next parent
        const nextParent =
          index === list.length - 1 ? undefined : children.find((child) => isSameGuid(child.id, list[index + 1].id));

        if (index === 0) {
          // For the first level create the root as content tree node and set it as parent
          const rootItem = this.mapItemToContentTreeNode(undefined, ancestor);
          children.forEach((child) => (child.parent = rootItem));

          if (!isStartRoot) {
            state.root = children;
          } else {
            // When start item is the root item include it in the data
            rootItem.updateChildren(children);
            state.root = [rootItem];
          }
        } else if (state.prev) {
          state.prev.updateChildren(children);
        }

        // provide reference to found child for next loop
        state.prev = nextParent;
        return state;
      },
      { prev: undefined, root: [] },
    );

    return ancestors.root;
  }

  private mapItemChildrenToContentTreeNodes(parent: ContentTreeNode | undefined, item: Item) {
    if (!item.children) {
      return [];
    }

    return item.children.map((childItem) => this.mapItemToContentTreeNode(parent, childItem));
  }

  mapItemToContentTreeNode(parent: ContentTreeNode | undefined, item: Item) {
    const permissions = ContentTreePermissions.fromItem(item.permissions);
    const locking = ContentTreeLocking.fromItem(item.locking);
    return new ContentTreeNode({
      item,
      id: item.id,
      text: item.displayName,
      parent,
      permissions,
      locking,
      isFolder: item.isFolder,
      hasChildren: item.hasChildren,
      hasVersions: item.hasVersions,
    });
  }

  private async showGetItemErrorNotification() {
    const text = await firstValueFrom(this.translateService.get('ERRORS.APP_RESET_TO_HOME'));
    const actonTitle = await firstValueFrom(this.translateService.get('ERRORS.RELOAD_ERROR_ACTION_TITLE'));

    const notification = new TimedNotification('getItemError', text, 'warning');
    notification.action = { run: () => window.location.reload(), title: actonTitle };
    notification.persistent = false;

    this.timedNotificationsService.pushNotification(notification);
  }
}
