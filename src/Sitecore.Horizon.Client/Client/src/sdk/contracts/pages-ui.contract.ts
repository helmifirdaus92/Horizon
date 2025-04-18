/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingContract } from '@sitecore/page-composer-sdk';

export interface PagesUIRpc {
  openRHS(): void;
  closeRHS(): void;
  toggleRHS(): void;
}

export const PageUIContractName = 'PagesUI';

export const PageUIContract: MessagingContract<{}, PagesUIRpc> = {
  name: PageUIContractName,
};
