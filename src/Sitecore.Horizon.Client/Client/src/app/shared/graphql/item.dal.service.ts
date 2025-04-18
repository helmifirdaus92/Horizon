/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, Observable } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { ItemChangeScope } from '../client-state/item-change-service';
import { extractGqlErrorCode } from '../utils/graphql.utils';
import { XmCloudFeatureCheckerService } from '../xm-cloud/xm-cloud-feature-checker.service';
import { Item, ItemInsertOption } from './item.interface';

export type ItemFieldVersioning = 'VERSIONED' | 'SHARED' | 'UNVERSIONED';

export enum ItemFieldValidationResult {
  Unknown = 'Unknown',
  Suggestion = 'Suggestion',
  Warning = 'Warning',
  Error = 'Error',
  CriticalError = 'CriticalError',
  FatalError = 'FatalError',
}

export interface PageInfo {
  hasNextPage: boolean;
  startCursor: string;
  endCursor: string;
}

interface FieldDataSourceResult {
  item: {
    id: string;
    template: {
      id: string;
      field: {
        id: string;
        sources: string[];
      };
    };
  };
}

export interface ItemFieldAccess {
  canWrite: boolean;
  canRead: boolean;
}
export interface ItemField {
  item: {
    id: string;
    version: number;
    language: string;
    revision: string;
    access: ItemFieldAccess;
  };
  value: { rawValue: string };
  containsStandardValue: boolean;
  validation: Array<{
    message: string;
    valid: boolean;
    validator: string;
    result?: ItemFieldValidationResult;
  }>;
  access: ItemFieldAccess;
  templateField: {
    templateFieldId: string;
    name: string;
    type: ItemFieldType;
    sectionName: string;
    dataSource: ItemFieldDataSource[];
    dataSourcePageInfo: PageInfo;
    versioning: ItemFieldVersioning;
  };
}

export type ItemFieldType =
  | 'Droplink'
  | 'Checklist'
  | 'Single-Line Text'
  | 'Multi-Line Text'
  | 'Rich Text'
  | 'Tag Treelist'
  | 'Multilist'
  | 'Multilist with Search'
  | 'Droplist'
  | 'Number'
  | 'Integer'
  | 'Multiroot Treelist'
  | 'Treelist'
  | 'Checkbox'
  | 'Taglist'
  | 'Image'
  | 'File'
  | 'General Link'
  | 'Date'
  | 'Datetime'
  | 'Droptree'
  | 'Grouped Droplink'
  | 'Grouped Droplist'
  | 'TreelistEx';

export interface ItemFieldDataSource {
  displayName: string;
  itemId: string;
  hasChildren: boolean;
  hasPresentation: boolean;
  path?: string;
}
export interface ItemFieldsAuthoringGqlResponse {
  item: {
    itemId: string;
    language: {
      name: string;
    };
    version: number;
    revision: { value: string };
    access: ItemFieldAccess;
    fields: {
      nodes: Array<{
        value: string | null;
        containsStandardValue: boolean;
        access: ItemFieldAccess;
        templateField: {
          section: {
            name: string;
          };
          templateFieldId: string;
          name: string;
          type: ItemFieldType;
          dataSource: {
            items: {
              nodes: ItemFieldDataSource[];
              pageInfo: PageInfo;
            };
          };
          versioning: ItemFieldVersioning;
        };
        validation: [
          {
            results: {
              nodes: Array<{
                message: string;
                valid: boolean;
                validator: string;
                result?: ItemFieldValidationResult;
              }>;
            };
          },
        ];
      }>;
      pageInfo: PageInfo;
    };
  };
}

export interface ItemFieldAuthoringGqlResponse {
  item: {
    itemId: string;
    language: {
      name: string;
    };
    version: number;
    revision: { value: string };
    access: ItemFieldAccess;
    field: {
      value: string;
      containsStandardValue: boolean;
      access: ItemFieldAccess;
      templateField: {
        section: {
          name: string;
        };
        templateFieldId: string;
        name: string;
        type: ItemFieldType;
        dataSource: {
          items: {
            nodes: ItemFieldDataSource[];
            pageInfo: PageInfo;
          };
        };
        versioning: ItemFieldVersioning;
      };
      validation: [
        {
          results: {
            nodes: Array<{
              message: string;
              valid: boolean;
              validator: string;
              result?: ItemFieldValidationResult;
            }>;
          };
        },
      ];
    };
  };
}

type ItemKind = 'Page' | 'Folder' | 'Item';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const queries = require('graphql-tag/loader!./item.dal.service.graphql');

export interface RawItem {
  readonly id: string;
  readonly displayName: string;
  readonly hasChildren: boolean;
  readonly isFolder: boolean;
  readonly children?: readonly RawItem[];
  readonly url: string;
  readonly path: string;
}

@Injectable({ providedIn: 'root' })
export abstract class BaseItemDalService {
  protected readonly apollo = inject(Apollo);
  private readonly xmCloudFeatureCheckerService = inject(XmCloudFeatureCheckerService);

  constructor() {}

  abstract getItem(itemId: string, language: string, site: string, itemVersion?: number): Observable<Item>;

  abstract getItemVersions(
    itemId: string,
    language: string | null,
    site: string,
    itemVersion?: number,
  ): Observable<Item>;

  abstract getItemState(
    itemId: string,
    language: string,
    site: string,
    itemVersion?: number,
    scopes?: readonly ItemChangeScope[],
  ): Observable<Item>;

  abstract getItemInsertOptions(
    path: string,
    kind: 'page' | 'folder',
    language: string,
    site: string,
  ): Observable<ItemInsertOption[]>;

  abstract getItemType(
    itemId: string,
    language: string,
    siteName: string,
    siteId: string,
    itemVersion?: number,
  ): Observable<{
    id: string;
    version: number;
    kind: ItemKind;
    baseTemplateIds: string[];
    ancestors: Array<{ template: { id: string } }>;
  }>;

  abstract getItemDisplayName(itemId: string, language: string, site: string): Observable<string>;

  /// XmAps api does not support field data sources and item without presentation queries in v1
  getFieldDataSources(itemId: string, fieldId: string, language: string, site: string): Observable<string[]> {
    return this.apollo
      .query<FieldDataSourceResult>({
        query: queries['GetFieldDataSources'],
        fetchPolicy: 'network-only',
        variables: { path: itemId, language, site, fieldId },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data.item.template.field.sources),
      );
  }

  getRawItem(itemId: string, language: string, site: string): Observable<RawItem> {
    return this.apollo
      .query<{ rawItem: RawItem }>({
        query: queries['GetRawItemByPath'],
        fetchPolicy: 'network-only',
        variables: {
          path: itemId,
          language,
          site,
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data.rawItem),
      );
  }

  /// XmAps api does not yet support fetching item fields
  async fetchItemFields(itemId: string, language: string, version?: number): Promise<ItemField[]> {
    const isErrorSeveritySupported = await this.xmCloudFeatureCheckerService.isErrorSeveritySupported();

    const getFieldsQuery = isErrorSeveritySupported
      ? queries['GetItemFieldsWithErrorSeverity']
      : queries['GetItemFields'];

    const fetchFieldsPaginated = (fieldsStartCursor?: string) => {
      return this.apollo
        .use('global')
        .query<ItemFieldsAuthoringGqlResponse>({
          query: getFieldsQuery,
          fetchPolicy: 'no-cache',
          variables: {
            itemId,
            language,
            version,
            fieldsStartCursor,
          },
        })
        .pipe(catchError(extractGqlErrorCode));
    };

    const response = (await firstValueFrom(fetchFieldsPaginated())).data;

    let pageNumber = 1;
    while (response.item?.fields?.pageInfo?.hasNextPage && pageNumber <= 20) {
      pageNumber++;
      const nextPageFields = (await firstValueFrom(fetchFieldsPaginated(response.item.fields.pageInfo.endCursor))).data
        .item.fields;
      response.item.fields.nodes.push(...nextPageFields.nodes);
      response.item.fields.pageInfo = nextPageFields.pageInfo;
    }

    return this.mapResponseToItemFields(response);
  }

  fetchItemField(
    fieldId: string,
    itemId: string,
    language: string,
    version?: number,
    dsStartCursor?: string,
  ): Observable<ItemField> {
    return this.apollo
      .use('global')
      .query<ItemFieldAuthoringGqlResponse>({
        query: queries['GetItemField'],
        fetchPolicy: 'no-cache',
        variables: {
          itemId,
          language,
          version,
          fieldId,
          dsStartCursor,
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => {
          return this.mapResponseToItemField(data);
        }),
      );
  }

  getItemPath(itemId: string, language: string, site: string): Observable<string> {
    return this.apollo
      .query<{ rawItem: Item }>({
        query: queries['GetRawItemPath'],
        fetchPolicy: 'cache-first',
        variables: {
          path: itemId,
          language,
          site,
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        filter(({ data }) => !!data),
        map(({ data }) => data.rawItem.path),
      );
  }

  private mapResponseToItemFields(response: ItemFieldsAuthoringGqlResponse): ItemField[] {
    if (response.item.fields && response.item.fields.nodes) {
      return response.item.fields.nodes.map((node) => ({
        item: {
          id: response.item.itemId,
          language: response.item.language.name,
          version: response.item.version,
          revision: response.item.revision.value,
          access: response.item.access,
        },
        value: { rawValue: node.value ?? '' },
        containsStandardValue: node.containsStandardValue,
        access: node.access,
        validation: node.validation
          .map((v) =>
            v.results.nodes.map((r) => ({
              message: r.message,
              valid: r.valid,
              validator: r.validator,
              result: r.result,
            })),
          )
          .flat(),
        templateField: {
          templateFieldId: node.templateField.templateFieldId,
          name: node.templateField.name,
          type: node.templateField.type,
          sectionName: node.templateField.section.name,
          dataSource: node.templateField.dataSource.items.nodes.map((item) => ({
            displayName: item.displayName,
            itemId: item.itemId,
            hasChildren: item.hasChildren,
            hasPresentation: item.hasPresentation,
            path: item.path,
          })),
          dataSourcePageInfo: node.templateField.dataSource.items.pageInfo,
          versioning: node.templateField.versioning,
        },
      }));
    }
    return [];
  }

  private mapResponseToItemField(response: ItemFieldAuthoringGqlResponse): ItemField {
    return {
      item: {
        id: response.item.itemId,
        language: response.item.language.name,
        version: response.item.version,
        revision: response.item.revision.value,
        access: response.item.access,
      },
      value: { rawValue: response.item.field.value },
      containsStandardValue: response.item.field.containsStandardValue,
      validation: response.item.field.validation
        .map((v) =>
          v.results.nodes.map((r) => ({
            message: r.message,
            valid: r.valid,
            validator: r.validator,
            result: r.result,
          })),
        )
        .flat(),
      access: response.item.field.access,
      templateField: {
        templateFieldId: response.item.field.templateField.templateFieldId,
        name: response.item.field.templateField.name,
        type: response.item.field.templateField.type,
        sectionName: response.item.field.templateField.section.name,
        dataSource: response.item.field.templateField.dataSource.items.nodes.map((item) => ({
          displayName: item.displayName,
          itemId: item.itemId,
          hasChildren: item.hasChildren,
          hasPresentation: item.hasPresentation,
        })),
        dataSourcePageInfo: response.item.field.templateField.dataSource.items.pageInfo,
        versioning: response.item.field.templateField.versioning,
      },
    };
  }
}

@Injectable()
export class ItemDalService extends BaseItemDalService {
  constructor() {
    super();
  }

  getItem(itemId: string, language: string, site: string, itemVersion?: number): Observable<Item> {
    return this.apollo
      .query<{ item: Item }>({
        query: queries['GetItem'],
        fetchPolicy: 'network-only',
        variables: {
          path: itemId,
          version: itemVersion,
          language,
          site,
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data.item),
      );
  }

  getItemVersions(itemId: string, language: string | null, site: string, itemVersion?: number): Observable<Item> {
    return this.apollo
      .query<{ item: Item }>({
        query: queries['GetItemVersions'],
        fetchPolicy: 'network-only',
        variables: {
          path: itemId,
          version: itemVersion,
          language,
          site,
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data.item),
      );
  }

  getItemState(
    itemId: string,
    language: string,
    site: string,
    itemVersion?: number,
    scopes?: readonly ItemChangeScope[],
  ): Observable<Item> {
    return this.apollo
      .query<{ item: Item }>({
        query: queries['GetItemState'],
        fetchPolicy: 'network-only',
        variables: {
          path: itemId,
          version: itemVersion,
          language,
          site,
          withDisplayName: scopes?.includes('display-name'),
          withWorkflow: scopes?.includes('workflow'),
          withVersions: scopes?.includes('versions'),
          withPresentation: scopes?.includes('layout'),
          withLayoutEditingKind: scopes?.includes('layoutEditingKind'),
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data.item),
      );
  }

  getItemInsertOptions(
    path: string,
    kind: 'page' | 'folder',
    language: string,
    site: string,
  ): Observable<ItemInsertOption[]> {
    return this.apollo
      .query<{ item: Item }>({
        query: queries['GetItemInsertOptions'],
        fetchPolicy: 'no-cache',
        variables: {
          path,
          kind: kind === 'page' ? 'PAGE' : 'FOLDER',
          language,
          site,
        },
      })
      .pipe(
        map((result) => {
          return result.data.item.insertOptions;
        }),
      );
  }

  getItemDisplayName(itemId: string, language: string, site: string): Observable<string> {
    return this.apollo
      .query<{ rawItem: Item }>({
        query: queries['GetRawItemDisplayName'],
        fetchPolicy: 'cache-first',
        variables: {
          path: itemId,
          language,
          site,
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        filter(({ data }) => !!data),
        map(({ data }) => data.rawItem.displayName),
      );
  }

  getItemType(
    itemId: string,
    language: string,
    siteName: string,
    _siteId: string,
    itemVersion?: number,
  ): Observable<{
    id: string;
    version: number;
    kind: ItemKind;
    baseTemplateIds: string[];
    ancestors: Array<{ template: { id: string } }>;
  }> {
    return this.apollo
      .query<{
        item: {
          id: string;
          version: number;
          template: { id: string; baseTemplateIds: [] };
          ancestors: Array<{ template: { id: string } }>;
          __typename: string;
        };
      }>({
        query: queries['GetItemType'],
        fetchPolicy: 'cache-first',
        variables: {
          path: itemId,
          version: itemVersion,
          language,
          site: siteName,
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => ({
          id: data.item.id,
          version: data.item.version,
          kind: data.item.__typename as ItemKind,
          baseTemplateIds: data.item.template.baseTemplateIds,
          ancestors: data.item.ancestors,
        })),
      );
  }
}
