/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

// ***************************************************************
//
// NOTICE! NOTICE! NOTICE! NOTICE! NOTICE! NOTICE! NOTICE! NOTICE!
//
// This file is a copy of the Federated UI messaging interface.
// It is not a design goal to be FedUi compatible moving forward.
// This is why its a copy and not a reference to FedUI.
//
// ***************************************************************

// Typing utils for Messaging
type Fn = (...args: any[]) => any;

type StringKeys<T> = Extract<keyof T, string>;

// RPC contracts
export type MessagingRpcServicesClient<TRpcContract> = {
  readonly [K in keyof TRpcContract]: TRpcContract[K] extends Fn
    ? (...args: Parameters<TRpcContract[K]>) => Promise<ReturnType<TRpcContract[K]>>
    : never;
};

export type MessagingRpcServicesImplementation<TRpcContract> = {
  readonly [K in keyof TRpcContract]: TRpcContract[K] extends Fn
    ? (...args: Parameters<TRpcContract[K]>) => ReturnType<TRpcContract[K]> | Promise<ReturnType<TRpcContract[K]>>
    : never;
};

export interface MessagingRpcProvider {
  disconnect(): void;
}

// Events contracts
export interface MessagingEventsEmitterChannel<TOutboundEvents> {
  disconnect: () => void;
  emit<TEventName extends StringKeys<TOutboundEvents>>(
    eventName: TEventName,
    ...arg: TOutboundEvents[TEventName] extends void ? [undefined?] : [TOutboundEvents[TEventName]]
  ): void;
  syncEmit<TEventName extends StringKeys<TOutboundEvents>>(
    eventName: TEventName,
    ...arg: TOutboundEvents[TEventName] extends void ? [undefined?] : [TOutboundEvents[TEventName]]
  ): Promise<void>;
}

export interface MessagingEventsReceiverChannel<TInboundEvents> {
  disconnect: () => void;
  on<TEventName extends StringKeys<TInboundEvents>>(
    eventName: TEventName,
    handler: MessagingEventsReceiverEventHandler<TInboundEvents[TEventName]>,
  ): () => void;
}

export type MessagingEventsReceiverEventHandler<TArg> = (...arg: TArg extends void ? [undefined?] : [TArg]) => void | Promise<void>;

// Global messaging usage contracts
export interface GlobalMessaging {
  getEventReceiver<TEvents, TRpc>(contract: MessagingContract<TEvents, TRpc>): MessagingEventsReceiverChannel<TEvents>;
  createEventEmitter<TEvents, TRpc>(contract: MessagingContract<TEvents, TRpc>): MessagingEventsEmitterChannel<TEvents>;

  getRpc<TEvents, TRpc>(contract: MessagingContract<TEvents, TRpc>): Promise<MessagingRpcServicesClient<TRpc>>;
  createRpc<TEvents, TRpc>(
    contract: MessagingContract<TEvents, TRpc>,
    impl: MessagingRpcServicesImplementation<TRpc>,
  ): MessagingRpcProvider;
}

export interface MessagingContract<_TEvents, _TRpc> {
  name: string;
}
