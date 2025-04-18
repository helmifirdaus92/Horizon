/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingP2PConnection } from '@sitecore/horizon-messaging';
import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import { BeaconChannelDef, EditingChannelDef } from './horizon-canvas.contract.defs';
import {
  BeaconCanvasEvents,
  BeaconCanvasRpcServices,
  BeaconHorizonEvents,
  BeaconHorizonRpcServices,
  BeaconState,
  ChromeRhsMessage,
  EditingCanvasEvents,
  EditingCanvasRpcServices,
  EditingHorizonEvents,
  EditingHorizonRpcServices,
} from './horizon-canvas.contract.parts';
import { MessagingService } from './messaging-service';

describe('MessagingService', () => {
  let sut: MessagingService;
  let editingChannel: TestMessagingP2PChannel<
    EditingHorizonEvents,
    EditingCanvasEvents,
    EditingHorizonRpcServices,
    EditingCanvasRpcServices
  >;
  let beaconChannel: TestMessagingP2PChannel<BeaconHorizonEvents, BeaconCanvasEvents, BeaconHorizonRpcServices, BeaconCanvasRpcServices>;
  let getItemPermissionsSpy: jasmine.Spy;
  let selectMediaSpy: jasmine.Spy;
  let getPageFlowsSpy: jasmine.Spy;
  let getAbTestConfigStatusSpy: jasmine.Spy;

  beforeEach(() => {
    getItemPermissionsSpy = jasmine.createSpy();
    selectMediaSpy = jasmine.createSpy();

    getPageFlowsSpy = jasmine.createSpy();
    getAbTestConfigStatusSpy = jasmine.createSpy();

    editingChannel = makeTestMessagingP2PChannelFromDef(EditingChannelDef, {
      reloadCanvas: () => {},
      getItemPermissions: (): any => {
        return getItemPermissionsSpy();
      },
      selectMedia: (): any => {
        return selectMediaSpy();
      },
      editSourceCode: (): any => {},
      addPhoneNumber: (): any => {},
      getPageFlows: () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return getPageFlowsSpy();
      },
      getAbTestConfigStatus() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return getAbTestConfigStatusSpy();
      },
      promptSelectPage: (): any => {},
      setRenderingParams: (): any => {},
    });
    beaconChannel = makeTestMessagingP2PChannelFromDef(BeaconChannelDef, {});
    const hostSpy = jasmine.createSpyObj<MessagingP2PConnection>('MessagingConnection', ['getChannel']);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    hostSpy.getChannel.and.callFake((channelDef: any) => (({ editing: editingChannel, beacon: beaconChannel }) as any)[channelDef.name]);
    sut = new MessagingService(hostSpy);
  });

  it('should listen for messages from the channel', () => {
    const spy = jasmine.createSpy('message callback');
    sut.editingChannel.on('chrome:rhs:message', spy);
    const testPayload: ChromeRhsMessage = { chromeId: 'cid', msg: null };

    editingChannel.dispatchEvent('chrome:rhs:message', testPayload);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(testPayload);
  });

  it('should unsubscribe from events', () => {
    const spy = jasmine.createSpy('message callback');
    const testPayload: ChromeRhsMessage = { chromeId: 'cid', msg: null };

    const unsubscribe = sut.editingChannel.on('chrome:rhs:message', spy);
    unsubscribe();
    editingChannel.dispatchEvent('chrome:rhs:message', testPayload);

    expect(spy).not.toHaveBeenCalled();
  });

  it('should post beacon to channel', () => {
    const beaconMessage: BeaconState = { itemId: 'item', itemVersion: 1, language: 'lang', siteName: 'site', variant: undefined };

    sut.postBeacon(beaconMessage);

    const stateMessages = beaconChannel.getEmittedEvents('state');
    expect(stateMessages.length).toBe(1);
    expect(stateMessages[0]).toBe(beaconMessage);
  });
});
