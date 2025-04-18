/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Item } from 'app/shared/graphql/item.interface';
import { extractGqlErrorCode } from 'app/shared/utils/graphql.utils';
import gql from 'graphql-tag';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';
import {
  BaseContentTreeDalService,
  ChangeDisplayNameResult,
  ContentTreeService,
  CreateFolderResult,
  CreatePageResult,
  DuplicateItemResult,
  MutationResult,
  RenameItemInput,
  RenamResult,
  UpdateItemInput,
} from '../content-tree.service';

@Injectable()
export class ContentTreeDalService extends BaseContentTreeDalService {
  constructor() {
    super();
  }

  getItemAncestors(siteName: string, language: string, itemId: string) {
    return this.apollo
      .query<{ item: Item }>({
        query: ContentTreeService.queries['GetItemAncestors'],
        variables: { path: itemId, language, siteName },
        fetchPolicy: 'no-cache', // Disable caching of the response to ensure other parts of app don't see unfiltered versions.
      })
      .pipe(map((result) => this.mapHasVersions(result.data.item)));
  }

  deleteItem(itemId: string, site?: string, language?: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const input: any = {
      path: itemId,
      deletePermanently: false,
    };

    if (site) {
      input.site = site;
    }

    if (language) {
      input.language = language;
    }

    return this.apollo
      .mutate({
        mutation: ContentTreeService.queries['DeleteItem'],
        variables: {
          input,
        },
      })
      .pipe(catchError(extractGqlErrorCode));
  }

  addFolder(
    name: string,
    templateId: string,
    parentId: string,
    language: string,
    site: string,
  ): Observable<CreateFolderResult> {
    return this.apollo
      .mutate<{ createFolder: MutationResult<CreateFolderResult> }>({
        mutation: ContentTreeService.queries['CreateFolder'],
        variables: {
          input: {
            language,
            site,
            parentId,
            folderName: name,
            templateId,
          },
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data!.createFolder.item),
      );
  }

  addPage(
    name: string,
    templateId: string,
    parentId: string,
    language: string,
    site: string,
  ): Observable<CreatePageResult> {
    return this.apollo
      .mutate<{ createPage: MutationResult<CreatePageResult> }>({
        mutation: ContentTreeService.queries['CreatePage'],
        variables: {
          input: {
            language,
            site,
            parentId,
            pageName: name,
            templateId,
          },
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data!.createPage.item),
      );
  }

  duplicateItem(
    sourceItemId: string,
    newItemName: string,
    language: string,
    site: string,
  ): Observable<DuplicateItemResult> {
    return this.apollo
      .mutate<{ duplicateItem: MutationResult<DuplicateItemResult> }>({
        mutation: ContentTreeService.queries['DuplicateItem'],
        variables: {
          input: {
            sourceItemId,
            newItemName,
            language,
            site,
          },
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data!.duplicateItem.item),
      );
  }

  changeDisplayName(
    path: string,
    newDisplayName: string,
    language: string,
    site: string,
  ): Observable<ChangeDisplayNameResult> {
    return this.apollo
      .mutate<{ changeDisplayName: MutationResult<ChangeDisplayNameResult> }>({
        mutation: ContentTreeService.queries['ChangeDisplayName'],
        variables: {
          input: {
            path,
            language,
            site,
            newDisplayName,
          },
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        switchMap(({ data }) =>
          data ? of(data.changeDisplayName.item) : throwError(() => 'ChangeDisplayName result contains no data'),
        ),
      );
  }

  renamePage(
    renameItem: RenameItemInput | null,
    updateItem: UpdateItemInput | null,
    _language: string,
    _site: string,
  ): Observable<{ renameItem: RenamResult | null; updateItem: ChangeDisplayNameResult | null }> {
    return this.apollo
      .use('global')
      .query<{ renameItem: { item: Item }; updateItem: { item: Item } }>({
        query: gql`mutation UpdateItem($renameItem: RenameItemInput!, $updateItem: UpdateItemInput!) {
          renameItem(input: $renameItem) @include(if: ${!!renameItem?.newName}) {
            item {
              id:itemId
              name
              path
            }
          }
          updateItem(input: $updateItem) @include(if: ${!!updateItem?.fields.length}) {
            item {
              id:itemId
              name
              displayName
            }
          }
        }
        `,
        variables: { renameItem, updateItem },
        fetchPolicy: 'no-cache',
      })
      .pipe(
        catchError(extractGqlErrorCode),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map((result: any) => ({
          renameItem: result.data.renameItem
            ? { id: result.data.renameItem.item.id, name: result.data.renameItem.item.name }
            : null,
          updateItem: result.data.updateItem
            ? { id: result.data.updateItem.item.id, displayName: result.data.updateItem.item.displayName }
            : null,
        })),
      );
  }

  moveItem(
    itemId: string,
    targetId: string,
    site: string,
    position: 'BEFORE' | 'AFTER' | 'INTO' = 'INTO',
  ): Observable<{ success: boolean }> {
    return this.apollo
      .mutate<{ moveItem: { success: boolean } }>({
        mutation: ContentTreeService.queries['MoveItem'],
        variables: { input: { itemToMoveId: itemId, site, targetId, position } },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data!.moveItem),
      );
  }

  fetchItemChildren(siteName: string, language: string, itemId: string) {
    return this.apollo
      .query<{ item: Item }>({
        query: ContentTreeService.queries['GetItemChildren'],
        fetchPolicy: 'no-cache', // Disable caching of the response to ensure other parts of app don't see unfiltered versions.
        variables: {
          path: itemId,
          language,
          siteName,
        },
      })
      .pipe(map((result) => this.mapHasVersions(result.data.item)));
  }

  private mapHasVersions(item: Item): Item {
    item.hasVersions = item.versions && item.versions.length > 0;

    // Recursively map `hasVersions` for children
    if (item.children) {
      item.children = item.children.map(this.mapHasVersions.bind(this));
    }

    // Recursively map `hasVersions` for ancestors
    if (item.ancestors) {
      item.ancestors = item.ancestors.map(this.mapHasVersions.bind(this));
    }

    return item;
  }
}
