/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingContract } from '@sitecore/page-composer-sdk';

export interface RhsPanelContext {
  key: string;
  header?: string;
}

export interface RhsPanelRpc {
  openPanel(context: RhsPanelContext): void;
  closePanel(): void;
}

export interface RhsPanelEvents {
  'rhs-panel:open': RhsPanelContext;
  'rhs-panel:close': RhsPanelContext;
}

export const RhsPanelCotractName = 'RhsPanel';

export const RhsPanelCotract: MessagingContract<RhsPanelEvents, RhsPanelRpc> = {
  name: RhsPanelCotractName,
};
