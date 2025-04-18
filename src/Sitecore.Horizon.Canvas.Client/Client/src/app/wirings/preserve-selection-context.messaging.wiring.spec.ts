/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingP2PConnection } from '@sitecore/horizon-messaging';
import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import { WindowDom } from '../chrome/chrome-dom';
import { ChromeHighlighter } from '../chrome/chrome-highlighter';
import { ChromeManager } from '../chrome/chrome-manager';
import { ChromePersistSelection } from '../chrome/chrome-persist-selection';
import { EditingChannelDef } from '../messaging/horizon-canvas.contract.defs';
import {
  EditingCanvasEvents,
  EditingCanvasRpcServices,
  EditingHorizonEvents,
  EditingHorizonRpcServices,
} from '../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../messaging/messaging-service';
import { Writable } from '../utils/lang';
import { PreserveSelectionContextWiring } from './preserve-selection-context.messaging.wiring';

describe(PreserveSelectionContextWiring.name, () => {
  let sut: PreserveSelectionContextWiring;
  let chromePersistSelection: jasmine.SpyObj<ChromePersistSelection>;
  let chromeHighlighter: ChromeHighlighter;
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

    chromePersistSelection = jasmine.createSpyObj<ChromePersistSelection>('chromePersistSelection', ['saveSnapshot']);
    chromeHighlighter = new ChromeHighlighter(new WindowDom(), new AbortController());

    sut = new PreserveSelectionContextWiring(messagingService, chromePersistSelection, chromeHighlighter);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('WHEN wire', () => {
    describe(`messaging emits 'canvas:before-unload'`, () => {
      it(`should call to preserve snapshot if it's reload`, () => {
        sut.wire();

        editingChannel.dispatchEvent('canvas:before-unload', {
          preserveCanvasSelection: true,
          chromeToSelect: { chromeId: 'chromeId', chromeType: 'rendering' },
        });

        expect(chromePersistSelection.saveSnapshot).toHaveBeenCalled();
      });

      it(`should call to preserve snapshot if it's not reload`, () => {
        sut.wire();

        editingChannel.dispatchEvent('canvas:before-unload', { preserveCanvasSelection: false, chromeToSelect: undefined });

        expect(chromePersistSelection.saveSnapshot).not.toHaveBeenCalled();
      });
    });
  });
});
