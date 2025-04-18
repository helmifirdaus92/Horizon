/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { firstValueFrom, of } from 'rxjs';
import { PublishingMode, PublishPageRequest, PublishPageStatus } from '../page/page.types';
import { PublishingRestDalService } from './publishing.rest.dal.service';

const xmAppsApiBaseUrl = 'https://sites-api-url.com/';
const pageServiceEndpoint = 'api/v1/pages/';

describe(PublishingRestDalService.name, () => {
  let sut: PublishingRestDalService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, StaticConfigurationServiceStubModule],
      providers: [
        {
          provide: HttpClient,
          useValue: jasmine.createSpyObj<HttpClient>({ get: undefined, post: undefined, delete: undefined }),
        },
        PublishingRestDalService,
      ],
    });

    httpClientSpy = TestBedInjectSpy(HttpClient);
    sut = TestBed.inject(PublishingRestDalService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('getPublishingStatus', () => {
    it('should return COMPLETED status with processed items count when publishing is finished', async () => {
      // Arrange
      const operationId = '123';
      const mockPageStatus: PublishPageStatus = { isDone: true, isFailed: false, processed: 10, state: 'FINISHED' };
      httpClientSpy.get.and.returnValue(of(mockPageStatus));

      // Act
      const result = await firstValueFrom(sut.getPublishingStatus(operationId));

      // Assert
      expect(result.state).toEqual('FINISHED');
      expect(result.processed).toEqual(10);
      expect(httpClientSpy.get).toHaveBeenCalledWith(
        `${xmAppsApiBaseUrl}${pageServiceEndpoint}/publishstatus/${operationId}`,
      );
    });

    it('should return RUNNING status when publishing is initializing, queued, or running', async () => {
      // Arrange
      const operationId = '123';
      const initializingStatus: PublishPageStatus = {
        isDone: false,
        isFailed: false,
        processed: 0,
        state: 'INITIALIZING',
      };
      httpClientSpy.get.and.returnValue(of(initializingStatus));

      // Act
      const result = await firstValueFrom(sut.getPublishingStatus(operationId));

      // Assert
      expect(result.state).toEqual('INITIALIZING');
      expect(result.processed).toBe(0);
    });

    it('should return FAILED status when publishing is aborted and failed', async () => {
      // Arrange
      const operationId = '123';
      const abortRequestedStatus: PublishPageStatus = {
        isDone: true,
        isFailed: true,
        processed: 0,
        state: 'ABORTREQUESTED',
      };
      httpClientSpy.get.and.returnValue(of(abortRequestedStatus));

      // Act
      const result = await firstValueFrom(sut.getPublishingStatus(operationId));

      // Assert
      expect(result.state).toEqual('ABORTREQUESTED');
      expect(result.processed).toBe(0);
    });

    it('should return UNKNOWN status when publishing state is unknown', async () => {
      // Arrange
      const operationId = '123';
      const unknownStatus: PublishPageStatus = { isDone: false, isFailed: false, processed: 0, state: 'UNKNOWN' };
      httpClientSpy.get.and.returnValue(of(unknownStatus));

      // Act
      const result = await firstValueFrom(sut.getPublishingStatus(operationId));

      // Assert
      expect(result.state).toEqual('UNKNOWN');
      expect(result.processed).toBe(0);
    });
  });

  it('should publish item', async () => {
    // Arrange
    const pageId = 'page123';
    const publishMode: string = 'SMART';
    const publishingMode: PublishingMode = publishMode as PublishingMode;
    const mockInput = {
      rootItemId: pageId,
      publishSubItems: true,
      languages: ['en'],
      publishRelatedItems: true,
      publishItemMode: publishingMode,
    };
    const publishPageRequest: PublishPageRequest = {
      publishRelatedItems: true,
      languages: ['en'],
      publishSubitems: true,
      PublishMode: 'SMART',
    };
    const expectedResponse = { operationId: 'operationId123' };
    httpClientSpy.post.and.returnValue(of('operationId123'));

    // Act
    const result = await firstValueFrom(sut.publishItem(mockInput));

    // Assert
    expect(result).toEqual(expectedResponse);
    expect(httpClientSpy.post).toHaveBeenCalledWith(
      `${xmAppsApiBaseUrl}${pageServiceEndpoint}${pageId}/publish`,
      publishPageRequest,
    );
  });
});
