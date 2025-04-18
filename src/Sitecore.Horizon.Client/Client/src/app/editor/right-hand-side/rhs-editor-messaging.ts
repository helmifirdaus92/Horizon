/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import {
  MessagingP2PChannel,
  MessagingP2PChannelDef,
  MessagingPort,
  MessagingReconnectableP2PConnection,
} from '@sitecore/horizon-messaging';
import { Lifespan, Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { Subject } from 'rxjs';

export type RhsEditorMessaging = Pick<
  RhsEditorMessagingReconnectable,
  'getChannel' | 'onReconnect' | 'changeRemotePeer'
>;

export class RhsEditorMessagingReconnectable {
  private readonly lifetime = new Lifetime();
  private readonly onReconnect$ = new Subject<void>();
  private readonly onDestroyCallbacks: Array<() => void> = [];

  constructor(
    private readonly messaging: MessagingReconnectableP2PConnection,
    private readonly getMessagingPortFn: (peerId: string) => MessagingPort,
  ) {}

  isEstablished(): boolean {
    return this.messaging.isEstablished;
  }

  getChannel<TInboundEvents, TOutboundEvents, TRemoteRpcContract, TProvidedRpcContract>(
    channelDef: MessagingP2PChannelDef<TInboundEvents, TOutboundEvents, TRemoteRpcContract, TProvidedRpcContract>,
  ): MessagingP2PChannel<TInboundEvents, TOutboundEvents, TRemoteRpcContract, TProvidedRpcContract> {
    return this.messaging.getChannel(channelDef);
  }

  reconnect(): void {
    this.messaging.reconnect();
    this.onReconnect$.next(undefined);
  }

  changeRemotePeer(targetChromeId: string) {
    this.messaging.changePort(this.getMessagingPortFn(targetChromeId));
  }

  destroy(): void {
    // Dispose connection with a small delay to let all the pending RPC calls and sync events to complete.
    // Otherwise they might be interrupted in between and fail with an error.
    // We have registered a tech dept task, so that we introduce "graceful disconnect", which prevents new messages,
    // but let the pending requests get their answer (e.g. by giving some time buffer).
    setTimeout(() => {
      this.messaging.disconnect();
      this.onDestroyCallbacks.forEach((callback) => callback());
    }, 100);

    this.lifetime.dispose();
  }

  onReconnect(callback: () => void, lifespan: Lifespan): void {
    this.onReconnect$.pipe(takeWhileAlive(lifespan)).subscribe(callback);
    if (this.messaging.isEstablished && lifespan.isAlive) {
      callback();
    }
  }

  onDestroy(callback: () => void): void {
    this.onDestroyCallbacks.push(callback);
  }
}
