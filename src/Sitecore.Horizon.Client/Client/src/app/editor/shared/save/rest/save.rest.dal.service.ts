/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { inject, Injectable } from '@angular/core';
import { PageToItemMapper } from 'app/shared/rest/page/page-to-item-mapper';
import { PageApiService } from 'app/shared/rest/page/page.api.service';
import { SavePageRequest, SavePageResponse } from 'app/shared/rest/page/page.types';
import { map, Observable } from 'rxjs';
import { BaseSaveDalService } from '../graphql/save.dal.service';
import { SaveFieldDetails, SaveLayoutDetails, SaveResult } from '../save.interfaces';

@Injectable()
export class SaveRestDalService extends BaseSaveDalService {
  private readonly pageApiService = inject(PageApiService);

  savePage(
    language: string,
    site: string,
    saveLayoutDetail: SaveLayoutDetails[],
    saveFieldDetails: SaveFieldDetails[],
  ): Observable<SaveResult> {
    const pageToSave = this.getPageToSaveInfo(saveLayoutDetail, saveFieldDetails);
    if (!pageToSave.pageId) {
      throw new Error('page not found');
    }

    const fieldDetail = saveFieldDetails.find((detail) => detail.itemId === pageToSave.pageId);
    const layoutDetailToSave = saveLayoutDetail.find((detail) => detail.itemId === pageToSave.pageId);

    const requestBody: SavePageRequest = {
      language,
      site,
      version: pageToSave.version,
      revision: pageToSave.revision,
      fields: fieldDetail
        ? fieldDetail.fields.map((field) => ({
            id: field.id,
            value: field.value,
            containsStandardValue: field.reset,
          }))
        : undefined,
      layout: layoutDetailToSave
        ? {
            kind: layoutDetailToSave.presentationDetails.kind,
            body: layoutDetailToSave.presentationDetails.body,
          }
        : undefined,
      originalLayout: layoutDetailToSave
        ? {
            kind: layoutDetailToSave.originalPresentationDetails.kind,
            body: layoutDetailToSave.originalPresentationDetails.body,
          }
        : undefined,
    };

    return this.pageApiService
      .savePage(pageToSave.pageId, requestBody)
      .pipe(map((response: SavePageResponse) => PageToItemMapper.mapSavePageResponseToSaveResult(response)));
  }

  private getPageToSaveInfo(
    saveLayoutDetail?: SaveLayoutDetails[],
    saveFieldDetails?: SaveFieldDetails[],
  ): { pageId?: string; version?: number; revision?: string } {
    const pageDetail =
      saveFieldDetails?.find((fieldDetails: SaveFieldDetails) => 'itemId' in fieldDetails) ||
      saveLayoutDetail?.find((layoutDetaill: SaveLayoutDetails) => 'itemId' in layoutDetaill);

    if (pageDetail) {
      return {
        pageId: pageDetail.itemId,
        version: pageDetail.itemVersion,
        revision: pageDetail.revision ?? undefined,
      };
    }

    return {};
  }
}
