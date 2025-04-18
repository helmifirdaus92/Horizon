/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingEventHandler, MessagingPort, RpcServicesImplementation } from '../public-interfaces';
import { Fn, removeFromArray, Writable } from '../utils';
import {
  ChannelEmitMessage,
  ChannelMessage,
  ChannelPendingResultMessage,
  ChannelRpcCallMessage,
  ChannelSyncEmitMessage,
  isChannelEmitMessage,
  isChannelMessage,
  isChannelPendingResultMessage,
  isChannelRpcCallMessage,
  isChannelSyncEmitMessage,
} from './message-types';

export type ConnectionState =
  | { readonly kind: 'connected'; readonly connectionId: string }
  | { readonly kind: 'disconnected' };

interface ChannelInfo {
  requestIdCounter: number;
  services: Record<string, Fn>;
  eventListeners: Record<string, Array<MessagingEventHandler<any>>>;
  pendingRequests: Array<{
    requestId: number;
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }>;
}

export class ConnectionEndpoint {
  private _state:
    | Readonly<{ kind: 'connected'; connectionId: string; port: MessagingPort; portUnsubscribe: () => void }>
    | Readonly<{ kind: 'disconnected' }> = {
    kind: 'disconnected',
  };
  private readonly channelInfos: Record<string, ChannelInfo> = {};
  private queuedMessages: ChannelMessage[] = [];

  get state(): { readonly kind: 'connected'; readonly connectionId: string } | { readonly kind: 'disconnected' } {
    return this._state;
  }

  connect(port: MessagingPort, connectionId: string): void {
    // If connection is re-established, we drop the previous connection.
    // That might be required to kill e.g. pending RPC calls.
    if (this._state.kind === 'connected') {
      this.disconnect();
    }

    const portUnsubscribe = port.onMessage((msg) => this.handleMessage(msg));
    this._state = { kind: 'connected', connectionId, port, portUnsubscribe };

    // Send all the queued messages.
    // Is important to do after port is initialized, as otherwise they will be queued again.
    this.queuedMessages.forEach((msg) => this.postOrQueueMessage(msg));
    this.queuedMessages = [];
  }

  disconnect(): void {
    if (this._state.kind === 'disconnected') {
      return;
    }

    this._state.portUnsubscribe();
    this._state = { kind: 'disconnected' };

    // Fail all the calls/emits awaiting reply, as reply will never come.
    for (const chInfo of this.getAllChannels()) {
      const pendingRequests = chInfo.pendingRequests;
      pendingRequests.forEach((pendingReq) =>
        pendingReq.reject(Error('Underlying connection was unexpectedly closed.')),
      );
      chInfo.pendingRequests = [];
    }
  }

  onEvent(channelName: string, eventName: string, handler: MessagingEventHandler<any>): () => void {
    const channelInfo = this.getOrCreateChannelInfo(channelName);
    let eventListeners = channelInfo.eventListeners[eventName];
    if (!eventListeners) {
      channelInfo.eventListeners[eventName] = eventListeners = [];
    }

    eventListeners.push(handler);
    // Unsubscribe handler
    const nonNullEventListeners = eventListeners;
    return () => removeFromArray(handler, nonNullEventListeners);
  }

  emitEvent(channelName: string, eventName: string, arg: any): void {
    const msg: ChannelEmitMessage = {
      type: 'EMIT',
      channelName,
      eventName,
      arg,
    };
    this.postOrQueueMessage(msg);
  }

  syncEmitEvent(channelName: string, eventName: string, arg: any): Promise<void> {
    const msg: ChannelSyncEmitMessage = {
      type: 'SYNC_EMIT',
      channelName,
      eventName,
      arg,
      requestId: -1,
    };

    return this.postOrQueueMessageAwaitingReply<void>(msg);
  }

  performRpcCall(channelName: string, methodName: string, args: any[]): Promise<any> {
    const msg: ChannelRpcCallMessage = {
      type: 'RPC_CALL',
      channelName,
      methodName,
      args,
      requestId: -1,
    };

    return this.postOrQueueMessageAwaitingReply<any>(msg);
  }

  setRpcServicesImplementation(channelName: string, impl: RpcServicesImplementation<any>): void {
    const channelInfo = this.getOrCreateChannelInfo(channelName);
    channelInfo.services = impl;
  }

  private handleMessage(msg: unknown): void {
    if (!isChannelMessage(msg)) {
      console.warn(`[Messaging] Unknown message received: ${JSON.stringify(msg)}`);
      return;
    }

    if (isChannelEmitMessage(msg)) {
      this.handleIncomingEvent(msg.channelName, msg.eventName, msg.arg);
      return;
    }

    if (isChannelSyncEmitMessage(msg)) {
      this.handleIncomingSyncEvent(msg.channelName, msg.eventName, msg.arg, msg.requestId);
      return;
    }

    if (isChannelRpcCallMessage(msg)) {
      this.handleIncomingRpcCall(msg.channelName, msg.methodName, msg.args, msg.requestId);
      return;
    }

    if (isChannelPendingResultMessage(msg)) {
      this.handleIncomingPendingResult(msg.channelName, msg.requestId, msg.result, msg.error);
      return;
    }

    console.warn(`[Messaging] Message of unknown type received. Type: '${msg.type}', Channel: '${msg.channelName}'`);
  }

  private handleIncomingEvent(channelName: string, eventName: string, payload: any) {
    const chInfo = this.getOrCreateChannelInfo(channelName);

    const eventHandlers = chInfo.eventListeners[eventName] ?? [];
    eventHandlers.forEach((handler) => handler(payload));
  }

  private async handleIncomingSyncEvent(channelName: string, eventName: string, payload: any, requestId: number) {
    const chInfo = this.getOrCreateChannelInfo(channelName);

    const msg: Writable<ChannelPendingResultMessage> = {
      type: 'PENDING_RESULT',
      channelName,
      requestId,
    };

    const eventHandlers = chInfo.eventListeners[eventName] ?? [];

    try {
      const pendingResults = eventHandlers.map((handler) => handler(payload));

      // Support both handlers returning promises and ones returning nothing.
      await Promise.all(pendingResults);
    } catch (error) {
      msg.error = `Event handler failed: ${error.message || 'Unknown error'}`;
    }

    this.postOrQueueMessage(msg);
  }

  private async handleIncomingRpcCall(channelName: string, methodName: string, args: any[], requestId: number) {
    const chInfo = this.getOrCreateChannelInfo(channelName);
    const servicesObj = chInfo.services;
    const service = servicesObj[methodName];

    const msg: Writable<ChannelPendingResultMessage> = {
      type: 'PENDING_RESULT',
      channelName,
      requestId,
    };

    try {
      if (!service) {
        throw Error(`RPC service is not registered. Channel: '${channelName}', Method: '${methodName}'`);
      }

      const serviceResult: any = service.apply(servicesObj, args);

      // Support service returning a promise.
      msg.result = await Promise.resolve(serviceResult);
    } catch (error) {
      msg.error = error.message || 'Unknown error';
    }

    this.postOrQueueMessage(msg);
  }

  private handleIncomingPendingResult(channelName: string, requestId: number, result?: any, error?: string) {
    const chInfo = this.getOrCreateChannelInfo(channelName);
    const pendingRpcIndex = chInfo.pendingRequests.findIndex((x) => x.requestId === requestId);
    if (pendingRpcIndex < 0) {
      console.warn(`[Messaging] Cannot find pending request. Channel: '${channelName}', RequestId: '${requestId}'.`);
      return;
    }

    let [pendingReq] = chInfo.pendingRequests.splice(pendingRpcIndex, 1);
    // tslint:disable-next-line: no-non-null-assertion - at least one element should be there as index was found.
    pendingReq = pendingReq!;
    // Handle error first, as result might be falsy, but still exist.
    if (error) {
      pendingReq.reject(Error(error));
    } else {
      pendingReq.resolve(result);
    }
  }

  private postOrQueueMessage(msg: ChannelMessage) {
    switch (this._state.kind) {
      case 'connected':
        this._state.port.postMessage(msg);
        return;

      case 'disconnected':
        this.queuedMessages.push(msg);
        return;
    }
  }

  private postOrQueueMessageAwaitingReply<TResult>(msg: ChannelMessage & { requestId: number }) {
    const chInfo = this.getOrCreateChannelInfo(msg.channelName);
    msg.requestId = chInfo.requestIdCounter++;

    const promise = new Promise<TResult>((resolve, reject) => {
      chInfo.pendingRequests.push({ requestId: msg.requestId, resolve, reject });
    });

    this.postOrQueueMessage(msg);
    return promise;
  }

  private getOrCreateChannelInfo(channelName: string): ChannelInfo {
    let info = this.channelInfos[channelName];
    if (!info) {
      this.channelInfos[channelName] = info = {
        requestIdCounter: 0,
        services: {},
        eventListeners: {},
        pendingRequests: [],
      };
    }

    return info;
  }

  private getAllChannels(): readonly ChannelInfo[] {
    return Object.keys(this.channelInfos)
      .map((key) => this.channelInfos[key])
      .filter((value): value is ChannelInfo => value !== undefined);
  }
}
