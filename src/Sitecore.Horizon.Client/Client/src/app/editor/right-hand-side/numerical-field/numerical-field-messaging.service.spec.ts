/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, tick } from '@angular/core/testing';
import {
  TestMessagingP2PChannelFromChannel,
  makeTestMessagingP2PChannelFromDef,
} from '@sitecore/horizon-messaging/dist/testing';
import { createSpyObserver, nextTick } from 'app/testing/test.utils';
import { RhsEditorMessaging } from '../rhs-editor-messaging';
import { CanvasChannel, CanvasChannelDef, NumericalFieldMessagingService } from './numerical-field-messaging.service';

describe(NumericalFieldMessagingService.name, () => {
  let sut: NumericalFieldMessagingService;

  let messaging: TestMessagingP2PChannelFromChannel<CanvasChannel>;
  let messagingRemoteRpc: any;
  let rhsMessaging: jasmine.SpyObj<RhsEditorMessaging>;

  beforeEach(() => {
    sut = new NumericalFieldMessagingService();
    messagingRemoteRpc = jasmine.createSpyObj('RPC', ['setValue', 'clearValue', 'getValue']);
    messaging = makeTestMessagingP2PChannelFromDef(CanvasChannelDef, messagingRemoteRpc);

    rhsMessaging = jasmine.createSpyObj<RhsEditorMessaging>('messaging', {
      getChannel: messaging as any,
      onReconnect: undefined,
    });
    rhsMessaging.onReconnect.and.callFake((callback) => callback());
  });

  describe('init()', () => {
    it('should get initial value via RPC call', async () => {
      const currentValueSpy = createSpyObserver();
      sut.currentValue$.subscribe(currentValueSpy);
      (messaging.remoteRpcImpl!.getValue as jasmine.Spy).and.returnValue('1.1');

      sut.init(rhsMessaging);

      await nextTick();
      expect(currentValueSpy.next).toHaveBeenCalledWith('1.1');
    });
  });

  describe('currentValue$', () => {
    it('should emit when canvas reconnects', fakeAsync(() => {
      const spy = jasmine.createSpy();
      sut.currentValue$.subscribe(spy);
      sut.init(rhsMessaging);
      tick();

      messagingRemoteRpc.getValue.and.returnValue('1.23');
      const onCanvasReconnectCallback = rhsMessaging.onReconnect.calls.mostRecent().args[0];
      onCanvasReconnectCallback();
      tick();

      expect(spy).toHaveBeenCalledWith('1.23');
      expect(spy).toHaveBeenCalledTimes(2);
      flush();
    }));

    it('should emit when messaging sends a new value', () => {
      const spy = jasmine.createSpy();
      sut.currentValue$.subscribe(spy);
      sut.init(rhsMessaging);

      messaging.dispatchEvent('value:change' as never, '1.1' as any);

      expect(spy).toHaveBeenCalledWith('1.1');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should emit null when messaging sends null value', () => {
      const spy = jasmine.createSpy();
      sut.currentValue$.subscribe(spy);
      sut.init(rhsMessaging);

      messaging.dispatchEvent('value:change' as never, undefined);

      expect(spy).toHaveBeenCalledWith(null);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should emit again when value changes', () => {
      const spy = jasmine.createSpy();
      sut.currentValue$.subscribe(spy);
      sut.init(rhsMessaging);

      messaging.dispatchEvent('value:change' as never, '1.1' as any);
      messaging.dispatchEvent('value:change' as never, '1.2' as any);

      expect(spy).toHaveBeenCalledWith('1.1');
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should not re-emit when a new value is the same value', () => {
      const spy = jasmine.createSpy();
      sut.currentValue$.subscribe(spy);
      sut.init(rhsMessaging);

      messaging.dispatchEvent('value:change' as never, '1.1' as any);
      messaging.dispatchEvent('value:change' as never, '1.1' as any);

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('set()', () => {
    it('should forward the value to messaging setValue', () => {
      sut.init(rhsMessaging);
      sut.set('1.1');

      expect(messaging.remoteRpcImpl.setValue).toHaveBeenCalledWith('1.1');
    });
  });
});
