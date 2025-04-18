/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { extractGqlErrorCode } from '../utils/graphql.utils';
import { PublishingStatus, PublishItemInput, PublishItemOutput } from './publishing.interfaces';

export const PUBLISH_ITEM_MUTATION = gql`
  mutation PublishItem($input: PublishItemInput!) {
    publishItem(input: $input) {
      operationId
    }
  }
`;

export const PUBLISHING_STATUS_QUERY = gql`
  query GetPublishingStatus($publishingOperationId: String!) {
    publishingStatus(publishingOperationId: $publishingOperationId) {
      isDone
      isFailed
      processed
      state
    }
  }
`;

export const PUBLISHING_TARGETS_QUERY = gql`
  query publishingTargets {
    publishingTargets {
      targetDatabase
    }
  }
`;

@Injectable({ providedIn: 'root' })
export abstract class BasePublishingDalService {
  abstract getPublishingStatus(publishingOperationId: string): Observable<PublishingStatus>;
  abstract publishItem(publishInput: PublishItemInput): Observable<PublishItemOutput>;
}

@Injectable()
export class PublishingDalService extends BasePublishingDalService {
  private readonly apollo = inject(Apollo);

  constructor() {
    super();
  }

  publishItem(publishInput: PublishItemInput): Observable<PublishItemOutput> {
    return this.getPublishingTargets().pipe(
      switchMap((targetDatabases) => {
        if (targetDatabases.length) {
          return this.apollo.use('global').mutate<{ publishItem: PublishItemOutput }>({
            mutation: PUBLISH_ITEM_MUTATION,
            variables: {
              input: {
                rootItemId: publishInput.rootItemId,
                languages: publishInput.languages,
                publishItemMode: 'SMART',
                publishRelatedItems: publishInput.publishRelatedItems,
                publishSubItems: publishInput.publishSubItems,
                targetDatabases: targetDatabases,
              },
            },
          });
        } else {
          return throwError(() => new Error('No publishing targets available'));
        }
      }),
      catchError(extractGqlErrorCode),
      map(({ data }) => data!.publishItem),
    );
  }

  getPublishingStatus(publishingOperationId: string): Observable<PublishingStatus> {
    return this.apollo
      .use('global')
      .query<{ publishingStatus: PublishingStatus }>({
        query: PUBLISHING_STATUS_QUERY,
        variables: { publishingOperationId },
        fetchPolicy: 'no-cache',
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data!.publishingStatus),
      );
  }

  private getPublishingTargets(): Observable<string[]> {
    return this.apollo
      .use('global')
      .query<{ publishingTargets: Array<{ targetDatabase: string }> }>({
        query: PUBLISHING_TARGETS_QUERY,
        fetchPolicy: 'no-cache',
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data!.publishingTargets.map((target) => target.targetDatabase)),
      );
  }
}
