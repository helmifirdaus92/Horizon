/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient, HttpClientModule, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';

import { of } from 'rxjs';
import { DevicesApiService } from './devices-api.service';
import { DevicesBreakPointResponse } from './devices.types';

describe(DevicesApiService.name, () => {
  let sut: DevicesApiService;

  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, TranslateModule, TranslateServiceStubModule],
      providers: [
        {
          provide: HttpClient,
          useValue: jasmine.createSpyObj<HttpClient>({ get: undefined }),
        },
      ],
    });

    httpClientSpy = TestBedInjectSpy(HttpClient);

    ConfigurationService.xmCloudTenant = {
      id: '123',
      name: 'tenant',
      displayName: 'tenant1',
      organizationId: 'test-org',
      url: 'http://cm.com',
      gqlEndpointUrl: 'http://cm.com/graph',
      cdpEmbeddedTenantId: '123',
      customerEnvironmentType: 'prd',
      environmentId: '321',
      environmentName: 'prodev',
      projectId: '12',
      projectName: 'proj',
    };

    sut = TestBed.inject(DevicesApiService);
  });

  afterEach(() => {
    ConfigurationService.xmCloudTenant = null;
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('devices endpoint', () => {
    it('should fetch list of devices breakpoints', async () => {
      // Arrange
      const devicesApiResponse: DevicesBreakPointResponse = {
        data: {
          default: 'bc624769-5132-4084-a298-24fc5ce86f56',
          devices: [
            {
              id: 'bc624769-5132-4084-a298-24fc5ce86f56',
              name: 'Phone',
              icon: 'ico',
              type: 'fixed',
              width: '600',
              stackBreakpoint: 'sm',
            },
          ],
        },
        ok: true,
      };
      const createOkResponse = new HttpResponse<DevicesBreakPointResponse>({
        body: devicesApiResponse,
        status: 200,
        statusText: 'OK',
        headers: new HttpHeaders(),
        url: 'api.com',
      });

      httpClientSpy.get.and.returnValue(of(createOkResponse));

      // Act
      const actual = await sut.getDevicesBreakpointInfo();

      // Assert
      expect(actual).not.toBeNull();
      expect(httpClientSpy.get.calls.mostRecent().args[0]).toBe(
        `${ConfigurationService.xmCloudTenant?.url}sxa/horizon/metadata/devices`,
      );
      expect(actual).toEqual({
        apiIsBroken: false,
        requestIsInvalid: false,
        data: devicesApiResponse,
        httpStatus: 200,
      });
    });

    it('should handle devices breakpoint api error', async () => {
      // Arrange
      const createErrorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'OK',
        headers: new HttpHeaders(),
        url: 'api.com',
      });

      httpClientSpy.get.and.returnValue(of(createErrorResponse));

      // Act
      const actual = await sut.getDevicesBreakpointInfo();

      // Assert
      expect(httpClientSpy.get.calls.mostRecent().args[0]).toBe(
        `${ConfigurationService.xmCloudTenant?.url}sxa/horizon/metadata/devices`,
      );
      expect(actual).toEqual({
        apiIsBroken: true,
        requestIsInvalid: false,
        data: null,
        httpStatus: 500,
      });
    });
  });
});
