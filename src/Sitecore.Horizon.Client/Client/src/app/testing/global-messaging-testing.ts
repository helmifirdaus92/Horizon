/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NgModule } from '@angular/core';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import {
  GlobalMessaging,
  MessagingContract,
  MessagingEventsEmitterChannel,
  MessagingEventsReceiverChannel,
  MessagingRpcProvider,
  MessagingRpcServicesClient,
  MessagingRpcServicesImplementation,
} from '@sitecore/page-composer-sdk';

export class GlobalMessagingTesting extends NgGlobalMessaging implements GlobalMessaging {
  private readonly _eventEmitterMap = new Map<MessagingContract<any, any>, EventTarget>();
  private readonly _rpcMap = new Map<MessagingContract<any, any>, any>();
  eventReceivers = new Map<MessagingContract<any, any>, MessagingEventsReceiverChannel<any>>();

  constructor() {
    super({} as any, {} as any);
  }

  override getEventReceiver<TEvents, TRpc>(
    contract: MessagingContract<TEvents, TRpc>,
  ): MessagingEventsReceiverChannel<TEvents> {
    const emitterImpl = this.getOrCreateEventEmitter(contract);

    const eventReceiver = {
      disconnect: () => {},
      on: (eventName: any, handler: () => void | Promise<void>) => {
        emitterImpl.addEventListener(eventName, ((event: CustomEvent) =>
          // eslint-disable-next-line prefer-spread
          handler.apply(null, event.detail)) as EventListener);
        return () => {};
      },
    };
    this.eventReceivers.set(contract, eventReceiver);

    return eventReceiver as any;
  }
  override createEventEmitter<TEvents, TRpc>(
    contract: MessagingContract<TEvents, TRpc>,
  ): MessagingEventsEmitterChannel<TEvents> {
    const emitterImpl = this.getOrCreateEventEmitter(contract);
    const eventEmitter = {
      disconnect: () => {},
      emit: (eventName: any, ...args: any) => {
        emitterImpl.dispatchEvent(new CustomEvent(eventName, { detail: args }));
      },
      syncEmit: (eventName: any, ...args: any) => {
        Promise.resolve(emitterImpl.dispatchEvent(new CustomEvent(eventName, { detail: args })));
      },
    };
    return eventEmitter as any;
  }
  override getRpc<TEvents, TRpc>(
    contract: MessagingContract<TEvents, TRpc>,
  ): Promise<MessagingRpcServicesClient<TRpc>> {
    return Promise.resolve(this._rpcMap.get(contract));
  }
  override createRpc<TEvents, TRpc>(
    contract: MessagingContract<TEvents, TRpc>,
    impl: MessagingRpcServicesImplementation<TRpc>,
  ): MessagingRpcProvider {
    this._rpcMap.set(contract, impl);
    return {
      disconnect: () => {},
    };
  }

  private getOrCreateEventEmitter(contract: MessagingContract<any, any>) {
    let eventEmitter = this._eventEmitterMap.get(contract);
    if (!eventEmitter) {
      eventEmitter = new EventTarget();
      this._eventEmitterMap.set(contract, eventEmitter);
    }
    return eventEmitter;
  }
}

@NgModule({
  providers: [
    {
      provide: NgGlobalMessaging,
      useExisting: GlobalMessagingTesting,
    },
    {
      provide: GlobalMessagingTesting,
      useFactory: () => new GlobalMessagingTesting(),
    },
  ],
})
export class GlobalMessagingTestingModule {}
