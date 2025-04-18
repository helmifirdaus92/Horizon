/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HostSDK, HostSDKInitializationOptions } from '@sitecore-mkp/host-sdk';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { TokenCustomClaimKeysEnum } from 'app/authentication/library/types';
import { ContextService } from 'app/shared/client-state/context.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { StaticConfigurationService } from 'app/shared/configuration/static-configuration.service';
import { Item } from 'app/shared/graphql/item.interface';
import { Site, SiteService } from 'app/shared/site-language/site-language.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { MkpApplicationConfig } from '../extension-lib.component';

interface PagesContext {
  siteInfo: Site;
  pageInfo: Item;
}

@Component({
  selector: 'app-lhs-panel-extension-wrapper',
  templateUrl: './lhs-panel-extension-wrapper.component.html',
  styleUrl: './lhs-panel-extension-wrapper.component.scss',
})
export class LhsPanelExtensionWrapperComponent implements OnInit, OnDestroy {
  private readonly lifetime = new Lifetime();
  static Extension: MkpApplicationConfig;

  hostSDK: HostSDK;

  @ViewChild('extEl', { static: true, read: ElementRef }) extEl: ElementRef;

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly contextService: ContextService,
    private readonly staticConfigurationService: StaticConfigurationService,
    private readonly sitesService: SiteService,
  ) {}

  async ngOnInit() {
    const userInfo = this.authenticationService.authProvider.user;
    const xmCloudTenantInfo = ConfigurationService.xmCloudTenant;
    const organizationId = userInfo?.[TokenCustomClaimKeysEnum.ORG_ID];
    const environment = this.staticConfigurationService.environment;
    const language = this.contextService.language;

    if (!organizationId || !xmCloudTenantInfo) {
      console.warn('Organization or Tenant Info is missing');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const methods: HostSDKInitializationOptions['methods'] & Record<string, any> = {
      getUserInfo: async () => userInfo,
      getHostState: async () => {
        return { environment, language };
      },
      getAccessToken: async () => this.authenticationService.getBearerToken(),
      getStaticInfo: async () => {
        return {
          organizationId,
          xmCloudTenantInfo,
          userInfo,
        };
      },
      getPagesContext: async () => {
        const siteInfo = this.sitesService.getContextSite();
        const pageInfo = await this.contextService.getItem();
        return {
          siteInfo,
          pageInfo,
        };
      },
      reloadCanvas: () => {
        this.contextService.updateContext(this.contextService.value);
      },
    };

    const initOptions: HostSDKInitializationOptions = {
      baseUrls: { edgePlatformProxy: this.staticConfigurationService.edgePlatformBaseUrl },
      element: this.extEl.nativeElement,
      methods,
      application: LhsPanelExtensionWrapperComponent.Extension.application,
      defaultOptions: {
        iframe: { width: '100%', height: '100%', sandbox: 'allow-scripts allow-same-origin' },
      },
    };

    this.hostSDK = await HostSDK.init(initOptions);

    this.contextService.value$.pipe(takeWhileAlive(this.lifetime)).subscribe(async () => {
      const pagesContext: PagesContext = {
        siteInfo: this.sitesService.getContextSite(),
        pageInfo: await this.contextService.getItem(),
      };
      this.hostSDK.triggerClientEvent<PagesContext>('onPageContextChange', pagesContext);
    });
  }

  ngOnDestroy(): void {
    this.hostSDK?.unmount();
  }
}
