/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingContract } from '@sitecore/page-composer-sdk';

export interface PlaceholderDetails {
  placeholderKey: string;
  placeholderName: string;
  placeholderDisplayName: string;
}

export interface PlaceholderPropertiesEvents {
  reconnect: void;
}

export interface PlaceholderPropertiesRpc {
  getPlaceholderDetails(): PlaceholderDetails | null;
}

export const SelectedPlaceholderPropertiesContractName =
  'Horizon.PropertiesPanel.SelectedPlaceholderProperties:Messaging';

export const PlaceholderPropertiesContract: MessagingContract<PlaceholderPropertiesEvents, PlaceholderPropertiesRpc> = {
  name: SelectedPlaceholderPropertiesContractName,
};
