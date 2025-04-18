/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { AbTestComponentConfigurationStatus, FlowDefinition } from '../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../messaging/messaging-service';
import { FeatureChecker } from '../utils/feature-checker';

export class AbTestComponentService {
  private static flows: FlowDefinition[] = [];
  private static abTestConfigStatus: AbTestComponentConfigurationStatus;
  constructor(private readonly messaging: MessagingService) {}

  static getFlows(): FlowDefinition[] {
    return this.flows;
  }

  static getAbTestConfigStatus(): AbTestComponentConfigurationStatus {
    return this.abTestConfigStatus;
  }

  async init(itemId: string, language: string) {
    if (FeatureChecker.isComponentTestingEnabled()) {
      AbTestComponentService.flows = await this.messaging.editingChannel.rpc.getPageFlows(itemId, language);
      AbTestComponentService.abTestConfigStatus = await this.messaging.editingChannel.rpc.getAbTestConfigStatus(itemId, language);
    }
  }
}
