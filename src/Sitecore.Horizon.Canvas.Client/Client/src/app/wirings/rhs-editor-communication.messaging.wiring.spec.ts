/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingP2PConnection } from '@sitecore/horizon-messaging';
import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import { ChromeManager } from '../chrome/chrome-manager';
import { EditingChannelDef } from '../messaging/horizon-canvas.contract.defs';
import {
  EditingCanvasEvents,
  EditingCanvasRpcServices,
  EditingHorizonEvents,
  EditingHorizonRpcServices,
} from '../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../messaging/messaging-service';
import { Writable } from '../utils/lang';
import { RhsEditorCommunicationMessagingWiring } from './rhs-editor-communication.messaging.wiring';

describe(RhsEditorCommunicationMessagingWiring.name, () => {
  let sut: RhsEditorCommunicationMessagingWiring;
  const chromeManager = jasmine.createSpyObj<ChromeManager>('chromeManager', ['chromes']);
  (chromeManager as Writable<ChromeManager, 'chromes'>).chromes = [];

  let editingChannel: TestMessagingP2PChannel<
    EditingHorizonEvents,
    EditingCanvasEvents,
    EditingHorizonRpcServices,
    EditingCanvasRpcServices
  >;
  let messagingService: MessagingService;
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

    const hostSpy = jasmine.createSpyObj<MessagingP2PConnection>('MessagingConnection', ['getChannel']);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    hostSpy.getChannel.and.callFake((channelDef: any) => (({ editing: editingChannel }) as any)[channelDef.name]);
    messagingService = new MessagingService(hostSpy);

    sut = new RhsEditorCommunicationMessagingWiring(chromeManager, messagingService);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });
});
