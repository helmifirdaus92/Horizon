/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map, Observable } from 'rxjs';
import { SaveFieldDetails, SaveLayoutDetails, SaveResult } from '../save.interfaces';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const queries = require('graphql-tag/loader!./save.service.graphql');

@Injectable({ providedIn: 'root' })
export abstract class BaseSaveDalService {
  constructor() {}

  abstract savePage(
    language: string,
    site: string,
    saveLayoutDetail: SaveLayoutDetails[],
    saveFieldDetails: SaveFieldDetails[],
  ): Observable<SaveResult>;
}

@Injectable()
export class SaveDalService extends BaseSaveDalService {
  private readonly apollo = inject(Apollo);

  savePage(
    language: string,
    site: string,
    saveLayoutDetail: SaveLayoutDetails[],
    saveFieldDetails: SaveFieldDetails[],
  ): Observable<SaveResult> {
    return this.apollo
      .mutate<{ saveItem: SaveResult }>({
        mutation: queries['Save'],
        variables: {
          input: {
            site,
            language,
            items: [...saveLayoutDetail, ...saveFieldDetails],
          },
        },
      })
      .pipe(
        map(({ data }) => {
          return data!.saveItem;
        }),
      );
  }
}
