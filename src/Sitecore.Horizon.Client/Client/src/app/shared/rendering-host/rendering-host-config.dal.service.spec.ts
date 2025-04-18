/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { ApiResponse } from '../utils/utils';
import { Version } from '../utils/version.utils';
import {
  RenderingHostConfig,
  RenderingHostConfigDalService,
  RenderingHostConfigResponse,
} from './rendering-host-config.dal.service';

describe(RenderingHostConfigDalService.name, () => {
  let service: RenderingHostConfigDalService;
  let httpMock: HttpTestingController;
  let mockConfigService: jasmine.SpyObj<ConfigurationService>;

  const mockRenderingHostUrl = 'http://localhost:4200';
  const secret = 'my-secret';
  const expectedUrl = `${mockRenderingHostUrl}/api/editing/config?secret=${secret}`;

  beforeEach(() => {
    mockConfigService = jasmine.createSpyObj('ConfigurationService', [], { jssEditingSecret: secret });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        RenderingHostConfigDalService,
        { provide: ConfigurationService, useValue: mockConfigService },
        {
          provide: AuthenticationService,
          useValue: jasmine.createSpyObj<AuthenticationService>({
            getBearerToken: Promise.resolve('test-token'),
          }),
        },
      ],
    });

    service = TestBed.inject(RenderingHostConfigDalService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve rendering host config', fakeAsync(() => {
    const mockResponse: RenderingHostConfigResponse = {
      components: ['Component1', 'Component2'],
      packages: { Package1: '1.0.0', Package2: '2.0.0' },
    };

    const expectedData = {
      components: ['Component1', 'Component2'],
      packages: {
        Package1: new Version('1.0.0'),
        Package2: new Version('2.0.0'),
      },
    };

    service.getRenderingHostConfig(mockRenderingHostUrl).subscribe((response: ApiResponse<RenderingHostConfig>) => {
      expect(response.apiIsBroken).toBeFalse();
      expect(response.requestIsInvalid).toBeFalse();
      expect(response.data).toEqual(expectedData);
    });
    tick();

    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
    tick();
  }));

  it('should handle CORS errors and retry without authorization header', fakeAsync(() => {
    const mockResponse: RenderingHostConfigResponse = {
      components: ['Component1', 'Component2'],
      packages: { Package1: '1.0.0', Package2: '2.0.0' },
    };

    service.getRenderingHostConfig(mockRenderingHostUrl).subscribe((response: ApiResponse<RenderingHostConfig>) => {
      expect(response.apiIsBroken).toBeFalse();
      expect(response.requestIsInvalid).toBeFalse();
      expect(response.data).toEqual({
        components: ['Component1', 'Component2'],
        packages: {
          Package1: new Version('1.0.0'),
          Package2: new Version('2.0.0'),
        },
      });
    });
    tick();

    const initialReq = httpMock.expectOne(expectedUrl);
    expect(initialReq.request.headers.has('Authorization')).toBeTrue();
    initialReq.flush(null, { status: 0, statusText: 'CORS error' });

    const retryReq = httpMock.expectOne(expectedUrl);
    expect(retryReq.request.headers.has('Authorization')).toBeFalse();
    retryReq.flush(mockResponse);
    tick();
  }));

  it('should handle errors in getRenderingHostConfig', fakeAsync(() => {
    service.getRenderingHostConfig(mockRenderingHostUrl).subscribe((response: ApiResponse<RenderingHostConfig>) => {
      expect(response.apiIsBroken).toBeTrue();
      expect(response.requestIsInvalid).toBeFalse();
      expect(response.data).toEqual(null);
    });
    tick();
    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('GET');
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
    tick();
  }));

  it('should return invalid result for invalid rendering host url', () => {
    service.getRenderingHostConfig('https://').subscribe((response: ApiResponse<RenderingHostConfig>) => {
      expect(response.apiIsBroken).toBeFalse();
      expect(response.requestIsInvalid).toBeTrue();
      expect(response.data).toEqual(null);
    });
  });
});
