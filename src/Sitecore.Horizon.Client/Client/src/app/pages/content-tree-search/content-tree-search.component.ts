/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PopoverDirective, SearchInputComponent } from '@sitecore/ng-spd-lib';
import { ContextService } from 'app/shared/client-state/context.service';
import { Item, toHorizonItem } from 'app/shared/graphql/item.interface';
import { TreeNode } from 'app/shared/item-tree/item-tree.component';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  debounce,
  distinctUntilChanged,
  firstValueFrom,
  map,
  of,
  timer,
} from 'rxjs';
import { ContentTreeService } from '../content-tree/content-tree.service';
import { ContentTreeSearchDalService } from './content-tree-search.dal.service';
import { SearchPaginationOperation } from './searh-pagination-operation';

export type TreeItemTypeFilter = 'All' | 'Pages' | 'Folders';

@Component({
  selector: 'app-content-tree-search',
  templateUrl: './content-tree-search.component.html',
  styleUrls: ['./content-tree-search.component.scss'],
})
export class ContentTreeSearchComponent implements AfterViewInit {
  @Output() closeSearch = new EventEmitter<void>();
  @Output() selectItem = new EventEmitter<TreeNode>();

  @ViewChild('popoverInstance', { static: true }) private popoverInstance?: PopoverDirective;
  @ViewChild(SearchInputComponent) searchInputComponent?: SearchInputComponent;
  @ViewChild('itemsTree', { read: ElementRef }) itemsTree?: ElementRef;

  readonly searchInput$ = new Subject<string>();
  readonly filterInput$ = new BehaviorSubject<TreeItemTypeFilter>('All');
  searchQueryIsEmpty = true;
  isLoading = false;
  treeData: TreeNode[] = [];
  hasScroll = false;

  private readonly lifetime = new Lifetime();
  private latestSearch = new SearchPaginationOperation(() => of({ isSuccessful: true, totalCount: 0, items: [] }));

  constructor(
    private readonly searchDalService: ContentTreeSearchDalService,
    private readonly contentTreeService: ContentTreeService,
    private readonly contextService: ContextService,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly translateService: TranslateService,
    private readonly elementRef: ElementRef,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {
    this.watchSearch()
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(([query, itemTypeFilter]) => {
        this.searchQueryIsEmpty = !query;
        if (!this.searchQueryIsEmpty) {
          this.latestSearch.cancel();

          this.latestSearch = new SearchPaginationOperation((paging) =>
            this.searchDalService.search(query, this.contentTreeService.contentTreeRoots, itemTypeFilter, paging),
          );
          this.fetchUntilScrollAppears(this.latestSearch);
        } else {
          this.treeData = [];
        }
      });
  }

  ngAfterViewInit() {
    // workaround to focus search input after rendering the component
    this.searchInputComponent?.clear();
  }

  readonly popoverIsActive = (): boolean | undefined => this.popoverInstance?.isPopoverVisible();

  // close the component by clicking outside of it
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target) && !this.popoverIsActive()) {
      this.closeSearch.next();
    }
  }

  // close the component by clicking outside of it - handle click inside Canvas
  @HostListener('window:blur', ['$event'])
  onWindowBlur(): void {
    this.closeSearch.next();
  }

  getChildren = (node: TreeNode) => {
    return node.hasChildren
      ? this.contentTreeService
          .fetchItemChildren(this.contextService.siteName, this.contextService.language, node.id)
          .pipe(map((item) => item.children?.map((childItem) => this.toTreeNode(childItem)) ?? []))
      : [];
  };

  setItemTypeFilter(itemTypeFilter: TreeItemTypeFilter, checked: boolean) {
    if (itemTypeFilter === this.filterInput$.value || !checked) {
      return;
    }
    this.filterInput$.next(itemTypeFilter);
  }

  onSelectItem(node: TreeNode) {
    this.selectItem.next(node);
  }

  onScroll(event: Event) {
    this.hasScroll = (event.target as HTMLElement).scrollTop > 0;

    this.handlePagination(event, this.latestSearch);
  }

  private async fetchUntilScrollAppears(search: SearchPaginationOperation) {
    this.treeData = [];

    let hasScroll = false;
    while (!hasScroll && search.state !== 'fetchedAllItems') {
      this.isLoading = true;
      const items = await firstValueFrom(search.searchNext());
      if (search === this.latestSearch) {
        this.isLoading = false;
      }

      if (search.state === 'canceled') {
        return;
      }

      if (search.state === 'error') {
        this.showError();
        return;
      }

      const treeNodes = items.map((r) => toHorizonItem(r)).map((item) => this.toTreeNode(item));
      this.treeData = this.treeData.concat(treeNodes);
      this.changeDetectorRef.detectChanges();

      hasScroll = this.itemsTree?.nativeElement?.scrollHeight > this.itemsTree?.nativeElement?.clientHeight;
    }
  }

  private async handlePagination(event: Event, searchOperation: SearchPaginationOperation) {
    const container = event.target as HTMLElement;
    if (!container) {
      return;
    }

    if (container.scrollHeight - container.scrollTop <= container.clientHeight + 5) {
      if (!this.isLoading && searchOperation.state !== 'fetchedAllItems') {
        this.isLoading = true;
        const items = await firstValueFrom(searchOperation.searchNext());
        if (searchOperation === this.latestSearch) {
          this.isLoading = false;
        }

        if (searchOperation.state === 'canceled') {
          return;
        }

        if (searchOperation.state === 'error') {
          this.showError();
          return;
        }

        const newItems = items.map((r) => toHorizonItem(r)).map((item) => this.toTreeNode(item));
        this.treeData = this.treeData.concat(...newItems);
      }
    }
  }

  private toTreeNode(item: Item): TreeNode {
    item.hasChildren = item.isFolder ? item.hasChildren : false;

    const treeNode: TreeNode = {
      id: item.id,
      displayName: item.displayName,
      hasChildren: item.hasChildren,
      isFolder: item.isFolder,
      isSelectable: !item.isFolder,
      isCompatible: !item.isFolder,
    };
    return treeNode;
  }

  private watchSearch(): Observable<[string, TreeItemTypeFilter]> {
    const query$ = this.searchInput$.pipe(
      debounce((value) => (!!value ? timer(500) : of(value))),
      distinctUntilChanged(),
    );

    return combineLatest([query$, this.filterInput$]);
  }

  private showError() {
    this.timedNotificationsService.push(
      'search-error',
      this.translateService.get('EDITOR.CONTENT_TREE.SEARCH.ERROR'),
      'error',
    );
  }
}
