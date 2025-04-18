/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { StaticConfigurationService } from 'app/shared/configuration/static-configuration.service';
import { makeAbsoluteUrl } from 'app/shared/utils/url.utils';
import { catchError, map, Observable, of } from 'rxjs';
import { Feedback, VariantsRequest, VariantsResponse } from './variant-recommendation.types';

@Injectable({
  providedIn: 'root',
})
export class VariantRecommendationApiService {
  private readonly variantRecommendationEndpointV2 = `/api/recommendations/v2/organizations`;
  private readonly variantRecommendationEndpointV1 = `/api/recommendations/v1/organizations`;

  constructor(
    private readonly http: HttpClient,
    private readonly staticConfigurationService: StaticConfigurationService,
  ) {}

  getVariants(request: VariantsRequest): Observable<VariantsResponse> {
    const headers = new HttpHeaders({
      accept: 'application/json',
      'content-type': 'application/json',
    });

    const organization = ConfigurationService.organization;
    const variantsRecommendationEndPoint = makeAbsoluteUrl(
      `${this.variantRecommendationEndpointV2}/${organization}/variants`,
      this.staticConfigurationService.genAiApiBaseUrl,
    );

    return this.http.post<VariantsResponse>(variantsRecommendationEndPoint, request, { headers }).pipe(
      map((response) => response),
      catchError((error) => {
        console.error('Error fetching variants:', error);
        // Pass the error state to handle ui in the component
        return of({ id: '', variants: [], apiError: true });
      }),
    );
  }

  updateVariant(
    optimizedVariants: VariantsResponse,
    feedback: Feedback,
  ): Observable<{ success: boolean; data?: unknown; error?: unknown }> {
    const headers = new HttpHeaders({
      accept: 'application/json',
      'content-type': 'application/json',
    });
    const organization = ConfigurationService.organization;
    const feedbackVariantId = optimizedVariants.variants[0].id;
    const variantResponseId = optimizedVariants.id;

    const variantsRecommendationFeedbackEndpoint = makeAbsoluteUrl(
      `${this.variantRecommendationEndpointV1}/${organization}/variants/${variantResponseId}/variant/${feedbackVariantId}`,
      this.staticConfigurationService.genAiApiBaseUrl,
    );

    const payload = { feedback };

    return this.http.patch(variantsRecommendationFeedbackEndpoint, payload, { headers }).pipe(
      map((response) => {
        return { success: true, data: response };
      }),
      catchError((error) => {
        return of({ success: false, error });
      }),
    );
  }
}
