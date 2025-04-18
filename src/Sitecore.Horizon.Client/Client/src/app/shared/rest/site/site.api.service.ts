/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SiteDalService } from 'app/shared/graphql/sites/solutionSite.dal.service';
import { Site, SiteCollection } from 'app/shared/site-language/site-language.service';
import { NgHttpCachingHeaders } from 'ng-http-caching';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { StaticConfigurationService } from '../../configuration/static-configuration.service';
import { makeAbsoluteUrl } from '../../utils/url.utils';
import { handleError } from '../errors.utils';
import { Page } from '../page/page.types';
import { SiteMapper } from './site-mapper';
import { SiteCollectionsResponse, SiteResponse } from './site.types';

@Injectable()
export class SiteApiService extends SiteDalService {
  private readonly staticConfigurationService = inject(StaticConfigurationService);
  private readonly cachingHeaders = { headers: { [NgHttpCachingHeaders.ALLOW_CACHE]: 'ALLOW' } };
  private readonly httpClient = inject(HttpClient);

  constructor() {
    super();
  }

  siteCollectionsServiceEndpoint = makeAbsoluteUrl(
    'api/v1/collections/',
    this.staticConfigurationService.xMAppsApiBaseUrl,
  );
  siteServiceEndpoint = makeAbsoluteUrl('api/v1/sites/', this.staticConfigurationService.xMAppsApiBaseUrl);
  pageServiceEndpoint = makeAbsoluteUrl('api/v1/pages/', this.staticConfigurationService.xMAppsApiBaseUrl);

  getCollections(): Observable<SiteCollection[]> {
    return this.httpClient
      .get<SiteCollectionsResponse[]>(this.siteCollectionsServiceEndpoint, this.cachingHeaders)
      .pipe(
        map((response) => response.map((collectionResponse) => SiteMapper.mapResponseToCollection(collectionResponse))),
        catchError(handleError),
      );
  }

  // Get all sites
  getSites(): Observable<Site[]> {
    return this.httpClient.get<SiteResponse[]>(this.siteServiceEndpoint, this.cachingHeaders).pipe(
      map((response) => response.map((siteResponse) => SiteMapper.mapResponseToSite(siteResponse))),
      catchError(handleError),
    );
  }

  // Get start item of a site in a specific language
  getStartItem(siteId: string, _siteName: string, language: string): Observable<{ id: string; version: number }> {
    return this.httpClient.get<SiteResponse>(`${this.siteServiceEndpoint}${siteId}`).pipe(
      switchMap((response) => {
        const site = SiteMapper.mapResponseToSite(response);
        return this.getPageLanguageVersion(site.startItemId, site.name, language);
      }),
      catchError(handleError),
    );
  }

  // Get default site
  getDefaultSite(siteId?: string, _siteName?: string): Observable<Pick<Site, 'id' | 'name'>> {
    if (siteId) {
      return this.httpClient.get<SiteResponse>(`${this.siteServiceEndpoint}${siteId}`).pipe(
        switchMap((response) => {
          const site = SiteMapper.mapResponseToSite(response);
          return of({ id: site.id, name: site.name });
        }),
        catchError(handleError),
      );
    }

    return this.getSites().pipe(
      switchMap((sites) => {
        const defaultSite = sites ? sites[0] : null;
        if (!defaultSite) {
          throw new Error('No sites found.');
        }
        return of({ id: defaultSite.id, name: defaultSite.name });
      }),
      catchError(handleError),
    );
  }

  getSiteById(siteId: string, _siteName: string): Observable<Site> {
    return this.httpClient.get<SiteResponse>(`${this.siteServiceEndpoint}${siteId}`).pipe(
      map((response) => SiteMapper.mapResponseToSite(response)),
      catchError(handleError),
    );
  }

  private getPageLanguageVersion(
    pageId: string,
    siteName: string,
    language: string,
  ): Observable<{ id: string; version: number }> {
    const requestUrl = `${this.pageServiceEndpoint}${pageId}/versions?site=${siteName}&language=${language}`;

    return this.httpClient.get<Page[]>(requestUrl).pipe(
      switchMap((pages: Page[]) => {
        const pageLanguageVersions = pages
          ?.filter((p) => p.language === language)
          .sort((a, b) => b.version - a.version);
        if (pageLanguageVersions && pageLanguageVersions.length > 0) {
          return of({ id: pageLanguageVersions[0].id, version: pageLanguageVersions[0].version });
        }
        return of({ id: pageId, version: 1 });
      }),
      catchError(handleError),
    );
  }
}
