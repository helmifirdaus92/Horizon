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
  GeneralLinkFieldMessagingService,
} from './general-link-field-messaging.service';
import { GeneralLinkValue } from './general-link.type';

const testValue: GeneralLinkValue = {
  linktype: 'external',
  text: 'text',
  class: 'className',
  title: 'title',
  url: 'http://url.rul',
};

describe('GeneralLinkFieldMessagingService', () => {
  let sut: GeneralLinkFieldMessagingService;
  let messaging: TestMessagingP2PChannelFromChannel<CanvasChannel>;
  let messagingRemoteRpc: any;
  let rhsMessaging: jasmine.SpyObj<RhsEditorMessaging>;

  beforeEach(() => {
    sut = new GeneralLinkFieldMessagingService();

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
      (messaging.remoteRpcImpl!.getValue as jasmine.Spy).and.returnValue(testValue);

      sut.init(rhsMessaging);

      await nextTick();
      expect(currentValueSpy.next).toHaveBeenCalledWith(testValue);
    });
  });

  describe('currentValue$', () => {
    it('should emit when canvas reconnects', fakeAsync(() => {
      const spyObserver = createSpyObserver();
      sut.currentValue$.subscribe(spyObserver);
      sut.init(rhsMessaging);
      tick();

      messagingRemoteRpc.getValue.and.returnValue(testValue);
      const onCanvasReconnectCallback = rhsMessaging.onReconnect.calls.mostRecent().args[0];
      onCanvasReconnectCallback();
      tick();

      expect(spyObserver.next).toHaveBeenCalledWith(testValue);
      expect(spyObserver.next).toHaveBeenCalledTimes(2);
      flush();
    }));
  });

  it('should emit when messaging sends a new value', () => {
    const spy = jasmine.createSpy();
    sut.currentValue$.subscribe(spy);
    sut.init(rhsMessaging);

    messaging.dispatchEvent('value:change' as never, testValue as any);

    expect(spy).toHaveBeenCalledWith(testValue);
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
    const otherTestValue: GeneralLinkValue = {
      linktype: 'internal',
      text: 'text',
      class: 'className',
      title: 'title',
      item: { id: 'id', url: '/url', displayName: 'displayName' },
      anchor: '',
      querystring: 'querystring',
    };

    const spy = jasmine.createSpy();
    sut.currentValue$.subscribe(spy);
    sut.init(rhsMessaging);

    messaging.dispatchEvent('value:change' as never, testValue as any);
    messaging.dispatchEvent('value:change' as never, otherTestValue as any);

    expect(spy).toHaveBeenCalledWith(otherTestValue);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  describe('set()', () => {
    it('should forward the value to messaging setValue', () => {
      sut.init(rhsMessaging);
      sut.set(testValue);

      expect(messaging.remoteRpcImpl.setValue).toHaveBeenCalledWith(jasmine.objectContaining({ url: testValue.url }));
    });
  });
});
