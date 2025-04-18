/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { GenericTestMessagingChannel } from './generic-test-messaging-channel';

interface InboundEvents {
  iEvent1: string;
  iEvent2: string;
}

interface OutboundEvents {
  oEvent1: string;
  oEvent2: string;
}

interface RemoteRpc {
  echo(value: string): string;
}

// tslint:disable-next-line: no-empty-interface - is required to describe the contract.
interface ProvidedRpc {}

describe('GenericTestMessagingChannel', () => {
  describe('eventing', () => {
    let sut: GenericTestMessagingChannel<InboundEvents, OutboundEvents, RemoteRpc, ProvidedRpc>;

    beforeEach(() => {
      sut = new GenericTestMessagingChannel<InboundEvents, OutboundEvents, RemoteRpc, ProvidedRpc>({
        echo: (val) => val,
      });
    });

    it('should collect received events', () => {
      sut.emit('oEvent1', 'arg1');
      sut.emit('oEvent2', 'arg1');
      sut.emit('oEvent1', 'arg2');

      const emittedEvent1 = sut.getEmittedEvents('oEvent1');
      expect(emittedEvent1).toEqual(['arg1', 'arg2']);
      const emittedEvent2 = sut.getEmittedEvents('oEvent2');
      expect(emittedEvent2).toEqual(['arg1']);
    });

    it('should collect received sync events', () => {
      sut.syncEmit('oEvent1', 'arg1');
      sut.syncEmit('oEvent2', 'arg1');
      sut.syncEmit('oEvent1', 'arg2');

      const emittedEvent1 = sut.getEmittedEvents('oEvent1');
      expect(emittedEvent1).toEqual(['arg1', 'arg2']);
      const emittedEvent2 = sut.getEmittedEvents('oEvent2');
      expect(emittedEvent2).toEqual(['arg1']);
    });

    it('should list subscribed handlers', () => {
      const event1Handler = jasmine.createSpy('event1Handler');
      const event2Handler = jasmine.createSpy('event2Handler');

      sut.on('iEvent1', event1Handler);
      sut.on('iEvent2', event2Handler);

      expect(
        sut.eventSubscribers.filter(({ eventName }) => eventName === 'iEvent1').map(({ handler }) => handler),
      ).toEqual([event1Handler]);
      expect(
        sut.eventSubscribers.filter(({ eventName }) => eventName === 'iEvent2').map(({ handler }) => handler),
      ).toEqual([event2Handler]);
    });

    it('should return subscribed handlers by event name', () => {
      const event1Handler = jasmine.createSpy('event1Handler');
      const event2Handler = jasmine.createSpy('event2Handler');
      const event3Handler = jasmine.createSpy('event3Handler');

      sut.on('iEvent1', event1Handler);
      sut.on('iEvent2', event2Handler);
      sut.on('iEvent1', event3Handler);

      expect(sut.getEventSubscribers('iEvent1')).toEqual([event1Handler, event3Handler]);
    });

    it('should invoke subscribed handlers', () => {
      const event1Handler = jasmine.createSpy();
      const event2Handler = jasmine.createSpy();

      sut.on('iEvent1', event1Handler);
      sut.on('iEvent2', event2Handler);
      sut.dispatchEvent('iEvent1', 'arg1');
      sut.dispatchEvent('iEvent2', 'arg2');

      expect(event1Handler).toHaveBeenCalledTimes(1);
      expect(event1Handler).toHaveBeenCalledWith('arg1');
      expect(event2Handler).toHaveBeenCalledTimes(1);
      expect(event2Handler).toHaveBeenCalledWith('arg2');
    });

    it('should not invoke unsubscribed handlers', () => {
      const event1Handler = jasmine.createSpy();
      const event2Handler = jasmine.createSpy();

      const unsubscribeEvent1 = sut.on('iEvent1', event1Handler);
      sut.on('iEvent2', event2Handler);
      unsubscribeEvent1();
      sut.dispatchEvent('iEvent1', 'arg1');

      expect(event1Handler).not.toHaveBeenCalled();
    });

    it('should await for deferred handlers', async () => {
      let resolveHandler: () => void = () => {};
      const handler = (input: string) => new Promise<void>((resolve) => (resolveHandler = resolve));

      sut.on('iEvent1', handler);
      const result = sut.dispatchEvent('iEvent1', 'arg1');

      let resolvedResult = false;
      result.then(() => (resolvedResult = true));
      expect(resolvedResult).toBeFalsy();
      resolveHandler();
      await expectAsync(result).toBeResolved();
      expect(resolvedResult).toBeTruthy();
    });
  });

  describe('rpc', () => {
    it('should invoke implementation', async () => {
      const sut = new GenericTestMessagingChannel<InboundEvents, OutboundEvents, RemoteRpc, ProvidedRpc>({
        echo: (val) => `${val}_REPLY`,
      });

      const result = await sut.rpc.echo('42');

      expect(result).toBe('42_REPLY');
    });

    it('should unwrap promise implementation', async () => {
      const sut = new GenericTestMessagingChannel<InboundEvents, OutboundEvents, RemoteRpc, ProvidedRpc>({
        echo: () => Promise.resolve('42'),
      });

      const result = await sut.rpc.echo('whatever');

      expect(result).toBe('42');
    });

    it('should return registered implementation', () => {
      const sut = new GenericTestMessagingChannel<InboundEvents, OutboundEvents, RemoteRpc, ProvidedRpc>({
        echo: () => '42',
      });
      const implementation = {};

      sut.setRpcServicesImpl(implementation);

      expect(sut.registeredRpcServicesImpl).toBe(implementation);
    });
  });
});
