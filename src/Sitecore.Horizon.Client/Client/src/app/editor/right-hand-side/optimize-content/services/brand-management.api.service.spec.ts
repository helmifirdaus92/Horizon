/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient, HttpClientModule, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { firstValueFrom, of, throwError } from 'rxjs';

import { BrandManagementApiService } from './brand-management.api.service';
import { BrandKitRequest, BrandKitResponse } from './brand-management.types';

const brandManagementBaseUrl = 'https://brand.sitecore-test.cloud';
const brandManagementEndpoint = '/api/brands/v1/organizations';

describe(BrandManagementApiService.name, () => {
  let service: BrandManagementApiService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, StaticConfigurationServiceStubModule],
      providers: [
        {
          provide: HttpClient,
          useValue: jasmine.createSpyObj<HttpClient>('HttpClient', ['get']),
        },
        {
          provide: ConfigurationService,
          useValue: jasmine.createSpyObj<ConfigurationService>(
            {},
            {
              configuration$: of({
                organization: 'sitecore',
              } as any),
            },
          ),
        },
        BrandManagementApiService,
      ],
    });

    ConfigurationService.organization = 'sitecore';
    httpClientSpy = TestBedInjectSpy(HttpClient);
    service = TestBed.inject(BrandManagementApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getBrandKit and return expected response', async () => {
    const mockRequest: BrandKitRequest = {
      brandKitId: 'test-brand-kit-id',
      includeDeleted: false,
    };

    const mockResponse: BrandKitResponse = {
      id: 'test-brand-kit-id',
      name: 'Test Brand Kit',
    };

    httpClientSpy.get.and.returnValue(of(mockResponse));

    const response = await firstValueFrom(service.getBrandKit(mockRequest));

    expect(response).toEqual(mockResponse);
    expect(httpClientSpy.get).toHaveBeenCalledWith(
      `${brandManagementBaseUrl}${brandManagementEndpoint}/${ConfigurationService.organization}/brandkits/${mockRequest.brandKitId}`,
      jasmine.any(Object),
    );
  });

  it('should handle error when getBrandKit fails', async () => {
    const mockRequest: BrandKitRequest = {
      brandKitId: 'test-brand-kit-id',
    };

    httpClientSpy.get.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: HttpStatusCode.InternalServerError })),
    );

    const response = await firstValueFrom(service.getBrandKit(mockRequest));

    expect(response).toEqual({ id: '', name: '', apiError: true });
  });
});
