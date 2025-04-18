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
import {
  CanvasChannel,
  CanvasChannelDef,
  ImageFieldMessagingService,
  MediaValue,
  isSameValue,
} from './image-field-messaging.service';

const canvasTestValue: MediaValue = {
  rawValue: `<image mediaid='123' />`,
  src: 'http://et.cetera',
};

const otherCanvasTestValue: MediaValue = {
  rawValue: `<image mediaid='321' />`,
  src: 'http://et.cetera.new',
};

describe('ImageFieldMessagingService', () => {
  let sut: ImageFieldMessagingService;
  let messaging: TestMessagingP2PChannelFromChannel<CanvasChannel>;
  let messagingRemoteRpc: any;
  let rhsMessaging: jasmine.SpyObj<RhsEditorMessaging>;

  beforeEach(() => {
    sut = new ImageFieldMessagingService();

    messagingRemoteRpc = jasmine.createSpyObj('RPC', ['setValue', 'clearValue', 'getValue']);
    messaging = makeTestMessagingP2PChannelFromDef(CanvasChannelDef, messagingRemoteRpc);

    rhsMessaging = jasmine.createSpyObj<RhsEditorMessaging>('messaging', {
      getChannel: messaging as any,
      onReconnect: undefined,
    });
    rhsMessaging.onReconnect.and.callFake((callback) => callback());
  });

  describe('init()', () => {
    it('should subscribe to the "value:change" event', () => {
      expect(messaging.getEventSubscribers('value:change' as never).length).toBe(0);

      sut.init(rhsMessaging);

      expect(messaging.getEventSubscribers('value:change' as never).length).toBe(1);
    });

    it('should get initial value via RPC call', async () => {
      const currentValueSpy = createSpyObserver();
      sut.currentValue$.subscribe(currentValueSpy);
      (messaging.remoteRpcImpl!.getValue as jasmine.Spy).and.returnValue(canvasTestValue);

      sut.init(rhsMessaging);

      await nextTick();
      expect(currentValueSpy.next).toHaveBeenCalledWith(
        jasmine.objectContaining({ rawValue: canvasTestValue.rawValue }),
      );
    });
  });

  describe('currentValue$', () => {
    it('should emit when canvas reconnects', fakeAsync(() => {
      const spy = jasmine.createSpy();
      sut.currentValue$.subscribe(spy);
      sut.init(rhsMessaging);
      tick();

      messagingRemoteRpc.getValue.and.returnValue(canvasTestValue);
      const onCanvasReconnectCallback = rhsMessaging.onReconnect.calls.mostRecent().args[0];
      onCanvasReconnectCallback();
      tick();

      expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({ rawValue: canvasTestValue.rawValue }));
      expect(spy).toHaveBeenCalledTimes(2);
      flush();
    }));

    it('should emit when messaging sends a new value', () => {
      const spy = jasmine.createSpy();
      sut.currentValue$.subscribe(spy);
      sut.init(rhsMessaging);

      messaging.dispatchEvent('value:change' as never, canvasTestValue as any);

      expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({ rawValue: canvasTestValue.rawValue }));
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should emit null when messaging sends null value', () => {
      const spy = jasmine.createSpy();
      sut.currentValue$.subscribe(spy);
      sut.init(rhsMessaging);

      messaging.dispatchEvent('value:change' as never, null as any);

      expect(spy).toHaveBeenCalledWith(null);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should emit again when value changes', () => {
      const spy = jasmine.createSpy();
      sut.currentValue$.subscribe(spy);
      sut.init(rhsMessaging);

      messaging.dispatchEvent('value:change' as never, canvasTestValue as any);
      messaging.dispatchEvent('value:change' as never, otherCanvasTestValue as any);

      expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({ rawValue: canvasTestValue.rawValue }));
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should not re-emit when a new value is the same value', () => {
      const spy = jasmine.createSpy();
      sut.currentValue$.subscribe(spy);
      sut.init(rhsMessaging);

      messaging.dispatchEvent('value:change' as never, canvasTestValue as any);
      messaging.dispatchEvent('value:change' as never, canvasTestValue as any);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should parse mediaId value from rawValue', () => {
      const currentValueSpy = createSpyObserver();
      sut.currentValue$.subscribe(currentValueSpy);
      sut.init(rhsMessaging);

      messaging.dispatchEvent('value:change' as never, canvasTestValue as any);

      expect(currentValueSpy.next).toHaveBeenCalledWith(jasmine.objectContaining({ mediaId: '123' }));
    });
  });

  describe('set()', () => {
    it('should forward the value to messaging setValue', () => {
      sut.init(rhsMessaging);
      sut.set(canvasTestValue);

      expect(messaging.remoteRpcImpl.setValue).toHaveBeenCalledWith(
        jasmine.objectContaining({ rawValue: canvasTestValue.rawValue }),
      );
    });

    it('should normalize empty src to undefined', () => {
      sut.init(rhsMessaging);
      sut.set({ rawValue: '<image />', src: '' });

      const [canvasValue] = (messaging.remoteRpcImpl.setValue as jasmine.Spy).calls.mostRecent().args;
      expect(canvasValue.src).toBeUndefined();
    });
  });

  describe('clear()', () => {
    it('should call clearValue on messaging', () => {
      sut.init(rhsMessaging);
      sut.clear();

      expect(messaging.remoteRpcImpl.clearValue).toHaveBeenCalledTimes(1);
    });
  });
});

const valueWithMediaId: MediaValue = {
  rawValue: 'raw',
  src: 'http://et.cetera',
  mediaId: '123',
};
const otherValueWithMediaId: MediaValue = {
  rawValue: 'raw',
  src: 'http://et.cetera',
  mediaId: '321',
};

const valueWoMediaId: MediaValue = {
  rawValue: 'raw',
  src: 'http://et.cetera',
};
const otherValueWoMediaId: MediaValue = {
  rawValue: 'other',
  src: 'http://et.cetera',
};

describe('isSameValue()', () => {
  (
    [
      [valueWithMediaId, valueWithMediaId, true],
      [valueWithMediaId, otherValueWithMediaId, true],
      [valueWithMediaId, null, false],
      [valueWoMediaId, valueWoMediaId, true],
      [valueWoMediaId, otherValueWoMediaId, false],
      [valueWithMediaId, valueWoMediaId, true],
      [null, null, true],
    ] as Array<[MediaValue | null, MediaValue | null, boolean]>
  ).forEach(([x, y, result]) =>
    it(`should understand if ImageFieldValue is the same`, () => {
      expect(isSameValue(x, y))
        .withContext(`expected ${JSON.stringify(x)} isSameValue ${JSON.stringify(y)} tobe ${result}`)
        .toBe(result);
    }),
  );
});
