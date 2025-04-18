/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { GlobalMessagingTesting } from 'app/testing/global-messaging-testing';
import { createSpyObserver } from 'app/testing/test.utils';
import { RhsPanelCotract } from 'sdk';
import { ExternalRhsPanelService } from './external-rhs-sliding-panel.service';

describe('ExternalRhsPanelService', () => {
  let sut: ExternalRhsPanelService;
  let messaging: GlobalMessagingTesting;
  beforeEach(() => {
    messaging = new GlobalMessagingTesting();
    sut = new ExternalRhsPanelService(messaging);
  });

  it('should be closed by first', () => {
    const spy = createSpyObserver();

    sut.panelState$.subscribe(spy);

    expect(spy.next).toHaveBeenCalledWith({ isOpen: false, key: '' });
  });

  it('should emit open state with key and header when call openPanel', () => {
    const spy = createSpyObserver();

    sut.openPanel('key1', 'header1');
    sut.panelState$.subscribe(spy);

    expect(spy.next).toHaveBeenCalledWith({ isOpen: true, key: 'key1', header: 'header1' });
  });

  it('should emit messaging event with key and header when call openPanel', () => {
    const messagingSpy = jasmine.createSpy();

    messaging.getEventReceiver(RhsPanelCotract).on('rhs-panel:open', messagingSpy);
    sut.openPanel('key1', 'header1');

    expect(messagingSpy).toHaveBeenCalledWith({ key: 'key1', header: 'header1' });
  });

  it('should not emit open state when panel is already opened', () => {
    const spy = createSpyObserver();

    sut.openPanel('key1', 'header1');
    sut.panelState$.subscribe(spy);
    sut.openPanel('key2', 'header2');

    expect(spy.next).toHaveBeenCalledTimes(1);
  });

  it('should emit closed state when closePanel is called', () => {
    const spy = createSpyObserver();

    sut.openPanel('key1', 'header1');
    sut.closePanel();
    sut.panelState$.subscribe(spy);

    expect(spy.next).toHaveBeenCalledWith({ isOpen: false, key: '' });
  });

  it('should emit messaging event when closePanel is called', () => {
    const messagingSpy = jasmine.createSpy();

    messaging.getEventReceiver(RhsPanelCotract).on('rhs-panel:close', messagingSpy);

    sut.openPanel('key1', 'header1');
    sut.closePanel();

    expect(messagingSpy).toHaveBeenCalledWith({ key: 'key1', header: 'header1' });
  });

  it('should open panel when it is opened from messaging', async () => {
    const rpc = await messaging.getRpc(RhsPanelCotract);
    const spy = createSpyObserver();

    rpc.openPanel({ key: 'key1', header: 'header1' });
    sut.panelState$.subscribe(spy);

    expect(spy.next).toHaveBeenCalledWith({ isOpen: true, key: 'key1', header: 'header1' });
  });

  it('should open panel when it is opened from messaging', async () => {
    const rpc = await messaging.getRpc(RhsPanelCotract);
    const spy = createSpyObserver();

    rpc.openPanel({ key: 'key1', header: 'header1' });
    rpc.closePanel();
    sut.panelState$.subscribe(spy);

    expect(spy.next).toHaveBeenCalledWith({ isOpen: false, key: '' });
  });
});
