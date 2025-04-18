/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingBroadcastChannelDef } from '../public-interfaces';
import { Writable } from '../utils';
import { BroadcastRecipientConnection } from './broadcast-recipient-connection';
import { ConnectionEndpoint } from './connection-endpoint';
import { createEntangledMessagingPorts } from './messaging-ports';

interface TestEvents {
  event: string;
}

interface TestRpcServices {
  echo(value: string): string;
}

const testChannelDef: MessagingBroadcastChannelDef<TestEvents, TestRpcServices> = {
  name: 'test',
};

describe('BroadcastRecipientConnection', () => {
  let disconnectCallback: jasmine.Spy;
  let endpoint: jasmine.SpyObj<ConnectionEndpoint>;
  let sut: BroadcastRecipientConnection;

  beforeEach(() => {
    disconnectCallback = jasmine.createSpy();
    endpoint = jasmine.createSpyObj<ConnectionEndpoint>('endpoint', {
      onEvent: undefined,
      performRpcCall: Promise.resolve(),
      connect: undefined,
      disconnect: undefined,
    });

    sut = new BroadcastRecipientConnection(endpoint, disconnectCallback);
  });

  describe('connect/disconnect', () => {
    it('should connect underlying connection on connect', () => {
      const [port] = createEntangledMessagingPorts();

      sut.connect(port, 'test connection id');

      expect(endpoint.connect).toHaveBeenCalledWith(port, 'test connection id');
    });

    it('should call disconnect callback on disconnect', () => {
      (endpoint as Writable<ConnectionEndpoint>).state = { kind: 'connected', connectionId: 'test conn id' };

      sut.disconnect();

      expect(disconnectCallback).toHaveBeenCalled();
      expect(endpoint.disconnect).toHaveBeenCalled();
    });

    it('should not call disconnect callback if is not connected', () => {
      (endpoint as Writable<ConnectionEndpoint>).state = { kind: 'disconnected' };

      sut.disconnect();

      expect(disconnectCallback).not.toHaveBeenCalled();
      expect(endpoint.disconnect).not.toHaveBeenCalled();
    });
  });

  describe('client channel', () => {
    it('should subscribe to underlying endpoint', () => {
      const channel = sut.getChannel(testChannelDef);
      const handler = jasmine.createSpy();

      channel.on('event', handler);

      expect(endpoint.onEvent).toHaveBeenCalledWith(testChannelDef.name, 'event', handler);
    });

    it('should proxy RPC calls to underlying endpoint', () => {
      const channel = sut.getChannel(testChannelDef);

      channel.rpc.echo('some input');

      expect(endpoint.performRpcCall).toHaveBeenCalledWith(testChannelDef.name, 'echo', ['some input']);
    });
  });
});
