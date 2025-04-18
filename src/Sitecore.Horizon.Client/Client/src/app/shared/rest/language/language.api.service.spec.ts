/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { of } from 'rxjs';
import { Language } from '../../graphql/language.dal.service';
import { ErrorResponse } from '../page/page.types';
import { LanguageApiService } from './language.api.service';

const xmAppsApiBaseUrl = 'https://sites-api-url.com/';
const languageEndpoint = 'api/v1/languages';

describe(LanguageApiService.name, () => {
  let sut: LanguageApiService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, StaticConfigurationServiceStubModule],
      providers: [
        {
          provide: HttpClient,
          useValue: jasmine.createSpyObj<HttpClient>({ get: undefined, post: undefined, delete: undefined }),
        },
        LanguageApiService,
      ],
    });

    httpClientSpy = TestBedInjectSpy(HttpClient);
    sut = TestBed.inject(LanguageApiService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should fetch languages successfully', () => {
    const mockLanguages: Language[] = [
      {
        name: 'english',
        displayName: 'English',
        nativeName: 'English',
        englishName: 'English',
        iso: 'en',
      },
      {
        name: 'french',
        displayName: 'French',
        nativeName: 'Français',
        englishName: 'French',
        iso: 'fr',
      },
    ];

    const expectedHeaders = { headers: { 'X-NG-HTTP-CACHING-ALLOW-CACHE': 'ALLOW' } };
    httpClientSpy.get.and.returnValue(of(mockLanguages));

    sut.fetchLanguages().subscribe((languages) => {
      expect(languages).toEqual(mockLanguages);
    });

    expect(httpClientSpy.get).toHaveBeenCalledOnceWith(`${xmAppsApiBaseUrl}${languageEndpoint}`, expectedHeaders);
  });

  it('should handle errors when fetching languages', () => {
    const mockErrorResponse: ErrorResponse = {
      type: 'Error',
      title: 'Error Title',
      detail: 'SomeErrorDetail',
      status: 500,
      traceId: 'traceId',
    };
    httpClientSpy.get.and.returnValue(of(mockErrorResponse));

    sut.fetchLanguages().subscribe({
      error: (error) => {
        expect(error).toEqual('SomeErrorDetail');
      },
    });

    expect(httpClientSpy.get).toHaveBeenCalled();
  });
});
