/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { makeAbsoluteUrl } from 'app/shared/utils/url.utils';
import { firstValueFrom } from 'rxjs';

export interface AuthenticationDetails {
  m_instance: string;
  search_page: string;
  external_redirect_key: string;
}

export interface CurrentSiteId {
  site_id: string | null;
}

export interface MappedAttributes {
  rawValue: string;
  properties: Array<{ name: string; value: string }>;
}

export interface IframeMessageEventData {
  alt: string;
  alternative: string;
  public_link: string;
  selected_asset_id: string;
  height: string;
  width: string;
}

export interface MDialogResult {
  id: string;
  thumbnail: string;
  alternative: string;
  downloadText: string;
  width: string | null;
  height: string | null;
  source: string;
  file_type: string;
  file_name?: string;
  file_extension?: string;
  damExtraProperties?: MappedAttributes['properties'];
}

export type ContentType = 'Image' | 'Video' | 'Other';

@Injectable({ providedIn: 'root' })
export class ContentHubDamDALService {
  private xmCloudTenantUrl = () => {
    if (!ConfigurationService.xmCloudTenant) {
      throw new Error('XMCloud tenant is not resolved');
    }
    return ConfigurationService.xmCloudTenant.url;
  };

  constructor(
    private readonly context: ContextService,
    private readonly httpClient: HttpClient,
  ) {}

  async getAuthenticationDetails(): Promise<AuthenticationDetails | null> {
    const url = makeAbsoluteUrl('sitecore/api/dam/MContent/GetAuthenticationDetails', this.xmCloudTenantUrl());

    return firstValueFrom(this.httpClient.get<AuthenticationDetails>(url)).catch(() => null);
  }

  async getCurrentSiteId(): Promise<CurrentSiteId | null> {
    const url = makeAbsoluteUrl('sitecore/api/dam/MContent/GetCurrentSiteId', this.xmCloudTenantUrl());

    return firstValueFrom(this.httpClient.get<CurrentSiteId>(url)).catch(() => null);
  }

  async getContentDetails(url: string): Promise<Response> {
    // A description from ContentHub ng-component bundled into Content Editor:
    //
    // We are caching GET, but we shouldn't cache HEAD because chrome has a bug where it won't store the CORS header.
    // As a GET request will override the cache control of the HEAD request,
    // we need to fool the browser by making him thinking we are doing 2 requests on 2 different resource
    return await fetch(url, {
      method: 'HEAD',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  async getRawFieldWithMappedAttributes(fieldType: string, body: any) {
    const url = makeAbsoluteUrl('sitecore/api/dam/MContent/GetMappedAttributesWithJson', this.xmCloudTenantUrl());

    return firstValueFrom(
      this.httpClient.post<string>(url, `'` + JSON.stringify(body) + `'`, {
        params: {
          lang: this.context.language,
          fieldType,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    ).catch(() => null);
  }

  async mapDamPropsToXmcAttributes(fieldType: string, data: string) {
    const url = makeAbsoluteUrl('sitecore/api/dam/MContent/GetMappedAttributesWithJson', this.xmCloudTenantUrl());

    return firstValueFrom(
      this.httpClient.post<string>(url, `'` + data + `'`, {
        params: {
          lang: this.context.language,
          fieldType,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    ).catch(() => null);
  }

  async getEmbeddedHtml(data: string) {
    const url = makeAbsoluteUrl('/sitecore/api/dam/MContent/GetRTEXmlValue', this.xmCloudTenantUrl());

    return firstValueFrom(
      this.httpClient.post<string>(url, `'` + data + `'`, {
        params: {
          lang: this.context.language,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    ).catch(() => null);
  }
}
