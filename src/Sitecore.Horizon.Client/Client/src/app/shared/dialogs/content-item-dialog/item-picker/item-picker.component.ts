/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TreeNode } from 'app/shared/item-tree/item-tree.component';
import { LanguageService, SiteService } from 'app/shared/site-language/site-language.service';
import { MaybeObservable } from 'app/shared/utils/rxjs/rxjs-custom';
import { convertToNestedTree } from 'app/shared/utils/tree.utils';
import { normalizeGuid } from 'app/shared/utils/utils';
import { BehaviorSubject, combineLatest, EMPTY, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { RawItem } from './item-picker.dal.service';
import { ItemPickerService } from './item-picker.service';

@Component({
  selector: 'app-item-picker',
  template: `
    <app-item-tree
      [data]="(data$ | async)!"
      [select]="itemId$ | async | normalizeGuid"
      [getChildren]="getChildrenThisBound"
      (selectChange)="onSelect($event)"
    ></app-item-tree>
  `,
  styleUrls: ['./item-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemPickerComponent implements OnInit {
  @Input() set itemId(val: string | null) {
    this.itemId$.next(val);
  }
  @Input() set language(val: string | null) {
    this.language$.next(val);
  }
  @Input() set site(val: string | null) {
    this.site$.next(val);
  }

  itemId$ = new BehaviorSubject<string | null>(null);
  private readonly language$ = new BehaviorSubject<string | null>(null);
  private readonly site$ = new BehaviorSubject<string | null>(null);

  data$: Observable<TreeNode[]> = EMPTY;
  select = '';

  @Output() readonly selectChange = new EventEmitter<string>();

  readonly getChildrenThisBound = (node: TreeNode) => this.getChildren(node);

  constructor(
    private readonly itemPickerService: ItemPickerService,
    private readonly siteService: SiteService,
    private readonly languageService: LanguageService,
  ) {}

  ngOnInit() {
    this.data$ = this.initTree();
  }

  private initTree() {
    return combineLatest([
      this.itemId$,
      this.language$.pipe(switchMap((languageValue) => this.languageService.getValidLanguage(languageValue))),
      this.site$.pipe(switchMap((siteValue) => this.siteService.getValidSiteName(siteValue))),
    ]).pipe(
      switchMap(([itemId, language, site]) => {
        return this.siteService.getDefaultSite(site, language).pipe(
          map((siteContext) => siteContext.id),
          switchMap((siteRootItemId: string) =>
            // Do the initial request with a happy path: selected item (if there's so) is within the context site
            this.fetchTree(itemId, language, site, siteRootItemId).pipe(
              catchError((e) => {
                if (!itemId || e !== 'RootNotReachable') {
                  return of([]);
                }

                // If the initial request fails with a specific error
                // Try to fetch the tree scoped to an active site without any selections
                return this.fetchTree(siteRootItemId, language, site, siteRootItemId);
              }),
            ),
          ),
        );
      }),
    );
  }

  onSelect(select: TreeNode) {
    this.select = select.id;
    this.selectChange.emit(select.id);
  }

  private fetchTree(
    itemId: string | null,
    language: string,
    siteName: string,
    siteRoot: string,
  ): Observable<TreeNode[]> {
    return this.itemPickerService
      .getAncestorsWithSiblings(itemId ? normalizeGuid(itemId) : siteRoot, language, siteName, [siteRoot])
      .pipe(
        map((data) => data.filter((item) => item.id !== siteRoot)),
        map((data) => convertToNestedTree(data)),
        map((rawData) => rawData.map((item) => this.toTreeNodeWithNormalizedId(item))),
      );
  }

  private getChildren({ id, children, hasChildren }: TreeNode): MaybeObservable<TreeNode[]> {
    if (!hasChildren) {
      return [];
    }

    if (!!children) {
      return children;
    }

    return this.fetchChildren(id);
  }

  private toTreeNodeWithNormalizedId(item: {
    id: string;
    displayName: string;
    isFolder: boolean;
    hasChildren: boolean;
    children?: readonly RawItem[];
  }): TreeNode {
    const { id, displayName, isFolder, hasChildren, children } = item;
    return {
      id: normalizeGuid(id),
      displayName,
      isFolder,
      hasChildren,
      isSelectable: !isFolder,
      children: children ? children.map((child) => this.toTreeNodeWithNormalizedId(child)) : undefined,
    };
  }

  private fetchChildren(path: string): Observable<TreeNode[]> {
    return combineLatest([
      this.languageService.getValidLanguage(this.language$),
      this.siteService.getValidSiteName(this.site$),
    ]).pipe(
      switchMap(([language, site]) =>
        this.itemPickerService
          .getChildren(path, language, site)
          .pipe(map((rawData: RawItem[]) => rawData.map((item) => this.toTreeNodeWithNormalizedId(item)))),
      ),
    );
  }
}
