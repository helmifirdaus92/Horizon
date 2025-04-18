/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import {
  MessagingBroadcastChannelDef,
  MessagingBroadcastRecipient,
  MessagingBroadcastRecipientChannel,
  MessagingPort,
} from '../public-interfaces';
import { makeCallInterceptor } from '../utils.interception';
import { ConnectableConnection } from './connectable-connection';
import { ConnectionEndpoint, ConnectionState } from './connection-endpoint';

export class BroadcastRecipientConnection implements ConnectableConnection, MessagingBroadcastRecipient {
  get state(): ConnectionState {
    return this.endpoint.state;
  }

  constructor(private readonly endpoint: ConnectionEndpoint, private readonly disconnectCallback: () => void) {}

  getChannel<TEvents, TRpcContract>({
    name: channelName,
  }: MessagingBroadcastChannelDef<TEvents, TRpcContract>): MessagingBroadcastRecipientChannel<TEvents, TRpcContract> {
    return {
      on: (eventName, handler) => this.endpoint.onEvent(channelName, eventName, handler),
      rpc: makeCallInterceptor(channelName, this.endpoint),
    };
  }

  connect(port: MessagingPort, connectionId: string): void {
    this.endpoint.connect(port, connectionId);
  }

  disconnect(): void {
    if (this.endpoint.state.kind === 'connected') {
      this.disconnectCallback();
      this.endpoint.disconnect();
    }
  }
}
