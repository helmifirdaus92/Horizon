/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { MessagingEventsEmitterChannel, MessagingRpcServicesImplementation } from '@sitecore/page-composer-sdk';
import {
  PlaceholderPropertiesContract,
  PlaceholderPropertiesEvents,
  PlaceholderPropertiesRpc,
} from 'sdk/contracts/placeholder-properties.contract';

const RpcNotAvailableImpl: MessagingRpcServicesImplementation<PlaceholderPropertiesRpc> = {
  getPlaceholderDetails: () => {
    throw Error('Service not available right now.');
  },
};

@Injectable({ providedIn: 'root' })
export class PlaceholderPropertiesSdkMessagingService {
  private readonly eventEmitter: MessagingEventsEmitterChannel<PlaceholderPropertiesEvents>;
  private rpcImpl: MessagingRpcServicesImplementation<PlaceholderPropertiesRpc>;

  constructor(private readonly messaging: NgGlobalMessaging) {
    this.eventEmitter = this.messaging.createEventEmitter(PlaceholderPropertiesContract);
    this.rpcImpl = RpcNotAvailableImpl;
  }

  init() {
    this.messaging.createRpc(PlaceholderPropertiesContract, {
      getPlaceholderDetails: () => this.rpcImpl.getPlaceholderDetails(),
    });
  }

  setRpcImpl(implementation: MessagingRpcServicesImplementation<PlaceholderPropertiesRpc>): void {
    this.rpcImpl = implementation;
  }

  resetRpcImpl(): void {
    this.rpcImpl = RpcNotAvailableImpl;
  }

  emitReconnectEvent(): void {
    this.eventEmitter.emit('reconnect');
  }
}
