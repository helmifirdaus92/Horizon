/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ConnectionEndpoint } from '../connection/connection-endpoint';
import { createEntangledMessagingPorts } from '../connection/messaging-ports';
import {
  MessagingBroadcastChannelDef,
  MessagingBroadcastHost,
  MessagingBroadcastRecipient,
  MessagingBroadcastSenderChannel,
  MessagingPort,
  RpcServicesImplementation,
} from '../public-interfaces';
import { removeFromArray } from '../utils';
import { makeCallInterceptor } from '../utils.interception';
import { HostController } from './host-controller';

export class BroadcastHost extends HostController<{}> implements MessagingBroadcastHost {
  private readonly clientConnections: ConnectionEndpoint[] = [];
  private readonly rpcServicesImplementations = new Map<string, RpcServicesImplementation<any>>();
  private clientIdCounter = 0;

  constructor() {
    super(() => {
      let connection: { connectionId: string; disconnectCallback: () => void } | null = null;

      return {
        get state() {
          return connection
            ? { kind: 'connected' as const, connectionId: connection.connectionId }
            : { kind: 'disconnected' as const };
        },

        connect: (port, connectionId) => {
          if (connection) {
            connection.disconnectCallback();
          }

          connection = { connectionId, disconnectCallback: this.registerClientConnection(port, connectionId) };
        },

        disconnect: () => {
          if (!connection) {
            return;
          }

          connection.disconnectCallback();
          connection = null;
        },
      };
    });
  }

  getSenderChannel<TEvents, TRpcContract>(
    channelDef: MessagingBroadcastChannelDef<TEvents, TRpcContract>,
  ): MessagingBroadcastSenderChannel<TEvents, TRpcContract> {
    const channelName = channelDef.name;

    return {
      emit: (eventName, ...[arg]) => {
        this.clientConnections.forEach((conn) => conn.emitEvent(channelName, eventName, arg));
      },

      syncEmit: async (eventName, ...[arg]) => {
        try {
          const pendingResults = this.clientConnections.map((conn) => conn.syncEmitEvent(channelName, eventName, arg));

          // Support both handlers returning promises and ones returning nothing.
          await Promise.all(pendingResults);
        } catch (error) {
          throw Error(`Event handler failed: ${error.message || 'Unknown error'}`);
        }
      },

      setRpcServicesImpl: (impl) => {
        this.rpcServicesImplementations.set(channelName, impl);
        this.clientConnections.forEach((conn) => conn.setRpcServicesImplementation(channelName, impl));
      },
    };
  }

  registerRecipient(): MessagingBroadcastRecipient {
    const [oursPort, theirsPort] = createEntangledMessagingPorts();

    const clientId = `in_memory_client_#${this.clientIdCounter++}`;
    const connectionId = 'in_memory_connection';
    this.connectClient(clientId, connectionId, oursPort);

    const recipientEndpoint = new ConnectionEndpoint();
    recipientEndpoint.connect(theirsPort, 'dynamic recipient connection');
    return {
      getChannel: ({ name: channelName }) => ({
        on: (eventName, handler) => recipientEndpoint.onEvent(channelName, eventName, handler),
        rpc: makeCallInterceptor(channelName, recipientEndpoint),
      }),

      disconnect: () => {
        this.disconnectClient(clientId, connectionId);
        recipientEndpoint.disconnect();
      },
    };
  }

  private registerClientConnection(port: MessagingPort, connectionId: string): () => void {
    const hostEndpoint = new ConnectionEndpoint();

    for (const [channelName, impl] of this.rpcServicesImplementations) {
      hostEndpoint.setRpcServicesImplementation(channelName, impl);
    }

    hostEndpoint.connect(port, connectionId);
    this.clientConnections.push(hostEndpoint);

    return () => {
      hostEndpoint.disconnect();
      removeFromArray(hostEndpoint, this.clientConnections);
    };
  }
}
