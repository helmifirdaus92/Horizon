/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { ContextService } from '../client-state/context.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { StaticConfigurationService } from '../configuration/static-configuration.service';
import { MessagingService } from './messaging.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationMessagingService {
  constructor(
    private readonly messagingService: MessagingService,
    private readonly contextService: ContextService,
    private readonly staticConfigurationService: StaticConfigurationService,
  ) {}

  async init() {
    const channel = this.messagingService.getConfigurationChannel();

    channel.setRpcServicesImpl({
      isLocalXM: () => environment.isLocalXM,
      getPagesHostEnvironment: () => this.staticConfigurationService.environment,
      getXmCloudTenantUrl: () => ConfigurationService.xmCloudTenant?.url,
      getStreamTenantId: () => ConfigurationService.xmCloudTenant?.aiEmbeddedTenantID,
      getActiveVariant: () => this.contextService.variant,
    });
  }
}
