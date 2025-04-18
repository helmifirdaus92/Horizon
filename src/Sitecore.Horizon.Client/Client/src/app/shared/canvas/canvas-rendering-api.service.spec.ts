/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient } from '@angular/common/http';
import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { of } from 'rxjs';
import { ConfigurationService } from '../configuration/configuration.service';
import { Site, SiteService } from '../site-language/site-language.service';
import { CanvasRenderingApiService, ComponentRenderRequest } from './canvas-rendering-api.service';

describe(CanvasRenderingApiService.name, () => {
  let sut: CanvasRenderingApiService;
  let siteServiceSpy: jasmine.SpyObj<SiteService>;
  let configurationServiceSpy: jasmine.SpyObj<ConfigurationService>;

  const html = '<h1>Hello world!</h1>';
  const siteContextTest: Site = {
    id: '227bc0ff-6237-42b6-851f-49e68c1998e8',
    collectionId: '337bc0ff-6237-42b6-851f-49e68c1998e8',
    hostId: 'hostId 1',
    appName: 'app_name',
    layoutServiceConfig: 'default',
    renderingEngineEndpointUrl: 'rendering-host-api-url',
    renderingEngineApplicationUrl: 'rendering-host-app-url',
    language: 'en',
    name: 'site',
    displayName: 'site',
    pointOfSale: [],
    startItemId: '',
    supportedLanguages: ['en'],
    properties: {
      isSxaSite: true,
      tagsFolderId: 'id001',
      isLocalDatasourcesEnabled: true,
    },
  };
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthenticationService,
          useValue: jasmine.createSpyObj<AuthenticationService>({
            getBearerToken: Promise.resolve('test-token'),
          }),
        },
        {
          provide: SiteService,
          useValue: jasmine.createSpyObj<SiteService>('SiteService', ['getContextSite']),
        },
        {
          provide: HttpClient,
          useValue: jasmine.createSpyObj<HttpClient>({ get: undefined, post: undefined }),
        },
        {
          provide: ConfigurationService,
          useValue: jasmine.createSpyObj<ConfigurationService>({}, { jssEditingSecret: 'secret123' }),
        },
      ],
    });

    ConfigurationService.xmCloudTenant = {
      url: 'https://xmcloud.localhost',
    } as any;

    sut = TestBed.inject(CanvasRenderingApiService);
    httpClientSpy = TestBedInjectSpy(HttpClient);

    siteServiceSpy = TestBedInjectSpy(SiteService);
    siteServiceSpy.getContextSite.and.returnValue(siteContextTest);

    configurationServiceSpy = TestBedInjectSpy(ConfigurationService);
  });

  afterEach(() => {
    ConfigurationService.xmCloudTenant = null;
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should call the rest API endpoint', async () => {
    const renderUrl = '/horizon/render/page';
    httpClientSpy.get.and.returnValue(of(html));

    // act
    const result = await sut.fetchPageRendering(renderUrl);

    // assert
    expect(httpClientSpy.get.calls.mostRecent().args[0]).toBe('/horizon/render/page');
    expect(result).toBe(html);
  });

  it('should get the component render url and call the rest API endpoint', fakeAsync(async () => {
    const mockContext = {
      itemId: 'item123',
      language: 'en',
      siteName: 'site1',
      itemVersion: 1,
      variant: 'variant1',
    };

    const mockComponentRenderRequest: ComponentRenderRequest = {
      platformUrl: 'https://xmcloud.localhost',
      jssEditingSecret: 'secret123',
      layoutServiceConfig: 'default',
      appName: 'app_name',
      renderingHostEndpointUrl: 'rendering-host-api-url',
      renderingHostApplicationUrl: 'rendering-host-app-url',
      scItemId: 'item123',
      scLang: 'en',
      scSite: 'site1',
      scVersion: '1',
      scVariant: 'variant1',
      scHorizon: 'editor',
      scHeadlessMode: 'edit',
      renderingInstanceId: 'instance123',
      renderingItemId: 'renderItem123',
      datasourceId: 'dataSource123',
      renderingParams: { param1: 'value1' },
    };

    httpClientSpy.post.and.returnValue(of(html));

    const result = await sut.fetchComponentRendering(mockContext, 'instance123', 'renderItem123', 'dataSource123', {
      param1: 'value1',
    });

    tick(500);

    expect(result).toBe(html);
    expect(httpClientSpy.post.calls.mostRecent().args[0]).toBe(`/horizon/render/component`);
    expect(httpClientSpy.post.calls.mostRecent().args[1]).toEqual(mockComponentRenderRequest);
    flush();
  }));
});
