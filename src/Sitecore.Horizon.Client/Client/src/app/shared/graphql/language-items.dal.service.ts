/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { extractGqlErrorCode } from '../utils/graphql.utils';
import { SupportedLanguage } from './sites/solutionSite.dal.service';

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string;
}
export const GET_LANGUAGE_ITEMS_QUERY = gql`
  query GetLanguageItems($cursor: String) {
    item(where: { itemId: "{64C4F646-A3FA-4205-B98E-4DE2C609B60F}" }) {
      children(after: $cursor) {
        pageInfo {
          hasNextPage
          startCursor
          endCursor
        }
        nodes {
          itemId
          name
        }
      }
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class LanguageItemsDalService {
  constructor(
    private readonly apollo: Apollo,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {}

  getSupportedLanguages(): Observable<SupportedLanguage[]> {
    if (!this.featureFlagsService.isFeatureEnabled('pages_site-supported-languages')) {
      return of([]);
    }
    return this.fetchLanguageItemsWithPagination(0, []).pipe(map((data) => data.nodes));
  }

  private fetchLanguageItemsWithPagination(
    pagesFetched: number,
    itemsFetched: SupportedLanguage[],
    cursor?: string,
  ): Observable<{ nodes: SupportedLanguage[]; pageInfo: PageInfo }> {
    return this.apollo
      .use('global')
      .query<{ item: { children: { nodes: SupportedLanguage[]; pageInfo: PageInfo } } }>({
        query: GET_LANGUAGE_ITEMS_QUERY,
        variables: {
          cursor,
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        switchMap(({ data }) => {
          pagesFetched += 1;
          itemsFetched = itemsFetched.concat(data.item.children.nodes);

          // Prevent possible infinite loop - fetching next page maximum 10 times.
          if (data.item.children.pageInfo.hasNextPage && pagesFetched < 10) {
            return this.fetchLanguageItemsWithPagination(
              pagesFetched,
              itemsFetched,
              data.item.children.pageInfo.endCursor,
            );
          }

          const result = { ...data.item.children, nodes: itemsFetched };
          return of(result);
        }),
      );
  }
}
