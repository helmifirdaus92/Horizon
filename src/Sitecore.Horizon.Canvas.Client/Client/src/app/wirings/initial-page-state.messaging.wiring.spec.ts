/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingP2PConnection } from '@sitecore/horizon-messaging';
import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import { nextTick } from '@sitecore/horizon-messaging/dist/utils';
import { ChromeManager } from '../chrome/chrome-manager';
import { PlaceholderChrome } from '../chrome/chrome.placeholder';
import { FrameManager } from '../frame/frame-manager';
import { EditingChannelDef } from '../messaging/horizon-canvas.contract.defs';
import {
  EditingCanvasEvents,
  EditingCanvasRpcServices,
  EditingHorizonEvents,
  EditingHorizonRpcServices,
  ItemPermissions,
  MediaSelectionResult,
} from '../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../messaging/messaging-service';
import { PageStateReader } from '../page-state-reader';
import { Writable } from '../utils/lang';
import { InitialPageStateMessagingWiring } from './initial-page-state.messaging.wiring';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

describe(InitialPageStateMessagingWiring.name, () => {
  let sut: InitialPageStateMessagingWiring;

  const chromeManager = jasmine.createSpyObj<ChromeManager>('chromeManager', ['chromes']);
  (chromeManager as Writable<ChromeManager, 'chromes'>).chromes = [];
  const frameManager = jasmine.createSpyObj<FrameManager>('frameManager', ['setPersonalizationMode']);
  const pageStateReader = jasmine.createSpyObj<PageStateReader>({ getPageLayout: '', getHorizonPageState: { deviceId: '' } as any }, {});
  let abortController: AbortController;

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

  const mockItemPermissions: ItemPermissions = {
    canCreate: false,
    canDelete: false,
    canPublish: true,
    canWrite: true,
    canRename: true,
  };

  const mediaSelectionResult: MediaSelectionResult = {
    status: 'OK',
    selectedValue: {
      src: '',
      alt: '',
    },
  };

  beforeEach(() => {
    abortController = new AbortController();
    getItemPermissionsSpy = jasmine.createSpy();
    selectMediaSpy = jasmine.createSpy();
    getItemPermissionsSpy.and.callFake(async () => mockItemPermissions);
    selectMediaSpy.and.callFake(async () => mediaSelectionResult);
    getPageFlowsSpy = jasmine.createSpy();
    getAbTestConfigStatusSpy = jasmine.createSpy();

    editingChannel = makeTestMessagingP2PChannelFromDef(EditingChannelDef, {
      reloadCanvas: () => {},
      getItemPermissions: getItemPermissionsSpy,
      selectMedia: selectMediaSpy,
      editSourceCode: (): any => {},
      addPhoneNumber: (): any => {},
      getPageFlows: (_itemId, _language) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return getPageFlowsSpy();
      },
      getAbTestConfigStatus(_itemId, _language) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return getAbTestConfigStatusSpy();
      },
      promptSelectPage: (): any => {},
      setRenderingParams: (): any => {},
    });
    const hostSpy = jasmine.createSpyObj<MessagingP2PConnection>('MessagingConnection', { getChannel: undefined });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    hostSpy.getChannel.and.callFake((channelDef: any) => (({ editing: editingChannel }) as any)[channelDef.name]);
    messagingService = new MessagingService(hostSpy);
    sut = new InitialPageStateMessagingWiring(chromeManager, frameManager, pageStateReader, messagingService, false);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('WHEN wire', () => {
    describe(`messaging emits 'canvas:set-personalization-mode'`, () => {
      it(`should call to preserve snapshot if it's reload`, () => {
        sut.wire();

        editingChannel.dispatchEvent('canvas:set-personalization-mode', { isPersonalizationMode: true });

        expect(frameManager.setPersonalizationMode).toHaveBeenCalledWith(true);
      });

      it('should call to getItemPermissions and should pass permissions to frameManage', async () => {
        sut.wire();
        await nextTick();

        expect(getItemPermissionsSpy).toHaveBeenCalled();
        expect(frameManager.permissions).toEqual({ canCreate: false, canPublish: true, canRename: true, canDelete: false, canWrite: true });
      });

      it('should call to disableEditingInPersonalizationMode for each placeholder chrome', async () => {
        const mockPhChrome = new PlaceholderChrome(
          'ph_1',
          '<div></div>' as unknown as Element,
          '<p></p>' as unknown as Element,
          'ph-key',
          ['ph-key'],
          [],
          { id: 'id', language: 'lang', version: 42, revision: 'rev' },
          true,
          'ph-key',
          [],
          null!,
          abortController,
        );
        (chromeManager as Writable<ChromeManager, 'chromes'>).chromes = [mockPhChrome];

        const spy = spyOn(mockPhChrome, 'disableEditingInPersonalizationMode');

        sut.wire();
        await nextTick();

        editingChannel.dispatchEvent('canvas:set-personalization-mode', { isPersonalizationMode: true });

        expect(spy).toHaveBeenCalledWith(true);
      });
    });
  });
});
