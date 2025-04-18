/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingContract } from '@sitecore/page-composer-sdk';

export interface RenderingDetails {
  instanceId: string;
  renderingId: string;
  placeholderKey: string;
  dataSource: string | null;
  parameters: Record<string, string>;
  personalizationVariantRenderingId?: string;
}

export type RenderingDetailsUpdate = Partial<Readonly<Omit<RenderingDetails, 'instanceId'>>>;

export interface CanvasUpdateOptions {
  reloadRequired: boolean;
}

export interface RenderingPropertiesEvents {
  onInlineEditorMessage: unknown;
  reconnect: void;
}

export interface RenderingPropertiesRpc {
  postInlineEditorMessage(payload: unknown): void;
  getInlineEditorProtocols(): readonly string[];
  getRenderingDetails(): RenderingDetails | null;
  setRenderingDetails(details: RenderingDetailsUpdate, options?: CanvasUpdateOptions): void;
  getIsInPersonalizationMode(): boolean;
}

export const RenderingPropertiesContractName = 'Horizon.PropertiesPanel.SelectedRenderingProperties:Messaging';

export const RenderingPropertiesContract: MessagingContract<RenderingPropertiesEvents, RenderingPropertiesRpc> = {
  name: RenderingPropertiesContractName,
};
