/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { firstValueFrom, of } from 'rxjs';

import { VariantRecommendationApiService } from './variant-recommendation.api.service';
import { Feedback, VariantsRequest, VariantsResponse } from './variant-recommendation.types';

const genAiApiBaseUrl = 'https://ai.sitecore-test.cloud';
const variantRecommendationEndpointV2 = `/api/recommendations/v2/organizations`;
const variantRecommendationEndpointV1 = `/api/recommendations/v1/organizations`;

describe(VariantRecommendationApiService.name, () => {
  let sut: VariantRecommendationApiService;
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
            patch: undefined,
            put: undefined,
            delete: undefined,
          }),
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
        VariantRecommendationApiService,
      ],
    });

    ConfigurationService.organization = 'sitecore';
    httpClientSpy = TestBedInjectSpy(HttpClient);
    sut = TestBed.inject(VariantRecommendationApiService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should call getVariants and return expected response', async () => {
    // Arrange
    const mockRequest: VariantsRequest = {
      promptInputs: {
        componentGoal: 'Optimize Content',
        seoKeywords: [],
        audiences: [],
      },
      predefinedPrompt: 0,
      numberOfVariants: 1,
      componentId: 'testComponentId',
      fields: [{ name: 'fieldName', value: 'fieldValue' }],
    };

    const mockResponse: VariantsResponse = {
      id: 'mockResponseId',
      variants: [
        {
          id: 'variant1',
          fields: [
            {
              name: '729034fc-24f3-40b7-8fa4-fb49d7de20dd',
              value: 'variant content',
            },
          ],
        },
      ],
    };

    httpClientSpy.post.and.returnValue(of(mockResponse));

    // Act
    const response = await firstValueFrom(sut.getVariants(mockRequest));

    // Assert
    expect(response).toEqual(mockResponse);
    expect(httpClientSpy.post).toHaveBeenCalledWith(
      `${genAiApiBaseUrl}${variantRecommendationEndpointV2}/${ConfigurationService.organization}/variants`,
      mockRequest,
      jasmine.any(Object),
    );
  });

  it('should call updateVariant and return expected response', async () => {
    // Arrange
    const mockVariantsResponse: VariantsResponse = {
      id: 'mockResponseId',
      variants: [
        {
          id: 'variant1',
          fields: [
            {
              name: 'field1',
              value: 'value1',
            },
          ],
        },
      ],
    };

    const mockFeedback: Feedback = {
      type: 'good',
      message: 'Positive feedback',
      reason: '',
      categories: [],
    };
    const mockApiResponse = { key: 'value' };
    const mockResponse = { success: true, data: mockApiResponse };

    const expectedUrl = `${genAiApiBaseUrl}${variantRecommendationEndpointV1}/${ConfigurationService.organization}/variants/${mockVariantsResponse.id}/variant/${mockVariantsResponse.variants[0].id}`;

    httpClientSpy.patch.and.returnValue(of(mockApiResponse));

    // Act
    const response = await firstValueFrom(sut.updateVariant(mockVariantsResponse, mockFeedback));

    // Assert
    expect(response).toEqual(mockResponse);
    expect(httpClientSpy.patch).toHaveBeenCalledWith(expectedUrl, { feedback: mockFeedback }, jasmine.any(Object));
  });
});
