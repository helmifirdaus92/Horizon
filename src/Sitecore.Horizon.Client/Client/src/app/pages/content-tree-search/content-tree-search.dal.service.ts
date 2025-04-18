/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ItemResponse, SearchResult } from 'app/page-design/page-templates.types';
import { ContextService } from 'app/shared/client-state/context.service';
import { normalizeGuidCharactersOnly } from 'app/shared/utils/utils';
import gql from 'graphql-tag';
import { catchError, map, Observable, of } from 'rxjs';
import { TreeItemTypeFilter } from './content-tree-search.component';

export const SEARCH_IN_TREE = gql`
  query SearchTree(
    $searchInput: String!
    $language: String!
    $pathCriteria: [SearchCriteriaInput]
    $itemTypeCriteria: [SearchCriteriaInput]
    $paging: SearchPagingInput!
  ) {
    search(
      query: {
        language: $language
        filterStatement: {
          criteria: [
            { field: "_name", value: $searchInput, criteriaType: CONTAINS }
            { field: "_displayname", value: $searchInput, criteriaType: CONTAINS }
          ]
          subStatements: {
            criteria: $pathCriteria
            operator: MUST
            subStatements: { criteria: $itemTypeCriteria, operator: MUST }
          }
        }
        sort: { field: "_name", direction: ASCENDING }
        paging: $paging
      }
    ) {
      totalCount
      results {
        innerItem {
          itemId
          path
          displayName
          hasPresentation
          hasChildren
          template {
            templateId
            baseTemplates {
              nodes {
                templateId
              }
            }
          }
        }
      }
    }
  }
`;

export interface SearchPagingInput {
  pageSize: number;
  skip?: number;
}

interface SearchCriteriaInput {
  field: '_path' | '_haslayout' | '_templates';
  value: string;
  criteriaType: 'CONTAINS' | 'EXACT';
}

@Injectable({ providedIn: 'root' })
export class ContentTreeSearchDalService {
  constructor(private readonly context: ContextService, private readonly apollo: Apollo) {}

  isPageCriteria: SearchCriteriaInput = { field: '_haslayout', value: 'true', criteriaType: 'EXACT' };
  isFolderCriteria: SearchCriteriaInput = {
    field: '_templates',
    value: 'a87a00b1e6db45ab8b54636fec3b5523',
    criteriaType: 'CONTAINS',
  };

  search(
    searchInput: string,
    treeRootsIds: string[],
    filter: TreeItemTypeFilter,
    paging: SearchPagingInput,
  ): Observable<{ isSuccessful: boolean; totalCount: number; items: ItemResponse[] }> {
    const pathCriteria: SearchCriteriaInput[] = [];
    treeRootsIds.forEach((id) => {
      pathCriteria.push({ field: '_path', value: normalizeGuidCharactersOnly(id), criteriaType: 'CONTAINS' });
    });

    const itemTypeCriteria: SearchCriteriaInput[] =
      filter === 'Pages'
        ? [this.isPageCriteria]
        : filter === 'Folders'
        ? [this.isFolderCriteria]
        : [this.isPageCriteria, this.isFolderCriteria];

    return this.apollo
      .use('global')
      .query<{
        search: SearchResult;
      }>({
        query: SEARCH_IN_TREE,
        fetchPolicy: 'no-cache',
        variables: {
          searchInput,
          language: this.context.language,
          pathCriteria,
          itemTypeCriteria,
          paging,
        },
      })
      .pipe(
        map(({ data }) => {
          return {
            isSuccessful: true,
            totalCount: data.search.totalCount,
            items: data.search.results.map((r) => r.innerItem),
          };
        }),
        catchError(() => {
          return of({ isSuccessful: false, totalCount: 0, items: [] });
        }),
      );
  }
}
