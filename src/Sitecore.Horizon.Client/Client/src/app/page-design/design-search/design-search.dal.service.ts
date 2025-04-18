/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { normalizeGuidCharactersOnly } from 'app/shared/utils/utils';
import gql from 'graphql-tag';
import { catchError, map, Observable, of } from 'rxjs';
import {
  FOLDER_ITEM_ID,
  ItemResponse,
  PAGE_DESIGN_TEMPLATE_ID,
  PARTIAL_DESIGN_TEMPLATE_ID,
  SearchResult,
} from '../page-templates.types';
import { DesignType } from './design-search.component';

export const SEARCH_IN_DESIGN = gql`
  query SearchDesign(
    $searchInput: String!
    $pathCriteria: [SearchCriteriaInput]
    $itemTypeCriteria: [SearchCriteriaInput]
  ) {
    search(
      query: {
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
      }
    ) {
      totalCount
      results {
        innerItem {
          itemId(format: D)
          path
          name
          displayName
          hasPresentation
          hasChildren
          thumbnailUrl
          parent {
            itemId(format: D)
          }
          ancestors {
            itemId(format: D)
          }
          template {
            baseTemplates {
              nodes {
                templateId(format: D)
              }
            }
          }
        }
      }
    }
  }
`;

interface SearchCriteriaInput {
  field: '_path' | '_templates';
  value: string;
  criteriaType: 'CONTAINS' | 'EXACT';
}

@Injectable({ providedIn: 'root' })
export class DesignSearchDalService {
  constructor(private readonly apollo: Apollo) {}

  partialDesignCriteria: SearchCriteriaInput = {
    field: '_templates',
    value: PARTIAL_DESIGN_TEMPLATE_ID,
    criteriaType: 'CONTAINS',
  };
  pageDesignCriteria: SearchCriteriaInput = {
    field: '_templates',
    value: PAGE_DESIGN_TEMPLATE_ID,
    criteriaType: 'CONTAINS',
  };
  folderCriteria: SearchCriteriaInput = {
    field: '_templates',
    value: normalizeGuidCharactersOnly(FOLDER_ITEM_ID),
    criteriaType: 'CONTAINS',
  };

  search(
    searchInput: string,
    designRootsIds: string[],
    designType: DesignType,
  ): Observable<{ isSuccessful: boolean; items: ItemResponse[] }> {
    const pathCriteria: SearchCriteriaInput[] = [];
    designRootsIds.forEach((id) => {
      pathCriteria.push({ field: '_path', value: normalizeGuidCharactersOnly(id), criteriaType: 'CONTAINS' });
    });
    const designCriteria = designType === 'pagedesign' ? this.pageDesignCriteria : this.partialDesignCriteria;
    const itemTypeCriteria: SearchCriteriaInput[] = [designCriteria, this.folderCriteria];

    return this.apollo
      .use('global')
      .query<{
        search: SearchResult;
      }>({
        query: SEARCH_IN_DESIGN,
        fetchPolicy: 'no-cache',
        variables: {
          searchInput,
          pathCriteria,
          itemTypeCriteria,
        },
      })
      .pipe(
        map(({ data }) => {
          return { isSuccessful: true, items: data.search.results.map((r) => r.innerItem) };
        }),
        catchError(() => {
          return of({ isSuccessful: false, items: [] });
        }),
      );
  }
}
