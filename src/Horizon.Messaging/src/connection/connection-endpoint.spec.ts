/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingPort, RpcServicesImplementation } from '../public-interfaces';
import { nextTick } from '../utils';
import { ConnectionEndpoint } from './connection-endpoint';
import { createEntangledMessagingPorts, NativeMessagingPort } from './messaging-ports';

describe('ConnectionEndpoint', () => {
  let firstEndpoint: ConnectionEndpoint;
  let secondEndpoint: ConnectionEndpoint;
  let connectFirstConnection: () => void;
  let connectSecondConection: () => void;

  beforeEach(() => {
    const [port1, port2] = createEntangledMessagingPorts();
    firstEndpoint = new ConnectionEndpoint();
    connectFirstConnection = () => firstEndpoint.connect(port1, 'testId');

    secondEndpoint = new ConnectionEndpoint();
    connectSecondConection = () => secondEndpoint.connect(port2, 'testId');
  });

  describe('when connected', () => {
    beforeEach(() => {
      connectFirstConnection();
      connectSecondConection();
    });

    it('should return correct state', () => {
      expect(firstEndpoint.state).toEqual(jasmine.objectContaining({ kind: 'connected', connectionId: 'testId' }));
    });

    describe('events', () => {
      it('should emit raised event', async () => {
        const handler = jasmine.createSpy();
        firstEndpoint.onEvent('testChannel', 'second:event', handler);

        secondEndpoint.emitEvent('testChannel', 'second:event', 42);

        await nextTick();
        expect(handler).toHaveBeenCalledWith(42);
      });

      it('should serialize complex model', async () => {
        const handler = jasmine.createSpy();
        firstEndpoint.onEvent('testChannel', 'second:complexEvent', handler);

        secondEndpoint.emitEvent('testChannel', 'second:complexEvent', { firstName: 'Alex', secondName: 'Povar' });

        await nextTick();
        const [receivedValue] = handler.calls.mostRecent().args as [{ firstName: string; secondName: string }];
        expect(receivedValue.firstName).toBe('Alex');
        expect(receivedValue.secondName).toBe('Povar');
      });

      it('should invoke multiple handlers on event', async () => {
        const handler = jasmine.createSpy();
        firstEndpoint.onEvent('testChannel', 'second:event', handler);
        firstEndpoint.onEvent('testChannel', 'second:event', handler);

        secondEndpoint.emitEvent('testChannel', 'second:event', 42);

        await nextTick();
        expect(handler).toHaveBeenCalledTimes(2);
      });

      it('should invoke only handlers for the particular event', async () => {
        const event1Handler = jasmine.createSpy();
        firstEndpoint.onEvent('testChannel', 'second:event', event1Handler);
        const event2Handler = jasmine.createSpy();
        firstEndpoint.onEvent('testChannel', 'second:event2', event2Handler);

        secondEndpoint.emitEvent('testChannel', 'second:event', 42);

        await nextTick();
        expect(event1Handler).toHaveBeenCalled();
        expect(event2Handler).not.toHaveBeenCalled();
      });

      it('should not call handler after unsubscribe', async () => {
        const handler1 = jasmine.createSpy();
        const handler2 = jasmine.createSpy();
        const unsubscribe1 = firstEndpoint.onEvent('testChannel', 'second:event', handler1);
        firstEndpoint.onEvent('testChannel', 'second:event', handler2);
        unsubscribe1();

        secondEndpoint.emitEvent('testChannel', 'second:event', 42);

        await nextTick();
        expect(handler1).not.toHaveBeenCalled();
        expect(handler2).toHaveBeenCalled();
      });

      it('should route channels correctly', async () => {
        const handler1 = jasmine.createSpy();
        const handler2 = jasmine.createSpy();

        secondEndpoint.onEvent('testChannel', 'first:stringEvent', handler1);
        secondEndpoint.onEvent('testChannel', 'first:stringEvent', handler2);

        firstEndpoint.emitEvent('testChannel', 'first:stringEvent', 'CHANNEL_1_ARG');
        firstEndpoint.emitEvent('testChannel', 'first:stringEvent', 'CHANNEL_2_ARG');

        await nextTick();
        expect(handler1).toHaveBeenCalledWith('CHANNEL_1_ARG');
        expect(handler2).toHaveBeenCalledWith('CHANNEL_2_ARG');
      });

      describe('synchronous events', () => {
        it('should emit raised event', async () => {
          const handler = jasmine.createSpy();
          firstEndpoint.onEvent('testChannel', 'second:event', handler);

          secondEndpoint.syncEmitEvent('testChannel', 'second:event', 42);

          await nextTick();
          expect(handler).toHaveBeenCalledWith(42);
        });

        it('should return when there are no handlers', async () => {
          const result = secondEndpoint.syncEmitEvent('testChannel', 'second:event', 42);

          await expectAsync(result).toBeResolved();
        });

        it('should return when sync handlers returned', async () => {
          const handler1 = jasmine.createSpy();
          const handler2 = jasmine.createSpy();
          firstEndpoint.onEvent('testChannel', 'second:event', handler1);
          firstEndpoint.onEvent('testChannel', 'second:event', handler2);

          const result = secondEndpoint.syncEmitEvent('testChannel', 'second:event', 42);

          await expectAsync(result).toBeResolved();
        });

        it('should return when async handler is resolved', async () => {
          firstEndpoint.onEvent(
            'testChannel',
            'second:event',
            () => new Promise<void>((resolve) => setTimeout(resolve)),
          );

          const result = secondEndpoint.syncEmitEvent('testChannel', 'second:event', 42);

          await expectAsync(result).toBeResolved();
        });

        it('should fail when sync handler fails', async () => {
          firstEndpoint.onEvent('testChannel', 'second:event', () => {
            throw new Error('Custom error');
          });

          const result = secondEndpoint.syncEmitEvent('testChannel', 'second:event', 42);

          await expectAsync(result).toBeRejectedWith(Error('Event handler failed: Custom error'));
        });

        it('should fail if async handler fails', async () => {
          firstEndpoint.onEvent('testChannel', 'second:event', () => Promise.reject(new Error('Custom error')));

          const result = secondEndpoint.syncEmitEvent('testChannel', 'second:event', 42);

          await expectAsync(result).toBeRejectedWith(Error('Event handler failed: Custom error'));
        });

        it('should return first error if multiple async handlers fail', async () => {
          firstEndpoint.onEvent('testChannel', 'second:event', () => Promise.reject(new Error('Custom error 1')));
          firstEndpoint.onEvent('testChannel', 'second:event', () => Promise.reject(new Error('Custom error 2')));

          const result = secondEndpoint.syncEmitEvent('testChannel', 'second:event', 42);

          await expectAsync(result).toBeRejectedWith(Error('Event handler failed: Custom error 1'));
        });
      });
    });

    describe('RPC', () => {
      it('should return result', async () => {
        firstEndpoint.setRpcServicesImplementation('testChannel', {
          echo: (val: string) => val,
          multiply: (a: number, b: number) => a * b,
        } as RpcServicesImplementation<any>);

        const result = await secondEndpoint.performRpcCall('testChannel', 'echo', ['42']);
        expect(result).toBe('42');
      });

      it('should pass correct `this` arg to service', async () => {
        const impl = {
          echoReply: 'forty two',

          echo() {
            return this.echoReply;
          },

          multiply(a: number, b: number) {
            return a * b;
          },
        };
        firstEndpoint.setRpcServicesImplementation('testChannel', impl as unknown as RpcServicesImplementation<any>);

        const result = await secondEndpoint.performRpcCall('testChannel', 'echo', ['42']);
        expect(result).toBe('forty two');
      });

      it('should wait for promise result', async () => {
        firstEndpoint.setRpcServicesImplementation('testChannel', {
          echo: (val: string) => new Promise<string>((resolve) => setTimeout(() => resolve(val), 1)),
          multiply: (a: number, b: number) => a * b,
        } as RpcServicesImplementation<any>);

        const result = await secondEndpoint.performRpcCall('testChannel', 'echo', ['42']);
        expect(result).toBe('42');
      });

      it('should send multiple arguments', async () => {
        firstEndpoint.setRpcServicesImplementation('testChannel', {
          echo: (val: string) => val,
          multiply: (x: number, y: number) => x * y,
        } as RpcServicesImplementation<any>);

        const result = await secondEndpoint.performRpcCall('testChannel', 'multiply', [21, 2]);
        expect(result).toBe(42);
      });

      it('should work in both directions', async () => {
        firstEndpoint.setRpcServicesImplementation('testChannel', {
          echo: (value: string) => value,
          multiply: (x: number, y: number) => x * y,
        } as RpcServicesImplementation<any>);
        secondEndpoint.setRpcServicesImplementation('testChannel', {
          multiply: (x: number, y: number) => x * y,
        } as RpcServicesImplementation<any>);

        const resultFromFirst = await secondEndpoint.performRpcCall('testChannel', 'echo', ['MSG_FROM_SIDE1']);
        const resultFromSecond = await firstEndpoint.performRpcCall('testChannel', 'multiply', [2, 3]);

        expect(resultFromFirst).toBe('MSG_FROM_SIDE1');
        expect(resultFromSecond).toBe(6);
      });

      it('should fail with meaningful error if service is not provided', async () => {
        firstEndpoint.setRpcServicesImplementation('testChannel', {
          echo: (value: string) => value,
        } as any);

        await expectAsync(secondEndpoint.performRpcCall('testChannel', 'multiply', [2, 3]))
          // tslint:disable-next-line: quotemark - it looks more readable
          .toBeRejectedWith(new Error("RPC service is not registered. Channel: 'testChannel', Method: 'multiply'"));
      });

      it('should return original thrown error', async () => {
        firstEndpoint.setRpcServicesImplementation('testChannel', {
          echo: () => {
            throw Error('Custom error');
          },
          multiply: (x: number, y: number) => x * y,
        } as RpcServicesImplementation<any>);

        await expectAsync(secondEndpoint.performRpcCall('testChannel', 'echo', ['42'])).toBeRejectedWith(
          Error('Custom error'),
        );
      });

      it('should return placeholder if original error cannot be serialized', async () => {
        firstEndpoint.setRpcServicesImplementation('testChannel', {
          echo: () => {
            throw 42;
          },
          multiply: (x: number, y: number) => x * y,
        } as RpcServicesImplementation<any>);

        await expectAsync(secondEndpoint.performRpcCall('testChannel', 'echo', ['42'])).toBeRejectedWith(
          Error('Unknown error'),
        );
      });
    });
  });

  describe('disconnect/reconnect behavior', () => {
    it('should deliver events once connected', async () => {
      connectFirstConnection();
      const handler = jasmine.createSpy();
      firstEndpoint.onEvent('testChannel', 'second:event', handler);
      await nextTick();

      secondEndpoint.emitEvent('testChannel', 'second:event', 42);
      secondEndpoint.emitEvent('testChannel', 'second:event', 24);
      await nextTick();
      connectSecondConection();

      await nextTick();
      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenCalledWith(42);
      expect(handler).toHaveBeenCalledWith(24);
    });

    it('should deliver events in _exactly_ same order', async () => {
      connectFirstConnection();
      const handler = jasmine.createSpy();
      firstEndpoint.onEvent('first', 'event', handler);
      firstEndpoint.onEvent('second', 'event', handler);
      firstEndpoint.onEvent('third', 'event', handler);
      await nextTick();

      secondEndpoint.emitEvent('first', 'event', 1);
      secondEndpoint.emitEvent('second', 'event', 2);
      secondEndpoint.emitEvent('second', 'event', 3);
      secondEndpoint.emitEvent('first', 'event', 4);
      secondEndpoint.emitEvent('third', 'event', 5);
      secondEndpoint.emitEvent('second', 'event', 6);
      await nextTick();
      connectSecondConection();

      await nextTick();
      expect(handler).toHaveBeenCalledTimes(6);
      expect(handler.calls.allArgs()).toEqual([[1], [2], [3], [4], [5], [6]]);
    });

    it('should resolve pending PRC calls once connected', async () => {
      connectFirstConnection();
      firstEndpoint.setRpcServicesImplementation('testChannel', {
        echo: (value: string) => value,
        multiply: (x: number, y: number) => x * y,
      } as RpcServicesImplementation<any>);

      const resultPromise = secondEndpoint.performRpcCall('testChannel', 'echo', ['42']);
      await nextTick();
      connectSecondConection();
      const result = await resultPromise;

      expect(result).toBe('42');
    });

    it('should drop ongoing RPC calls once disconnected', async () => {
      connectFirstConnection();
      firstEndpoint.setRpcServicesImplementation('testChannel', {
        echo: (value: string) =>
          new Promise<string>(() => {
            /* Promise which is never resolved */
          }),
        multiply: (x: number, y: number) => x * y,
      } as RpcServicesImplementation<any>);
      connectSecondConection();
      const resultPromise = secondEndpoint.performRpcCall('testChannel', 'echo', ['42']);

      secondEndpoint.disconnect();

      await expectAsync(resultPromise).toBeRejectedWith(Error('Underlying connection was unexpectedly closed.'));
    });

    it('should drop ongoing synchronous events calls once disconnected', async () => {
      connectFirstConnection();
      firstEndpoint.onEvent('testChannel', 'second:event', () => {
        return new Promise<void>(() => {
          /* Promise which is never resolved */
        });
      });
      connectSecondConection();
      const resultPromise = secondEndpoint.syncEmitEvent('testChannel', 'second:event', 42);

      secondEndpoint.disconnect();

      await expectAsync(resultPromise).toBeRejectedWith(Error('Underlying connection was unexpectedly closed.'));
    });

    it('should unsubscribe from port once disconnected', () => {
      const sut = new ConnectionEndpoint();
      const unsubscribeCallback = jasmine.createSpy();
      const port = jasmine.createSpyObj<MessagingPort>('port', { onMessage: unsubscribeCallback });

      sut.connect(port, 'connection id');
      expect(port.onMessage).toHaveBeenCalled();
      expect(unsubscribeCallback).not.toHaveBeenCalled();
      sut.disconnect();

      expect(unsubscribeCallback).toHaveBeenCalled();
    });

    it('should drop ongoing RPC calls once reconnected', async () => {
      connectFirstConnection();
      firstEndpoint.setRpcServicesImplementation('testChannel', {
        echo: (value: string) =>
          new Promise<string>(() => {
            /* Promise which is never resolved */
          }),
        multiply: (x: number, y: number) => x * y,
      } as RpcServicesImplementation<any>);
      connectSecondConection();
      const resultPromise = secondEndpoint.performRpcCall('testChannel', 'echo', ['42']);

      secondEndpoint.connect(new NativeMessagingPort(new MessageChannel().port1), 'connection id');

      await expectAsync(resultPromise).toBeRejectedWith(Error('Underlying connection was unexpectedly closed.'));
    });

    it('should drop ongoing synchronous events calls once reconnected', async () => {
      connectFirstConnection();
      firstEndpoint.onEvent('testChannel', 'second:event', () => {
        return new Promise<void>(() => {
          /* Promise which is never resolved */
        });
      });
      connectSecondConection();
      const resultPromise = secondEndpoint.syncEmitEvent('testChannel', 'second:event', 42);

      secondEndpoint.connect(new NativeMessagingPort(new MessageChannel().port1), 'connection id');

      await expectAsync(resultPromise).toBeRejectedWith(Error('Underlying connection was unexpectedly closed.'));
    });
  });
});
