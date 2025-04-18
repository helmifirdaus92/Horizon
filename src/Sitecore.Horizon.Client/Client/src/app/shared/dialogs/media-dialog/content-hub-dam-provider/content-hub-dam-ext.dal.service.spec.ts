/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient } from '@angular/common/http';
import { ContextService } from 'app/shared/client-state/context.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { ContentHubDamDALService } from './content-hub-dam-ext.dal.service';

describe(ContentHubDamDALService.name, () => {
  let sut: ContentHubDamDALService;
  let fetchSpy: jasmine.Spy;
  let httpClientMock: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const contextMock: Partial<ContextService> = {
      language: 'lang-en',
    };
    httpClientMock = jasmine.createSpyObj<HttpClient>(['get', 'post']);

    ConfigurationService.xmCloudTenant = {
      url: 'http://tenantUrl/',
    } as any;

    sut = new ContentHubDamDALService(contextMock as ContextService, httpClientMock);
    fetchSpy = spyOn(window, 'fetch').and.callFake(async () => new Response());
  });

  afterEach(() => {
    ConfigurationService.xmCloudTenant = null;
    ConfigurationService.cdpTenant = null;
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('getAuthenticationDetails', () => {
    it('should call correct endpoint', async () => {
      await sut.getAuthenticationDetails();

      expect(httpClientMock.get).toHaveBeenCalledOnceWith(
        'http://tenanturl/sitecore/api/dam/MContent/GetAuthenticationDetails',
      );
    });
  });

  describe('getCurrentSiteId', () => {
    it('should call correct endpoint', async () => {
      await sut.getCurrentSiteId();

      expect(httpClientMock.get).toHaveBeenCalledOnceWith(
        'http://tenanturl/sitecore/api/dam/MContent/GetCurrentSiteId',
      );
    });
  });

  describe('getContentDetails', () => {
    it('should call correct endpoint', () => {
      sut.getContentDetails('my-url');

      expect(fetchSpy.calls.mostRecent().args[0]).toBe('my-url');
    });

    it('should return response', async () => {
      const test = new Response('response');
      fetchSpy.and.callFake(async () => test);

      const result = await sut.getContentDetails('my-url');

      expect(result).toEqual(test);
    });
  });
});
