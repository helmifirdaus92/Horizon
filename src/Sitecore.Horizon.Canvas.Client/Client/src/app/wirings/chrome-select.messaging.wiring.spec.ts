/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingP2PConnection } from '@sitecore/horizon-messaging';
import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import { ChromeManager } from '../chrome/chrome-manager';
import { RenderingChrome } from '../chrome/chrome.rendering';
import { FrameManager } from '../frame/frame-manager';
import { EventEmitter } from '../messaging/event-emitter';
import { EditingChannelDef } from '../messaging/horizon-canvas.contract.defs';
import {
  EditingCanvasEvents,
  EditingCanvasRpcServices,
  EditingHorizonEvents,
  EditingHorizonRpcServices,
  RenderingChromeInfo,
} from '../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../messaging/messaging-service';
import { Writable } from '../utils/lang';
import { ChromeSelectingIncomeMessagingWiring } from './chrome-selecting-incoming.messaging.wiring';

describe(ChromeSelectingIncomeMessagingWiring.name, () => {
  let sut: ChromeSelectingIncomeMessagingWiring;
  let chromeManager = jasmine.createSpyObj<ChromeManager>('chromeManager', ['chromes']);
  let frameManager: jasmine.SpyObj<FrameManager>;
  let onDelete: EventEmitter<RenderingChrome>;
  let selectSpy: jasmine.Spy;
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

  const testRenderingChrome = {
    getChromeInfo: () => {
      return {} as RenderingChromeInfo;
    },
  } as RenderingChrome;

  beforeEach(() => {
    getItemPermissionsSpy = jasmine.createSpy();
    selectMediaSpy = jasmine.createSpy();
    getPageFlowsSpy = jasmine.createSpy();
    getAbTestConfigStatusSpy = jasmine.createSpy();

    frameManager = jasmine.createSpyObj<FrameManager>('FrameManager', ['highlight', 'onDeleteRendering']);
    frameManager.highlight.and.returnValue();
    onDelete = (frameManager as Writable<FrameManager, 'onDeleteRendering'>).onDeleteRendering = new EventEmitter();

    selectSpy = jasmine.createSpy('SelectSpy');
    chromeManager = jasmine.createSpyObj<ChromeManager>('ChromeManager', ['getByChromeId']);
    chromeManager.getByChromeId.and.callFake((chromeId): any => {
      return {
        chromeId,
        select: selectSpy,
      };
    });

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    hostSpy.getChannel.and.callFake((channelDef: any) => (({ editing: editingChannel }) as any)[channelDef.name]);
    messagingService = new MessagingService(hostSpy);

    sut = new ChromeSelectingIncomeMessagingWiring(chromeManager, frameManager, messagingService);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('WHEN wire', () => {
    describe(`messaging emits 'chrome:select'`, () => {
      it(`should select chrome`, () => {
        sut.wire();

        editingChannel.dispatchEvent('chrome:select', { id: 'renderingInstanceId', chromeType: 'rendering' });

        expect(selectSpy).toHaveBeenCalled();
      });

      it('should not fail IF cannot find chrome', () => {
        chromeManager.getByChromeId.and.returnValue(undefined);
        sut.wire();

        editingChannel.dispatchEvent('chrome:select', { id: 'renderingInstanceId', chromeType: 'rendering' });

        expect(selectSpy).not.toHaveBeenCalled();
      });
    });

    describe(`messaging emits 'chrome:highlight'`, () => {
      it(`should hightlight chrome`, () => {
        sut.wire();

        editingChannel.dispatchEvent('chrome:highlight', { id: 'renderingInstanceId', chromeType: 'rendering' });

        const result = frameManager.highlight.calls.mostRecent().args[0];
        expect(result.chromeId).toBe('RENDERING_renderinginstanceid');
      });

      it('should not fail IF cannot find chrome', () => {
        chromeManager.getByChromeId.and.returnValue(undefined);
        sut.wire();

        editingChannel.dispatchEvent('chrome:highlight', { id: 'renderingInstanceId', chromeType: 'rendering' });

        expect(frameManager.highlight).not.toHaveBeenCalled();
      });
    });

    describe(`onDelete`, () => {
      it(`should emit 'chrome:remove'`, () => {
        const spy = spyOn(editingChannel, 'emit');

        sut.wire();
        onDelete.emit(testRenderingChrome);

        expect(spy).toHaveBeenCalledWith('chrome:remove', testRenderingChrome.getChromeInfo());
        expect(spy).toHaveBeenCalledTimes(1);
      });
    });

    describe(`onDelete`, () => {
      it(`should not emit 'chrome:remove'`, () => {
        const spy = spyOn(editingChannel, 'emit');

        sut.wire();

        expect(spy).toHaveBeenCalledTimes(0);
      });
    });
  });
});
