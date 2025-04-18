/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { ParamMap, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  finalize,
  firstValueFrom,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { PageTemplatesService } from '../page-templates.service';
import {
  Ancestor,
  AncestorWithSite,
  FolderContext,
  Item,
  ItemsWithBreadcrumb,
  ItemWithSite,
  SiteType,
} from '../page-templates.types';
import { combineChildren, createNavigationExtras } from './page-templates-utils';

@Injectable()
export abstract class PageTemplatesItemsNavigationBaseService {
  protected abstract readonly folderTemplateId: string;
  protected abstract readonly itemTemplateId: string;

  protected readonly _isLoading$ = new BehaviorSubject<boolean>(false);
  readonly isLoading$ = this._isLoading$.asObservable();

  protected readonly _items$ = new BehaviorSubject<ItemWithSite[]>([]);
  readonly items$ = this._items$.asObservable();

  protected readonly _hasSharedSite$ = new BehaviorSubject<boolean>(false);
  readonly hasSharedSite$ = this._hasSharedSite$.asObservable();

  protected readonly _currentRootItem$ = new BehaviorSubject<Item | ItemWithSite | undefined>(undefined);
  currentRootItem$ = this._currentRootItem$.asObservable();

  protected readonly _itemTemplateId$ = new BehaviorSubject<string | undefined>(undefined);
  siteItemTemplateId$ = this._itemTemplateId$.asObservable();

  protected readonly _folderTemplateId$ = new BehaviorSubject<string | undefined>(undefined);
  siteFolderTemplateId$ = this._folderTemplateId$.asObservable();

  protected readonly _breadCrumbItems$ = new BehaviorSubject<AncestorWithSite[]>([]);
  breadCrumbItems$ = this._breadCrumbItems$.asObservable();

  protected readonly _siteType$ = new BehaviorSubject<SiteType>('current');
  siteType$ = this._siteType$.asObservable();

  protected readonly _designRoots$ = new BehaviorSubject<Array<{ itemId: string; siteName: string }>>([]);
  designRoots$ = this._designRoots$.asObservable();

  unsubscribe$ = new Subject();

  constructor(
    protected readonly pageTemplatesService: PageTemplatesService,
    protected readonly contextService: ContextService,
    protected readonly translateService: TranslateService,
    protected readonly timedNotificationsService: TimedNotificationsService,
    protected readonly router: Router,
  ) {}

  clearSubscriptions() {
    this.unsubscribe$?.next(undefined);
    this.unsubscribe$?.complete();
  }

  abstract fetchDesignRoots(ctx: FolderContext): Observable<ItemWithSite[]>;
  abstract fetchDesignRootsWithChildren(ctx: FolderContext): Observable<ItemWithSite[]>;

  watchItems(params$: Observable<ParamMap>) {
    combineLatest([this.contextService.siteName$, this.contextService.language$, params$])
      .pipe(
        switchMap(([siteName, language, params]) => {
          this._isLoading$.next(true);
          const folderIdParam = params?.get('folder_id') ?? '';
          const siteType = params.get('site_type') === 'shared' ? 'shared' : 'current';
          this._siteType$.next(siteType);
          const folderContext: FolderContext = {
            siteName,
            language,
            folderIdParam,
            siteType,
          };
          // Root level
          const isThisAChildFolder = !!folderIdParam;
          if (!isThisAChildFolder) {
            return this.getRootsChildrenAndTemplatesInfo(folderContext);
          }
          // folder level
          const designRoots = this._designRoots$.value;
          if (designRoots.length === 0) {
            return this.fetchRootsAndSetRootsAndTemplateInfo(folderContext).pipe(
              take(1),
              switchMap(() => {
                return this.fetchChildrenAndBreadCrumbs(folderIdParam);
              }),
            );
          }

          return this.fetchChildrenAndBreadCrumbs(folderIdParam);
        }),
        catchError(() => {
          this.showRequestFailErrorMessage();
          return of();
        }),
        finalize(() => {
          this._isLoading$.next(false);
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe(({ items, breadcrumbs }) => {
        this._items$.next(items);
        this._breadCrumbItems$.next(breadcrumbs);
        this._isLoading$.next(false);
      });
  }

  async showRequestFailErrorMessage() {
    const errorInApiRequest = await firstValueFrom(
      this.translateService.get('PAGE_DESIGNS.WORKSPACE.BAD_REQUEST_ERROR_MESSAGE'),
    );

    const notification = new TimedNotification('pageTemplateRequestError', errorInApiRequest, 'error');
    this.timedNotificationsService.pushNotification(notification);
  }

  navigateToFolder(folderId: string | null) {
    if (folderId === 'root') {
      folderId = null;
    }
    const navigationExtras = createNavigationExtras(folderId, this._siteType$.value);
    this.router.navigate([], navigationExtras);
  }

  changeSiteType(siteType: SiteType): Promise<boolean> {
    const navigationExtras = createNavigationExtras(null, siteType);
    return this.router.navigate([], navigationExtras);
  }

  fetchChildrenAndBreadCrumbs(itemId: string): Observable<ItemsWithBreadcrumb> {
    return this.fetchItemChildrenWithAncestors(itemId).pipe(
      takeUntil(this.unsubscribe$),
      map((item) => {
        const itemPath = [...(item.ancestors as Ancestor[]), { displayName: item.displayName, itemId: item.itemId }];

        this._currentRootItem$.next(item);

        const designRoots = this._designRoots$.value;
        const matchingRoot = designRoots.find(
          (root) => itemPath.findIndex((pathEntry) => pathEntry.itemId === root.itemId) !== -1,
        );

        const items = item.children?.map((child) => ({ ...child, siteName: matchingRoot?.siteName ?? '' })) ?? [];

        const breadcrumbs = this.buildBreadCrumbTree(
          itemPath,
          matchingRoot?.siteName ?? '',
          matchingRoot?.itemId ?? '',
        );
        return {
          items,
          breadcrumbs,
        };
      }),
    );
  }

  getRootsChildrenAndTemplatesInfo(ctx: FolderContext): Observable<ItemsWithBreadcrumb> {
    return this.fetchDesignRootsWithChildren(ctx).pipe(
      map((roots: ItemWithSite[]) => {
        this.setRootAndTemplatesInfo(roots, ctx);

        const combineItems = combineChildren(roots, ctx.siteName, ctx.siteType);
        return {
          items: combineItems,
          breadcrumbs: [
            {
              itemId: ctx.folderIdParam ?? 'root',
              displayName: this.translateService.instant('PAGE_DESIGNS.WORKSPACE.OVERVIEW'),
              siteName: ctx.siteName,
            },
          ],
        };
      }),
    );
  }

  fetchRootsAndSetRootsAndTemplateInfo(ctx: FolderContext) {
    return this.fetchDesignRoots(ctx).pipe(
      tap((roots: ItemWithSite[]) => {
        this.setRootAndTemplatesInfo(roots, ctx);
      }),
    );
  }

  fetchItemChildrenWithAncestors(itemId: string, includeSubChildren = false): Observable<Item> {
    return this.pageTemplatesService
      .getItemChildrenWithAncestors(
        itemId,
        this.contextService.language,
        [this.folderTemplateId, this.itemTemplateId],
        includeSubChildren,
      )
      .pipe(
        take(1),
        map((item: Item) => {
          return item;
        }),
      );
  }

  setRootAndTemplatesInfo(roots: ItemWithSite[], ctx: FolderContext) {
    const root = roots.find((item) => item.siteName === ctx.siteName);
    const folderTemplateId = root?.insertOptions?.find((option) =>
      option.baseTemplates?.nodes.find((node) => node.templateId.toLowerCase() === this.folderTemplateId),
    )?.templateId;
    this._folderTemplateId$.next(folderTemplateId);

    const itemTemplateId = root?.insertOptions?.find((option) =>
      option.baseTemplates?.nodes.find((node) => node.templateId.toLowerCase() === this.itemTemplateId),
    )?.templateId;
    this._itemTemplateId$.next(itemTemplateId);
    this._currentRootItem$.next(root);
    const designRoots = roots.map((rootItem) => ({ itemId: rootItem.itemId, siteName: rootItem.siteName }));
    this._designRoots$.next(designRoots);

    this._hasSharedSite$.next(designRoots.length > 1);
    this._siteType$.next(designRoots.length > 1 ? ctx.siteType : 'current');
  }

  buildBreadCrumbTree(itemPath: Ancestor[] | undefined, rootSiteName: string, rootItemId: string): AncestorWithSite[] {
    if (!itemPath || itemPath.length === 0) {
      return [];
    }
    const startIndex = itemPath.findIndex((ancestor: Ancestor) => ancestor.itemId === rootItemId);

    const rootName = this.translateService.instant('PAGE_DESIGNS.WORKSPACE.OVERVIEW');

    const breadcrumbItems = itemPath.slice(startIndex).map((ancestor: Ancestor) => ({
      itemId: ancestor.itemId,
      displayName: ancestor.itemId !== rootItemId ? ancestor.displayName : rootName,
      siteName: rootSiteName,
    }));
    return breadcrumbItems;
  }
}
