/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { SelectionChange } from '@angular/cdk/collections';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TreeControl, TreeNestedDataSource } from '@sitecore/ng-spd-lib';
import { LhsPanelComponent } from 'app/editor/lhs-panel/lhs-panel.component';
import { VersionActionsDialogService } from 'app/editor/right-hand-side/versions/version-actions-dialog/version-actions-dialog.service';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { ElementStyleKeys } from 'app/shared/component-library/dragimage.directive';
import { DropEvent } from 'app/shared/component-library/drop.directive';
import { temporaryItemIdPrefix } from 'app/shared/dialogs/datasource-picker/datasource-picker.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { isSameGuid } from 'app/shared/utils/utils';
import { firstValueFrom } from 'rxjs';
import { skip, take } from 'rxjs/operators';
import {
  CdpSiteDataService,
  cdpSiteData,
} from '../left-hand-side/personalization/personalization-services/cdp-site-data.service';
import { PageAbTestsDialogComponent } from '../page-ab-tests/page-ab-tests-dialog.component';
import { ContentTreeNode } from './content-tree-node';

export interface NodeChangeEvent {
  node: ContentTreeNode;
  oldName?: string;
  canceled?: boolean;
}

export interface NodeDropEvent {
  nodeId: string;
  dropNode: ContentTreeNode;
  position: 'BEFORE' | 'AFTER' | 'INTO';
}

export const treeControlFactory = (tree: ContentTreeComponent) => tree.treeControl;

@Component({
  selector: 'app-content-tree',
  templateUrl: './content-tree.component.html',
  styleUrls: ['./content-tree.component.scss'],
  providers: [
    {
      provide: TreeControl,
      useFactory: treeControlFactory,
      deps: [ContentTreeComponent],
    },
  ],
})
export class ContentTreeComponent implements OnChanges, OnInit, OnDestroy {
  @Input() selectedPageId = '';
  @Input() contentTreeData: ContentTreeNode[] = [];
  @Input() isCreatingNewItem = false;

  /**
   * Only triggers when user changes selection. Does not trigger if selection in tree is set programmatically.
   */
  @Output() selectChange = new EventEmitter<ContentTreeNode>();

  /**
   * Only triggers when user expands a node. Does not trigger if expansion in tree is done programmatically.
   */
  @Output() expandChange = new EventEmitter<ContentTreeNode>();

  @Output() nodeChange = new EventEmitter<NodeChangeEvent>();
  @Output() nodeDrop = new EventEmitter<NodeDropEvent>();

  readonly treeDataSource = new TreeNestedDataSource<ContentTreeNode>();
  readonly treeControl = new TreeControl<ContentTreeNode>(this.getChildren, this.isExpandable);
  readonly dropBeforeAfterHeight = 10;

  get contentTreeRootsIds() {
    return this.contentTreeData.map((node) => node.id);
  }

  readonly dragImageStyles: Array<[ElementStyleKeys, string]> = [
    ['fontWeight', '600'],
    ['color', '#212121'],
  ];

  private expandTriggeredProgrammatically = false;
  private selectTriggeredProgrammatically = false;
  private contentEditableElement: HTMLElement | null = null;

  private readonly lifetime = new Lifetime();

  private cdpSiteData: cdpSiteData;

  isAbTestOverviewFeatureEnabled = () => this.featureFlagService.isFeatureEnabled('pages_components-testing-overview');

  constructor(
    private readonly elementRef: ElementRef,
    private readonly versionActionsDialogService: VersionActionsDialogService,
    private readonly cdpSiteDataService: CdpSiteDataService,
    private readonly contextService: ContextService,
    private readonly featureFlagService: FeatureFlagsService,
  ) {}

  async ngOnInit() {
    this.cdpSiteDataService
      .watchCdpSiteData()
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe((data) => {
        this.cdpSiteData = data;
      });

    if (this.treeControl.onSelectChange) {
      this.treeControl.onSelectChange
        .pipe(takeWhileAlive(this.lifetime))
        .subscribe((selectionChange) => this.onTreeSelect(selectionChange));
    }
    if (this.treeControl.onExpandChange) {
      this.treeControl.onExpandChange
        .pipe(takeWhileAlive(this.lifetime))
        .subscribe((expansionChange) => this.onTreeExpand(expansionChange));
    }
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.contentTreeData) {
      this.treeDataSource.data = this.contentTreeData || [];
    }

    this.checkSelection(!!changes.contentTreeData);
  }

  isFolder(_i: number, node: ContentTreeNode) {
    return node.isFolder;
  }

  select(node: ContentTreeNode) {
    this.treeControl.select(node);
  }

  isSelected(node: ContentTreeNode) {
    return this.treeControl.isSelected(node);
  }

  isNewItemCreationInProgress(node: ContentTreeNode) {
    return node.id.startsWith(temporaryItemIdPrefix) && this.isCreatingNewItem;
  }

  onNodeSubmit(node: ContentTreeNode, newName: string) {
    this.contentEditableElement = null;
    const oldName = node.text;
    node.text = newName;
    this.nodeChange.emit({ node, oldName });
  }

  onNodeCancel(node: ContentTreeNode) {
    if (this.contentEditableElement) {
      this.contentEditableElement.focus();
    }
    this.contentEditableElement = null;
    this.nodeChange.emit({ node, canceled: true });
  }

  onNodeDrop({ payload: nodeId, offsetTop, offsetBottom }: DropEvent, dropNode: ContentTreeNode) {
    const position: NodeDropEvent['position'] =
      offsetTop <= this.dropBeforeAfterHeight
        ? 'BEFORE'
        : offsetBottom <= this.dropBeforeAfterHeight
          ? 'AFTER'
          : 'INTO';

    // Need to expand dropNode for cases when we move a folder without a context(selected) item
    this.treeControl.expand(dropNode);

    this.nodeDrop.emit({ nodeId, dropNode, position });
  }

  collapse(node: ContentTreeNode) {
    if (!node.enableEdit) {
      this.treeControl.collapse(node);
    }
  }

  async createNewVersion(node: ContentTreeNode) {
    const createVersion = await firstValueFrom(this.versionActionsDialogService.showCreateVersionDialog(node.id));
    node.hasVersions$.next(createVersion);
  }

  hasPersonalization(node: ContentTreeNode): boolean {
    return this.cdpSiteData.hasPagePersonalization(node.id);
  }

  hasAbTest(node: ContentTreeNode): boolean {
    return this.cdpSiteData.hasPageWithAbTest(node.id, this.isAbTestOverviewFeatureEnabled());
  }

  openPageAbTestsDialog(targetItemId: string): void {
    if (this.isAbTestOverviewFeatureEnabled()) {
      if (!isSameGuid(this.contextService.itemId, targetItemId)) {
        this.contextService.updateContext({ itemId: targetItemId });
      }

      LhsPanelComponent.show(PageAbTestsDialogComponent);
    }
  }

  private checkSelection(scrollToElement = false) {
    const node = this.findPageById(this.selectedPageId);
    if (node) {
      // selecting the node programmatically, because we don't want to dispatch events that are somehow handling user's selection
      this.selectNodeWithoutDispatchingSelectEvent(node);

      // expands all parent nodes programatically and recursively
      this.expandAncestorsWithoutDispatchingExpandEvent(node);

      if (scrollToElement) {
        this.scrollToSelectedItem(node);
      }
    }
  }

  private expandAncestorsWithoutDispatchingExpandEvent(node: ContentTreeNode) {
    let parent: ContentTreeNode | undefined = node;
    this.expandTriggeredProgrammatically = true;
    while (parent) {
      this.treeControl.expand(parent);
      parent = parent.parent;
    }
    this.expandTriggeredProgrammatically = false;
  }

  private selectNodeWithoutDispatchingSelectEvent(node: ContentTreeNode) {
    this.selectTriggeredProgrammatically = true;
    this.treeControl.select(node);
    this.selectTriggeredProgrammatically = false;
  }

  private async scrollToSelectedItem(node: ContentTreeNode) {
    // Wait for rendering to be done
    await Promise.resolve();
    const el = this.elementRef.nativeElement.querySelector(`[data-id="${node.id}"`) as HTMLElement | undefined;
    if (!el) {
      return;
    }

    const elRect = el.getBoundingClientRect();
    // Use parent element, as it has overflow:auto. Because of that our size is calculated wrongly.
    const visibleRect = (this.elementRef.nativeElement.parentElement as HTMLElement).getBoundingClientRect();
    const isFullyVisible =
      elRect.top >= visibleRect.top &&
      elRect.left >= visibleRect.left &&
      elRect.bottom <= visibleRect.bottom &&
      elRect.right <= visibleRect.right;

    if (!isFullyVisible) {
      el.scrollIntoView(true);
    }
  }

  private findPageById(pageId: string): ContentTreeNode | undefined {
    const findPage = (id: string, branch: ContentTreeNode): ContentTreeNode | undefined => {
      if (isSameGuid(id, branch.id)) {
        return branch;
      }
      const branchChildren = branch.children;
      for (const child of branchChildren) {
        const result = findPage(id, child);
        if (result) {
          return result;
        }
      }
      return undefined;
    };

    for (const child of this.treeDataSource.data) {
      const foundNode = findPage(pageId, child);
      if (foundNode) {
        return foundNode;
      }
    }

    return undefined;
  }

  private onTreeSelect(selectionChange: SelectionChange<ContentTreeNode>) {
    if (this.selectTriggeredProgrammatically) {
      return;
    }

    const added = selectionChange.added;
    if (added && added.length > 0) {
      // fire selected and expanded event, because whenever user selects -> we need to expand the item
      this.selectChange.next(added[0]);
      this.treeControl.expand(added[0]);
    }
  }

  private onTreeExpand(expansionChange: SelectionChange<ContentTreeNode>) {
    if (this.expandTriggeredProgrammatically) {
      return;
    }

    expansionChange.added
      .filter((n) => n.hasChildren)
      .forEach((node) => {
        // Wait for children to be loaded - skip initial value and close subscription after once first value is recieved
        // When expanding, if parent is not currently selected - we need to check for selected children, and select them
        if (node.parent && !this.treeControl.isSelected(node.parent)) {
          node.children$.pipe(skip(1), take(1)).subscribe(() => {
            this.checkSelection();
          });
        }

        this.expandChange.next(node);
      });

    expansionChange.removed
      //
      .filter((n) => n.hasChildren)
      .forEach((node) => node.resetChildren());
  }

  private getChildren(node: ContentTreeNode) {
    return node.children$;
  }

  private isExpandable(node: ContentTreeNode) {
    return node.hasChildren;
  }
}
