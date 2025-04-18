/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { firstValueFrom } from 'rxjs';
import { Context } from '../client-state/context.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { SiteService } from '../site-language/site-language.service';

export interface ComponentRenderRequest {
  platformUrl: string;
  renderingHostEndpointUrl: string;
  renderingHostApplicationUrl: string;
  layoutServiceConfig: string;
  jssEditingSecret: string;
  scHorizon: string;
  scHeadlessMode: string;
  scItemId: string;
  renderingInstanceId: string;
  appName: string;
  scLang?: string;
  scSite?: string;
  scVersion?: string;
  scVariant?: string;
  datasourceId?: string;
  renderingItemId?: string;
  renderingParams?: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class CanvasRenderingApiService {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly siteService: SiteService,
    private readonly configurationService: ConfigurationService,
    private readonly httpClient: HttpClient,
  ) {}

  async fetchPageRendering(renderUrl: string): Promise<string> {
    const requestOptions = await this.buildRequestOptions();
    const renderHTML = await firstValueFrom(this.httpClient.get<string>(renderUrl, requestOptions)).catch(
      (error) => error,
    );

    return renderHTML;
  }

  async fetchComponentRendering(
    context: Context,
    instanceId: string,
    renderingItemId: string | undefined,
    dataSource: string | undefined,
    parameters?: Record<string, string>,
  ): Promise<string> {
    const requestUrl = '/horizon/render/component';

    const componentRenderRequest = this.buildComponentRenderRequest(
      context,
      instanceId,
      renderingItemId,
      dataSource,
      parameters,
    );

    const requestOptions = await this.buildRequestOptions();
    const renderHTML = await firstValueFrom(
      this.httpClient.post<string>(requestUrl, componentRenderRequest, requestOptions),
    ).catch((error) => error);

    return renderHTML;
  }

  private buildComponentRenderRequest(
    context: Context,
    instanceId: string,
    renderingItemId: string | undefined,
    dataSource: string | undefined,
    parameters?: Record<string, string>,
  ): ComponentRenderRequest {
    const contextSite = this.siteService.getContextSite();

    return {
      platformUrl: ConfigurationService.xmCloudTenant?.url || '',
      jssEditingSecret: this.configurationService.jssEditingSecret,
      layoutServiceConfig: contextSite.layoutServiceConfig ?? '',
      appName: contextSite.appName ?? '',
      renderingHostEndpointUrl: contextSite.renderingEngineEndpointUrl ?? '',
      renderingHostApplicationUrl: contextSite.renderingEngineApplicationUrl ?? '',
      scItemId: context.itemId,
      scLang: context.language,
      scSite: context.siteName,
      scVersion: (context.itemVersion ?? '').toString(),
      scVariant: context.variant ?? '',
      scHorizon: 'editor',
      scHeadlessMode: 'edit',
      renderingInstanceId: instanceId,
      renderingItemId,
      datasourceId: dataSource,
      renderingParams: parameters,
    };
  }

  private async buildRequestOptions() {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + (await this.authenticationService.getBearerToken()),
    });

    const requestOptions = {
      headers,
      responseType: 'text' as 'json',
    };
    return requestOptions;
  }
}
