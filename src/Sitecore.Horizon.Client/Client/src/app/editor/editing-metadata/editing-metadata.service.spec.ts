/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { of } from 'rxjs';
import { TestBedInjectSpy } from '../../testing/test.utils';
import { ContextService } from '../../shared/client-state/context.service';
import { EditingMetadataService, LayoutDataRequestContext } from './editing-metadata.service';
import { LayoutDataParseService } from './layout-data-parse.service';
import { EditingData, LayoutServiceData } from './layout-service-models';

describe('EditingMetadataService', () => {
  let service: EditingMetadataService;
  let authServiceSpy: jasmine.SpyObj<AuthenticationService>;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let contextServiceSpy: jasmine.SpyObj<ContextService>;

  let requestMocks: Array<{ url: string; responseBody: unknown }> = [];
  const mockResponse1: LayoutServiceData = {
    sitecore: {
      context: {
        foo: 'bar',
      },
      route: null,
    },
  };

  const mockResponse2: LayoutServiceData = {
    sitecore: {
      context: {
        a: 'b',
      },
      route: null,
    },
  };

  const mockEditingData1: EditingData = {
    renderings: [{ renderingUid: 'r1', chromeData: 'abc' }],
    placeholders: [],
    fields: [],
  };

  function configureMockRequest(url: string, responseBody: unknown) {
    requestMocks.push({ url, responseBody });
  }

  const mockEditingData2: EditingData = {
    renderings: [{ renderingUid: 'r2', chromeData: 'def' }],
    placeholders: [],
    fields: [],
  };

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['getBearerToken']);
    authServiceSpy.getBearerToken.and.returnValue(Promise.resolve('fake-token'));

    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);

    const layoutParseService = jasmine.createSpyObj<LayoutDataParseService>('LayoutDataParseService', [
      'parseLayoutData',
    ]);

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        EditingMetadataService,
        { provide: AuthenticationService, useValue: authServiceSpy },
        { provide: LayoutDataParseService, useValue: layoutParseService },
        { provide: HttpClient, useValue: httpClientSpy },
        {
          provide: ContextService,
          useValue: jasmine.createSpyObj<ContextService>('ContextService', ['getItem']),
        },
      ],
    });
    service = TestBed.inject(EditingMetadataService);
    ConfigurationService.xmCloudTenant = {
      url: 'https://xmcloud.localhost',
    } as any;

    layoutParseService.parseLayoutData.and.callFake((ld) => {
      if (ld === mockResponse1) {
        return mockEditingData1;
      }

      if (ld === mockResponse2) {
        return mockEditingData2;
      }

      throw new Error('Unexpected layout data mock');
    });

    httpClientSpy.get.and.callFake((url: string) => {
      const index = requestMocks.findIndex((req) => req.url === url);
      if (index === -1) {
        throw new Error(`Encountered unregistered request with url: ${url}`);
      }
      return of(requestMocks.splice(index, 1)[0].responseBody) as any;
    });

    contextServiceSpy = TestBedInjectSpy(ContextService);
    contextServiceSpy.getItem.and.resolveTo({ id: 'item-id' } as any);
  });

  afterEach(() => {
    requestMocks = [];
  });

  describe('loadAndCacheEditingData', () => {
    it('should fetch data', async () => {
      const requestContext: LayoutDataRequestContext = {
        itemId: '1',
        siteName: 'exampleSite',
        language: 'en',
      };

      configureMockRequest(
        'https://xmcloud.localhost/sitecore/api/layout/render/sxa-jss?sc_headless_mode=edit&item=1&sc_lang=en&sc_site=exampleSite',
        mockResponse1,
      );

      const data = await service.loadAndCacheEditingData(requestContext);
      expect(data).toBe(mockEditingData1);
    });

    it('should fetch data with item version if exists', async () => {
      contextServiceSpy.getItem.and.resolveTo({ version: 1, versions: [{ version: 1 }] } as any);

      const requestContext: LayoutDataRequestContext = {
        itemId: '1',
        siteName: 'exampleSite',
        language: 'en',
      };

      configureMockRequest(
        'https://xmcloud.localhost/sitecore/api/layout/render/sxa-jss?sc_headless_mode=edit&item=1&sc_lang=en&sc_site=exampleSite&version=1',
        mockResponse1,
      );

      const data = await service.loadAndCacheEditingData(requestContext);
      expect(data).toBe(mockEditingData1);
    });
  });

  describe('getEditingData', () => {
    describe('data was not pre-cached', () => {
      it('should fetch data', async () => {
        const requestContext: LayoutDataRequestContext = {
          itemId: '1',
          siteName: 'exampleSite',
          language: 'en',
        };
        configureMockRequest(
          'https://xmcloud.localhost/sitecore/api/layout/render/sxa-jss?sc_headless_mode=edit&item=1&sc_lang=en&sc_site=exampleSite',
          mockResponse1,
        );

        const data = await service.getEditingData(requestContext);
        expect(data).toBe(mockEditingData1);
      });
    });

    describe('data is cached', () => {
      beforeEach(async () => {
        const requestContext: LayoutDataRequestContext = {
          itemId: '1',
          siteName: 'exampleSite',
          language: 'en',
        };

        configureMockRequest(
          'https://xmcloud.localhost/sitecore/api/layout/render/sxa-jss?sc_headless_mode=edit&item=1&sc_lang=en&sc_site=exampleSite',
          mockResponse1,
        );

        await service.loadAndCacheEditingData(requestContext);
      });

      it('should return cached data when request is matched', async () => {
        const newRequestContext: LayoutDataRequestContext = {
          itemId: '1',
          siteName: 'exampleSite',
          language: 'en',
        };
        const data = await service.getEditingData(newRequestContext);

        expect(data).toBe(mockEditingData1);
      });

      it('should request a new data when request is not matched', async () => {
        const newRequestContext: LayoutDataRequestContext = {
          itemId: '2',
          siteName: 'secondSite',
          language: 'de',
        };

        configureMockRequest(
          'https://xmcloud.localhost/sitecore/api/layout/render/sxa-jss?sc_headless_mode=edit&item=2&sc_lang=de&sc_site=secondSite',
          mockResponse2,
        );

        const data = await service.getEditingData(newRequestContext);
        expect(data).toBe(mockEditingData2);
      });
    });
  });
});
