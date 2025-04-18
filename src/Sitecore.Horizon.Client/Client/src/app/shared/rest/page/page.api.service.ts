/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ItemChangeScope } from 'app/shared/client-state/item-change-service';
import { catchError, Observable } from 'rxjs';
import { StaticConfigurationService } from '../../configuration/static-configuration.service';
import { makeAbsoluteUrl } from '../../utils/url.utils';
import { handleError } from '../errors.utils';
import {
  AddPageVersionRequest,
  CreatePageRequest,
  DeletePageRequest,
  DeletePageVersionRequest,
  DuplicatePageRequest,
  ExecuteWorkflowCommandRequest,
  ExecuteWorkflowCommandResult,
  MovePageRequest,
  Page,
  PageHierarchy,
  PageInsertOption,
  PageOperationResponse,
  RenamePageRequest,
  SavePageRequest,
  SavePageResponse,
  SetPublishingSettingRequest,
  UpdatePageRequest,
} from './page.types';

@Injectable({ providedIn: 'root' })
export class PageApiService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly staticConfigurationService: StaticConfigurationService,
  ) {}

  pageServiceEndpoint = makeAbsoluteUrl('api/v1/pages/', this.staticConfigurationService.xMAppsApiBaseUrl);

  siteServiceEndpoint = makeAbsoluteUrl('api/v1/sites/', this.staticConfigurationService.xMAppsApiBaseUrl);

  getPage(pageId: string, siteId: string, language: string, version?: number): Observable<Page> {
    let requestUrl = `${this.pageServiceEndpoint}${pageId}?site=${siteId}&language=${language}`;
    if (version) {
      requestUrl += `&version=${version}`;
    }

    return this.httpClient.get<Page>(requestUrl).pipe(catchError(handleError));
  }

  getPageState(
    pageId: string,
    siteId: string,
    language: string,
    version?: number,
    scopes?: readonly ItemChangeScope[],
  ): Observable<Page> {
    let queryParams = `site=${siteId}&language=${language}`;

    if (version) {
      queryParams += `&version=${version}`;
    }
    if (scopes?.includes('workflow')) {
      queryParams += `&withWorkflow=true`;
    }
    if (scopes?.includes('versions')) {
      queryParams += `&withVersions=true`;
    }
    if (scopes?.includes('layout')) {
      queryParams += `&withLayout=true`;
    }

    const requestUrl = `${this.pageServiceEndpoint}${pageId}/state?${queryParams}`;

    return this.httpClient.get<Page>(requestUrl).pipe(catchError(handleError));
  }

  getPageInsertOptions(
    pageId: string,
    siteId: string,
    language: string,
    insertOptionKind: string,
  ): Observable<PageInsertOption[]> {
    const queryParams = `site=${siteId}&language=${language}&insertOptionKind=${insertOptionKind}`;
    const requestUrl = `${this.pageServiceEndpoint}${pageId}/insertoptions?${queryParams}`;

    return this.httpClient.get<PageInsertOption[]>(requestUrl).pipe(catchError(handleError));
  }

  getPageHierarchy(pageId: string, siteId: string, language: string): Observable<PageHierarchy> {
    const requestUrl = `${this.siteServiceEndpoint}${siteId}/hierarchy/${pageId}?language=${language}`;
    return this.httpClient.get<PageHierarchy>(requestUrl).pipe(catchError(handleError));
  }

  getPageAncestors(pageId: string, siteId: string, language: string): Observable<Page[]> {
    const requestUrl = `${this.siteServiceEndpoint}${siteId}/hierarchy/${pageId}/ancestors?language=${language}`;
    return this.httpClient.get<Page[]>(requestUrl).pipe(catchError(handleError));
  }

  getPageChildren(pageId: string, siteId: string, language: string): Observable<Page[]> {
    const requestUrl = `${this.siteServiceEndpoint}${siteId}/hierarchy/${pageId}/children?language=${language}`;
    return this.httpClient.get<Page[]>(requestUrl).pipe(catchError(handleError));
  }

  getPageVersions(pageId: string, siteId: string, language: string): Observable<Page[]> {
    const requestUrl = `${this.pageServiceEndpoint}${pageId}/versions?site=${siteId}&language=${language}`;
    return this.httpClient.get<Page[]>(requestUrl).pipe(catchError(handleError));
  }

  createPage(requestBody: CreatePageRequest): Observable<PageOperationResponse> {
    return this.httpClient
      .post<PageOperationResponse>(this.pageServiceEndpoint, requestBody)
      .pipe(catchError(handleError));
  }

  updatePage(pageId: string, requestBody: UpdatePageRequest): Observable<PageOperationResponse> {
    const requestUrl = `${this.pageServiceEndpoint}${pageId}`;
    return this.httpClient.patch<PageOperationResponse>(requestUrl, requestBody).pipe(catchError(handleError));
  }

  duplicatePage(pageId: string, requestBody: DuplicatePageRequest): Observable<PageOperationResponse> {
    const requestUrl = `${this.pageServiceEndpoint}${pageId}/duplicate`;
    return this.httpClient.post<PageOperationResponse>(requestUrl, requestBody).pipe(catchError(handleError));
  }

  renamePage(pageId: string, requestBody: RenamePageRequest): Observable<PageOperationResponse> {
    const requestUrl = `${this.pageServiceEndpoint}${pageId}/rename`;
    return this.httpClient.post<PageOperationResponse>(requestUrl, requestBody).pipe(catchError(handleError));
  }

  savePage(pageId: string, requestBody: SavePageRequest): Observable<SavePageResponse> {
    const requestUrl = `${this.pageServiceEndpoint}${pageId}/layout`;
    return this.httpClient.post<SavePageResponse>(requestUrl, requestBody).pipe(catchError(handleError));
  }

  deletePage(pageId: string, requestBody: DeletePageRequest): Observable<boolean> {
    const requestUrl = `${this.pageServiceEndpoint}${pageId}`;
    return this.httpClient.delete<boolean>(requestUrl, { body: requestBody }).pipe(catchError(handleError));
  }

  movePage(pageId: string, siteId: string, requestBody: MovePageRequest): Observable<boolean> {
    const requestUrl = `${this.siteServiceEndpoint}${siteId}/hierarchy/${pageId}/move`;
    return this.httpClient.post<boolean>(requestUrl, requestBody).pipe(catchError(handleError));
  }

  executeWorkflow(
    pageId: string,
    requestBody: ExecuteWorkflowCommandRequest,
  ): Observable<ExecuteWorkflowCommandResult> {
    const requestUrl = `${this.pageServiceEndpoint}${pageId}/executeworkflow`;
    return this.httpClient.post<ExecuteWorkflowCommandResult>(requestUrl, requestBody).pipe(catchError(handleError));
  }

  deletePageVersion(pageId: string, requestBody: DeletePageVersionRequest): Observable<number> {
    const requestUrl = `${this.pageServiceEndpoint}${pageId}/version`;
    return this.httpClient.delete<number>(requestUrl, { body: requestBody }).pipe(catchError(handleError));
  }

  addPageVersion(pageId: string, requestBody: AddPageVersionRequest): Observable<number> {
    const requestUrl = `${this.pageServiceEndpoint}${pageId}/version`;
    return this.httpClient.post<number>(requestUrl, requestBody).pipe(catchError(handleError));
  }

  setPublishingSettings(pageId: string, requestBody: SetPublishingSettingRequest): Observable<boolean> {
    const requestUrl = `${this.pageServiceEndpoint}${pageId}/publish/settings`;
    return this.httpClient.post<boolean>(requestUrl, requestBody).pipe(catchError(handleError));
  }

  getLivePageVariants(pageId: string, language: string): Observable<string[]> {
    const requestUrl = `${this.pageServiceEndpoint}${pageId}/live/variants?language=${language}`;

    return this.httpClient.get<string[]>(requestUrl).pipe(catchError(handleError));
  }
}
