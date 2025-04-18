/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { ApiResponse, handleHttpErrorResponse, handleHttpResponse } from 'app/shared/utils/utils';
import { firstValueFrom } from 'rxjs';
import { DevicesBreakPointResponse } from './devices.types';

@Injectable({ providedIn: 'root' })
export class DevicesApiService {
  devicesMetdataBaseUrl = ConfigurationService.xmCloudTenant?.url + 'sxa/horizon/metadata/devices';

  constructor(private readonly httpClient: HttpClient) {}

  public async getDevicesBreakpointInfo(): Promise<ApiResponse<DevicesBreakPointResponse>> {
    try {
      const response = await firstValueFrom(
        this.httpClient.get<DevicesBreakPointResponse>(this.devicesMetdataBaseUrl, {
          observe: 'response',
        }),
      );
      return handleHttpResponse<DevicesBreakPointResponse>(response);
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        return handleHttpErrorResponse(error);
      }
    }
    return {
      apiIsBroken: true,
      requestIsInvalid: true,
      data: null,
    };
  }
}
