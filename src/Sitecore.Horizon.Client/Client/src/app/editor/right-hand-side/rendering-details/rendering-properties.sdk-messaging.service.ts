/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { MessagingEventsEmitterChannel, MessagingRpcServicesImplementation } from '@sitecore/page-composer-sdk';
import { BehaviorSubject } from 'rxjs';
import {
  RenderingDetailsUpdate,
  RenderingPropertiesContract,
  RenderingPropertiesEvents,
  RenderingPropertiesRpc,
} from 'sdk';

const RpcNotAvailableImpl: MessagingRpcServicesImplementation<RenderingPropertiesRpc> = {
  getInlineEditorProtocols: () => {
    throw Error('Service not available right now.');
  },
  postInlineEditorMessage: () => {
    throw Error('Service not available right now.');
  },
  getRenderingDetails: () => {
    throw Error('Service not available right now.');
  },
  setRenderingDetails: (_: RenderingDetailsUpdate) => {
    throw Error('Service not available right now.');
  },
  getIsInPersonalizationMode: () => {
    throw Error('Service not available right now.');
  },
};

@Injectable({ providedIn: 'root' })
export class RenderingPropertiesSdkMessagingService {
  private readonly eventEmitter: MessagingEventsEmitterChannel<RenderingPropertiesEvents>;
  private rpcImpl: MessagingRpcServicesImplementation<RenderingPropertiesRpc>;
  private _messagingStatus$ = new BehaviorSubject<'connected' | 'disconnected'>('disconnected');
  public readonly messagingStatus$ = this._messagingStatus$.asObservable();

  constructor(private readonly messaging: NgGlobalMessaging) {
    this.eventEmitter = this.messaging.createEventEmitter(RenderingPropertiesContract);
    this.rpcImpl = RpcNotAvailableImpl;
  }

  init() {
    this.messaging.createRpc(RenderingPropertiesContract, {
      getInlineEditorProtocols: () => this.rpcImpl.getInlineEditorProtocols(),
      postInlineEditorMessage: (data: unknown) => this.rpcImpl.postInlineEditorMessage(data),
      getRenderingDetails: () => this.rpcImpl.getRenderingDetails(),
      setRenderingDetails: (details, options) => this.rpcImpl.setRenderingDetails(details, options),
      getIsInPersonalizationMode: () => this.rpcImpl.getIsInPersonalizationMode(),
    });
  }

  setRpcImpl(implementation: MessagingRpcServicesImplementation<RenderingPropertiesRpc>): void {
    this.rpcImpl = implementation;
    this._messagingStatus$.next('connected');
  }

  resetRpcImpl(): void {
    this.rpcImpl = RpcNotAvailableImpl;
    this._messagingStatus$.next('disconnected');
  }

  emitOnInlineEditorMessageEvent(msg: unknown): void {
    this.eventEmitter.emit('onInlineEditorMessage', msg);
  }

  emitReconnectEvent(): void {
    this.eventEmitter.emit('reconnect');
  }
}
