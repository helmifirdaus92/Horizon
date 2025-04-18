/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ConnectionEndpoint } from '../connection/connection-endpoint';
import { createEntangledMessagingPorts } from '../connection/messaging-ports';
import { MessagingBroadcastChannelDef, MessagingPort } from '../public-interfaces';
import { nextTick } from '../utils';
import { BroadcastHost } from './broadcast-host';

interface TestEvents {
  event: string;
  'void-event': void;
}

interface TestRpcServices {
  echo(value: string): string;
}

const testChannelDef: MessagingBroadcastChannelDef<TestEvents, TestRpcServices> = {
  name: 'testCh',
};

describe('BroadcastHost', () => {
  let sut: BroadcastHost;

  beforeEach(() => {
    sut = new BroadcastHost();
  });

  describe('dynamic receiver', () => {
    it('should pass arguments for event call', async () => {
      const senderChannel = sut.getSenderChannel(testChannelDef);
      const channel = sut.registerRecipient().getChannel(testChannelDef);
      const handler = jasmine.createSpy();

      channel.on('event', handler);
      senderChannel.emit('event', 'some value');

      await nextTick();
      expect(handler).toHaveBeenCalledWith('some value');
    });

    it('should pass arguments for RPC call', async () => {
      const senderChannel = sut.getSenderChannel(testChannelDef);
      const channel = sut.registerRecipient().getChannel(testChannelDef);
      const echoImpl = jasmine.createSpy();
      senderChannel.setRpcServicesImpl({ echo: echoImpl });

      await channel.rpc.echo('42');

      expect(echoImpl).toHaveBeenCalledWith('42');
    });

    it('should create new recipient each time', () => {
      const recipient1 = sut.registerRecipient();
      const recipient2 = sut.registerRecipient();

      expect(recipient2).not.toBe(recipient1);
    });

    it('should call multiple event handlers', async () => {
      const senderChannel = sut.getSenderChannel(testChannelDef);
      const recipient1Ch = sut.registerRecipient().getChannel(testChannelDef);
      const recipient2Ch = sut.registerRecipient().getChannel(testChannelDef);
      const handler1 = jasmine.createSpy();
      const handler2 = jasmine.createSpy();

      recipient1Ch.on('event', handler1);
      recipient2Ch.on('event', handler2);
      senderChannel.emit('event', 'test value');

      await nextTick();
      expect(handler1).toHaveBeenCalledWith('test value');
      expect(handler2).toHaveBeenCalledWith('test value');
    });

    it('should not call recipient after disposal', async () => {
      const senderChannel = sut.getSenderChannel(testChannelDef);
      const recipient = sut.registerRecipient();
      const handler = jasmine.createSpy();

      recipient.getChannel(testChannelDef).on('event', handler);
      recipient.disconnect();
      senderChannel.emit('event', 'test value');

      await nextTick();
      expect(handler).not.toHaveBeenCalled();
    });

    it('should call connected callback on registration', () => {
      const connectedSpy = jasmine.createSpy();
      sut.onClientConnected(connectedSpy);

      sut.registerRecipient();

      expect(connectedSpy).toHaveBeenCalled();
    });

    it('should call disconnected callback on registration disposal', () => {
      const handler = jasmine.createSpy();
      sut.onClientDisconnected(handler);
      const recipient = sut.registerRecipient();

      recipient.disconnect();

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('remote client', () => {
    let clientEndpoint: ConnectionEndpoint;
    let clientPort: MessagingPort;

    beforeEach(() => {
      const [theirPort, oursPort] = createEntangledMessagingPorts();
      clientPort = theirPort;
      clientEndpoint = new ConnectionEndpoint();
      clientEndpoint.connect(oursPort, 'test connection id');
    });

    it('should call event handler', async () => {
      const senderChannel = sut.getSenderChannel(testChannelDef);
      sut.connectClient('test client', 'test connection id', clientPort);
      const handler = jasmine.createSpy();
      clientEndpoint.onEvent(testChannelDef.name, 'event', handler);

      senderChannel.emit('event', 'some test value');

      await nextTick();
      expect(handler).toHaveBeenCalledWith('some test value');
    });

    it('should allow to call RPC service', async () => {
      const senderChannel = sut.getSenderChannel(testChannelDef);
      senderChannel.setRpcServicesImpl({ echo: (val) => `REPLY: ${val}` });
      sut.connectClient('test client', 'test connection id', clientPort);

      const result = await clientEndpoint.performRpcCall(testChannelDef.name, 'echo', ['test value']);

      expect(result).toEqual('REPLY: test value');
    });

    it('should call multiple event handlers', async () => {
      const senderChannel = sut.getSenderChannel(testChannelDef);
      const endpoint2 = new ConnectionEndpoint();
      const [theirsPort2, oursPort2] = createEntangledMessagingPorts();
      endpoint2.connect(oursPort2, 'conn2');
      sut.connectClient('client1', 'conn1', clientPort);
      sut.connectClient('client2', 'conn2', theirsPort2);
      const handler1 = jasmine.createSpy();
      const handler2 = jasmine.createSpy();
      clientEndpoint.onEvent(testChannelDef.name, 'event', handler1);
      endpoint2.onEvent(testChannelDef.name, 'event', handler2);

      senderChannel.emit('event', 'test value to all');

      await nextTick();
      expect(handler1).toHaveBeenCalledWith('test value to all');
      expect(handler2).toHaveBeenCalledWith('test value to all');
    });

    it('should call callback on client connect', async () => {
      const handler = jasmine.createSpy();
      sut.onClientConnected(handler);

      sut.connectClient('test client', 'test conn', clientPort);

      expect(handler).toHaveBeenCalledWith('test client');
    });

    it('should call callback on client disconnect', async () => {
      const handler = jasmine.createSpy();
      sut.onClientDisconnected(handler);

      sut.connectClient('test client', 'test conn', clientPort);
      sut.disconnectClient('test client', 'test conn');

      expect(handler).toHaveBeenCalledWith('test client');
    });
  });
});
