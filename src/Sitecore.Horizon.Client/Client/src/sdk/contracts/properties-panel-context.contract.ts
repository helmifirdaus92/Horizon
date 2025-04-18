/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingContract } from '@sitecore/page-composer-sdk';

export interface PropertiesPanelContext {
  itemId: string;
}

export interface PropertiesPanelContextRpc {
  getContext(): PropertiesPanelContext;
}

export interface PropertiesPanelContextEvents {
  change: PropertiesPanelContext;
}

export const PropertiesPanelContextContractName = 'Horizon.PropertiesPanel.Context';

export const PropertiesPanelContextContract: MessagingContract<
  PropertiesPanelContextEvents,
  PropertiesPanelContextRpc
> = {
  name: PropertiesPanelContextContractName,
};
