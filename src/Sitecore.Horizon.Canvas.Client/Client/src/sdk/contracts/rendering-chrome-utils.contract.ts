/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingContract } from '../messaging/global-messaging';

export interface RenderingChromeUtilsRpc {
  notifyResize(): void;
}

export const RenderingChromeUtilsContract: MessagingContract<object, RenderingChromeUtilsRpc> = {
  name: 'renderingChrome-utils',
};
