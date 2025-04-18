/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ConnectableConnection } from '../connection/connectable-connection';
import { MessagingPort } from '../public-interfaces';
import { Writable } from '../utils';
import { HostController } from './host-controller';

function createPort(): MessagingPort {
  return jasmine.createSpyObj<MessagingPort>('Port', {
    postMessage: undefined,
    onMessage: undefined,
  });
}

describe('HostController', () => {
  let sut: HostController<{}>;

  beforeEach(() => {
    sut = new HostController(() => {
      const spy = jasmine.createSpyObj<ConnectableConnection>('client', ['connect', 'disconnect']);
      // Native properties support should come in jasmine 3.5.0.
      (spy as Writable<ConnectableConnection>).state = { kind: 'disconnected' };

      return spy;
    });
  });

  it('should return same client each time', () => {
    const clientId = 'TEST_CLIENT_ID';

    const client1 = sut.getClientConnection(clientId);
    const client2 = sut.getClientConnection(clientId);

    expect(client1).toBe(client2);
  });

  describe('connect', () => {
    it('should invoke connect on underlying connection', () => {
      const clientId = 'TEST_CLIENT_ID';
      const connectionId = 'TEST_CONNECTION_ID';
      const port = createPort();

      sut.connectClient(clientId, connectionId, port);

      const client = sut.getClientConnection(clientId) as ConnectableConnection;
      expect(client.connect).toHaveBeenCalledWith(port, connectionId);
    });

    it('should invoke callback', () => {
      const clientId = 'TEST_CLIENT_ID';
      const connectionId = 'TEST_CONNECTION_ID';
      const port = createPort();
      const connectCallback = jasmine.createSpy();

      sut.onClientConnected(connectCallback);
      sut.connectClient(clientId, connectionId, port);

      expect(connectCallback).toHaveBeenCalledWith(clientId);
    });

    it('should not invoke callback if unsubscribed', () => {
      const clientId = 'TEST_CLIENT_ID';
      const connectionId = 'TEST_CONNECTION_ID';
      const port = createPort();
      const connectCallback1 = jasmine.createSpy();
      const connectCallback2 = jasmine.createSpy();

      const unsubscribe1 = sut.onClientConnected(connectCallback1);
      sut.onClientConnected(connectCallback2);
      unsubscribe1();
      sut.connectClient(clientId, connectionId, port);

      expect(connectCallback1).not.toHaveBeenCalled();
      expect(connectCallback2).toHaveBeenCalled();
    });

    it('should disconnect existing connection if that is established', () => {
      const clientId = 'TEST_CLIENT_ID';
      const connectionIdOld = 'TEST_CONNECTION_OLD_ID';
      const connectionIdNew = 'TEST_CONNECTION_NEW_ID';
      const port = createPort();
      const connection = sut.getClientConnection(clientId) as Writable<ConnectableConnection>;
      connection.state = { kind: 'connected', connectionId: connectionIdOld };

      sut.connectClient(clientId, connectionIdNew, port);

      expect(connection.disconnect).toHaveBeenCalled();
    });

    it('should not disconnect existing connection if that is not established', () => {
      const clientId = 'TEST_CLIENT_ID';
      const connectionId = 'TEST_CONNECTION_ID';
      const port = createPort();
      const connection = sut.getClientConnection(clientId) as Writable<ConnectableConnection>;
      connection.state = { kind: 'disconnected' };

      sut.connectClient(clientId, connectionId, port);

      expect(connection.disconnect).not.toHaveBeenCalled();
    });

    it('should raise event about closing existing connection if that is established', () => {
      const clientId = 'TEST_CLIENT_ID';
      const connectionIdOld = 'TEST_CONNECTION_OLD_ID';
      const connectionIdNew = 'TEST_CONNECTION_NEW_ID';
      const port = createPort();
      const connection = sut.getClientConnection(clientId) as Writable<ConnectableConnection>;
      connection.state = { kind: 'connected', connectionId: connectionIdOld };
      const disconnectedCallback = jasmine.createSpy();

      sut.onClientDisconnected(disconnectedCallback);
      sut.connectClient(clientId, connectionIdNew, port);

      expect(disconnectedCallback).toHaveBeenCalledWith(clientId);
    });
  });

  describe('disconnect', () => {
    it('should not invoke disconnect if current connectionId mismatches', () => {
      const clientId = 'TEST_CLIENT_ID';
      const connectionId = 'TEST_CONNECTION_ID';

      sut.disconnectClient(clientId, connectionId);

      const connection = sut.getClientConnection(clientId) as ConnectableConnection;
      expect(connection.disconnect).not.toHaveBeenCalled();
    });

    it('should disconnect connection if current connectionId matches', () => {
      const clientId = 'TEST_CLIENT_ID';
      const connectionId = 'TEST_CONNECTION_ID';
      const connection = sut.getClientConnection(clientId) as Writable<ConnectableConnection>;
      (connection.state = { kind: 'connected', connectionId }), sut.disconnectClient(clientId, connectionId);

      expect(connection.disconnect).toHaveBeenCalled();
    });

    it('should raise event when disconnecting', () => {
      const clientId = 'TEST_CLIENT_ID';
      const connectionId = 'TEST_CONNECTION_ID';
      const connection = sut.getClientConnection(clientId) as Writable<ConnectableConnection>;
      connection.state = { kind: 'connected', connectionId };
      const disconnectedCallback = jasmine.createSpy();

      sut.onClientDisconnected(disconnectedCallback);
      sut.disconnectClient(clientId, connectionId);

      expect(disconnectedCallback).toHaveBeenCalledWith(clientId);
    });

    it('should not raise disconnect event if unsubscribed', () => {
      const clientId = 'TEST_CLIENT_ID';
      const connectionId = 'TEST_CONNECTION_ID';
      const connection = sut.getClientConnection(clientId) as Writable<ConnectableConnection>;
      connection.state = { kind: 'connected', connectionId };
      const disconnectedCallback = jasmine.createSpy();

      const unsubscribe = sut.onClientDisconnected(disconnectedCallback);
      unsubscribe();
      sut.disconnectClient(clientId, connectionId);

      expect(disconnectedCallback).not.toHaveBeenCalledWith(clientId);
    });
  });
});
