/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingBroadcastChannelDef, MessagingP2PChannelDef, RpcServicesImplementation } from '../public-interfaces';
import { GenericTestMessagingChannel } from './generic-test-messaging-channel';
import {
  TestMessagingBroadcastRecipientChannel,
  TestMessagingBroadcastSenderChannel,
  TestMessagingP2PChannel,
} from './testing-public-interfaces';

export function makeTestMessagingP2PChannel<TInboundEvents, TOutboundEvents, TRemoteRpcContract, TProvidedRpcContract>(
  remoteRpcImpl: RpcServicesImplementation<TRemoteRpcContract>,
): TestMessagingP2PChannel<TInboundEvents, TOutboundEvents, TRemoteRpcContract, TProvidedRpcContract> {
  return new GenericTestMessagingChannel<TInboundEvents, TOutboundEvents, TRemoteRpcContract, TProvidedRpcContract>(
    remoteRpcImpl,
  );
}

export function makeTestMessagingP2PChannelFromDef<
  TInboundEvents,
  TOutboundEvents,
  TRemoteRpcContract,
  TProvidedRpcContract,
>(
  _channelDef: MessagingP2PChannelDef<TInboundEvents, TOutboundEvents, TRemoteRpcContract, TProvidedRpcContract>,
  remoteRpcImpl: RpcServicesImplementation<TRemoteRpcContract>,
): TestMessagingP2PChannel<TInboundEvents, TOutboundEvents, TRemoteRpcContract, TProvidedRpcContract> {
  return makeTestMessagingP2PChannel<TInboundEvents, TOutboundEvents, TRemoteRpcContract, TProvidedRpcContract>(
    remoteRpcImpl,
  );
}

export function makeTestMessagingBroadcastRecipientChannel<TEvents, TRpcContract>(
  remoteRpcImpl: RpcServicesImplementation<TRpcContract>,
): TestMessagingBroadcastRecipientChannel<TEvents, TRpcContract> {
  return new GenericTestMessagingChannel<TEvents, {}, TRpcContract, {}>(remoteRpcImpl);
}

export function makeTestMessagingBroadcastRecipientChannelFromDef<TEvents, TRpcContract>(
  _channelDef: MessagingBroadcastChannelDef<TEvents, TRpcContract>,
  remoteRpcImpl: RpcServicesImplementation<TRpcContract>,
): TestMessagingBroadcastRecipientChannel<TEvents, TRpcContract> {
  return makeTestMessagingBroadcastRecipientChannel<TEvents, TRpcContract>(remoteRpcImpl);
}

export function makeTestMessagingBroadcastSenderChannel<TEvents, TRpcContract>(): TestMessagingBroadcastSenderChannel<
  TEvents,
  TRpcContract
> {
  return new GenericTestMessagingChannel<{}, TEvents, {}, TRpcContract>({});
}

export function makeTestMessagingBroadcastSenderChannelFromDef<TEvents, TRpcContract>(
  _channelDef: MessagingBroadcastChannelDef<TEvents, TRpcContract>,
): TestMessagingBroadcastSenderChannel<TEvents, TRpcContract> {
  return makeTestMessagingBroadcastSenderChannel<TEvents, TRpcContract>();
}
