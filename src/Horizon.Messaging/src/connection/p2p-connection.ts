/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import {
  MessagingP2PChannel,
  MessagingP2PChannelDef,
  MessagingP2PConnection,
  MessagingPort,
} from '../public-interfaces';
import { makeCallInterceptor } from '../utils.interception';
import { ConnectableConnection } from './connectable-connection';
import { ConnectionEndpoint, ConnectionState } from './connection-endpoint';

export class P2PConnection implements MessagingP2PConnection, ConnectableConnection {
  get state(): ConnectionState {
    return this.endpoint.state;
  }

  get isEstablished(): boolean {
    return this.endpoint.state.kind === 'connected';
  }

  constructor(private readonly endpoint: ConnectionEndpoint) {}

  getChannel<TInboundEvents, TOutboundEvents, TRemoteRpcContract, TProvidedRpcContract>(
    channelDef: MessagingP2PChannelDef<TInboundEvents, TOutboundEvents, TRemoteRpcContract, TProvidedRpcContract>,
  ): MessagingP2PChannel<TInboundEvents, TOutboundEvents, TRemoteRpcContract, TProvidedRpcContract> {
    const { name: channelName } = channelDef;

    return {
      // EVENTS
      emit: (eventName, ...[arg]) => this.endpoint.emitEvent(channelName, eventName, arg),
      syncEmit: (eventName, ...[arg]) => this.endpoint.syncEmitEvent(channelName, eventName, arg),
      on: (eventName, handler) => this.endpoint.onEvent(channelName, eventName, handler),
      // RPC
      rpc: makeCallInterceptor(channelName, this.endpoint),
      setRpcServicesImpl: (impl) => this.endpoint.setRpcServicesImplementation(channelName, impl),
    };
  }

  connect(port: MessagingPort, connectionId: string): void {
    this.endpoint.connect(port, connectionId);
  }

  disconnect(): void {
    this.endpoint.disconnect();
  }
}
