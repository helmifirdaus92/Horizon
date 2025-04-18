/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingService } from '../messaging/messaging-service';

export class ConfigurationService {
  public static isLocalXM: boolean;
  public static pagesHostEnvironment: string;
  public static xmCloudTenantUrl: string;
  public static streamTenantId: string | undefined;
  public static activeVariant: string | undefined;

  constructor(private readonly messaging: MessagingService) {}

  async init() {
    ConfigurationService.isLocalXM = await this.messaging.configurationMessagingChannel.rpc.isLocalXM();
    ConfigurationService.pagesHostEnvironment = await this.messaging.configurationMessagingChannel.rpc.getPagesHostEnvironment();
    ConfigurationService.xmCloudTenantUrl = await this.messaging.configurationMessagingChannel.rpc.getXmCloudTenantUrl();
    ConfigurationService.streamTenantId = await this.messaging.configurationMessagingChannel.rpc.getStreamTenantId();
    ConfigurationService.activeVariant = await this.messaging.configurationMessagingChannel.rpc.getActiveVariant();
  }
}
