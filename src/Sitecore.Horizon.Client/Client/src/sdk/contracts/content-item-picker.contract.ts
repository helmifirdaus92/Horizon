/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingContract } from '@sitecore/page-composer-sdk';

export const ContentItemPickerContractName = 'ContentItemPicker';

export type ContentItemPickerResult =
  | {
      status: 'OK';
      item: {
        id: string;
        language: string | null;
        site: string | null;
      };
    }
  | { status: 'Canceled' };

export interface ContentItemPickerRpc {
  prompt(context: { id: string | null; language: string | null; site: string | null }): ContentItemPickerResult;
}

export const ContentItemPickerContract: MessagingContract<{}, ContentItemPickerRpc> = {
  name: ContentItemPickerContractName,
};
