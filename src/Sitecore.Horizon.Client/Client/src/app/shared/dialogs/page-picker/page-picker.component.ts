/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ContentTreeNode } from 'app/pages/content-tree/content-tree-node';
import { ContentTreeService } from 'app/pages/content-tree/content-tree.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { Item } from 'app/shared/graphql/item.interface';
import { TreeNode } from 'app/shared/item-tree/item-tree.component';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { Lifetime } from 'app/shared/utils/lifetime';
import { normalizeGuid } from 'app/shared/utils/utils';
import { BehaviorSubject, EMPTY, Observable, combineLatest, firstValueFrom, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-page-picker',
  templateUrl: './page-picker.component.html',
  styleUrl: './page-picker.component.scss',
})
export class PagePickerComponent implements OnInit, OnDestroy {
  private readonly lifetime = new Lifetime();

  @Input() usePageNames = true;
  @Input() itemId: string | null;
  @Input() set language(val: string | null) {
    this._language$.next(val);
  }
  @Input() set site(val: string | null) {
    this._site$.next(val);
  }

  private readonly _language$ = new BehaviorSubject<string | null>(null);
  private readonly _site$ = new BehaviorSubject<string | null>(null);

  @Output() selectItem = new EventEmitter<TreeNode>();

  isLoading = true;
  data$: Observable<TreeNode[]> = EMPTY;

  constructor(
    private readonly context: ContextService,
    private readonly contentTreeService: ContentTreeService,
    private readonly siteService: SiteService,
  ) {}

  ngOnInit() {
    this.data$ = combineLatest([this._site$, this._language$]).pipe(
      switchMap(async ([site, language]) => {
        const fetchSite = site ?? this.context.siteName;
        const fetchLanguage = language ?? this.context.language;
        const siteStartItem = this.siteService.getSiteByName(fetchSite)?.startItemId;
        const fetchItem = this.itemId ?? siteStartItem;

        if (!fetchItem) {
          throw new Error('Site start item is not defined');
        }

        let treeData = await firstValueFrom(
          this.contentTreeService.getContentTreeData(fetchSite, fetchLanguage, fetchItem),
        );

        if (!treeData.length && siteStartItem) {
          treeData = await firstValueFrom(
            this.contentTreeService.getContentTreeData(fetchSite, fetchLanguage, siteStartItem),
          );
        }

        const data = treeData.map((node) => this.toTreeNode(node));
        this.isLoading = false;
        return data;
      }),
    );
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
  }

  readonly getChildrenThisBound = (node: TreeNode) => {
    if (!node.hasChildren) {
      return [];
    }

    if (!!node.children?.length) {
      return node.children;
    }

    return this.fetchItemChildren(this.context.siteName, this.context.language, node.id);
  };

  onSelect(node: TreeNode) {
    this.selectItem.next(node);
  }

  private fetchItemChildren(siteName: string, language: string, itemId: string): Observable<TreeNode[]> {
    return this.contentTreeService.fetchItemChildren(siteName, language, itemId).pipe(
      map((item) => {
        return (
          item.children?.map((child) => {
            return {
              id: child.id,
              displayName: this.usePageNames ? child.name : child.displayName,
              isFolder: child.isFolder,
              isSelectable: !child.isFolder,
              hasChildren: child.hasChildren,
            };
          }) ?? []
        );
      }),
    );
  }

  private toTreeNode(node: {
    id: string;
    item: Item;
    text: string;
    isFolder: boolean;
    hasChildren: boolean;
    children?: readonly ContentTreeNode[];
  }): TreeNode {
    const { id, item, text, isFolder, hasChildren, children } = node;
    return {
      id: normalizeGuid(id),
      displayName: this.usePageNames ? item.name : text,
      isFolder,
      hasChildren,
      isSelectable: !isFolder,
      children: hasChildren ? children?.map((child) => this.toTreeNode(child)) : undefined,
    };
  }
}
