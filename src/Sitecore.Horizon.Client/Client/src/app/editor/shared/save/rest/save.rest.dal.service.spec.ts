/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { SavePageRequest } from 'app/shared/rest/page/page.types';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { firstValueFrom, of } from 'rxjs';
import { SaveFieldDetails, SaveLayoutDetails } from '../save.interfaces';
import { SaveRestDalService } from './save.rest.dal.service';

const xmAppsApiBaseUrl = 'https://sites-api-url.com/';
const pageServiceEndpoint = 'api/v1/pages/';

let sut: SaveRestDalService;
let httpClientSpy: jasmine.SpyObj<HttpClient>;

describe(SaveRestDalService.name, () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, StaticConfigurationServiceStubModule],
      providers: [
        {
          provide: HttpClient,
          useValue: jasmine.createSpyObj<HttpClient>({ get: undefined, post: undefined, delete: undefined }),
        },
        {
          provide: ConfigurationService,
          useValue: jasmine.createSpyObj<ConfigurationService>({}, { isSaveSupportsResetField: () => true } as any),
        },
        SaveRestDalService,
      ],
    });
    sut = TestBed.inject(SaveRestDalService);
    httpClientSpy = TestBedInjectSpy(HttpClient);
  });

  it('should be defined', () => {
    expect(sut).toBeTruthy();
  });

  it('should save fields through save page', async () => {
    // Arrange
    const language = 'en';
    const site = 'example-site';
    const pageId = 'page-1';

    const saveFieldDetails: SaveFieldDetails[] = [
      {
        itemId: pageId,
        revision: 'revision-1',
        itemVersion: 1,
        fields: [{ id: 'fieldId', originalValue: 'originalValue', value: 'value', reset: false }],
      },
    ];

    const mockSavePageResponse = {
      language: 'en',
      site: 'example-site',
      pageVersion: 1,
      revision: 'revision-1',
      fields: [
        {
          id: 'fieldId',
          originalValue: 'originalValue',
          value: 'value',
          containsStandardValue: false,
        },
      ],
      errors: [],
      savedPage: { fields: [], id: pageId, language: 'en', revision: 'revision-1', version: 1 },
      validationErrors: [],
      warnings: [],
      newCreatedVersion: { pageId, displayName: 'NewPageName', versionNumber: 1 },
    };

    httpClientSpy.post.and.returnValue(of(mockSavePageResponse));

    const createPageRequest: SavePageRequest = {
      language,
      site,
      version: 1,
      revision: 'revision-1',
      fields: [{ id: 'fieldId', value: 'value', containsStandardValue: false }],
      layout: undefined,
      originalLayout: undefined,
    };

    const result = await firstValueFrom(sut.savePage(language, site, [], saveFieldDetails));

    expect(httpClientSpy.post).toHaveBeenCalledOnceWith(
      `${xmAppsApiBaseUrl}${pageServiceEndpoint}${pageId}/layout`,
      createPageRequest,
    );

    expect(result.errors).toEqual([]);
    expect(result.savedItems.length).toBe(1);
    expect(result.savedItems[0].fields).toEqual(saveFieldDetails[0].fields);
    expect(result.savedItems[0].id).toBe(mockSavePageResponse.savedPage.id);
    expect(result.savedItems[0].language).toBe(mockSavePageResponse.language);
    expect(result.savedItems[0].revision).toBe(mockSavePageResponse.revision);
    expect(result.savedItems[0].version).toBe(mockSavePageResponse.pageVersion);
    expect(result.validationErrors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.newCreatedVersions.length).toBe(1);
    expect(result.newCreatedVersions[0]).toEqual({
      itemId: pageId,
      displayName: 'NewPageName',
      versionNumber: 1,
    });
  });

  it('should save layout through save page', async () => {
    // Arrange
    const language = 'en';
    const site = 'example-site';
    const pageId = 'page-1';
    const saveLayoutDetail: SaveLayoutDetails[] = [
      {
        itemId: pageId,
        itemVersion: 1,
        presentationDetails: { kind: 'FINAL', body: 'layoutBody' },
        originalPresentationDetails: { kind: 'FINAL', body: 'originalLayoutBody' },
        revision: 'revision-1',
      },
    ];

    const mockSavePageResponse = {
      language: 'en',
      site: 'example-site',
      pageVersion: 1,
      revision: 'revision-1',
      fields: [],
      layout: { kind: 'FINAL', body: 'layoutBody' },
      originalLayout: { kind: 'FINAL', body: 'originalLayoutBody' },
      errors: [],
      savedPage: { fields: [], id: pageId, language: 'en', revision: 'revision-1', version: 1 },
      validationErrors: [],
      warnings: [],
      newCreatedVersion: { pageId, displayName: 'NewPageName', versionNumber: 1 },
    };

    httpClientSpy.post.and.returnValue(of(mockSavePageResponse));

    const createPageRequest = {
      language,
      site,
      version: 1,
      revision: 'revision-1',
      fields: undefined,
      layout: { kind: 'FINAL', body: 'layoutBody' },
      originalLayout: { kind: 'FINAL', body: 'originalLayoutBody' },
    };

    const result = await firstValueFrom(sut.savePage(language, site, saveLayoutDetail, []));

    expect(httpClientSpy.post).toHaveBeenCalledOnceWith(
      `${xmAppsApiBaseUrl}${pageServiceEndpoint}${pageId}/layout`,
      createPageRequest,
    );

    expect(result.errors).toEqual([]);
    expect(result.savedItems.length).toBe(1);
    expect(result.savedItems[0].id).toBe(mockSavePageResponse.savedPage.id);
    expect(result.savedItems[0].language).toBe(mockSavePageResponse.language);
    expect(result.savedItems[0].revision).toBe(mockSavePageResponse.revision);
    expect(result.savedItems[0].version).toBe(mockSavePageResponse.pageVersion);
    expect(result.validationErrors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.newCreatedVersions.length).toBe(1);
    expect(result.newCreatedVersions[0]).toEqual({
      itemId: pageId,
      displayName: 'NewPageName',
      versionNumber: 1,
    });
  });
});
