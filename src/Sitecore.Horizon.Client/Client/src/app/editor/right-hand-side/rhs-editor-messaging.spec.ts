/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */


import { fakeAsync, flush, tick } from '@angular/core/testing';
import {
  MessagingP2PChannelDef,
  MessagingPort,
  MessagingReconnectableP2PConnection,
} from '@sitecore/horizon-messaging';
import { Lifetime } from 'app/shared/utils/lifetime';
import { Mutable } from 'app/testing/test.utils';
import { RhsEditorMessagingReconnectable } from './rhs-editor-messaging';

describe(RhsEditorMessagingReconnectable.name, () => {
  let hrzMessagingSpy: jasmine.SpyObj<MessagingReconnectableP2PConnection>;
  let changePortFnSpy: jasmine.Spy;

  const testChannelDef: MessagingP2PChannelDef<{ 'test:event': string }, { 'test:event': string }, {}, {}> = {
    name: 'test-channel',
  };
  let lifetime: Lifetime;
  let sut: RhsEditorMessagingReconnectable;

  beforeEach(() => {
    hrzMessagingSpy = jasmine.createSpyObj<MessagingReconnectableP2PConnection>({
      getChannel: undefined,
      isEstablished: undefined,
      reconnect: undefined,
      disconnect: undefined,
      changePort: undefined,
    });
    // Workaround till spy supports properties.
    (hrzMessagingSpy as Mutable<MessagingReconnectableP2PConnection, 'isEstablished'>).isEstablished = false;
    changePortFnSpy = jasmine.createSpy('changePort');
    sut = new RhsEditorMessagingReconnectable(hrzMessagingSpy, changePortFnSpy);
    lifetime = new Lifetime();
  });

  it('should call getChannel of underlying messaging when getChannel is called', () => {
    sut.getChannel(testChannelDef);

    expect(hrzMessagingSpy.getChannel).toHaveBeenCalledOnceWith(testChannelDef);
  });

  it('should call changePort of underlying messaging when changeRemotePeer is called', () => {
    const newPeerChromeId = 'newPeerChromeId';
    const newMessagingPort = {} as MessagingPort;
    changePortFnSpy.and.returnValue(newMessagingPort);

    sut.changeRemotePeer(newPeerChromeId);

    expect(changePortFnSpy).toHaveBeenCalledOnceWith(newPeerChromeId);
    expect(hrzMessagingSpy.changePort).toHaveBeenCalledOnceWith(newMessagingPort);
  });

  it('should disconnect from underlying messaging when destroy is called', fakeAsync(() => {
    sut.destroy();
    tick(100);

    expect(hrzMessagingSpy.disconnect).toHaveBeenCalled();
    flush();
  }));

  describe('reconnect', () => {
    it('should execute provided callbacks when provided Lifetime is alive', () => {
      const callbackSpy = jasmine.createSpy('callback');

      sut.onReconnect(callbackSpy, lifetime);
      sut.reconnect();

      expect(hrzMessagingSpy.reconnect).toHaveBeenCalled();
      expect(callbackSpy).toHaveBeenCalledTimes(1);
    });

    it('should not execute provided callbacks when provided Lifetime is not alive', () => {
      const callbackSpy = jasmine.createSpy('callback');

      sut.onReconnect(callbackSpy, lifetime);
      lifetime.dispose();
      sut.reconnect();

      expect(hrzMessagingSpy.reconnect).toHaveBeenCalled();
      expect(callbackSpy).not.toHaveBeenCalled();
    });
  });
});
