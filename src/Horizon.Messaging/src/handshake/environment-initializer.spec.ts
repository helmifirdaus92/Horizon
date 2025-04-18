/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ConnectableConnection } from '../connection/connectable-connection';
import { NativeMessagingPort } from '../connection/messaging-ports';
import { ConnectionRequestFilter } from '../public-interfaces';
import { ShutdownListener } from '../shutdown/shutdown-listener';
import { Writable } from '../utils';
import { ConfigurableHost, EnvironmentInitializer } from './environment-initializer';
import { HandshakeMessageHandler, HandshakeTrasport } from './handshake-interfaces';
import { HandshakeMessage, IncomingHandshakeMessage } from './message-types';

// tslint:disable: no-non-null-assertion
// tslint:disable: max-classes-per-file

class TestHandshakeTransport implements HandshakeTrasport {
  collectedMessages: HandshakeMessage[] = [];
  private readonly _subscribers: HandshakeMessageHandler[] = [];

  postMessage(message: HandshakeMessage): void {
    this.collectedMessages.push(message);
  }

  onMessage(handler: HandshakeMessageHandler): void {
    this._subscribers.push(handler);
  }

  dispatchMessage(msg: IncomingHandshakeMessage, onReply?: (msg: HandshakeMessage) => void) {
    const replyCallback = onReply ?? (() => {});
    this._subscribers.forEach((subscriber) => subscriber(msg, replyCallback));
  }
}

class TestShutdownListener implements ShutdownListener {
  private readonly _handlers: Array<() => void> = [];

  onShutdown(handler: () => void): void {
    this._handlers.push(handler);
  }

  raiseShutdown() {
    this._handlers.forEach((h) => h());
  }
}

describe('EnvironmentInitializer', () => {
  let transport: TestHandshakeTransport;
  let sut: EnvironmentInitializer;
  const TEST_HOST_NAME = 'TEST_HOST_NAME';
  const TEST_CLIENT_ID = 'TEST_CLIENT_ID';
  const RETRY_INTERVAL_MS = 250;
  const TEST_ORIGIN = 'http://test.com';

  beforeEach(() => {
    transport = new TestHandshakeTransport();
    sut = new EnvironmentInitializer(transport, TEST_HOST_NAME);
  });

  describe('host setup', () => {
    it('should notify host about incoming connection', () => {
      const host = jasmine.createSpyObj<ConfigurableHost>('host', ['connectClient']);
      const connectionId = 'TEST_CONNECTION_ID';
      const port = new MessageChannel().port1;

      sut.setupHost({ host });
      transport.dispatchMessage({
        type: 'HANDSHAKE_REQUEST',
        protocol: 'horizon_messaging_v3',
        hostName: TEST_HOST_NAME,
        clientId: TEST_CLIENT_ID,
        connectionId,
        port,
        origin: TEST_ORIGIN,
      });

      expect(host.connectClient).toHaveBeenCalledWith(TEST_CLIENT_ID, connectionId, jasmine.any(NativeMessagingPort));
    });

    it('should reply back with handshake reply', () => {
      const host = jasmine.createSpyObj<ConfigurableHost>('host', ['connectClient']);
      const connectionId = 'TEST_CONNECTION_ID';
      const port = new MessageChannel().port1;
      let receivedReply: HandshakeMessage | undefined;

      sut.setupHost({ host });
      transport.dispatchMessage(
        {
          type: 'HANDSHAKE_REQUEST',
          protocol: 'horizon_messaging_v3',
          hostName: TEST_HOST_NAME,
          clientId: TEST_CLIENT_ID,
          connectionId,
          port,
          origin: TEST_ORIGIN,
        },
        (reply) => (receivedReply = reply),
      );

      expect(receivedReply).toBeTruthy();
      expect(receivedReply!.type).toBe('HANDSHAKE_ACCEPT');
      expect(receivedReply!.clientId).toBe(TEST_CLIENT_ID);
      expect(receivedReply!.connectionId).toBe(connectionId);
    });

    it('should disconnect on message', () => {
      const host = jasmine.createSpyObj<ConfigurableHost>('host', ['disconnectClient']);
      const connectionId = 'TEST_CONNECTION_ID';

      sut.setupHost({ host });
      transport.dispatchMessage({
        type: 'DISCONNECT',
        protocol: 'horizon_messaging_v3',
        hostName: TEST_HOST_NAME,
        clientId: TEST_CLIENT_ID,
        connectionId,
        origin: TEST_ORIGIN,
      });

      expect(host.disconnectClient).toHaveBeenCalledWith(TEST_CLIENT_ID, connectionId);
    });

    it('should not accept handshake if port is not specified', () => {
      const host = jasmine.createSpyObj<ConfigurableHost>('host', ['connectClient']);
      const connectionId = 'TEST_CONNECTION_ID';
      const replyCallback = jasmine.createSpy();

      sut.setupHost({ host });
      transport.dispatchMessage(
        {
          type: 'HANDSHAKE_REQUEST',
          protocol: 'horizon_messaging_v3',
          hostName: TEST_HOST_NAME,
          clientId: TEST_CLIENT_ID,
          connectionId,
          origin: TEST_ORIGIN,
        },
        replyCallback,
      );

      expect(host.connectClient).not.toHaveBeenCalled();
      expect(replyCallback).not.toHaveBeenCalled();
    });

    describe('request connection filter', () => {
      it('should invoke filter on incoming requests', () => {
        const host = jasmine.createSpyObj<ConfigurableHost>({ connectClient: undefined });
        const connectionId = 'TEST_CONNECTION_ID';
        const replyCallback = jasmine.createSpy();
        const port = new MessageChannel().port1;
        const extras = { key: 'value' };
        const connectionRequestFilter = jasmine.createSpy<ConnectionRequestFilter>().and.returnValue('ACCEPT');

        sut.setupHost({ host, connectionRequestFilter });
        transport.dispatchMessage(
          {
            type: 'HANDSHAKE_REQUEST',
            protocol: 'horizon_messaging_v3',
            hostName: TEST_HOST_NAME,
            clientId: TEST_CLIENT_ID,
            connectionId,
            port,
            origin: TEST_ORIGIN,
            extras,
          },
          replyCallback,
        );

        expect(connectionRequestFilter).toHaveBeenCalled();
        const [requestInfo] = connectionRequestFilter.calls.mostRecent().args;
        expect(requestInfo.clientId).toBe(TEST_CLIENT_ID);
        expect(requestInfo.origin).toBe(TEST_ORIGIN);
        expect(requestInfo.extras).toBe(extras);
      });

      it('should accept handshake if filter ACCEPTs', () => {
        const host = jasmine.createSpyObj<ConfigurableHost>({ connectClient: undefined });
        const connectionId = 'TEST_CONNECTION_ID';
        const replyCallback = jasmine.createSpy();
        const port = new MessageChannel().port1;
        const connectionRequestFilter = jasmine.createSpy<ConnectionRequestFilter>().and.returnValue('ACCEPT');

        sut.setupHost({ host, connectionRequestFilter });
        transport.dispatchMessage(
          {
            type: 'HANDSHAKE_REQUEST',
            protocol: 'horizon_messaging_v3',
            hostName: TEST_HOST_NAME,
            clientId: TEST_CLIENT_ID,
            connectionId,
            port,
            origin: TEST_ORIGIN,
          },
          replyCallback,
        );

        expect(replyCallback).toHaveBeenCalled();
        expect(host.connectClient).toHaveBeenCalled();
      });

      it('should skip handshake and reply nothing if filter IGNOREs', () => {
        const host = jasmine.createSpyObj<ConfigurableHost>({ connectClient: undefined });
        const connectionId = 'TEST_CONNECTION_ID';
        const port = new MessageChannel().port1;
        const replyCallback = jasmine.createSpy();
        const connectionRequestFilter = jasmine.createSpy<ConnectionRequestFilter>().and.returnValue('IGNORE_ATTEMPT');

        sut.setupHost({ host, connectionRequestFilter });
        transport.dispatchMessage(
          {
            type: 'HANDSHAKE_REQUEST',
            protocol: 'horizon_messaging_v3',
            hostName: TEST_HOST_NAME,
            clientId: TEST_CLIENT_ID,
            connectionId,
            port,
            origin: TEST_ORIGIN,
          },
          replyCallback,
        );

        expect(replyCallback).not.toHaveBeenCalled();
        expect(host.connectClient).not.toHaveBeenCalled();
      });

      it('should reply with reject if filter REJECTs', () => {
        const host = jasmine.createSpyObj<ConfigurableHost>({ connectClient: undefined });
        const connectionId = 'TEST_CONNECTION_ID';
        const port = new MessageChannel().port1;
        const replyCallback = jasmine.createSpy<(msg: HandshakeMessage) => void>();
        const connectionRequestFilter = jasmine.createSpy<ConnectionRequestFilter>().and.returnValue('REJECT');

        sut.setupHost({ host, connectionRequestFilter });
        transport.dispatchMessage(
          {
            type: 'HANDSHAKE_REQUEST',
            protocol: 'horizon_messaging_v3',
            hostName: TEST_HOST_NAME,
            clientId: TEST_CLIENT_ID,
            connectionId,
            port,
            origin: TEST_ORIGIN,
          },
          replyCallback,
        );

        expect(host.connectClient).not.toHaveBeenCalled();
        expect(replyCallback).toHaveBeenCalled();
        const [msg] = replyCallback.calls.mostRecent().args;
        expect(msg.type).toBe('HANDSHAKE_REJECT');
        expect(msg.clientId).toBe(TEST_CLIENT_ID);
        expect(msg.hostName).toBe(TEST_HOST_NAME);
        expect(msg.connectionId).toBe(connectionId);
      });
    });
  });

  describe('client setup', () => {
    let shutdownListener: TestShutdownListener;

    beforeEach(() => {
      jasmine.clock().install();

      shutdownListener = new TestShutdownListener();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should send handshake immediately', () => {
      const connection = jasmine.createSpyObj<ConnectableConnection>('client', ['connect']);

      sut.setupClient({
        connection,
        clientId: TEST_CLIENT_ID,
        retryIntervalMs: RETRY_INTERVAL_MS,
        shutdownListener,
      });

      expect(transport.collectedMessages.length).toBe(1);
      const [msg] = transport.collectedMessages;
      expect(msg.type).toBe('HANDSHAKE_REQUEST');
    });

    it('should retry handshake after interval', () => {
      const connection = jasmine.createSpyObj<ConnectableConnection>('client', ['connect']);

      sut.setupClient({
        connection,
        clientId: TEST_CLIENT_ID,
        retryIntervalMs: RETRY_INTERVAL_MS,
        shutdownListener,
      });
      jasmine.clock().tick(RETRY_INTERVAL_MS);
      jasmine.clock().tick(RETRY_INTERVAL_MS);

      expect(transport.collectedMessages.length).toBe(3);
    });

    it('should not send next handshake retry till interval', () => {
      const connection = jasmine.createSpyObj<ConnectableConnection>('client', ['connect']);

      sut.setupClient({
        connection,
        clientId: TEST_CLIENT_ID,
        retryIntervalMs: RETRY_INTERVAL_MS,
        shutdownListener,
      });
      jasmine.clock().tick(RETRY_INTERVAL_MS - 1);

      expect(transport.collectedMessages.length).toBe(1);
    });

    it('should use clientId in handshake', () => {
      const connection = jasmine.createSpyObj<ConnectableConnection>('client', ['connect']);

      sut.setupClient({
        connection,
        clientId: TEST_CLIENT_ID,
        retryIntervalMs: RETRY_INTERVAL_MS,
        shutdownListener,
      });

      const [msg] = transport.collectedMessages;
      expect(msg.clientId).toBe(TEST_CLIENT_ID);
    });

    it('should pass extras to message', () => {
      const connection = jasmine.createSpyObj<ConnectableConnection>('client', ['connect']);
      const extras = { key: 'value' };

      sut.setupClient({
        connection,
        clientId: TEST_CLIENT_ID,
        retryIntervalMs: RETRY_INTERVAL_MS,
        shutdownListener,
        extras,
      });

      const [msg] = transport.collectedMessages;
      expect(msg.extras).toBe(extras);
    });

    it('should pass nothing if no extras specified', () => {
      const connection = jasmine.createSpyObj<ConnectableConnection>('client', ['connect']);

      sut.setupClient({
        connection,
        clientId: TEST_CLIENT_ID,
        retryIntervalMs: RETRY_INTERVAL_MS,
        shutdownListener,
      });

      const [msg] = transport.collectedMessages;
      expect(msg.extras).not.toBeDefined();
    });

    it('should create new connection ID for each time', () => {
      const connection = jasmine.createSpyObj<ConnectableConnection>('client', ['connect']);

      sut.setupClient({
        connection,
        clientId: TEST_CLIENT_ID,
        retryIntervalMs: RETRY_INTERVAL_MS,
        shutdownListener,
      });
      jasmine.clock().tick(RETRY_INTERVAL_MS);

      const [msg1, msg2] = transport.collectedMessages;
      expect(msg1.connectionId).not.toBe(msg2.connectionId);
    });

    it('should create new port for each time', () => {
      const connection = jasmine.createSpyObj<ConnectableConnection>('client', ['connect']);

      sut.setupClient({
        connection,
        clientId: TEST_CLIENT_ID,
        retryIntervalMs: RETRY_INTERVAL_MS,
        shutdownListener,
      });
      jasmine.clock().tick(RETRY_INTERVAL_MS);

      const [msg1, msg2] = transport.collectedMessages;
      expect(msg1.port).toBeTruthy();
      expect(msg2.port).toBeTruthy();
      expect(msg1.port).not.toBe(msg2.port);
    });

    it('should connect client on first handshake reply', () => {
      const connection = jasmine.createSpyObj<ConnectableConnection>('client', ['connect']);

      sut.setupClient({
        connection,
        clientId: TEST_CLIENT_ID,
        retryIntervalMs: RETRY_INTERVAL_MS,
        shutdownListener,
      });
      const [msg] = transport.collectedMessages;
      transport.dispatchMessage({
        type: 'HANDSHAKE_ACCEPT',
        protocol: 'horizon_messaging_v3',
        hostName: msg.hostName,
        clientId: msg.clientId,
        connectionId: msg.connectionId,
        origin: TEST_ORIGIN,
      });

      expect(connection.connect).toHaveBeenCalled();
    });

    it('should stop sending handshakes after reply', () => {
      const connection = jasmine.createSpyObj<ConnectableConnection>('client', ['connect']);

      sut.setupClient({
        connection,
        clientId: TEST_CLIENT_ID,
        retryIntervalMs: RETRY_INTERVAL_MS,
        shutdownListener,
      });
      const [msg] = transport.collectedMessages;
      transport.dispatchMessage({
        type: 'HANDSHAKE_ACCEPT',
        protocol: 'horizon_messaging_v3',
        hostName: msg.hostName,
        clientId: msg.clientId,
        connectionId: msg.connectionId,
        origin: TEST_ORIGIN,
      });
      jasmine.clock().tick(RETRY_INTERVAL_MS);

      expect(transport.collectedMessages.length).toBe(1);
    });

    it('should connect client on subsequent handshake reply', () => {
      const connection = jasmine.createSpyObj<ConnectableConnection>('client', ['connect']);

      sut.setupClient({
        connection,
        clientId: TEST_CLIENT_ID,
        retryIntervalMs: RETRY_INTERVAL_MS,
        shutdownListener,
      });
      jasmine.clock().tick(RETRY_INTERVAL_MS + 1);
      const [_, msg] = transport.collectedMessages;
      transport.dispatchMessage({
        type: 'HANDSHAKE_ACCEPT',
        protocol: 'horizon_messaging_v3',
        hostName: msg.hostName,
        clientId: msg.clientId,
        connectionId: msg.connectionId,
        origin: TEST_ORIGIN,
      });

      expect(connection.connect).toHaveBeenCalled();
    });

    it('should ignore first handshake reply if new one is raised', () => {
      const connection = jasmine.createSpyObj<ConnectableConnection>('client', ['connect']);

      sut.setupClient({
        connection,
        clientId: TEST_CLIENT_ID,
        retryIntervalMs: RETRY_INTERVAL_MS,
        shutdownListener,
      });
      jasmine.clock().tick(RETRY_INTERVAL_MS + 1);
      const [msg, _] = transport.collectedMessages;
      transport.dispatchMessage({
        type: 'HANDSHAKE_ACCEPT',
        protocol: 'horizon_messaging_v3',
        hostName: msg.hostName,
        clientId: msg.clientId,
        connectionId: msg.connectionId,
        origin: TEST_ORIGIN,
      });

      expect(connection.connect).not.toHaveBeenCalled();
    });

    it('should ignore handshake reply if clientId mismatches', () => {
      const connection = jasmine.createSpyObj<ConnectableConnection>('client', ['connect']);

      sut.setupClient({
        connection,
        clientId: TEST_CLIENT_ID,
        retryIntervalMs: RETRY_INTERVAL_MS,
        shutdownListener,
      });
      const [msg] = transport.collectedMessages;
      transport.dispatchMessage({
        type: 'HANDSHAKE_ACCEPT',
        protocol: 'horizon_messaging_v3',
        hostName: TEST_HOST_NAME,
        clientId: 'OTHER_CLIENT_ID',
        connectionId: msg.connectionId,
        origin: TEST_ORIGIN,
      });
      jasmine.clock().tick(RETRY_INTERVAL_MS + 1);

      expect(connection.connect).not.toHaveBeenCalled();
      expect(transport.collectedMessages.length).toBe(2);
    });

    it('should ignore handshake reply if connectionId mismatches', () => {
      const connection = jasmine.createSpyObj<ConnectableConnection>('client', ['connect']);

      sut.setupClient({
        connection,
        clientId: TEST_CLIENT_ID,
        retryIntervalMs: RETRY_INTERVAL_MS,
        shutdownListener,
      });
      const [msg] = transport.collectedMessages;
      transport.dispatchMessage({
        type: 'HANDSHAKE_ACCEPT',
        protocol: 'horizon_messaging_v3',
        hostName: TEST_HOST_NAME,
        clientId: msg.clientId,
        connectionId: 'WRONG_CONNECTION_ID',
        origin: TEST_ORIGIN,
      });
      jasmine.clock().tick(RETRY_INTERVAL_MS + 1);

      expect(connection.connect).not.toHaveBeenCalled();
      expect(transport.collectedMessages.length).toBe(2);
    });

    it('should disconnect client on DISCONNNECT message', () => {
      const connection = jasmine.createSpyObj<ConnectableConnection>('client', ['connect', 'disconnect']);

      sut.setupClient({
        connection,
        clientId: TEST_CLIENT_ID,
        retryIntervalMs: RETRY_INTERVAL_MS,
        shutdownListener,
      });
      const [msg] = transport.collectedMessages;
      transport.dispatchMessage({
        type: 'HANDSHAKE_ACCEPT',
        protocol: 'horizon_messaging_v3',
        hostName: TEST_HOST_NAME,
        clientId: msg.clientId,
        connectionId: msg.connectionId,
        origin: TEST_ORIGIN,
      });
      transport.dispatchMessage({
        type: 'DISCONNECT',
        protocol: 'horizon_messaging_v3',
        hostName: TEST_HOST_NAME,
        clientId: TEST_CLIENT_ID,
        connectionId: msg.connectionId,
        origin: TEST_ORIGIN,
      });

      expect(connection.disconnect).toHaveBeenCalled();
    });

    it('should not disconnect client if connectionId is wrong', () => {
      const connection = jasmine.createSpyObj<ConnectableConnection>('client', ['connect', 'disconnect']);

      sut.setupClient({
        connection,
        clientId: TEST_CLIENT_ID,
        retryIntervalMs: RETRY_INTERVAL_MS,
        shutdownListener,
      });
      const [msg] = transport.collectedMessages;
      transport.dispatchMessage({
        type: 'HANDSHAKE_ACCEPT',
        protocol: 'horizon_messaging_v3',
        hostName: TEST_HOST_NAME,
        clientId: msg.clientId,
        connectionId: msg.connectionId,
        origin: TEST_ORIGIN,
      });
      transport.dispatchMessage({
        type: 'DISCONNECT',
        protocol: 'horizon_messaging_v3',
        hostName: TEST_HOST_NAME,
        clientId: TEST_CLIENT_ID,
        connectionId: 'WRONG_CONNECTIN_ID',
        origin: TEST_ORIGIN,
      });

      expect(connection.disconnect).not.toHaveBeenCalled();
    });

    describe('shutdown', () => {
      it('should send disconnect message if connection is established', () => {
        const connection = jasmine.createSpyObj<ConnectableConnection>('client', ['connect', 'disconnect']);

        sut.setupClient({
          connection,
          clientId: TEST_CLIENT_ID,
          retryIntervalMs: RETRY_INTERVAL_MS,
          shutdownListener,
        });
        const [handshakeMsg] = transport.collectedMessages.splice(0);
        (connection as Writable<ConnectableConnection>).state = {
          kind: 'connected',
          connectionId: handshakeMsg.connectionId,
        };
        shutdownListener.raiseShutdown();

        const [msg] = transport.collectedMessages;
        expect(msg.type).toBe('DISCONNECT');
        expect(msg.hostName).toBe(TEST_HOST_NAME);
        expect(msg.clientId).toBe(TEST_CLIENT_ID);
        expect(msg.connectionId).toBe(handshakeMsg.connectionId);
      });

      it('should not send disconnect message if connection is not established', () => {
        const connection = jasmine.createSpyObj<ConnectableConnection>('client', ['connect', 'disconnect']);

        (connection as Writable<ConnectableConnection>).state = { kind: 'disconnected' };
        sut.setupClient({
          connection,
          clientId: TEST_CLIENT_ID,
          retryIntervalMs: RETRY_INTERVAL_MS,
          shutdownListener,
        });
        shutdownListener.raiseShutdown();

        expect(connection.disconnect).not.toHaveBeenCalled();
      });
    });
  });
});
