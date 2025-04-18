/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { Observable, catchError, first, from, map, of, switchMap } from 'rxjs';
import { ConfigurationService } from '../configuration/configuration.service';
import { ApiResponse, handleHttpErrorResponse } from '../utils/utils';
import { Version } from '../utils/version.utils';

export interface RenderingHostConfig {
  components: string[];
  packages: Record<string, Version>;
  editMode?: 'metadata' | 'chromes';
}

export interface RenderingHostConfigResponse {
  components: string[];
  packages: Record<string, string>;
  editMode?: 'metadata' | 'chromes';
}

@Injectable({
  providedIn: 'root',
})
export class RenderingHostConfigDalService {
  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly httpClient: HttpClient,
    private readonly authenticationService: AuthenticationService,
  ) {}

  getRenderingHostConfig(renderingHostUrl: string | undefined): Observable<ApiResponse<RenderingHostConfig>> {
    if (!renderingHostUrl) {
      return this.invalidResponse();
    }

    let configUrl: string;
    try {
      configUrl = this.buildUrl(renderingHostUrl);
    } catch {
      return this.invalidResponse();
    }

    const withTokenHeader = (token: string): { headers: { [key: string]: string } } => ({
      headers: { Authorization: `Bearer ${token}` },
    });

    return from(this.authenticationService.getBearerToken()).pipe(
      first(),
      switchMap((token: string) =>
        this.httpClient.get<RenderingHostConfigResponse>(configUrl, withTokenHeader(token)).pipe(
          map((response: RenderingHostConfigResponse) => this.validResponse(this.parserRHVPackageVersions(response))),
          catchError((error) => this.handleCorsError(configUrl, error)),
        ),
      ),
      catchError(() => this.brokenApiResponse()),
    );
  }

  private handleCorsError(configUrl: string, error: HttpErrorResponse): Observable<ApiResponse<RenderingHostConfig>> {
    if (error.status === 0) {
      return this.httpClient.get<RenderingHostConfigResponse>(configUrl).pipe(
        map((response: RenderingHostConfigResponse) => this.validResponse(this.parserRHVPackageVersions(response))),
        catchError((innerError) => of(handleHttpErrorResponse<RenderingHostConfig>(innerError))),
      );
    }
    return of(handleHttpErrorResponse<RenderingHostConfig>(error));
  }

  private parserRHVPackageVersions(rhConfigResponse: RenderingHostConfigResponse): RenderingHostConfig {
    return {
      ...rhConfigResponse,
      components: rhConfigResponse.components,
      packages: Object.entries(rhConfigResponse.packages).reduce(
        (acc, [key, value]) => {
          acc[key] = new Version(value);
          return acc;
        },
        {} as Record<string, Version>,
      ),
    };
  }

  private buildUrl(renderingHostUrl: string): string {
    const rhUrl = new URL(renderingHostUrl);
    rhUrl.searchParams.append('secret', this.configurationService.jssEditingSecret);
    // Fix for Vercel editing host not working properly with deployment protection enabled in metadata edit mode.
    rhUrl.searchParams.delete('x-vercel-set-bypass-cookie');
    rhUrl.pathname = '/api/editing/config';

    return rhUrl.toString();
  }

  private validResponse(data: RenderingHostConfig): ApiResponse<RenderingHostConfig> {
    return {
      apiIsBroken: false,
      requestIsInvalid: false,
      data,
    };
  }

  private invalidResponse(): Observable<ApiResponse<RenderingHostConfig>> {
    return of({
      apiIsBroken: false,
      requestIsInvalid: true,
      data: null,
    });
  }

  private brokenApiResponse(): Observable<ApiResponse<RenderingHostConfig>> {
    return of({
      apiIsBroken: true,
      requestIsInvalid: false,
      data: null,
    });
  }
}
