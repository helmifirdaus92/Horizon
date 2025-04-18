/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Context } from '../client-state/context.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { LayoutKind } from '../graphql/item.interface';
import { RenderingHostFeaturesService } from '../rendering-host/rendering-host-features.service';
import { RenderingHostResolverService } from '../rendering-host/rendering-host-resolver.service';

function appendQueryParam(key: string, value: string) {
  return value ? `&${key}=${value}` : '';
}

@Injectable({ providedIn: 'root' })
export class CanvasUrlBuilder {
  constructor(
    private readonly config: ConfigurationService,
    private readonly renderingHostResolverService: RenderingHostResolverService,
    private readonly renderingHostFeaturesService: RenderingHostFeaturesService,
  ) {}

  buildEditModeUrl(context: Context, route: string, layoutKind: LayoutKind): string {
    return this.buildRenderPageUrl(context, route, layoutKind, 'edit');
  }

  buildXmcEditModeUrl(context: Context, options: { metadataMode: boolean }): string {
    const platformUrl = ConfigurationService.xmCloudTenant?.url;
    let url = `${platformUrl}?sc_horizon=editor&sc_headless_mode=edit`;
    url = this.withContextParams(url, context);
    url = this.withHorizonHostParam(url);
    if (options?.metadataMode) {
      url = this.withMetadataChromes(url);
    }
    return url;
  }

  async buildPreviewModeUrl(context: Context, route: string): Promise<string> {
    const isDirectPreviewEnabled = await this.renderingHostFeaturesService.isFeatureEnabled('rh_preview_mode');
    if (isDirectPreviewEnabled) {
      return this.buildRenderPageUrl(context, route, 'FINAL', 'preview');
    }

    return this.buildXmcPreviewModeUrl(context);
  }

  private buildRenderPageUrl(
    context: Context,
    route: string,
    layoutKind: LayoutKind,
    mode: 'edit' | 'preview',
  ): string {
    if (!this.renderingHostResolverService.hostUrl) {
      throw new Error('Rendering host endpoint is not specified');
    }

    const url = new URL(this.renderingHostResolverService.hostUrl);

    url.pathname = !url.pathname.endsWith('/') ? url.pathname + '/' : url.pathname;
    url.pathname += 'api/editing/render';

    const queryParams = url.searchParams;
    queryParams.append('sc_itemid', `${context.itemId}`);
    queryParams.append('sc_lang', context.language);
    queryParams.append('sc_site', context.siteName);
    if (context.itemVersion) {
      queryParams.append('sc_version', context.itemVersion.toString());
    }
    if (context.variant) {
      queryParams.append('sc_variant', context.variant || 'default');
    }

    queryParams.append('sc_layoutKind', layoutKind.toLowerCase());

    queryParams.append('mode', mode);
    queryParams.append('secret', this.config.jssEditingSecret);
    queryParams.append('route', route);
    queryParams.append('tenant_id', ConfigurationService.xmCloudTenant?.id || '');

    const finalUrl = url.toString();
    return finalUrl;
  }

  private buildXmcPreviewModeUrl(context: Context): string {
    const platformUrl = ConfigurationService.xmCloudTenant?.url;
    let url = `${platformUrl}?sc_horizon=preview&sc_headless_mode=preview`;
    url = this.withContextParams(url, context);
    url = this.withHorizonHostParam(url);

    return url;
  }

  private withContextParams(url: string, context: Context) {
    return (
      url +
      appendQueryParam('sc_device', `${context.deviceLayoutId}`) +
      appendQueryParam('sc_itemid', `${context.itemId}`) +
      appendQueryParam('sc_lang', context.language) +
      appendQueryParam('sc_site', context.siteName) +
      appendQueryParam('sc_version', (context.itemVersion || '').toString()) +
      appendQueryParam('sc_variant', context.variant || '')
    );
  }

  private withHorizonHostParam(url: string) {
    return url + appendQueryParam('sc_horizonhost', encodeURIComponent(window.location.origin));
  }

  private withMetadataChromes(url: string) {
    return url + appendQueryParam('sc_editMode', 'true');
  }
}
