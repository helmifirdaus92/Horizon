/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingP2PChannelDef } from '../public-interfaces';
import { Writable } from '../utils';
import { ConnectionEndpoint } from './connection-endpoint';
import { P2PConnection } from './p2p-connection';

interface TestInboundEvents {
  remote: number;
}

interface TestOutboundEvents {
  local: string;
  'local:void': void;
}

interface TestRemoteRpcServices {
  echo(value: string): string;
}

interface TestProvidedRpcServices {
  divide(x: number, y: number): number;
}

const testChannelDef: MessagingP2PChannelDef<
  TestInboundEvents,
  TestOutboundEvents,
  TestRemoteRpcServices,
  TestProvidedRpcServices
> = {
  name: 'test',
};

describe('P2PConnection', () => {
  let connectionEndpointSpy: jasmine.SpyObj<ConnectionEndpoint>;
  let sut: P2PConnection;

  beforeEach(() => {
    connectionEndpointSpy = jasmine.createSpyObj<ConnectionEndpoint>('ConnectionEndpoint', {
      connect: undefined,
      disconnect: undefined,
      emitEvent: undefined,
      syncEmitEvent: Promise.resolve(),
      onEvent: undefined,
      setRpcServicesImplementation: undefined,
      performRpcCall: Promise.resolve(),
    });
    sut = new P2PConnection(connectionEndpointSpy);
  });

  describe('channel', () => {
    it('should correctly proxy arguments for sendEvent', () => {
      const channel = sut.getChannel(testChannelDef);

      channel.emit('local', '42');

      expect(connectionEndpointSpy.emitEvent).toHaveBeenCalledWith(testChannelDef.name, 'local', '42');
    });

    it('should pass undefined for event without arg', () => {
      const channel = sut.getChannel(testChannelDef);

      channel.emit('local:void');

      expect(connectionEndpointSpy.emitEvent).toHaveBeenCalledWith(testChannelDef.name, 'local:void', undefined);
    });

    it('should correctly proxy arguments for syncSendEvent', () => {
      const channel = sut.getChannel(testChannelDef);

      channel.syncEmit('local', '42');

      expect(connectionEndpointSpy.syncEmitEvent).toHaveBeenCalledWith(testChannelDef.name, 'local', '42');
    });

    it('should pass undefined for sync event without arg', () => {
      const channel = sut.getChannel(testChannelDef);

      channel.syncEmit('local:void');

      expect(connectionEndpointSpy.syncEmitEvent).toHaveBeenCalledWith(testChannelDef.name, 'local:void', undefined);
    });

    it('should correctly proxy arguments for rpc implementation config', () => {
      const channel = sut.getChannel(testChannelDef);
      const impl = { divide: (x: number, y: number) => x / y };

      channel.setRpcServicesImpl(impl);

      expect(connectionEndpointSpy.setRpcServicesImplementation).toHaveBeenCalledWith(testChannelDef.name, impl as any);
    });

    it('should proxy arguments for subscription', () => {
      const channel = sut.getChannel(testChannelDef);
      const handler = jasmine.createSpy();

      channel.on('remote', handler);

      expect(connectionEndpointSpy.onEvent).toHaveBeenCalledWith(testChannelDef.name, 'remote', handler);
    });

    it('should proxy arguments for RPC call', () => {
      const channel = sut.getChannel(testChannelDef);

      channel.rpc.echo('42');

      expect(connectionEndpointSpy.performRpcCall).toHaveBeenCalledWith(testChannelDef.name, 'echo', ['42']);
    });

    it('should return state from underlying endpoint', () => {
      (connectionEndpointSpy as Writable<ConnectionEndpoint>).state = {
        kind: 'connected',
        connectionId: 'random test connection id',
      };

      expect(sut.state).toEqual({ kind: 'connected', connectionId: 'random test connection id' });
    });
  });
});
