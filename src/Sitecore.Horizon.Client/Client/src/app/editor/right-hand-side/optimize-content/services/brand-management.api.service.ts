/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StaticConfigurationService } from '../../../../shared/configuration/static-configuration.service';
import { makeAbsoluteUrl } from '../../../../shared/utils/url.utils';
import { ConfigurationService } from '../../../../shared/configuration/configuration.service';
import { BrandKitRequest, BrandKitResponse } from './brand-management.types';

@Injectable({
  providedIn: 'root',
})
export class BrandManagementApiService {
  private readonly brandManagementEndpoint = `/api/brands/v1/organizations`;

  constructor(
    private readonly http: HttpClient,
    private readonly staticConfigurationService: StaticConfigurationService,
  ) {}

  getBrandKit(request: BrandKitRequest): Observable<BrandKitResponse> {
    const headers = new HttpHeaders({
      accept: 'application/json',
      'content-type': 'application/json',
    });

    const organization = ConfigurationService.organization;

    const brandKitEndpoint = makeAbsoluteUrl(
      `${this.brandManagementEndpoint}/${organization}/brandkits/${request.brandKitId}`,
      this.staticConfigurationService.brandManagementBaseUrl,
    );

    return this.http.get<BrandKitResponse>(brandKitEndpoint, { headers }).pipe(
      map((response) => response),
      catchError((error) => {
        console.error('Error fetching brand kit:', error);
        return of({ id: '', name: '', apiError: true });
      }),
    );
  }
}
