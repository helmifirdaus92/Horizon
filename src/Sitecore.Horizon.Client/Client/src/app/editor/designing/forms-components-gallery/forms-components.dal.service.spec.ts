/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { firstValueFrom, of } from 'rxjs';
import { EntitiesResponse, FormsComponentsDalService, FormsEntityResponse } from './forms-components.dal.service';

const formsApiBaseUrl = 'https://form-app-url.com';
const entityFilterEndpoint = '/api/entities/filter';

describe(FormsComponentsDalService.name, () => {
  let sut: FormsComponentsDalService;
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
          }),
        },
        FormsComponentsDalService,
      ],
    });
    httpClientSpy = TestBedInjectSpy(HttpClient);
    sut = TestBed.inject(FormsComponentsDalService);
  });

  it('should fetch entities successfully', async () => {
    // Arrange
    const siteName = 'mockSite';
    const mockResponse: EntitiesResponse = {
      Items: [
        {
          Entity: {
            Id: '1',
            Signature: 'sig1',
            HasBlueprints: false,
            HasWebhookSettings: false,
            IsLive: true,
            Name: 'Entity1',
            Status: 1,
            Type: 1,
            Subtype: 1,
            Archived: false,
          },
          Tags: ['tag1'],
          SiteList: ['site1'],
          PreviewImageUrl: 'http://example.com/image1.png',
        },
      ],
    };

    const expectedEntities = {
      FormsEntities: [
        {
          id: '1',
          name: 'Entity1',
          thumbnail: 'http://example.com/image1.png',
        },
      ],
      apiError: false,
    };

    httpClientSpy.post.and.returnValue(of(mockResponse));

    // Act
    const result = await firstValueFrom(sut.getEntities(siteName));

    // Assert
    expect(result).toEqual(expectedEntities);
    expect(httpClientSpy.post).toHaveBeenCalledOnceWith(
      `${formsApiBaseUrl}${entityFilterEndpoint}`,
      jasmine.objectContaining({
        Page: 1,
        PageSize: 1000,
        WhereEntityStatus: 1,
        SiteNames: [siteName],
      }),
    );
  });

  it('should handle missing preview image in entities response', async () => {
    // Arrange
    const siteName = 'mockSite';
    const mockResponse: EntitiesResponse = {
      Items: [
        {
          Entity: {
            Id: '1',
            Signature: 'sig1',
            HasBlueprints: false,
            HasWebhookSettings: false,
            IsLive: true,
            Name: 'Entity1',
            Status: 1,
            Type: 1,
            Subtype: 1,
            Archived: false,
          },
          Tags: ['tag1'],
          SiteList: ['site1'],
          PreviewImageUrl: null,
        },
      ],
    };

    const expectedEntities: FormsEntityResponse = {
      FormsEntities: [
        {
          id: '1',
          name: 'Entity1',
          thumbnail: '',
        },
      ],
      apiError: false,
    };

    httpClientSpy.post.and.returnValue(of(mockResponse));

    // Act
    const result = await firstValueFrom(sut.getEntities(siteName));

    // Assert
    expect(result).toEqual(expectedEntities);
    expect(httpClientSpy.post).toHaveBeenCalledTimes(1);
  });

  it('should handle empty siteName gracefully', async () => {
    // Arrange
    const mockResponse: EntitiesResponse = { Items: [] };
    const expectedEntities = { FormsEntities: [], apiError: false };
    httpClientSpy.post.and.returnValue(of(mockResponse));

    // Act
    const result = await firstValueFrom(sut.getEntities(''));

    // Assert
    expect(result).toEqual(expectedEntities);
    expect(httpClientSpy.post).toHaveBeenCalledOnceWith(
      `${formsApiBaseUrl}${entityFilterEndpoint}`,
      jasmine.objectContaining({
        Page: 1,
        PageSize: 1000,
        WhereEntityStatus: 1,
        SiteNames: undefined,
      }),
    );
  });
});
