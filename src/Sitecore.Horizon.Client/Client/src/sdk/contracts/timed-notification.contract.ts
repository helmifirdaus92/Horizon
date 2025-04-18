/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingContract } from '@sitecore/page-composer-sdk';

export type TimedNotificationSeverity = 'error' | 'info' | 'success' | 'warning';
export type TimedNotificationScope = 'root' | 'dialog';

export interface TimedNotificationAction {
  title: string;
  run: () => void;
}

export interface TimedNotificationResult {
  persistent: boolean;
  action: TimedNotificationAction | undefined;
}

export interface TimedNotificationRpc {
  push(
    id: string,
    text: string,
    severity: TimedNotificationSeverity,
    notificationScope?: TimedNotificationScope,
  ): Promise<TimedNotificationResult>;
  hideById(id: string): void;
}

export const TimedNotificationContractName = 'TimedNotification';

export const TimedNotificationContract: MessagingContract<{}, TimedNotificationRpc> = {
  name: TimedNotificationContractName,
};
