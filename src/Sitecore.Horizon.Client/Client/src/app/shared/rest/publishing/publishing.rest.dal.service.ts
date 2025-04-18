/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { StaticConfigurationService } from 'app/shared/configuration/static-configuration.service';
import { BasePublishingDalService } from 'app/shared/graphql/publishing.dal.service';
import { PublishingStatus, PublishItemInput, PublishItemOutput } from 'app/shared/graphql/publishing.interfaces';
import { makeAbsoluteUrl } from 'app/shared/utils/url.utils';
import { catchError, map, Observable } from 'rxjs';
import { handleError } from '../errors.utils';
import { PublishPageRequest, PublishPageStatus } from '../page/page.types';

@Injectable()
export class PublishingRestDalService extends BasePublishingDalService {
  private readonly httpClient = inject(HttpClient);
  private readonly staticConfigurationService = inject(StaticConfigurationService);
  constructor() {
    super();
  }

  pageServiceEndpoint = makeAbsoluteUrl('api/v1/pages/', this.staticConfigurationService.xMAppsApiBaseUrl);

  getPublishingStatus(operationId: string): Observable<PublishingStatus> {
    const requestUrl = `${this.pageServiceEndpoint}/publishstatus/${operationId}`;
    return this.httpClient.get<PublishPageStatus>(requestUrl).pipe(catchError(handleError));
  }

  publishItem(publishInput: PublishItemInput): Observable<PublishItemOutput> {
    const requestUrl = `${this.pageServiceEndpoint}${publishInput.rootItemId}/publish`;
    const requestBody: PublishPageRequest = {
      publishRelatedItems: true,
      languages: publishInput.languages,
      publishSubitems: publishInput.publishSubItems,
      PublishMode: 'SMART',
    };

    return this.httpClient.post<string>(requestUrl, requestBody).pipe(
      map((response) => ({
        operationId: response,
      })),
      catchError(handleError),
    );
  }
}
