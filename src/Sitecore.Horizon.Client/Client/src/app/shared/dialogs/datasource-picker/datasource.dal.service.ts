/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { Item, ItemInsertOption, ItemTemplate } from 'app/shared/graphql/item.interface';
import { extractGqlErrorCode } from 'app/shared/utils/graphql.utils';
import { MaybeObservable, asObservable } from 'app/shared/utils/rxjs/rxjs-custom';
import { Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const queries = require('graphql-tag/loader!./datasource.graphql');
export interface DataSourceRootItem {
  readonly id: string;
}

export interface RenderingDefinition {
  readonly datasourceRootItems: readonly DataSourceRootItem[];
  readonly templates: ItemTemplate[];
}

export interface RawItem {
  readonly id: string;
  readonly path: string;
  readonly displayName: string;
  readonly hasChildren: boolean;
  readonly isFolder: boolean;
  readonly template: {
    readonly id: string;
    readonly baseTemplateIds: string[];
    readonly isCompatible: boolean;
  };
  readonly children?: readonly RawItem[];
}

export interface RawItemAncestor extends RawItem {
  // Ancestors include `parentId` so that we can recreate the parent/child relationship
  readonly parentId: string;
  readonly children: undefined;
}

export interface ResolvedDataSource {
  readonly id: string;
}

export interface ResolvedDatasourceAndSiblings {
  id: string;
  name: string;
  path: string;
  siblings: Array<{
    id: string;
    name: string;
  }>;
}

export interface CreateRawItemResult {
  id: string;
  displayName: string;
  isFolder: boolean;
}

@Injectable({ providedIn: 'root' })
export class DatasourceDalService {
  constructor(
    private readonly apollo: Apollo,
    private readonly configurationService: ConfigurationService,
  ) {}

  getRenderingDefinition(
    path: string,
    contextItemId: string,
    language: string,
    site: string,
  ): Observable<RenderingDefinition> {
    return this.apollo
      .query<{ renderingDefinition: RenderingDefinition }>({
        query: this.configurationService.isRenderingDefinitionIncludesBranchTemplate()
          ? queries['GetRenderingDefinitionWithBranchTemplate']
          : queries['GetRenderingDefinition'],
        fetchPolicy: 'network-only',
        variables: { path, contextItemId, language, site },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data.renderingDefinition),
      );
  }

  getChildren(
    path: string,
    language: string,
    site: string,
    baseTemplateIds: MaybeObservable<readonly string[]>,
  ): Observable<RawItem[]> {
    return asObservable(baseTemplateIds).pipe(
      switchMap((templateIds) => this._getChildren(path, language, site, templateIds)),
    );
  }

  private _getChildren(
    path: string,
    language: string,
    site: string,
    baseTemplateIds: readonly string[],
  ): Observable<RawItem[]> {
    return this.apollo
      .query<{ rawItem: { id: string; children: RawItem[] } }>({
        query: queries['GetChildren'],
        fetchPolicy: 'network-only',
        variables: { path, language, site, baseTemplateIds },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data.rawItem.children),
      );
  }

  getAncestorsWithSiblings(
    path: string,
    language: string,
    site: string,
    baseTemplateIds: readonly string[],
    roots?: readonly string[],
  ): Observable<RawItemAncestor[]> {
    return this.apollo
      .query<{ rawItem: { id: string; ancestorsWithSiblings: RawItemAncestor[] } }>({
        query: queries['GetAncestorsWithSiblings'],
        fetchPolicy: 'network-only',
        variables: { path, language, site, baseTemplateIds, roots },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data.rawItem.ancestorsWithSiblings),
      );
  }

  resolveDatasource(
    source: string,
    contextItemId: string,
    language: string,
    site: string,
  ): Observable<ResolvedDataSource> {
    return this.apollo
      .query<{ resolveDataSource: ResolvedDataSource }>({
        query: queries['ResolveDataSource'],
        fetchPolicy: 'network-only',
        variables: { source, contextItemId, language, site },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data.resolveDataSource),
      );
  }

  resolveDataSourceAndSiblings(
    source: string,
    contextItemId: string,
    language: string,
    site: string,
  ): Observable<ResolvedDatasourceAndSiblings> {
    return this.apollo
      .query<{ resolveDataSource: Item }>({
        query: queries['ResolveDatasourceAndSiblings'],
        fetchPolicy: 'network-only',
        variables: { source, contextItemId, language, site },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => {
          const dsItem = data.resolveDataSource;
          return {
            id: dsItem.id,
            name: dsItem.name,
            path: dsItem.path,
            siblings: dsItem.parent?.children ?? [],
          };
        }),
      );
  }

  getInsertOptions(itemId: string, language: string, site: string): Observable<ItemInsertOption[]> {
    return this.apollo
      .query<{ item: Item }>({
        query: queries['GetInsertOptions'],
        variables: {
          itemId,
          kind: 'ITEM',
          language,
          site,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map((result) => {
          return result.data.item.insertOptions;
        }),
      );
  }

  createRawItem(
    language: string,
    site: string,
    parentId: string,
    itemName: string,
    templateId: string,
  ): Observable<CreateRawItemResult> {
    return this.apollo
      .mutate<{ createRawItem: { rawItem: CreateRawItemResult } }>({
        mutation: queries['CreateRawItem'],
        variables: {
          input: {
            language,
            site,
            parentId,
            itemName,
            templateId,
          },
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data!.createRawItem.rawItem),
      );
  }
}
