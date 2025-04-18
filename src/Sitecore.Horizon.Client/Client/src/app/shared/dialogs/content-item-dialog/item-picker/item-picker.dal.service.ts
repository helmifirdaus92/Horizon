/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { extractGqlErrorCode } from 'app/shared/utils/graphql.utils';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const queries = require('graphql-tag/loader!./item-picker.graphql');

export interface RawItem {
  readonly id: string;
  readonly displayName: string;
  readonly hasChildren: boolean;
  readonly isFolder: boolean;
  readonly children?: readonly RawItem[];
}

export interface RawItemAncestor {
  readonly parentId: string;
  readonly id: string;
  readonly displayName: string;
  readonly hasChildren: boolean;
  readonly isFolder: boolean;
}

@Injectable({ providedIn: 'root' })
export class ItemPickerDalService {
  constructor(private readonly apollo: Apollo) {}

  getChildren(path: string, language: string, site: string): Observable<RawItem[]> {
    return this.apollo
      .query<{ rawItem: { id: string; children: RawItem[] } }>({
        query: queries['GetChildren'],
        fetchPolicy: 'network-only',
        variables: { path, language, site },
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
    roots?: readonly string[],
  ): Observable<RawItemAncestor[]> {
    return this.apollo
      .query<{ rawItem: { id: string; ancestorsWithSiblings: RawItemAncestor[] } }>({
        query: queries['GetAncestorsWithSiblings'],
        fetchPolicy: 'network-only',
        variables: { path, language, site, roots },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data.rawItem.ancestorsWithSiblings),
      );
  }
}
