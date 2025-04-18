/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import {
  MessagingBroadcastChannelDef,
  MessagingBroadcastRecipientChannel,
  MessagingBroadcastSenderChannel,
} from '../../src/index';

export interface Events {
  message: string;
  'message:slow': string;
}

export interface RpcServices {
  echo(value: string): string;
}

export const BroadcastDemoChannelDef: MessagingBroadcastChannelDef<Events, RpcServices> = {
  name: 'demo',
};

export type BroadcastDemoSenderChannel = MessagingBroadcastSenderChannel<Event, RpcServices>;

export type BroadcastDemoRecipientChannel = MessagingBroadcastRecipientChannel<Event, RpcServices>;
