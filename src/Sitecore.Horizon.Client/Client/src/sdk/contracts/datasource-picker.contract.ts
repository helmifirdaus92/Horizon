/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingContract } from '@sitecore/page-composer-sdk';

export const DatasourcePickerContractName = 'DatasourcePicker';

export type DatasourcePickerResult = { status: 'OK'; datasource: string } | { status: 'Canceled' };
export type DatasourcePickerOptions = { compatibleTemplateIds: string[]; customParameters?: Record<string, string> };
export type DatasourcePickerContext = {
  renderingId: string;
  datasource?: string;
  renderingDetails?: {
    instanceId?: string;
    parameters?: Record<string, string>;
    placeholderKey?: string;
  };
};

export interface DatasourcePickerRpc {
  prompt(context: DatasourcePickerContext, options?: DatasourcePickerOptions): DatasourcePickerResult;
}

export const DatasourcePickerContract: MessagingContract<{}, DatasourcePickerRpc> = {
  name: DatasourcePickerContractName,
};
