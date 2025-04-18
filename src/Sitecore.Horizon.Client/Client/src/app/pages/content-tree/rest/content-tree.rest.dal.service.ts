/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { inject, Injectable } from '@angular/core';
import { MoveNodePosition } from 'app/pages/content-tree-container/content-tree-container.service';
import { Item } from 'app/shared/graphql/item.interface';
import { PageToItemMapper } from 'app/shared/rest/page/page-to-item-mapper';
import { PageApiService } from 'app/shared/rest/page/page.api.service';
import {
  CreatePageRequest,
  DeletePageRequest,
  DuplicatePageRequest,
  MovePageRequest,
  UpdatePageRequest,
} from 'app/shared/rest/page/page.types';
import { SiteRepositoryService } from 'app/shared/site-language/site-repository.service';
import { combineLatest, map, Observable, of } from 'rxjs';
import {
  BaseContentTreeDalService,
  ChangeDisplayNameResult,
  CreateFolderResult,
  CreatePageResult,
  DISPLAY_NAME_FIELD_ID,
  DuplicateItemResult,
  RenameItemInput,
  RenamResult,
  UpdateItemInput,
} from '../content-tree.service';

@Injectable()
export class ContentTreeRestDalService extends BaseContentTreeDalService {
  private readonly pageApiService = inject(PageApiService);
  private readonly siteRepositoryService = inject(SiteRepositoryService);

  constructor() {
    super();
  }

  getItemAncestors(siteName: string, language: string, itemId: string): Observable<Item> {
    return this.pageApiService
      .getPageHierarchy(itemId, this.siteRepositoryService.getSiteId(siteName), language)
      .pipe(map((pageResponse) => PageToItemMapper.mapPageHierarchyToItem(pageResponse)));
  }

  addFolder(
    name: string,
    templateId: string,
    parentId: string,
    language: string,
    _site: string,
  ): Observable<CreateFolderResult> {
    const requestBody: CreatePageRequest = {
      parentId,
      pageName: name,
      templateId,
      language,
    };

    return this.pageApiService.createPage(requestBody).pipe(
      map((response) => ({
        id: response.pageId,
        displayName: response.displayName,
      })),
    );
  }

  addPage(
    name: string,
    templateId: string,
    parentId: string,
    language: string,
    _site: string,
  ): Observable<CreatePageResult> {
    const requestBody: CreatePageRequest = {
      parentId,
      pageName: name,
      templateId,
      language,
    };

    return this.pageApiService.createPage(requestBody).pipe(
      map((response) => ({
        id: response.pageId,
        displayName: response.displayName,
      })),
    );
  }

  deleteItem(itemId: string, _site?: string, _language?: string): Observable<void> {
    const requestBody: DeletePageRequest = {
      permanently: true,
    };

    return this.pageApiService.deletePage(itemId, requestBody).pipe(map(() => {}));
  }

  duplicateItem(
    sourceItemId: string,
    newItemName: string,
    language: string,
    siteName: string,
  ): Observable<DuplicateItemResult> {
    const requestBody: DuplicatePageRequest = {
      newName: newItemName,
      site: this.siteRepositoryService.getSiteId(siteName),
      language,
    };

    return this.pageApiService.duplicatePage(sourceItemId, requestBody).pipe(
      map((response) => ({
        id: response.pageId,
        path: response.path,
        displayName: response.displayName,
      })),
    );
  }

  changeDisplayName(
    pageId: string,
    newDisplayName: string,
    language: string,
    _site: string,
  ): Observable<ChangeDisplayNameResult> {
    const requestBody: UpdatePageRequest = {
      language,
      fields: [{ name: '__Display name', value: newDisplayName }],
    };

    return this.pageApiService.updatePage(pageId, requestBody).pipe(
      map((response) => ({
        id: response.pageId,
        displayName: response.displayName,
      })),
    );
  }

  renamePage(
    renameItem: RenameItemInput | null,
    updateItem: UpdateItemInput | null,
    language: string,
    siteName: string,
  ): Observable<{ renameItem: RenamResult | null; updateItem: ChangeDisplayNameResult | null }> {
    const pageId = renameItem?.itemId || updateItem?.itemId;
    const newDisplayName = updateItem?.fields.find((field) => field.name === DISPLAY_NAME_FIELD_ID)?.value;

    if (!pageId) {
      console.error('PageId is required');
      return of({ renameItem: null, updateItem: null });
    }

    const renamResult$: Observable<{ id: string; name: string } | null> = renameItem
      ? this.pageApiService
          .renamePage(pageId, { newName: renameItem.newName })
          .pipe(map(() => ({ id: pageId, name: renameItem.newName })))
      : of(null);

    const changeDisplayNameResult$: Observable<{ id: string; displayName: string } | null> =
      newDisplayName !== null && newDisplayName !== undefined
        ? this.changeDisplayName(pageId, newDisplayName, language, this.siteRepositoryService.getSiteId(siteName)).pipe(
            map(() => ({ id: pageId, displayName: newDisplayName })),
          )
        : of(null);

    return combineLatest([renamResult$, changeDisplayNameResult$]).pipe(
      map(([renameItemResult, updateItemResult]) => ({ renameItem: renameItemResult, updateItem: updateItemResult })),
    );
  }

  fetchItemChildren(siteName: string, language: string, itemId: string): Observable<Item> {
    return this.pageApiService
      .getPageChildren(itemId, this.siteRepositoryService.getSiteId(siteName), language)
      .pipe(map((pageRepsone) => PageToItemMapper.mapPageChildrenToItem(itemId, pageRepsone)));
  }

  moveItem(
    itemId: string,
    targetId: string,
    siteName: string,
    position: MoveNodePosition,
  ): Observable<{ success: boolean }> {
    const requestBody: MovePageRequest = {
      targetId,
      site: this.siteRepositoryService.getSiteId(siteName),
      position,
    };

    return this.pageApiService.movePage(itemId, this.siteRepositoryService.getSiteId(siteName), requestBody).pipe(
      map((response) => ({
        success: response,
      })),
    );
  }
}
