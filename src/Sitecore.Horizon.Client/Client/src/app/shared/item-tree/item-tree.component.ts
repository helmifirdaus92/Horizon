/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { ArrayDataSource } from '@angular/cdk/collections';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { TreeControl } from '@sitecore/ng-spd-lib';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { findNodeAncestors, isVirtualPageTemplate } from 'app/shared/utils/tree.utils';
import { Observable } from 'rxjs';
import { PAGE_RELATIVE_PATH } from '../dialogs/datasource-picker/datasource-picker.component';

export interface TreeNode {
  readonly id: string;
  displayName: string;
  readonly isFolder: boolean;
  readonly isSelectable: boolean;
  readonly hasChildren: boolean;
  readonly children?: TreeNode[];
  readonly enableEdit?: boolean;
  readonly isCompatible?: boolean;
  readonly template?: { id: string; baseTemplateIds: string[] };
  isRoot?: boolean;
  path?: string;
}

export interface ContextMenuState {
  state: boolean;
  itemId: string;
}

export type NodeChangeEvent = { status: 'OK'; oldName: string; node: TreeNode } | { status: 'Canceled' };

function isExpandable(node: TreeNode): boolean {
  return node.hasChildren;
}

@Component({
  selector: 'app-item-tree',
  templateUrl: './item-tree.component.html',
  styleUrls: ['./item-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemTreeComponent implements OnChanges, OnDestroy {
  @Input() data?: readonly TreeNode[] | null;
  @Input() select?: string;
  @Input() contextMenu?: TemplateRef<any>;
  @Input() contextMenuState?: ContextMenuState;
  @Input() highlightIncompatibleNodes = false;
  @Input() expandFirstRoot = true;
  @Input() expandSelected = true;

  @Output() selectChange = new EventEmitter<TreeNode>();
  @Output() nodeChange = new EventEmitter<NodeChangeEvent>();

  readonly treeControl = new TreeControl<TreeNode>((node) => this.getChildren(node), isExpandable);
  dataSource?: ArrayDataSource<TreeNode>;

  // Specify the padding level for root nodes
  readonly initialPaddingLevel = 1;

  private readonly lifetime = new Lifetime();

  @Input() getChildren: (node: TreeNode) => Observable<TreeNode[]> | TreeNode[] | undefined | null = (node) =>
    node.children;

  // ATTENTION: don't refer to `this` in the function implementation.
  // It is used from the `when` property in the template which changes the context of `this`.
  readonly isSelectable = (_: number, node: TreeNode): boolean => node.isSelectable;

  constructor() {
    this.treeControl.onSelectChange.pipe(takeWhileAlive(this.lifetime)).subscribe(({ added }) => {
      const selected = added[0];
      if (this.expandSelected) {
        this.treeControl.expand(selected);
      }
      this.selectChange.emit(selected);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data) {
      // Initialize or re-initialize the tree when data changes.
      this.initializeTree();
    }
  }

  ngOnDestroy() {
    this.lifetime.dispose();
  }

  onNodeSubmit(node: TreeNode, newName: string) {
    const oldName = node.displayName;
    node.displayName = newName;
    this.nodeChange.emit({ status: 'OK', node, oldName });
  }

  onNodeCancel() {
    this.nodeChange.emit({ status: 'Canceled' });
  }

  private initializeTree() {
    if (!this.data) {
      return;
    }

    this.dataSource = new ArrayDataSource(this.data);

    let nodeToSelect: TreeNode | undefined;
    let nodesToExpand: TreeNode[] = [];
    if (this.select) {
      if (this.select === PAGE_RELATIVE_PATH) {
        nodeToSelect = this.data.find((node) => isVirtualPageTemplate(node.template?.id));
      } else {
        nodesToExpand = findNodeAncestors(this.data, 'id', this.select);
        nodeToSelect = nodesToExpand[nodesToExpand.length - 1];
      }
    }

    if (!nodeToSelect) {
      const firstRoot = this.data[0];
      nodesToExpand = firstRoot && this.expandFirstRoot ? [firstRoot] : [];
    }

    if (nodeToSelect && nodeToSelect.isSelectable) {
      this.treeControl.select(nodeToSelect);
    }

    nodesToExpand.forEach((node) => this.treeControl.expand(node));
  }
}
