/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StaticConfigurationService } from 'app/shared/configuration/static-configuration.service';
import { catchError, map, Observable, of } from 'rxjs';

export interface Entity {
  Id: string;
  Signature: string;
  HasBlueprints: boolean;
  HasWebhookSettings: boolean;
  IsLive: boolean;
  Name: string;
  Status: number;
  Type: number;
  Subtype: number;
  Archived: boolean;
}

export interface EntityItem {
  Entity: Entity;
  Tags: string[];
  SiteList: string[];
  PreviewImageUrl: string | null;
}

export interface EntitiesResponse {
  Items: EntityItem[];
}

export interface FormsEntity {
  id: string;
  name: string;
  thumbnail: string;
}

export interface FormsEntityResponse {
  FormsEntities: FormsEntity[];
  apiError?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class FormsComponentsDalService {
  private apiUrl = `${this.staticConfigurationService.formsApiBaseUrl}/api/entities/filter`;

  constructor(
    private http: HttpClient,
    private readonly staticConfigurationService: StaticConfigurationService,
  ) {}

  getEntities(siteName: string): Observable<FormsEntityResponse> {
    const requestBody = {
      Page: 1,
      PageSize: 1000,
      WhereEntityStatus: 1,
      SiteNames: siteName ? [siteName] : undefined,
    };

    return this.http.post<EntitiesResponse>(this.apiUrl, requestBody).pipe(
      map((response) => ({
        FormsEntities:
          response?.Items?.map((item) => ({
            id: item.Entity.Id,
            name: item.Entity.Name,
            thumbnail: item.PreviewImageUrl ?? '',
          })) ?? [],
        apiError: false,
      })),
      catchError((error) => {
        console.error('Error fetching forms:', error);
        return of({ FormsEntities: [], apiError: true });
      }),
    );
  }
}
