/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { extractGqlErrorCode } from '../utils/graphql.utils';
import { PageInfo } from './item.dal.service';

export const GET_LANGUAGES_PAGE_QUERY = gql`
  query GetLanguages($startCursor: String) {
    languages(after: $startCursor) {
      nodes {
        displayName
        nativeName
        englishName
        name
        iso
      }
      pageInfo {
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`;

export interface Language {
  name: string;
  displayName: string;
  nativeName: string;
  englishName: string | null;
  iso: string;
}

@Injectable({ providedIn: 'root' })
export abstract class LanguageDalBaseService {
  abstract fetchLanguages(): Observable<Language[]>;
}

@Injectable()
export class LanguageDalService extends LanguageDalBaseService {
  private readonly apollo = inject(Apollo);

  constructor() {
    super();
  }

  fetchLanguages(): Observable<Language[]> {
    return this.fetchLanguagesWithPagination(0, []).pipe(map((data) => data.nodes));
  }

  private fetchLanguagesWithPagination(
    pagesFetched: number,
    languagesFetched: Language[],
    startCursor?: string,
  ): Observable<{ nodes: Language[]; pageInfo: PageInfo }> {
    return this.apollo
      .use('global')
      .query<{ languages: { nodes: Language[]; pageInfo: PageInfo } }>({
        query: GET_LANGUAGES_PAGE_QUERY,
        variables: {
          startCursor,
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        switchMap(({ data }) => {
          pagesFetched += 1;
          languagesFetched = languagesFetched.concat(data.languages.nodes);

          // Prevent possible infinite loop - fetching next page maximum 10 times. One page is 50 languages.
          if (data.languages.pageInfo.hasNextPage && pagesFetched < 10) {
            return this.fetchLanguagesWithPagination(pagesFetched, languagesFetched, data.languages.pageInfo.endCursor);
          }

          const result = { ...data.languages, ...{ nodes: languagesFetched } };
          return of(result);
        }),
      );
  }
}
