/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { makeAbsoluteUrl } from 'app/shared/utils/url.utils';
import { NgHttpCachingHeaders } from 'ng-http-caching';
import { catchError, Observable } from 'rxjs';
import { StaticConfigurationService } from '../../configuration/static-configuration.service';
import { Language, LanguageDalBaseService } from '../../graphql/language.dal.service';
import { handleError } from '../errors.utils';

@Injectable()
export class LanguageApiService extends LanguageDalBaseService {
  private readonly httpClient = inject(HttpClient);
  private readonly staticConfigurationService = inject(StaticConfigurationService);
  private readonly cachingHeaders = { headers: { [NgHttpCachingHeaders.ALLOW_CACHE]: 'ALLOW' } };
  constructor() {
    super();
  }

  languageEndpoint = makeAbsoluteUrl('api/v1/languages', this.staticConfigurationService.xMAppsApiBaseUrl);

  fetchLanguages(): Observable<Language[]> {
    return this.httpClient.get<Language[]>(this.languageEndpoint, this.cachingHeaders).pipe(catchError(handleError));
  }
}
