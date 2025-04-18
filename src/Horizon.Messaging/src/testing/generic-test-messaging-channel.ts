/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingEventHandler, RpcServicesClient, RpcServicesImplementation } from '../public-interfaces';
import { removeFromArray, StringKeys } from '../utils';
import {
  TestMessagingBroadcastRecipientChannel,
  TestMessagingBroadcastSenderChannel,
  TestMessagingP2PChannel,
} from './testing-public-interfaces';

interface EventSubscription {
  eventName: string;
  handler: MessagingEventHandler<any>;
}

type EmittedEvent<TContract> = keyof TContract extends infer TKey
  ? TKey extends StringKeys<TContract>
    ? { eventName: TKey; arg: TContract[TKey] }
    : never
  : never;

/**
 * Testing utility to simplify peer-to-peer channel mocking. Use @see {makeTestMessagingChannel} to simplify object construction.
 */
export class GenericTestMessagingChannel<TInboundEvents, TOutboundEvents, TRemoteRpcContract, TProvidedRpcContract>
  implements
    TestMessagingP2PChannel<TInboundEvents, TOutboundEvents, TRemoteRpcContract, TProvidedRpcContract>,
    TestMessagingBroadcastRecipientChannel<TInboundEvents, TRemoteRpcContract>,
    TestMessagingBroadcastSenderChannel<TOutboundEvents, TProvidedRpcContract> {
  private readonly _emittedEvents: Array<{ eventName: string; arg: any }> = [];
  get emittedEvents(): ReadonlyArray<EmittedEvent<TOutboundEvents>> {
    // Kill typing here, as we guarantee type safety by logic.
    return [...this._emittedEvents] as any;
  }

  readonly eventSubscribers: EventSubscription[] = [];

  readonly rpc: RpcServicesClient<TRemoteRpcContract>;

  private _registeredRpcServicesImpl: RpcServicesImplementation<TProvidedRpcContract> | null = null;
  get registeredRpcServicesImpl(): RpcServicesImplementation<TProvidedRpcContract> | null {
    return this._registeredRpcServicesImpl;
  }

  constructor(public readonly remoteRpcImpl: RpcServicesImplementation<TRemoteRpcContract>) {
    this.rpc = new Proxy(
      {},
      {
        get: (_target: {}, property: PropertyKey) => {
          return (...args: any[]) =>
            new Promise((resolve) => {
              const service = (remoteRpcImpl as RpcServicesImplementation<any>)[property.toString()];
              if (!service) {
                throw new Error(`[BUG] cannot find service '${property.toString()}' in RPC implementation.`);
              }

              resolve(service.apply(remoteRpcImpl, args));
            });
        },
      },
    ) as RpcServicesClient<TRemoteRpcContract>;
  }
  emit<TEventName extends StringKeys<TOutboundEvents>>(
    eventName: TEventName,
    ...args: TOutboundEvents[TEventName] extends void ? [undefined?] : [TOutboundEvents[TEventName]]
  ): void {
    this._emittedEvents.push({ eventName, arg: args[0] });
  }

  syncEmit<TEventName extends StringKeys<TOutboundEvents>>(
    eventName: TEventName,
    ...args: TOutboundEvents[TEventName] extends void ? [undefined?] : [TOutboundEvents[TEventName]]
  ): Promise<void> {
    this._emittedEvents.push({ eventName, arg: args[0] });
    return Promise.resolve();
  }

  on<TEventName extends StringKeys<TInboundEvents>>(
    eventName: TEventName,
    handler: MessagingEventHandler<TInboundEvents[TEventName]>,
  ): () => void {
    const subscription: EventSubscription = { eventName, handler };
    this.eventSubscribers.push(subscription);

    return () => removeFromArray(subscription, this.eventSubscribers);
  }

  setRpcServicesImpl(implementation: RpcServicesImplementation<TProvidedRpcContract>): void {
    this._registeredRpcServicesImpl = implementation;
  }

  dispatchEvent<TEventName extends StringKeys<TInboundEvents>>(
    eventName: TEventName,
    ...args: void extends TInboundEvents[TEventName] ? [undefined?] : [TInboundEvents[TEventName]]
  ): Promise<void> {
    const pendingResults = this.eventSubscribers
      .filter(({ eventName: evName }) => evName === eventName)
      .map(({ handler }) => handler(...args));

    // It's safe to convert Promise<void[]> to Promise<void>.
    return Promise.all(pendingResults) as unknown as Promise<void>;
  }

  getEmittedEvents<TEventName extends StringKeys<TOutboundEvents>>(
    eventName: TEventName,
  ): ReadonlyArray<TOutboundEvents[TEventName]> {
    return this._emittedEvents.filter((x) => x.eventName === eventName).map((x) => x.arg);
  }

  getEventSubscribers<TEventName extends StringKeys<TInboundEvents>>(
    eventName: TEventName,
  ): ReadonlyArray<MessagingEventHandler<TInboundEvents[TEventName]>> {
    return this.eventSubscribers
      .filter((x) => x.eventName === eventName)
      .map((x) => x.handler as MessagingEventHandler<TInboundEvents[TEventName]>);
  }
}
