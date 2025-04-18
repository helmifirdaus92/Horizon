/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Fn, StringKeys } from './utils';

export interface MessagingPort {
  onMessage(handler: (msg: unknown) => void): () => void;
  postMessage(msg: unknown): void;
}

export type RpcServicesImplementation<TRpcContract> = {
  readonly [K in keyof TRpcContract]: TRpcContract[K] extends Fn
    ? (...args: Parameters<TRpcContract[K]>) => ReturnType<TRpcContract[K]> | Promise<ReturnType<TRpcContract[K]>>
    : never;
};

export type RpcServicesClient<TRpcContract> = {
  readonly [K in keyof TRpcContract]: TRpcContract[K] extends Fn
    ? (...args: Parameters<TRpcContract[K]>) => Promise<ReturnType<TRpcContract[K]>>
    : never;
};

export type MessagingEventHandler<TArg> = (...arg: TArg extends void ? [undefined?] : [TArg]) => void | Promise<void>;

interface MessagingChannelInboundEventsMixin<TInboundEvents> {
  /**
   * Subscribes to event and handles it either synchronously or asynchronously.
   * Depending on how event is raised caller might be interested in the handler's status, or status is discarded.
   */
  on<TEventName extends StringKeys<TInboundEvents>>(
    eventName: TEventName,
    handler: MessagingEventHandler<TInboundEvents[TEventName]>,
  ): () => void;
}

interface MessagingChannelOutboundEventsMixin<TOutboundEvents> {
  /**
   * Emit event without waiting for all the handlers to be executed.
   */
  emit<TEventName extends StringKeys<TOutboundEvents>>(
    eventName: TEventName,
    ...arg: TOutboundEvents[TEventName] extends void ? [undefined?] : [TOutboundEvents[TEventName]]
  ): void;

  /**
   * Emit event and wait for all the handlers to be executed.
   */
  syncEmit<TEventName extends StringKeys<TOutboundEvents>>(
    eventName: TEventName,
    ...arg: TOutboundEvents[TEventName] extends void ? [undefined?] : [TOutboundEvents[TEventName]]
  ): Promise<void>;
}

interface MessagingChannelRpcClientMixin<TRemoteRpcContract> {
  /**
   * Invoke remote RPC services.
   */
  readonly rpc: RpcServicesClient<TRemoteRpcContract>;
}

interface MessagingChannelRpcProviderMixin<TProvidedRpcContract> {
  /**
   * Set implementation of the provided RPC services.
   */
  setRpcServicesImpl(implementation: RpcServicesImplementation<TProvidedRpcContract>): void;
}

/**
 * Filter which allows to review incoming connections and decide whether to accept them.
 */
export type ConnectionRequestFilter = (request: {
  clientId: string;
  origin: string;
  extras?: Record<string, string>;
}) => 'ACCEPT' | 'IGNORE_ATTEMPT' | 'REJECT';

/* ********************** PEER TO PEER ********************** */

/**
 * Channel for peer-to-peer communication.
 */
export type MessagingP2PChannel<TInboundEvents, TOutboundEvents, TRemoteRpcContract, TProvidedRpcContract> =
  MessagingChannelInboundEventsMixin<TInboundEvents> &
    MessagingChannelOutboundEventsMixin<TOutboundEvents> &
    MessagingChannelRpcClientMixin<TRemoteRpcContract> &
    MessagingChannelRpcProviderMixin<TProvidedRpcContract>;

/**
 * Definition for the peer-to-peer channel. Defines contract for all the services and channel name.
 */
export interface MessagingP2PChannelDef<TInboundEvents, TOutboundEvents, TRemoteRpcContract, TProvidedRpcContract> {
  readonly name: string;
}

/**
 * Util to extract channel definition type from channel type.
 */
export type MessagingP2PChannelDefFromChannel<TChannel extends MessagingP2PChannel<any, any, any, any>> =
  TChannel extends MessagingP2PChannel<infer TInEvents, infer TOutEvents, infer TInRpc, infer TOutRpc>
    ? MessagingP2PChannelDef<TInEvents, TOutEvents, TInRpc, TOutRpc>
    : never;

export interface MessagingP2PConnection {
  readonly isEstablished: boolean;

  getChannel<TInboundEvents, TOutboundEvents, TRemoteRpcContract, TProvidedRpcContract>(
    channelDef: MessagingP2PChannelDef<TInboundEvents, TOutboundEvents, TRemoteRpcContract, TProvidedRpcContract>,
  ): MessagingP2PChannel<TInboundEvents, TOutboundEvents, TRemoteRpcContract, TProvidedRpcContract>;
}

export interface MessagingReconnectableP2PConnection extends MessagingP2PConnection {
  reconnect(): void;
  disconnect(): void;

  changePort(newPort: MessagingPort): void;
}

export interface MessagingP2PHostController {
  getClientConnection(clientId: string): MessagingP2PConnection;
  onClientConnected(handler: (clientId: string) => void): () => void;
  onClientDisconnected(handler: (clientId: string) => void): () => void;
}

/* ********************** BROADCAST ********************** */

export type MessagingBroadcastSenderChannel<TOutboundEvents, TProvidedRpcContract> =
  MessagingChannelOutboundEventsMixin<TOutboundEvents> & MessagingChannelRpcProviderMixin<TProvidedRpcContract>;

export type MessagingBroadcastRecipientChannel<TInboundEvents, TRemoteRpcContract> =
  MessagingChannelInboundEventsMixin<TInboundEvents> & MessagingChannelRpcClientMixin<TRemoteRpcContract>;

export interface MessagingBroadcastRecipient {
  getChannel<TEvents, TRpcContract>(
    channelDef: MessagingBroadcastChannelDef<TEvents, TRpcContract>,
  ): MessagingBroadcastRecipientChannel<TEvents, TRpcContract>;

  disconnect(): void;
}

/**
 * Definition for the broadcast channel. Defines contract for all the services and the channel name.
 */
export interface MessagingBroadcastChannelDef<TEvents, TRpcContract> {
  readonly name: string;
}

export interface MessagingBroadcastHost {
  getSenderChannel<TEvents, TRpcContract>(
    channelDef: MessagingBroadcastChannelDef<TEvents, TRpcContract>,
  ): MessagingBroadcastSenderChannel<TEvents, TRpcContract>;

  onClientConnected(handler: (clientId: string) => void): () => void;
  onClientDisconnected(handler: (clientId: string) => void): () => void;

  registerRecipient(): MessagingBroadcastRecipient;
}
