/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ConnectableConnection } from '../connection/connectable-connection';
import { ConnectionState } from '../connection/connection-endpoint';
import { NativeMessagingPort } from '../connection/messaging-ports';
import { ConnectionRequestFilter, MessagingPort } from '../public-interfaces';
import { ShutdownListener } from '../shutdown/shutdown-listener';
import { HandshakeTrasport } from './handshake-interfaces';
import { HandshakeMessage } from './message-types';

export interface ConfigurableHost {
  connectClient(clientId: string, connectionId: string, port: MessagingPort): void;
  disconnectClient(clientId: string, connectionId: string): void;
}

export class EnvironmentInitializer {
  constructor(private readonly handshakeTrasport: HandshakeTrasport, private readonly hostName: string) {}

  setupHost({
    host,
    connectionRequestFilter,
  }: {
    host: ConfigurableHost;
    connectionRequestFilter?: ConnectionRequestFilter;
  }): void {
    this.handshakeTrasport.onMessage((msg, reply) => {
      if (msg.hostName === this.hostName && msg.type === 'HANDSHAKE_REQUEST' && msg.port) {
        const action =
          connectionRequestFilter?.({ clientId: msg.clientId, origin: msg.origin, extras: msg.extras }) ?? 'ACCEPT';
        switch (action) {
          case 'IGNORE_ATTEMPT': {
            // Reply nothing, expecting client to repeat its attempt.
            // Expect filter to finally reply with either ACCEPT or REJECT.
            return;
          }

          case 'REJECT': {
            reply({
              protocol: 'horizon_messaging_v3',
              type: 'HANDSHAKE_REJECT',
              hostName: this.hostName,
              clientId: msg.clientId,
              connectionId: msg.connectionId,
            });

            return;
          }

          case 'ACCEPT': {
            host.connectClient(msg.clientId, msg.connectionId, new NativeMessagingPort(msg.port));

            reply({
              protocol: 'horizon_messaging_v3',
              type: 'HANDSHAKE_ACCEPT',
              hostName: this.hostName,
              clientId: msg.clientId,
              connectionId: msg.connectionId,
            });

            return;
          }
        }
      }

      if (msg.type === 'DISCONNECT') {
        host.disconnectClient(msg.clientId, msg.connectionId);
        return;
      }
    });
  }

  setupClient({
    connection,
    clientId,
    retryIntervalMs,
    shutdownListener,
    extras,
  }: {
    connection: ConnectableConnection;
    clientId: string;
    retryIntervalMs: number;
    shutdownListener: ShutdownListener;
    extras?: Record<string, string>;
  }): void {
    let { ourPort, remotePort, connectionId } = this.createMessageChannel();

    let intervalHandle: ReturnType<typeof setTimeout>;
    this.handshakeTrasport.onMessage((msg) => {
      if (msg.hostName !== this.hostName) {
        return;
      }

      if (msg.type === 'HANDSHAKE_ACCEPT' && msg.clientId === clientId && msg.connectionId === connectionId) {
        clearInterval(intervalHandle);

        connection.connect(new NativeMessagingPort(ourPort), connectionId);
        return;
      }

      if (msg.type === 'HANDSHAKE_REJECT' && msg.clientId === clientId && msg.connectionId === connectionId) {
        clearInterval(intervalHandle);
        return;
      }

      if (msg.type === 'DISCONNECT' && msg.connectionId === connectionId) {
        connection.disconnect();
        return;
      }
    });

    const sendHandshake = () => {
      // Each time MessageChannel is transferred, it's destroyed and is not usable anymore.
      // So we should create new channel on each iteration.
      ({ ourPort, remotePort, connectionId } = this.createMessageChannel());

      const msg: HandshakeMessage = {
        protocol: 'horizon_messaging_v3',
        type: 'HANDSHAKE_REQUEST',
        hostName: this.hostName,
        clientId,
        connectionId,
        port: remotePort,
        extras,
      };
      this.handshakeTrasport.postMessage(msg);
    };

    sendHandshake();
    // We don't know whether parent host is already initialized, so we retry handshake beacon till it replies.
    intervalHandle = setInterval(sendHandshake, retryIntervalMs);

    shutdownListener.onShutdown(() => this.notifyConnectionForciblyClosed(connection, clientId));
  }

  notifyConnectionForciblyClosed(connection: { readonly state: ConnectionState }, clientId: string): void {
    if (connection.state.kind !== 'connected') {
      return;
    }

    const msg: HandshakeMessage = {
      protocol: 'horizon_messaging_v3',
      type: 'DISCONNECT',
      hostName: this.hostName,
      clientId,
      connectionId: connection.state.connectionId,
    };
    this.handshakeTrasport.postMessage(msg);
  }

  private createMessageChannel() {
    const msgChannel = new MessageChannel();
    const randomNumber = window.crypto.getRandomValues(new Uint32Array(1));
    const connectionId = `CONN_${randomNumber[0]}`;

    return { ourPort: msgChannel.port1, remotePort: msgChannel.port2, connectionId };
  }
}
