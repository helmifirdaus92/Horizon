/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingReconnectableP2PConnection } from '@sitecore/horizon-messaging';
import {
  GlobalMessaging,
  MessagingContract,
  MessagingEventsEmitterChannel,
  MessagingEventsReceiverChannel,
  MessagingRpcProvider,
  MessagingRpcServicesClient,
  MessagingRpcServicesImplementation,
} from '../../sdk';

export function createMessagingAdapter(hrzMessaging: MessagingReconnectableP2PConnection): GlobalMessaging {
  return {
    getEventReceiver: <TEvents, TRpc>(contract: MessagingContract<TEvents, TRpc>): MessagingEventsReceiverChannel<TEvents> => {
      const channel = hrzMessaging.getChannel<TEvents, object, TRpc, object>({ name: contract.name });

      return {
        disconnect: () => hrzMessaging.disconnect(),
        on: (name, handler) => channel.on(name, handler),
      };
    },
    createEventEmitter: <TEvents, TRpc>(contract: MessagingContract<TEvents, TRpc>): MessagingEventsEmitterChannel<TEvents> => {
      const channel = hrzMessaging.getChannel<object, TEvents, object, TRpc>({ name: contract.name });

      return {
        disconnect: () => hrzMessaging.disconnect(),
        emit: (name, ...args) => channel.emit(name, ...args),
        syncEmit: (name, ...args) => channel.syncEmit(name, ...args),
      };
    },
    getRpc: <TEvents, TRpc>(contract: MessagingContract<TEvents, TRpc>): Promise<MessagingRpcServicesClient<TRpc>> => {
      const channel = hrzMessaging.getChannel<TEvents, object, TRpc, object>({ name: contract.name });
      const channelRpcServices = channel.rpc as any;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Promise.resolve(
        new Proxy(
          {},
          {
            get: (_target: object, property: PropertyKey) => {
              // A workaround to be able to return value inside a promise.
              if (property.toString() === 'then') {
                return undefined;
              }

              // eslint-disable-next-line @typescript-eslint/no-unsafe-return, prefer-spread, @typescript-eslint/no-unsafe-call
              return (...args: any[]) => channelRpcServices[property].apply(channelRpcServices, args);
            },
          },
        ) as any,
      );
    },
    createRpc: <TEvents, TRpc>(
      contract: MessagingContract<TEvents, TRpc>,
      impl: MessagingRpcServicesImplementation<TRpc>,
    ): MessagingRpcProvider => {
      const channel = hrzMessaging.getChannel<object, TEvents, object, TRpc>({ name: contract.name });

      channel.setRpcServicesImpl(impl);
      return {
        disconnect: () => hrzMessaging.disconnect(),
      };
    },
  };
}
