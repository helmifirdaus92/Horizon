/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { DISPLAY_NAME_FIELD_ID } from 'app/pages/content-tree/content-tree.service';
import { ItemChangeScope } from 'app/shared/client-state/item-change-service';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { firstValueFrom, of } from 'rxjs';
import { PageApiService } from './page.api.service';
import { PageTestData } from './page.test.data';

import {
  AddPageVersionRequest,
  CreatePageRequest,
  DeletePageRequest,
  DeletePageVersionRequest,
  DuplicatePageRequest,
  ErrorResponse,
  ExecuteWorkflowCommandRequest,
  ExecuteWorkflowCommandResult,
  MovePageRequest,
  Page,
  PageHierarchy,
  PageInsertOption,
  PageOperationResponse,
  SavePageRequest,
  SavePageResponse,
  SetPublishingSettingRequest,
  UpdatePageRequest,
} from './page.types';

const xmAppsApiBaseUrl = 'https://sites-api-url.com/';
const pageServiceEndpoint = 'api/v1/pages/';
const siteServiceEndpoint = 'api/v1/sites/';

describe(PageApiService.name, () => {
  let sut: PageApiService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, StaticConfigurationServiceStubModule],
      providers: [
        {
          provide: HttpClient,
          useValue: jasmine.createSpyObj<HttpClient>({
            get: undefined,
            post: undefined,
            put: undefined,
            delete: undefined,
            patch: undefined,
          }),
        },
        PageApiService,
      ],
    });

    httpClientSpy = TestBedInjectSpy(HttpClient);
    sut = TestBed.inject(PageApiService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should get page', async () => {
    // Arrange
    const pageId = 'mockPageId';
    const siteName = 'mockSiteName';
    const language = 'en';
    const mockPage: Page = PageTestData.mockPage;
    httpClientSpy.get.and.returnValue(of(mockPage));

    // Act
    const response = await firstValueFrom(sut.getPage(pageId, siteName, language));

    // Assert
    expect(response).toEqual(mockPage);
    expect(httpClientSpy.get).toHaveBeenCalledOnceWith(
      `${xmAppsApiBaseUrl}${pageServiceEndpoint}${pageId}?site=${siteName}&language=${language}`,
    );
  });

  it('should get page state without version and scopes', async () => {
    // Arrange
    const pageId = 'mockPageId';
    const siteName = 'mockSiteName';
    const language = 'en';
    const mockPage: Page = PageTestData.mockPage;
    httpClientSpy.get.and.returnValue(of(mockPage));

    // Act
    const response = await firstValueFrom(sut.getPageState(pageId, siteName, language));

    // Assert
    expect(response).toEqual(mockPage);
    expect(httpClientSpy.get).toHaveBeenCalledOnceWith(
      `${sut.pageServiceEndpoint}${pageId}/state?site=${siteName}&language=${language}`,
    );
  });

  it('should get page state with version and scopes', async () => {
    // Arrange
    const pageId = 'mockPageId';
    const siteName = 'mockSiteName';
    const language = 'en';
    const version = 1;
    const scopes: readonly ItemChangeScope[] = ['workflow', 'versions', 'layout'];
    const mockPage: Page = PageTestData.mockPage;
    httpClientSpy.get.and.returnValue(of(mockPage));

    // Act
    const response = await firstValueFrom(sut.getPageState(pageId, siteName, language, version, scopes));

    // Assert
    expect(response).toEqual(mockPage);
    expect(httpClientSpy.get).toHaveBeenCalledOnceWith(
      `${sut.pageServiceEndpoint}${pageId}/state?site=${siteName}&language=${language}&version=${version}&withWorkflow=true&withVersions=true&withLayout=true`,
    );
  });

  it('should get page insert options', async () => {
    // Arrange
    const pageId = 'mockPageId';
    const siteName = 'mockSiteName';
    const language = 'en';
    const insertOptionKind = 'mockKind';
    const mockInsertOptions: PageInsertOption[] = [
      { displayName: 'Option 1', id: 'option1Id' },
      { displayName: 'Option 2', id: 'option2Id' },
    ];
    httpClientSpy.get.and.returnValue(of(mockInsertOptions));

    // Act
    const response = await firstValueFrom(sut.getPageInsertOptions(pageId, siteName, language, insertOptionKind));

    // Assert
    expect(response).toEqual(mockInsertOptions);
    expect(httpClientSpy.get).toHaveBeenCalledOnceWith(
      `${sut.pageServiceEndpoint}${pageId}/insertoptions?site=${siteName}&language=${language}&insertOptionKind=${insertOptionKind}`,
    );
  });

  it('should fetch page hierarchy', async () => {
    const siteId = 'site123';
    const pageId = 'page123';
    const language = 'en';
    const mockPageHierarchy: PageHierarchy = PageTestData.mockPageHierarchy;

    httpClientSpy.get.and.returnValue(of(mockPageHierarchy));

    // Act
    const response = await firstValueFrom(sut.getPageHierarchy(pageId, siteId, language));

    // Assert
    expect(response).toEqual(mockPageHierarchy);
    expect(httpClientSpy.get).toHaveBeenCalledOnceWith(
      `${xmAppsApiBaseUrl}${siteServiceEndpoint}${siteId}/hierarchy/${pageId}?language=${language}`,
    );
  });

  it('should fetch page ancestors', async () => {
    const siteId = 'site123';
    const pageId = 'page123';
    const language = 'en';
    const mockPageAncestors: Page[] = PageTestData.mockAncestors;

    httpClientSpy.get.and.returnValue(of(mockPageAncestors));

    // Act
    const response = await firstValueFrom(sut.getPageAncestors(pageId, siteId, language));

    // Assert
    expect(response).toEqual(mockPageAncestors);
    expect(httpClientSpy.get).toHaveBeenCalledOnceWith(
      `${xmAppsApiBaseUrl}${siteServiceEndpoint}${siteId}/hierarchy/${pageId}/ancestors?language=${language}`,
    );
  });

  it('should fetch page versions', async () => {
    const site = 'site123';
    const pageId = 'page123';
    const language = 'en';

    const mockPageVersions: Page[] = PageTestData.mockVersions;

    httpClientSpy.get.and.returnValue(of(mockPageVersions));

    // Act
    const response = await firstValueFrom(sut.getPageVersions(pageId, site, language));

    // Assert
    expect(response).toEqual(mockPageVersions);
    expect(httpClientSpy.get).toHaveBeenCalledOnceWith(
      `${xmAppsApiBaseUrl}${pageServiceEndpoint}${pageId}/versions?site=${site}&language=${language}`,
    );
  });

  it('should create a page', async () => {
    // Arrange
    const createPageRequest: CreatePageRequest = {
      parentId: 'parentId',
      pageName: 'pageName',
      templateId: 'templateId',
      language: 'en',
    };
    const pageOperationResponse: PageOperationResponse = {
      pageId: 'pageId',
      path: 'path',
      name: 'name',
      displayName: 'displayName',
    };
    httpClientSpy.post.and.returnValue(of(pageOperationResponse));

    // Act
    const response = await firstValueFrom(sut.createPage(createPageRequest));

    // Assert
    expect(response).toEqual(pageOperationResponse);
    expect(httpClientSpy.post).toHaveBeenCalledOnceWith(`${xmAppsApiBaseUrl}${pageServiceEndpoint}`, createPageRequest);
  });

  it('should duplicate a page', async () => {
    // Arrange
    const pageId = 'mockPageId';
    const duplicatePageRequest: DuplicatePageRequest = {
      newName: 'newName',
      site: 'site',
      language: 'en',
    };
    const pageOperationResponse: PageOperationResponse = {
      pageId: 'pageId',
      path: 'path',
      name: 'name',
      displayName: 'displayName',
    };
    httpClientSpy.post.and.returnValue(of(pageOperationResponse));

    // Act
    const response = await firstValueFrom(sut.duplicatePage(pageId, duplicatePageRequest));

    // Assert
    expect(response).toEqual(pageOperationResponse);
    expect(httpClientSpy.post).toHaveBeenCalledOnceWith(
      `${xmAppsApiBaseUrl}${pageServiceEndpoint}${pageId}/duplicate`,
      duplicatePageRequest,
    );
  });

  it('should update a page', async () => {
    // Arrange
    const requestBody: UpdatePageRequest = {
      language: 'en',
      fields: [{ name: '__Display name', value: 'displayName' }],
    };

    const pageId = 'pageId';
    const pageOperationResponse: PageOperationResponse = {
      pageId,
      path: 'path',
      name: 'name',
      displayName: 'displayName',
    };
    httpClientSpy.patch.and.returnValue(of(pageOperationResponse));

    // Act
    const response = await firstValueFrom(sut.updatePage(pageId, requestBody));

    // Assert
    expect(response).toEqual(pageOperationResponse);
    expect(httpClientSpy.patch).toHaveBeenCalledOnceWith(
      `${xmAppsApiBaseUrl}${pageServiceEndpoint}${pageId}`,
      requestBody,
    );
  });

  it('should delete a page', async () => {
    // Arrange
    const pageId = 'mockPageId';
    const deletePageRequestBody: DeletePageRequest = {
      permanently: true,
    };
    httpClientSpy.delete.and.returnValue(of(deletePageRequestBody));

    // Act
    const response = await firstValueFrom(sut.deletePage(pageId, deletePageRequestBody));

    // Assert
    expect(response).toBeTruthy();
    expect(httpClientSpy.delete).toHaveBeenCalledOnceWith(`${xmAppsApiBaseUrl}${pageServiceEndpoint}${pageId}`, {
      body: deletePageRequestBody,
    });
  });

  it('should extract error code', () => {
    // Arrange
    const createPageRequest: CreatePageRequest = {
      parentId: 'parentId',
      pageName: 'pageName',
      templateId: 'templateId',
      language: 'en',
    };
    const mockErrorResponse: ErrorResponse = {
      type: 'Error',
      title: 'Error Title',
      detail: 'SomeErrorDetail',
      status: 500,
      traceId: 'traceId',
    };
    httpClientSpy.post.and.returnValue(of(mockErrorResponse));

    // Act
    sut.createPage(createPageRequest).subscribe({
      error: (error) => {
        expect(error).toEqual('SomeErrorDetail');
      },
    });
  });

  it('should move a page', async () => {
    // Arrange
    const siteId = 'site123';
    const pageId = 'mockPageId';
    const requestBody: MovePageRequest = {
      site: siteId,
      targetId: 'targetPageId',
      position: 'INTO',
    };

    httpClientSpy.post.and.returnValue(of(true));

    // Act
    const response = await firstValueFrom(sut.movePage(pageId, siteId, requestBody));

    // Assert
    expect(response).toBeTrue();
    expect(httpClientSpy.post).toHaveBeenCalledOnceWith(
      `${xmAppsApiBaseUrl}${siteServiceEndpoint}${siteId}/hierarchy/${pageId}/move`,
      requestBody,
    );
  });

  it('should save a page', async () => {
    // Arrange
    const pageId = 'mockPageId';
    const newDisplayName = 'newDisplayName';
    const savePageResponse: SavePageResponse = {
      language: 'en',
      site: 'site01',
      pageVersion: 1,
      revision: 'revision',
      fields: [{ id: DISPLAY_NAME_FIELD_ID, value: newDisplayName, containsStandardValue: false }],
      layout: undefined,
      originalLayout: undefined,
      errors: [],
      savedPage: {
        id: pageId,
        language: 'en',
        revision: 'revision',
        version: 1,
        fields: [{ id: DISPLAY_NAME_FIELD_ID, value: newDisplayName, containsStandardValue: false }],
      },
      validationErrors: [],
      warnings: [],
      newCreatedVersion: { pageId, displayName: newDisplayName, versionNumber: 1 },
    };

    const savePageRequest: SavePageRequest = {
      language: 'en',
      site: 'example-site',
      revision: '123456',
      fields: [
        { id: 'field1', value: 'value1', containsStandardValue: false },
        { id: 'field2', value: 'value2', originalValue: 'originalValue2', containsStandardValue: false },
      ],
      layout: {
        kind: 'FINAL',
        body: '<div>This is the layout body</div>',
      },
      originalLayout: {
        kind: 'SHARED',
        body: '<div>This is the original layout body</div>',
      },
    };

    httpClientSpy.post.and.returnValue(of(savePageResponse));

    // Act
    const response = await firstValueFrom(sut.savePage(pageId, savePageRequest));

    // Assert
    expect(response).toEqual(savePageResponse);
    expect(httpClientSpy.post).toHaveBeenCalledOnceWith(
      `${xmAppsApiBaseUrl}${pageServiceEndpoint}${pageId}/layout`,
      savePageRequest,
    );
  });

  it('should execute a workflow', async () => {
    // Arrange
    const pageId = 'mockPageId';
    const requestBody: ExecuteWorkflowCommandRequest = {
      pageVersion: 1,
      site: 'example-site',
      language: 'en',
      commandId: 'command123',
      comments: 'Workflow executed successfully',
    };

    const executeWorkflowCommandResult: ExecuteWorkflowCommandResult = {
      completed: true,
      error: '',
      datasourcesCommandResult: [],
      pageWorkflowValidationResult: {
        pageValidationResult: { pageId, pageName: 'Page Name', pageRulesResult: [], fieldRulesResult: [] },
        defaultDatasourceItemsResult: [],
        personalizedDatasourceItemsResult: [],
      },
    };
    httpClientSpy.post.and.returnValue(of(executeWorkflowCommandResult));

    // Act
    const response = await firstValueFrom(sut.executeWorkflow(pageId, requestBody));

    // Assert
    expect(response).toEqual(executeWorkflowCommandResult);
    expect(httpClientSpy.post).toHaveBeenCalledOnceWith(
      `${xmAppsApiBaseUrl}${pageServiceEndpoint}${pageId}/executeworkflow`,
      requestBody,
    );
  });

  it('should delete a page version', async () => {
    // Arrange
    const pageId = 'mockPageId';
    const deletePageVersionRequest: DeletePageVersionRequest = {
      language: 'en',
      versionNumber: 2,
    };

    const latestVersion = 1;
    httpClientSpy.delete.and.returnValue(of(latestVersion));

    // Act
    const response = await firstValueFrom(sut.deletePageVersion(pageId, deletePageVersionRequest));

    // Assert
    expect(response).toEqual(latestVersion);
    expect(httpClientSpy.delete).toHaveBeenCalledOnceWith(
      `${xmAppsApiBaseUrl}${pageServiceEndpoint}${pageId}/version`,
      { body: deletePageVersionRequest },
    );
  });

  it('should add a page version', async () => {
    // Arrange
    const pageId = 'mockPageId';
    const addPageVersionRequest: AddPageVersionRequest = {
      language: 'en',
      baseVersion: 1,
      versionName: 'Version 2.0',
    };
    const newVersionNumber = 2;
    httpClientSpy.post.and.returnValue(of(newVersionNumber));

    // Act
    const response = await firstValueFrom(sut.addPageVersion(pageId, addPageVersionRequest));

    // Assert
    expect(response).toEqual(newVersionNumber);
    expect(httpClientSpy.post).toHaveBeenCalledOnceWith(
      `${xmAppsApiBaseUrl}${pageServiceEndpoint}${pageId}/version`,
      addPageVersionRequest,
    );
  });

  it('should set publishing settings for a page', async () => {
    // Arrange
    const pageId = 'mockPageId';
    const setPublishingSettingsRequest: SetPublishingSettingRequest = {
      versionNumber: 1,
      validFromDate: '2024-05-20',
      validToDate: '2024-06-20',
      isAvailableToPublish: true,
      language: 'en',
      site: 'example-site',
    };
    const expectedResponse = true;
    httpClientSpy.post.and.returnValue(of(expectedResponse));

    // Act
    const response = await firstValueFrom(sut.setPublishingSettings(pageId, setPublishingSettingsRequest));

    // Assert
    expect(response).toEqual(expectedResponse);
    expect(httpClientSpy.post).toHaveBeenCalledOnceWith(
      `${xmAppsApiBaseUrl}${pageServiceEndpoint}${pageId}/publish/settings`,
      setPublishingSettingsRequest,
    );
  });
});
