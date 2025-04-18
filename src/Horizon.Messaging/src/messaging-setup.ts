/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { BroadcastRecipientConnection } from './connection/broadcast-recipient-connection';
import { ConnectionEndpoint } from './connection/connection-endpoint';
import { createEntangledMessagingPorts } from './connection/messaging-ports';
import { P2PConnection } from './connection/p2p-connection';
import { ReconnectableP2PConnection } from './connection/reconnectable-p2p-connection';
import { EnvironmentInitializer } from './handshake/environment-initializer';
import { WindowHandshakeTrasport } from './handshake/window-handshake-transport';
import { BroadcastHost } from './host/broadcast-host';
import { HostController } from './host/host-controller';
import {
  ConnectionRequestFilter,
  MessagingBroadcastHost,
  MessagingBroadcastRecipient,
  MessagingP2PConnection,
  MessagingP2PHostController,
  MessagingPort,
  MessagingReconnectableP2PConnection,
} from './public-interfaces';
import { WindowShutdownListener } from './shutdown/window-shutdown-listener';

const DEFAULT_RETRY_INTERVAL = 100;

/**
 * Entry point to lazily initialize current application as a messaging peer-to-peer client.
 * You must invoke the returned callback to complete host initialization.
 * Notice, only one host per page should be created.
 */
export function setupNotInitializedMessagingPeerToPeerHost({
  hostName,
  incomingConnectionsFilter,
}: {
  hostName: string;
  incomingConnectionsFilter?: ConnectionRequestFilter;
}): {
  hostController: MessagingP2PHostController;
  init: () => void;
} {
  const p2pHost = new HostController(() => new P2PConnection(new ConnectionEndpoint()));

  let isAlreadyInitialied = false;
  const initialize = () => {
    if (isAlreadyInitialied) {
      throw Error('Is already initialized. Messaging host can be initialized only once.');
    }
    isAlreadyInitialied = true;

    // Notice, targetWindow and targetOrigin doesn't matter for the host.
    const windowHandshakeTrasport = new WindowHandshakeTrasport(window, window, '*');

    const envInitializer = new EnvironmentInitializer(windowHandshakeTrasport, hostName);
    envInitializer.setupHost({ host: p2pHost, connectionRequestFilter: incomingConnectionsFilter });
  };

  return { hostController: p2pHost, init: initialize };
}

/**
 * Entry point to initialize messaging current application as a messaging peer-to-peer client.
 * Notice, you could initialize a few clients if you need.
 */
export function setupMessagingPeerToPeerClient({
  clientId,
  hostWindow,
  hostOrigin,
  hostName,
  extras,
}: {
  clientId: string;
  hostWindow: Window;
  hostOrigin: string;
  hostName: string;
  extras?: Record<string, string>;
}): MessagingP2PConnection {
  const connection = new P2PConnection(new ConnectionEndpoint());

  const windowHandshakeTrasport = new WindowHandshakeTrasport(window, hostWindow, hostOrigin);
  const envInitializer = new EnvironmentInitializer(windowHandshakeTrasport, hostName);
  const windowShutdownListener = new WindowShutdownListener();

  envInitializer.setupClient({
    connection,
    clientId,
    retryIntervalMs: DEFAULT_RETRY_INTERVAL,
    shutdownListener: windowShutdownListener,
    extras,
  });

  return connection;
}

export function createMessagingBroadcastHost(): MessagingBroadcastHost {
  return new BroadcastHost();
}

export function setupNonInitializedMessagingBroadcastHost({
  hostName,
  incomingConnectionsFilter,
}: {
  hostName: string;
  incomingConnectionsFilter?: ConnectionRequestFilter;
}): { host: MessagingBroadcastHost; init: () => void } {
  const broadcastHost = new BroadcastHost();

  let isAlreadyInitialied = false;
  const initialize = () => {
    if (isAlreadyInitialied) {
      throw Error('Is already initialized. Messaging host can be initialized only once.');
    }
    isAlreadyInitialied = true;

    // Notice, targetWindow and targetOrigin doesn't matter for the host.
    const windowHandshakeTrasport = new WindowHandshakeTrasport(window, window, '*');

    const envInitializer = new EnvironmentInitializer(windowHandshakeTrasport, hostName);
    envInitializer.setupHost({ host: broadcastHost, connectionRequestFilter: incomingConnectionsFilter });
  };

  return { host: broadcastHost, init: initialize };
}

export function setupMessagingBroadcastClient({
  clientId,
  hostWindow,
  hostOrigin,
  hostName,
  extras,
}: {
  clientId: string;
  hostWindow: Window;
  hostOrigin: string;
  hostName: string;
  extras?: Record<string, string>;
}): MessagingBroadcastRecipient {
  const windowHandshakeTrasport = new WindowHandshakeTrasport(window, hostWindow, hostOrigin);
  const windowShutdownListener = new WindowShutdownListener();
  const envInitializer = new EnvironmentInitializer(windowHandshakeTrasport, hostName);

  const endpoint = new ConnectionEndpoint();
  const connection = new BroadcastRecipientConnection(endpoint, () =>
    envInitializer.notifyConnectionForciblyClosed(endpoint, clientId),
  );

  envInitializer.setupClient({
    connection,
    clientId,
    retryIntervalMs: DEFAULT_RETRY_INTERVAL,
    shutdownListener: windowShutdownListener,
    extras,
  });

  return connection;
}

/**
 * Creates a peer-to-peer connection over arbitrary transport.
 * Notice, the returned connection is not connected, so you need to connect it first.
 * Client is reponsible for connecting and disconnecting the returned connection.
 */
export function createVirtualP2PConnection(messagePort: MessagingPort): MessagingReconnectableP2PConnection {
  return new ReconnectableP2PConnection(new ConnectionEndpoint(), messagePort);
}

/**
 * Creates a pair of peer-to-peer connections which are interconnected.
 * Notice, the returned connections are not connected, so you need to connect them first.
 * Client is reponsible for connecting and disconnecting the returned connections.
 *
 * Notice, if you change port on the returned connection they will stop be entangled.
 */
export function createEntangledP2PConnections(): [
  MessagingReconnectableP2PConnection,
  MessagingReconnectableP2PConnection,
] {
  const [port1, port2] = createEntangledMessagingPorts();

  return [createVirtualP2PConnection(port1), createVirtualP2PConnection(port2)];
}
