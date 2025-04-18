/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Item } from 'app/shared/graphql/item.interface';
import { withItemAt, withoutItem } from 'app/shared/utils/array.utils';
import { BehaviorSubject } from 'rxjs';
import { ContentTreeLocking } from './content-tree-locking';
import { ContentTreePermissions } from './content-tree-permissions';

export class ContentTreeNode {
  readonly id: string;
  readonly item: Item;
  parent: ContentTreeNode | undefined;
  text: string;
  readonly isFolder: boolean;
  hasChildren: boolean;
  readonly locking: ContentTreeLocking;

  enableEdit: boolean;
  readonly permissions: ContentTreePermissions;
  isLoading = false;

  readonly hasVersions$ = new BehaviorSubject<boolean>(true);

  private readonly _children$ = new BehaviorSubject<ContentTreeNode[]>([]);
  readonly children$ = this._children$.asObservable();
  get children(): ContentTreeNode[] {
    return this._children$.getValue();
  }

  static createEmpty() {
    return new ContentTreeNode({
      id: '',
      item: {} as Item,
      text: '',
      permissions: ContentTreePermissions.empty(),
      locking: ContentTreeLocking.empty(),
    });
  }

  constructor(values: {
    item: Item;
    id: string;
    text: string;
    permissions: ContentTreePermissions;
    locking: ContentTreeLocking;
    parent?: ContentTreeNode | undefined;
    isFolder?: boolean;
    hasChildren?: boolean;
    enableEdit?: boolean;
    hasVersions?: boolean;
  }) {
    this.item = values.item;
    this.id = values.id;
    this.text = values.text;
    this.permissions = values.permissions;
    this.parent = values.parent;

    this.locking = values.locking;
    this.isFolder = values.isFolder || false;
    this.hasChildren = values.hasChildren || false;
    this.enableEdit = values.enableEdit || false;
    this.hasVersions$.next(values.hasVersions || false);
  }

  /**
   * Resets the already fetched nodes without touching @see {hasChildren} flag.
   */
  resetChildren(): void {
    this._children$.next([]);
  }

  /**
   * Replaces node with new information about children. Affects @see {hasChildren} flag.
   */
  updateChildren(children: ContentTreeNode[]): void {
    this._children$.next(children);
    this.hasChildren = !!children.length;
  }

  addChild(node: ContentTreeNode, index: number) {
    this.updateChildren(withItemAt(this.children, node, index));
  }

  removeChild(node: ContentTreeNode) {
    this.updateChildren(withoutItem(this.children, node));
  }
}
