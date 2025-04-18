/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ConnectableConnection } from '../connection/connectable-connection';
import { MessagingPort } from '../public-interfaces';
import { removeFromArray } from '../utils';

export class HostController<TConnection> {
  private readonly connections: Record<string, ConnectableConnection & TConnection> = {};
  private readonly onConnectHanlders: Array<(clientId: string) => void> = [];
  private readonly onDisconnectHandlers: Array<(clientId: string) => void> = [];

  constructor(private readonly connectionFactory: () => ConnectableConnection & TConnection) {}

  getClientConnection(clientId: string): TConnection {
    return this.getOrCreateConnection(clientId);
  }

  onClientConnected(handler: (clientId: string) => void): () => void {
    this.onConnectHanlders.push(handler);
    // Unsubscribe handler
    return () => removeFromArray(handler, this.onConnectHanlders);
  }

  onClientDisconnected(handler: (clientId: string) => void): () => void {
    this.onDisconnectHandlers.push(handler);
    // Unsubscribe handler
    return () => removeFromArray(handler, this.onDisconnectHandlers);
  }

  connectClient(clientId: string, connectionId: string, port: MessagingPort) {
    const connection = this.getOrCreateConnection(clientId);

    if (connection.state.kind === 'connected') {
      this.disconnectClient(clientId, connection.state.connectionId);
    }

    connection.connect(port, connectionId);
    this.onConnectHanlders.forEach((handler) => handler(clientId));
  }

  disconnectClient(clientId: string, connectionId: string) {
    const connection = this.getOrCreateConnection(clientId);
    const state = connection.state;

    if (state.kind === 'connected' && state.connectionId === connectionId) {
      connection.disconnect();
      this.onDisconnectHandlers.forEach((handler) => handler(clientId));
    }
  }

  private getOrCreateConnection(clientId: string) {
    let connection = this.connections[clientId];
    if (!connection) {
      this.connections[clientId] = connection = this.connectionFactory();
    }

    return connection;
  }
}
