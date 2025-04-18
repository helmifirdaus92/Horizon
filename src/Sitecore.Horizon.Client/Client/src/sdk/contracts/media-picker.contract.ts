/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingContract } from '@sitecore/page-composer-sdk';

export interface MediaPickerValue {
  rawValue: string;
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
}
export type MediaPickerSelection = MediaPickerValue & { src: string; embeddedHtml: string };

export const MediaPickerContractName = 'MediaPicker';

export type MediaPickerResult = { status: 'OK'; selectedValue: MediaPickerSelection } | { status: 'Canceled' };

export interface MediaPickerRpc {
  prompt(context: { currentValue?: MediaPickerValue; sources: string[] }): MediaPickerResult;
}

export const MediaPickerContract: MessagingContract<{}, MediaPickerRpc> = {
  name: MediaPickerContractName,
};
