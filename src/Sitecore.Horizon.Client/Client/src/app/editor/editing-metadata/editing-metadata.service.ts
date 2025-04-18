/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { normalizeGuid } from 'app/shared/utils/utils';
import { firstValueFrom } from 'rxjs';
import { ContextService } from '../../shared/client-state/context.service';
import { LayoutDataParseService } from './layout-data-parse.service';
import { EditingData, LayoutServiceData } from './layout-service-models';

export interface LayoutDataRequestContext {
  itemId: string;
  siteName: string;
  language: string;
  itemVersion?: number;
  variant?: string;
}

@Injectable({ providedIn: 'root' })
export class EditingMetadataService {
  private lastEditingDataCacheEntry: {
    requestContext: LayoutDataRequestContext;
    deferredData: Promise<EditingData>;
  } | null = null;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly layoutDataParseService: LayoutDataParseService,
    private readonly contextService: ContextService,
  ) {}

  async loadAndCacheEditingData(requestContext: LayoutDataRequestContext): Promise<EditingData> {
    this.lastEditingDataCacheEntry = null;
    const deferedData = this.preloadEditingData(requestContext);
    this.lastEditingDataCacheEntry = {
      requestContext: { ...requestContext },
      deferredData: deferedData,
    };

    return await deferedData;
  }

  async getEditingData(requestContext: LayoutDataRequestContext): Promise<EditingData> {
    try {
      if (
        this.lastEditingDataCacheEntry &&
        this.isCacheHit(this.lastEditingDataCacheEntry.requestContext, requestContext)
      ) {
        return await this.lastEditingDataCacheEntry.deferredData;
      }

      return await this.loadAndCacheEditingData(requestContext);
    } finally {
      // Cleanup cache after it was used one time. This way we reduce chanse of using a stale version of layout
      this.lastEditingDataCacheEntry = null;
    }
  }

  private isCacheHit(cacheContext: LayoutDataRequestContext, requestContext: LayoutDataRequestContext) {
    return (
      normalizeGuid(cacheContext.itemId) === normalizeGuid(requestContext.itemId) &&
      cacheContext.language === requestContext.language &&
      cacheContext.siteName === requestContext.siteName &&
      (!cacheContext.variant || cacheContext.variant === requestContext.variant) &&
      (cacheContext.itemVersion === undefined || cacheContext.itemVersion === requestContext.itemVersion)
    );
  }

  private async preloadEditingData(options: LayoutDataRequestContext): Promise<EditingData> {
    const item = await this.contextService.getItem();
    const itemVersion = item.versions?.length ? item.version : undefined;

    const response = await firstValueFrom(
      this.httpClient.get<LayoutServiceData>(this.buildRequestUrl({ ...options, itemVersion })),
    );
    return this.layoutDataParseService.parseLayoutData(response);
  }

  private buildRequestUrl(params: LayoutDataRequestContext) {
    const searchParams = new URLSearchParams();
    searchParams.append('sc_headless_mode', 'edit');
    searchParams.append('item', params.itemId);
    searchParams.append('sc_lang', params.language);
    searchParams.append('sc_site', params.siteName);
    if (!!params.variant) {
      searchParams.append('sc_variant', params.variant);
    }
    if (!!params.itemVersion) {
      searchParams.append('version', params.itemVersion.toString());
    }
    return `${ConfigurationService.xmCloudTenant?.url}/sitecore/api/layout/render/sxa-jss?${searchParams.toString()}`;
  }
}
