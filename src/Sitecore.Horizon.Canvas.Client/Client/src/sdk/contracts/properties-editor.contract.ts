/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingContract } from '../messaging/global-messaging';

export interface PropertiesEditorEvents {
  onPropertiesEditorMessage: unknown;
}

export interface PropertiesEditorRpc {
  postPropertiesEditorMessage(data: unknown): void;
}

export const PropertiesEditorContract: MessagingContract<PropertiesEditorEvents, PropertiesEditorRpc> = {
  name: 'properties-editor',
};
