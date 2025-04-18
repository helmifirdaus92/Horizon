/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import {
  MessagingBroadcastRecipientChannel,
  MessagingBroadcastSenderChannel,
  MessagingEventHandler,
  MessagingP2PChannel,
  RpcServicesImplementation,
} from '../public-interfaces';
import { StringKeys } from '../utils';

interface EventSubscription {
  eventName: string;
  handler: MessagingEventHandler<any>;
}

interface TestMessagingEventsDispatcher<TEvents> {
  readonly eventSubscribers: ReadonlyArray<EventSubscription>;

  dispatchEvent<TEventName extends StringKeys<TEvents>>(
    eventName: TEventName,
    ...args: void extends TEvents[TEventName] ? [undefined?] : [TEvents[TEventName]]
  ): Promise<void>;

  getEventSubscribers<TEventName extends StringKeys<TEvents>>(
    eventName: TEventName,
  ): ReadonlyArray<MessagingEventHandler<TEvents[TEventName]>>;
}

interface TestMessagingEmittedEventsObserver<TEvents> {
  getEmittedEvents<TEventName extends StringKeys<TEvents>>(eventName: TEventName): ReadonlyArray<TEvents[TEventName]>;
}

interface TestMessagingRegisteredRpcServicesImpl<TRpcContract> {
  readonly registeredRpcServicesImpl: RpcServicesImplementation<TRpcContract> | null;
}

interface TestMessagingRemoteRpcServicesImpl<TRpcContract> {
  readonly remoteRpcImpl: RpcServicesImplementation<TRpcContract>;
}

// ===================== BROADCAST =====================

export type TestMessagingBroadcastRecipientChannel<TEvents, TRpcContract> = MessagingBroadcastRecipientChannel<
  TEvents,
  TRpcContract
> &
  TestMessagingEventsDispatcher<TEvents> &
  TestMessagingRemoteRpcServicesImpl<TRpcContract>;

export type TestMessagingBroadcastSenderChannel<TEvents, TRpcContract> = MessagingBroadcastSenderChannel<
  TEvents,
  TRpcContract
> &
  TestMessagingEmittedEventsObserver<TEvents> &
  TestMessagingRegisteredRpcServicesImpl<TRpcContract>;

/**
 * Type to infer @see {TestMessagingBroadcastRecipientChannel} from existing channel type.
 */
export type TestMessagingBroadcastRecipientChannelFromChannel<
  TChannel extends MessagingBroadcastRecipientChannel<any, any>,
> = TChannel extends MessagingBroadcastRecipientChannel<infer TEvents, infer TRpc>
  ? TestMessagingBroadcastRecipientChannel<TEvents, TRpc>
  : never;

/**
 * Type to infer @see {TestMessagingBroadcastSenderChannel} from existing channel type.
 */
export type TestMessagingBroadcastSenderChannelFromChannel<TChannel extends MessagingBroadcastSenderChannel<any, any>> =
  TChannel extends MessagingBroadcastSenderChannel<infer TEvents, infer TRpc>
    ? TestMessagingBroadcastSenderChannel<TEvents, TRpc>
    : never;

// ========================== Peer 2 Peer ===============================

export type TestMessagingP2PChannel<TInEvents, TOutEvents, TRemoteRpc, TProvidedRpc> = MessagingP2PChannel<
  TInEvents,
  TOutEvents,
  TRemoteRpc,
  TProvidedRpc
> &
  TestMessagingEventsDispatcher<TInEvents> &
  TestMessagingEmittedEventsObserver<TOutEvents> &
  TestMessagingRemoteRpcServicesImpl<TRemoteRpc> &
  TestMessagingRegisteredRpcServicesImpl<TProvidedRpc>;

/**
 * Type to infer @see {TestMessagingP2PChannel} from existing channel type.
 */
export type TestMessagingP2PChannelFromChannel<TChannel extends MessagingP2PChannel<any, any, any, any>> =
  TChannel extends MessagingP2PChannel<infer TInEvents, infer TOutEvents, infer TRemoteRpc, infer TProvidedRpc>
    ? TestMessagingP2PChannel<TInEvents, TOutEvents, TRemoteRpc, TProvidedRpc>
    : never;
