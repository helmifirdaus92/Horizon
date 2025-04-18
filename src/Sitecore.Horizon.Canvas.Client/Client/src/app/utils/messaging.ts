/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingP2PChannel } from '@sitecore/horizon-messaging';

/**
 * Extracts Remote RPC type from the provided channel type.
 */
export type RemoteRpcServices<TChannel extends MessagingP2PChannel<any, any, any, any>> = TChannel extends MessagingP2PChannel<
  any,
  any,
  infer TRemoteRpc,
  any
>
  ? TRemoteRpc
  : never;

/**
 * Creates channel type where incoming and outcoming events and RPCs are swapped.
 */
export type ReverseMessagingP2PChannel<TChannel extends MessagingP2PChannel<any, any, any, any>> = TChannel extends MessagingP2PChannel<
  infer TInEvents,
  infer TOutEvents,
  infer TInRpc,
  infer TOutRpc
>
  ? MessagingP2PChannel<TOutEvents, TInEvents, TOutRpc, TInRpc>
  : never;
