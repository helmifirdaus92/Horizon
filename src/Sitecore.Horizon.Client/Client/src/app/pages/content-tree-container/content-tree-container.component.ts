/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ContentTreeNode } from 'app/pages/content-tree/content-tree-node';
import { ContentTreePermissions } from 'app/pages/content-tree/content-tree-permissions';
import { NodeChangeEvent, NodeDropEvent } from 'app/pages/content-tree/content-tree.component';
import {
  ContentTreeItem,
  ContentTreeService,
  DuplicateItemParameters,
} from 'app/pages/content-tree/content-tree.service';
import { ContextNavigationService } from 'app/shared/client-state/context-navigation.sevice';
import { ContextHelper } from 'app/shared/client-state/context.helper';
import { ContextService } from 'app/shared/client-state/context.service';
import { ItemChangeService } from 'app/shared/client-state/item-change-service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { Item } from 'app/shared/graphql/item.interface';
import { LoggingService } from 'app/shared/logging.service';
import { withItemAt, withoutItem } from 'app/shared/utils/array.utils';
import { findTreeNode } from 'app/shared/utils/tree.utils';
import { isSameGuid } from 'app/shared/utils/utils';
import { EMPTY, NEVER, Observable, Subject, firstValueFrom, merge, of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  first,
  map,
  switchMap,
  switchMapTo,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { ContentTreeLocking } from '../content-tree/content-tree-locking';
import { LHSNavigationService } from '../left-hand-side/lhs-navigation.service';
import { ContentTreeContainerService, MoveNodePosition } from './content-tree-container.service';

interface CreateTransaction {
  mode: 'createNewItem' | 'duplicateItem';
  tempNode: ContentTreeNode;
  parentId: string;
  previousPageId: string;
  sourceId: string;
}

@Component({
  selector: 'app-content-tree-container',
  template: `
    <div class="loading-indicator-container px-md m-auto" *ngIf="loading">
      <ng-spd-horizontal-bars-loading-indicator [barAmount]="10"></ng-spd-horizontal-bars-loading-indicator>
    </div>
    <app-content-tree
      [contentTreeData]="contentTreeData"
      [selectedPageId]="selectedPageId"
      (selectChange)="onTreeSelect($event)"
      (expandChange)="onTreeExpand($event)"
      (nodeChange)="onNodeChange($event)"
      (nodeDrop)="onNodeDrop($event)"
      [isCreatingNewItem]="isLoading"
      [class.hidden]="loading"
    ></app-content-tree>
  `,
  styleUrls: ['./content-tree-container.component.scss'],
})
/**
 * This component handles the data aspects of content-tree component.
 * So that this is a container/controller component and content-tree is presentation.
 */
export class ContentTreeContainerComponent implements OnInit, OnDestroy {
  contentTreeData: ContentTreeNode[] = [];
  selectedPageId = '';
  unsubscribe$ = new Subject();
  isLoading = false;

  routeSegment = '';

  // This should be private but was made public to facilitate testing - cheecky
  currentCreationTransaction?: CreateTransaction;

  loading = true;

  constructor(
    private readonly contentTreeService: ContentTreeService,
    private readonly logger: LoggingService,
    private readonly context: ContextService,
    private readonly contextNavigationService: ContextNavigationService,
    private readonly lhsService: ContentTreeContainerService,
    private readonly lhsNavService: LHSNavigationService,
    private readonly configuration: ConfigurationService,
    private readonly itemChangeService: ItemChangeService,
  ) {}

  ngOnInit() {
    this.watchContentTreeContext()
      .pipe(
        takeUntil(this.unsubscribe$),
        switchMap(({ siteName, language, itemId }) => {
          this.loading = true;
          return this.contentTreeService.getContentTreeData(siteName, language, itemId);
        }),
      )
      .subscribe(async (data) => {
        this.loading = false;
        this.contentTreeData = data;

        if (this.contentTreeData && this.contentTreeData.length === 0 && this.context.itemId && this.context.siteName) {
          const activeNavigation = await firstValueFrom(this.lhsNavService.watchRouteSegment());
          if (activeNavigation !== 'editor') {
            return;
          }

          this.lhsService.showEmptyTreeErrorNotification(this.selectStartItem.bind(this));
        }
      });

    this.context.itemId$.pipe(takeUntil(this.unsubscribe$)).subscribe((id) => {
      this.selectedPageId = id;
    });

    this.contextNavigationService.mostInnerRouteSegment$.pipe(takeUntil(this.unsubscribe$)).subscribe((segment) => {
      this.routeSegment = segment;
    });

    this.contentTreeService.deleteItem$.pipe(takeUntil(this.unsubscribe$)).subscribe((itemId) => {
      this.deleteItem(itemId);
    });

    this.contentTreeService.itemToAdd$.pipe(takeUntil(this.unsubscribe$)).subscribe((item) => {
      this.addTempCreatedItem(item);
    });

    this.contentTreeService.itemToDuplicate$.pipe(takeUntil(this.unsubscribe$)).subscribe((parameters) => {
      this.addTempDuplicatedItem(parameters);
    });

    this.itemChangeService
      .watchForChanges({ scopes: ['versions'] })
      .pipe(
        switchMap(async () => await this.context.getItem()),
        map((item) => {
          const selectedNode = findTreeNode(this.selectedPageId, this.contentTreeData);
          if (selectedNode) {
            selectedNode.hasVersions$.next(item.versions.length > 0);
          }
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  onTreeSelect(node: ContentTreeNode) {
    this.selectItem(node.id, node.isFolder);
  }

  onTreeExpand(node: ContentTreeNode) {
    this.refetchNodeChildren(node);
  }

  onNodeChange({ node, canceled }: NodeChangeEvent) {
    // if node is temporaryNode then it's a Create page operation.
    if (this.currentCreationTransaction && node === this.currentCreationTransaction.tempNode) {
      this.completePendingCreationTransaction(!!canceled);
    }
  }

  async onNodeDrop({ nodeId, dropNode, position }: NodeDropEvent) {
    const node = findTreeNode(nodeId, this.contentTreeData);
    if (!node) {
      throw new Error('node not found');
    }

    const originalParent = node.parent;
    const originalPosition = this.getNodePosition(node);

    // Optimistically update on the client side immediately
    const { newParent, newIndex } = this.calculateNewParentOnMoveItem(node, dropNode, position);

    const undoAction = await this.createMoveItemUndoAction(
      node.id,
      originalParent,
      originalPosition,
      dropNode,
      position,
    );

    this.changeParent(node, newParent, newIndex);
    this._moveItem(node, dropNode, position, originalParent, originalPosition, undoAction);
  }

  private _moveItem(
    node: ContentTreeNode,
    dropNode: ContentTreeNode,
    position: MoveNodePosition,
    originalParent: ContentTreeNode | undefined,
    originalIndex: number,
    undoAction?: () => void,
  ) {
    this.lhsService
      .moveItem(this.context.siteName, node, dropNode, position)
      .pipe(
        catchError(() => {
          this.changeParent(node, originalParent, originalIndex);
          this.lhsService.showNodeMoveErrorNotification(node.id, node.text);
          return EMPTY;
        }),
      )
      .subscribe(async () => {
        // We are not done until the tree data is updated!
        // This is to prevent incompatible actions running in parallel.
        // `updateTreeAfterNodeMoved` and `undo` might have unexpected results if run concurrently.
        await this.updateTreeAfterNodeMoved(node, position);

        if (undoAction) {
          this.lhsService.showNodeMoveSuccessNotification(node.id, node.text, dropNode.text, position, undoAction);
        }
      });
  }

  private async createMoveItemUndoAction(
    nodeId: string,
    originalParent: ContentTreeNode | undefined,
    originalIndex: number,
    dropNode: ContentTreeNode,
    position: MoveNodePosition,
  ): Promise<() => void> {
    if (originalParent?.id === undefined) {
      this.logger.warn('We cannot undo action because we cannot determine the original parent of the node');
      return () => {};
    }

    let originalPosition: MoveNodePosition = 'INTO';
    let originalParentOrSibling = originalParent;

    // There is an issue: When we reorder items that belong to the same parent and then Undo,
    // we cannot update the moved item position without reloading the tree.
    //
    // So, we need to make Undo operation relative to close siblings of the dragged item, but not its parent.
    if (position !== 'INTO' && originalParent && originalParent?.id === dropNode.parent?.id) {
      originalPosition = originalIndex > 0 ? 'AFTER' : 'BEFORE';

      const siblings = await firstValueFrom(this.getChildNodes(originalParent));
      const index = originalPosition === 'AFTER' ? originalIndex - 1 : originalIndex + 1;

      originalParentOrSibling = siblings.filter((_node, i) => i === index)[0];
    }

    return () => {
      // At the time of undo the nodes might have been refetched and so they have a new object identity.
      // Make sure to find them again in the tree, using node references from before undo might no work.
      const node = findTreeNode(nodeId, this.contentTreeData);

      // For root items parent is not part of tree so we get it from parent of first item in the tree.
      // We need to re-discover the original parent if move INTO, because it updates its children references.
      originalParent =
        originalParent?.id === this.configuration.contentRootItemId
          ? this.contentTreeData[0].parent
          : findTreeNode(originalParent!.id, this.contentTreeData);

      if (!node || !originalParent) {
        throw new Error('node or originalParent not found');
      }

      // Undo can fail so we need to be able to revert it.
      const currentParent = node.parent;
      const currentPosition = this.getNodePosition(node);

      this.changeParent(node, originalParent, originalIndex);
      this._moveItem(node, originalParentOrSibling, originalPosition, currentParent, currentPosition);
    };
  }

  private calculateNewParentOnMoveItem(
    node: ContentTreeNode,
    dropNode: ContentTreeNode,
    position: MoveNodePosition,
  ): { newParent: ContentTreeNode | undefined; newIndex: number } {
    if (position === 'INTO') {
      return { newParent: dropNode, newIndex: dropNode.children.length };
    }

    const siblings = this.isChildNode(dropNode) ? dropNode.parent.children : this.contentTreeData;
    const dropNodeIndex = siblings.indexOf(dropNode);
    const isSameParent = node.parent === dropNode.parent;

    let newIndex = dropNodeIndex;

    /*
      In the scenario when the node is moved within the same parent, to a position further down.
      We need to correct the new index because the node itself being moved shifts the indexes of all node after it.

      example:
      - A
      - B -> index 1
      - C

      move A after B, new index is calculated 2 (index of B+1) but it should be 1 because the new index of B will be 0.
    */
    if (isSameParent) {
      const currentIndex = siblings.indexOf(node);
      newIndex = dropNodeIndex > currentIndex ? dropNodeIndex - 1 : dropNodeIndex;
    }

    switch (position) {
      case 'BEFORE':
        return { newParent: dropNode.parent, newIndex };
      case 'AFTER':
        return { newParent: dropNode.parent, newIndex: newIndex + 1 };
    }
  }

  private async updateTreeAfterNodeMoved(node: ContentTreeNode, position: MoveNodePosition): Promise<void> {
    if (!node.isFolder) {
      /**
       * Case: moved item is a page
       */

      this.selectItem(node.id, node.isFolder);

      // Expand new parent item if move INTO because a new parent node might be collapsed
      if (this.isChildNode(node) && position === 'INTO') {
        await this.refetchNodeChildren(node.parent);
      }

      // We do not want to realod the whole tree to keep previously expanded items expanded.
      // The node component does selection on the "selectedPageId" changes event.
      // So, it does not understand that the currentally selected item is selected because "selectedPageId"
      // does not actually change.
      //
      // To resolve this conflict we refresh "selectedPageId" parameter manualy to trigger selection change.
      this.selectedPageId = '';
      setTimeout(() => {
        this.selectedPageId = node.id;
      }, 0);

      return;
    }

    /**
     * Case: moved item is a folder
     */
    this.selectItem(this.selectedPageId, true);

    if (position === 'INTO' && node.parent) {
      // If a selected item is an immediate descendant on the moved folder
      // "refetching of node children" will expand the moved folder.
      await this.refetchNodeChildren(node.parent);
    }

    /**
     * Case: selected item is in a subfolder in the moved folder
     */
    if (!findTreeNode(this.selectedPageId, this.contentTreeData)) {
      await this.reloadTree(this.selectedPageId);
    }
  }

  private getNodePosition(node: ContentTreeNode) {
    return this.isChildNode(node) ? node.parent.children.indexOf(node) : this.contentTreeData.indexOf(node);
  }

  private isChildNode(node: ContentTreeNode): node is ContentTreeNode & { parent: ContentTreeNode } {
    if (!node.parent) {
      return false;
    }

    return !this.isContentRootItem(node.parent);
  }

  private isContentRootItem(node: ContentTreeNode) {
    return (
      isSameGuid(this.configuration.contentRootItemId, node.id) ||
      isSameGuid(this.contentTreeData[0]?.parent?.id, node.id)
    );
  }

  private addRootNode(node: ContentTreeNode, index?: number) {
    index = index ?? this.contentTreeData.length;
    this.contentTreeData = withItemAt(this.contentTreeData, node, index);
  }

  private removeRootNode(node: ContentTreeNode) {
    this.contentTreeData = withoutItem(this.contentTreeData, node);
  }

  private changeParent(node: ContentTreeNode, newParent: ContentTreeNode | undefined, index: number) {
    if (this.isChildNode(node)) {
      node.parent.removeChild(node);
    } else {
      this.removeRootNode(node);
    }

    const isNewParentContentRootItem = !newParent || this.isContentRootItem(newParent);
    if (!newParent || isNewParentContentRootItem) {
      this.addRootNode(node, index);
    } else {
      newParent.addChild(node, index);
    }

    node.parent = newParent;
  }

  private async selectItem(itemId: string, isFolder: boolean) {
    if (!isFolder) {
      this.selectedPageId = itemId;
    }
    await this.context.updateContext({ itemId });
  }

  /**
   * Completely refresh tree, by loading new data, when either
   * a) Site name or language changes
   * b) ItemId changes to a value not already loaded in the tree
   */
  private watchContentTreeContext() {
    const { itemId$, language$, siteName$, value$ } = this.context;

    const itemIdChangedAndNotAlreadyLoaded$ = itemId$.pipe(filter((id) => !findTreeNode(id, this.contentTreeData)));

    return merge(itemIdChangedAndNotAlreadyLoaded$, language$, siteName$).pipe(
      // We don't care about the given value, it's just a trigger, map to the current value of context.
      switchMapTo(value$.pipe(first())),

      // Need to check if value changed because multiple streams from the merge could trigger for the same context change.
      // e.g. Language and itemId changed at the same time.
      distinctUntilChanged((previous, current) => ContextHelper.areEqual(previous, current)),
    );
  }

  private completePendingCreationTransaction(canceled: boolean) {
    if (!this.currentCreationTransaction) {
      return;
    }

    const { tempNode, parentId, previousPageId } = this.currentCreationTransaction;

    if (canceled) {
      this.cancelPendingCreationTransaction();
      return;
    }

    if (!tempNode.text) {
      this.lhsService.showNotificationCreationEmptyName(tempNode);
      this.cancelPendingCreationTransaction();
      return;
    }

    let createOperation: Observable<any>;

    this.isLoading = true;
    if (this.currentCreationTransaction.mode === 'createNewItem') {
      createOperation = (tempNode.isFolder ? this.contentTreeService.addFolder : this.contentTreeService.addPage).apply(
        this.contentTreeService,
        [
          tempNode.text,
          this.currentCreationTransaction.sourceId,
          parentId,
          this.context.language,
          this.context.siteName,
        ],
      );
    } else {
      createOperation = this.contentTreeService.duplicateItem(
        this.currentCreationTransaction.sourceId,
        tempNode.text,
        this.context.language,
        this.context.siteName,
      );
    }

    createOperation
      .pipe(
        catchError((errorCode) => {
          this.isLoading = false;
          this.logger.info(`Create/duplicate page/folder failed for item ${tempNode.text} with code: ${errorCode}`);
          this.lhsService.showNotificationForCreationFailed(errorCode, tempNode);
          this.cancelPendingCreationTransaction();
          return NEVER;
        }),
      )
      .subscribe(async ({ id }) => {
        this.currentCreationTransaction = undefined;
        let newNode: ContentTreeNode | undefined;
        this.isLoading = false;

        if (tempNode.parent) {
          // Fetch latest siblings. It is important to reuse existent sibling nodes
          // If there are any sibling's expanded descendants we keep them in the tree
          const latestSameLevelNodes = await firstValueFrom(this.getChildNodes(tempNode.parent));
          newNode = latestSameLevelNodes.find((n) => isSameGuid(n.id, id));

          for (let i = 0; i < latestSameLevelNodes.length; i++) {
            const oldSibling = tempNode.parent.children.find((s) => isSameGuid(s.id, latestSameLevelNodes[i].id));
            if (oldSibling) {
              latestSameLevelNodes[i] = oldSibling;
            }
          }
          tempNode.parent.updateChildren(latestSameLevelNodes);
        } else {
          await this.reloadTree(id);
          await this.selectItem(id, tempNode.isFolder);
        }

        if (!tempNode.isFolder) {
          if (isSameGuid(this.context.itemId, previousPageId) && newNode) {
            if (newNode.hasChildren) {
              // Item created form branch template has child items
              await this.refetchNodeChildren(newNode);
            }
            this.selectItem(id, tempNode.isFolder);
          }
          return;
        } else {
          this.selectedPageId = previousPageId;
        }
      });
  }

  private reloadTree(itemId: string): Promise<any> {
    return firstValueFrom(
      this.contentTreeService.getContentTreeData(this.context.siteName, this.context.language, itemId).pipe(
        tap((treeData) => {
          this.contentTreeData = treeData;
        }),
      ),
    ).catch(() => undefined);
  }

  private cancelPendingCreationTransaction() {
    if (!this.currentCreationTransaction) {
      return;
    }

    const node = this.currentCreationTransaction.tempNode;
    if (this.isChildNode(node)) {
      node.parent.removeChild(node);
    } else {
      this.removeRootNode(node);
    }

    this.selectedPageId = this.currentCreationTransaction.previousPageId;
    this.currentCreationTransaction = undefined;
  }

  private refetchNodeChildren(node: ContentTreeNode): Promise<any> {
    node.isLoading = true;
    return firstValueFrom(
      this.getChildNodes(node).pipe(
        tap((childNodes) => {
          node.isLoading = false;
          node.updateChildren(childNodes);
        }),
      ),
    ).catch(() => undefined);
  }

  private isItemSelected(item: ContentTreeNode) {
    return isSameGuid(this.selectedPageId, item.id);
  }

  private async deleteItem(itemId: string) {
    const item = findTreeNode(itemId, this.contentTreeData);

    if (!item) {
      return;
    }

    if (!this.isChildNode(item)) {
      this.removeRootNode(item);
      if (this.isItemSelected(item) || this.hasActiveChild(item)) {
        await this.selectStartItem();
      }
      return;
    }

    if (this.isItemSelected(item) || this.hasActiveChild(item)) {
      await this.selectStartItem();
    }

    item.parent.removeChild(item);
    (item as ContentTreeNode).parent = undefined;

    /**
     * Case: item has not been removed for any reason
     */
    if (findTreeNode(itemId, this.contentTreeData)) {
      await this.reloadTree(this.selectedPageId);
    }
  }

  private async selectStartItem() {
    let startItemId = '';
    if (this.routeSegment === 'editpagebranch') {
      startItemId = this.contentTreeData[0]?.id;
    } else {
      startItemId = await firstValueFrom(this.lhsService.getStartItemId(this.context.siteName, this.context.language));
    }
    if (startItemId) {
      this.selectItem(startItemId, false);
    }
  }

  private addTempCreatedItem(item: ContentTreeItem) {
    this.renderTempNode(item.text, item.isFolder, item.parentId, false).subscribe((node) => {
      this.currentCreationTransaction = {
        mode: 'createNewItem',
        tempNode: node,
        previousPageId: this.selectedPageId,
        sourceId: item.templateId,
        parentId: item.parentId,
      };
      this.selectedPageId = node.id;
    });
  }

  private addTempDuplicatedItem(parameters: DuplicateItemParameters) {
    this.renderTempNode(parameters.text, parameters.isFolder, parameters.parentId, parameters.hasChildren).subscribe(
      (node) => {
        this.currentCreationTransaction = {
          mode: 'duplicateItem',
          sourceId: parameters.sourceItemId,
          tempNode: node,
          previousPageId: this.selectedPageId,
          parentId: parameters.parentId,
        };
        this.selectedPageId = node.id;
      },
    );
  }

  private renderTempNode(
    text: string,
    isFolder: boolean,
    parentId: string,
    hasChildren: boolean,
  ): Observable<ContentTreeNode> {
    let node: ContentTreeNode;
    const tempId = 'DraftId-' + new Date().getTime().toString();

    const parent = findTreeNode(parentId, this.contentTreeData);

    let siblings$: Observable<readonly ContentTreeNode[]>;

    if (!parent) {
      siblings$ = of(this.contentTreeData);
    } else if (parent.hasChildren && parent.children.length > 0) {
      siblings$ = parent.children$.pipe(first());
    } else {
      // Children are not fetched yet.
      siblings$ = this.getChildNodes(parent);
    }

    return siblings$.pipe(
      map((siblings) => {
        node = new ContentTreeNode({
          item: {} as Item,
          id: tempId,
          text,
          permissions: ContentTreePermissions.empty(),
          locking: ContentTreeLocking.empty(),
          parent,
          isFolder,
          hasChildren,
          enableEdit: true,
        });

        if (parent) {
          parent.updateChildren([node, ...siblings]);
        } else {
          this.addRootNode(node);
        }

        return node;
      }),
    );
  }

  private getChildNodes(node: ContentTreeNode) {
    return this.contentTreeService.getChildeNodes(this.context.siteName, this.context.language, node.id, node);
  }

  private hasActiveChild(node: ContentTreeNode): boolean {
    return node.children.some((child) => this.hasActiveChild(child) || this.isItemSelected(child));
  }
}
