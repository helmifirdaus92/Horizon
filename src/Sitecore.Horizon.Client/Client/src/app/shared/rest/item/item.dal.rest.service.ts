/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { inject, Injectable } from '@angular/core';
import { ItemChangeScope } from 'app/shared/client-state/item-change-service';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { Item, ItemInsertOption } from 'app/shared/graphql/item.interface';
import { SiteRepositoryService } from 'app/shared/site-language/site-repository.service';
import { combineLatest, map, Observable } from 'rxjs';
import { PageToItemMapper } from '../page/page-to-item-mapper';
import { PageApiService } from '../page/page.api.service';

@Injectable()
export class ItemDalRestService extends BaseItemDalService {
  private readonly pageApiService = inject(PageApiService);
  private readonly siteRepositoryService = inject(SiteRepositoryService);
  constructor() {
    super();
  }

  getItem(itemId: string, language: string, siteName: string, itemVersion?: number): Observable<Item> {
    const siteId = this.siteRepositoryService.getSiteId(siteName);
    return combineLatest([
      this.pageApiService.getPage(itemId, siteId, language, itemVersion),
      this.pageApiService.getPageVersions(itemId, siteId, language),
    ]).pipe(
      map(([page, versions]) => {
        const item: Item = PageToItemMapper.mapPageResponseToItem(page);
        item.versions = versions.map((versionPage) => PageToItemMapper.mapPageResponseToItem(versionPage));
        return item;
      }),
    );
  }

  getItemVersions(itemId: string, language: string, siteName: string, itemVersion?: number): Observable<Item> {
    return this.getItem(itemId, language, this.siteRepositoryService.getSiteId(siteName), itemVersion);
  }

  getItemState(
    itemId: string,
    language: string,
    siteName: string,
    itemVersion?: number,
    scopes?: readonly ItemChangeScope[],
  ): Observable<Item> {
    return this.pageApiService
      .getPageState(itemId, this.siteRepositoryService.getSiteId(siteName), language, itemVersion, scopes)
      .pipe(
        map((page) => {
          const item: Item = PageToItemMapper.mapPageStateResponseToItem(page);

          if (scopes?.includes('versions') && page.versions) {
            item.versions = page.versions.map((versionPage) => PageToItemMapper.mapPageResponseToItem(versionPage));
          }

          if (scopes?.includes('workflow') && page.workflow) {
            item.workflow = PageToItemMapper.mapWorkflow(page.workflow);
          }

          if (scopes?.includes('layout') && page.finalLayout) {
            item.presentationDetails = page.finalLayout;
          }

          return item;
        }),
      );
  }

  getItemInsertOptions(
    itemId: string,
    kind: 'page' | 'folder',
    language: string,
    siteName: string,
  ): Observable<ItemInsertOption[]> {
    return this.pageApiService
      .getPageInsertOptions(
        itemId,
        this.siteRepositoryService.getSiteId(siteName),
        language,
        kind === 'page' ? 'PAGE' : 'FOLDER',
      )
      .pipe(
        map((pageInsertOptions) =>
          pageInsertOptions.map((pageInsertOption) => ({
            id: pageInsertOption.id,
            displayName: pageInsertOption.displayName,
          })),
        ),
      );
  }

  getItemType(
    itemId: string,
    language: string,
    _siteName: string,
    siteId: string,
    itemVersion?: number | undefined,
  ): Observable<{
    id: string;
    version: number;
    kind: 'Page' | 'Folder' | 'Item';
    baseTemplateIds: string[];
    ancestors: Array<{ template: { id: string } }>;
  }> {
    return combineLatest([
      this.pageApiService.getPage(itemId, siteId, language, itemVersion),
      this.pageApiService.getPageAncestors(itemId, siteId, language),
    ]).pipe(
      map(([page, ancestors]) => {
        return {
          id: page.id,
          version: page.version,
          kind: page.hasPresentation ? 'Page' : 'Folder',
          baseTemplateIds: page.template.baseTemplateIds ?? [],
          ancestors: ancestors?.map((ancestor) => ({ template: { id: ancestor.templateId } })),
        };
      }),
    );
  }

  getItemDisplayName(itemId: string, language: string, site: string): Observable<string> {
    return this.pageApiService.getPage(itemId, site, language).pipe(map((page) => page.displayName));
  }
}
