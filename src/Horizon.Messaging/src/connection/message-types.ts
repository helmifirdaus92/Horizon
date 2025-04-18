/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export interface ChannelMessage {
  readonly channelName: string;
  readonly type: 'EMIT' | 'SYNC_EMIT' | 'RPC_CALL' | 'PENDING_RESULT';
}

export interface ChannelEmitMessage extends ChannelMessage {
  readonly type: 'EMIT';
  readonly eventName: string;
  readonly arg: any;
}

export interface ChannelSyncEmitMessage extends ChannelMessage {
  readonly type: 'SYNC_EMIT';
  readonly requestId: number;
  readonly eventName: string;
  readonly arg: any;
}

export interface ChannelRpcCallMessage extends ChannelMessage {
  readonly type: 'RPC_CALL';
  readonly requestId: number;
  readonly methodName: string;
  readonly args: any[];
}

export interface ChannelPendingResultMessage extends ChannelMessage {
  readonly type: 'PENDING_RESULT';
  readonly requestId: number;
  readonly result?: any;
  readonly error?: string;
}

export function isChannelMessage(message: any): message is ChannelMessage {
  return !!message && 'channelName' in message && 'type' in message;
}

export function isChannelEmitMessage(message: ChannelMessage): message is ChannelEmitMessage {
  return message.type === 'EMIT';
}

export function isChannelSyncEmitMessage(message: ChannelMessage): message is ChannelSyncEmitMessage {
  return message.type === 'SYNC_EMIT';
}

export function isChannelRpcCallMessage(message: ChannelMessage): message is ChannelRpcCallMessage {
  return message.type === 'RPC_CALL';
}

export function isChannelPendingResultMessage(message: ChannelMessage): message is ChannelPendingResultMessage {
  return message.type === 'PENDING_RESULT';
}
