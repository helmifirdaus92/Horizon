/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingP2PConnection, MessagingReconnectableP2PConnection } from '@sitecore/horizon-messaging';
import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import { SetupAppGlobalFunctionName, ShutdownAppGlobalFunctionName } from '../../sdk/contracts/set-app.contract';

import { ChromeManager } from '../chrome/chrome-manager';
import { RenderingChrome, RhsChannel, RhsChannelDef } from '../chrome/chrome.rendering';
import {
  RenderingChromeInlineEditor,
  RenderingChromeUtilsChannelDef,
  RenderingPropertiesEditorChannelDef,
} from '../chrome/chrome.rendering.inline-editor';
import { ManipulateCanvasDomManager } from '../designing/manipulate-canvas-dom.manager';
import { EditingChannelDef } from '../messaging/horizon-canvas.contract.defs';
import {
  EditingCanvasEvents,
  EditingCanvasRpcServices,
  EditingHorizonEvents,
  EditingHorizonRpcServices,
} from '../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../messaging/messaging-service';
import { setupTestDOM, teardownTestDOM } from '../utils/dom.testing';
import { RemoteRpcServices } from '../utils/messaging';
import { ManipulateCanvasDomWiring } from './manipulate-canvas-dom.wiring';

function setRenderingChrome(): [RenderingChrome, HTMLElement] {
  const rootElement = setupTestDOM(`
    <rendering id="rendering">
      <h1>Rendering</h1>
    </rendering>
    `);

  const renderingChromeRaw = {
    startElement: rootElement.querySelector('[id*=start_]') as Element,
    content: rootElement.querySelector('h1') as Element,
    endElement: rootElement.querySelector('[id*=end_]') as Element,
  };

  const messaging = makeTestMessagingP2PChannelFromDef(
    RhsChannelDef,
    jasmine.createSpyObj<RemoteRpcServices<RhsChannel>>({
      postPropertiesEditorMessage: undefined,
    }),
  );
  const inlineEditorMessaging = makeTestMessagingP2PChannelFromDef(RenderingPropertiesEditorChannelDef, {});
  const renderingChromeUtilsMessaging = makeTestMessagingP2PChannelFromDef(RenderingChromeUtilsChannelDef, {});
  const inlineEditor = jasmine.createSpyObj<RenderingChromeInlineEditor>(
    {
      connectMessaging: undefined,
      getInlineEditorMessaging: inlineEditorMessaging,
      getRenderingChromeUtilsMessaging: renderingChromeUtilsMessaging,
    },
    {
      inlineEditorMessagingProtocols: [],
    },
  );
  return [
    new RenderingChrome(
      'chromeId',
      renderingChromeRaw.startElement,
      renderingChromeRaw.endElement,
      'renderingInstanceId',
      'renderingDefinitionId',
      { id: 'id', language: 'lang', version: 42, revision: 'rev' },
      [],
      [],
      true,
      inlineEditor,
      'Sample rendering',
      [],
      jasmine.createSpyObj<MessagingReconnectableP2PConnection>('connection', {
        getChannel: messaging as any,
      }),
    ),
    rootElement,
  ];
}

describe(ManipulateCanvasDomWiring.name, () => {
  let rootElement: HTMLElement;
  let sut: ManipulateCanvasDomWiring;
  let chromeManager: jasmine.SpyObj<ChromeManager>;
  let editingChannel: TestMessagingP2PChannel<
    EditingHorizonEvents,
    EditingCanvasEvents,
    EditingHorizonRpcServices,
    EditingCanvasRpcServices
  >;
  let messagingService: MessagingService;
  let renderingChrome: RenderingChrome;
  let canvasApiSpy: jasmine.Spy;
  let getItemPermissionsSpy: jasmine.Spy;
  let selectMediaSpy: jasmine.Spy;
  let getPageFlowsSpy: jasmine.Spy;
  let getAbTestConfigStatusSpy: jasmine.Spy;
  const newRenderingHtml = '<h2>New Rendering</h2>';

  beforeEach(() => {
    getItemPermissionsSpy = jasmine.createSpy();
    selectMediaSpy = jasmine.createSpy();
    canvasApiSpy = jasmine.createSpy();
    getPageFlowsSpy = jasmine.createSpy();
    getAbTestConfigStatusSpy = jasmine.createSpy();
    window[ShutdownAppGlobalFunctionName.name] = canvasApiSpy;
    window[SetupAppGlobalFunctionName.name] = jasmine.createSpy(SetupAppGlobalFunctionName.name);

    [renderingChrome, rootElement] = setRenderingChrome();

    chromeManager = jasmine.createSpyObj<ChromeManager>('chromeManager', ['getByChromeId']);

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

    const hostSpy = jasmine.createSpyObj<MessagingP2PConnection>('MessagingConnection', { getChannel: undefined });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    hostSpy.getChannel.and.callFake((channelDef: any) => (({ editing: editingChannel }) as any)[channelDef.name]);
    messagingService = new MessagingService(hostSpy);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const manipulateDomManager = new ManipulateCanvasDomManager(chromeManager, {} as any);
    sut = new ManipulateCanvasDomWiring(manipulateDomManager, messagingService);
  });

  afterEach(() => {
    teardownTestDOM(rootElement);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('WHEN wire', () => {
    describe(`AND messaging emits 'canvas:change-dom'`, () => {
      describe('AND event is Insert rendering', () => {
        describe('AND position is After', () => {
          it('should insert the new rendering after the existing rendering', () => {
            chromeManager.getByChromeId.and.returnValue(renderingChrome);
            const oldContent = rootElement.innerHTML.toString().trim();
            const expectedNewContent = oldContent + newRenderingHtml;

            sut.wire();
            editingChannel.dispatchEvent('canvas:change-dom', {
              eventType: 'insert',
              chromeType: 'rendering',
              renderingInstanceId: 'renderingInstanceId',
              placeholderKey: 'placeholder',
              placement: { position: 'after', targetInstanceId: 'targetInstanceId' },
              renderingHtml: newRenderingHtml,
            });

            expect(rootElement.innerHTML.toString().trim()).toBe(expectedNewContent);
          });
        });

        describe('AND position is Before', () => {
          it('should insert the new rendering before the existing rendering', () => {
            chromeManager.getByChromeId.and.returnValue(renderingChrome);
            const oldContent = rootElement.innerHTML.toString().trim();
            const expectedNewContent = newRenderingHtml + oldContent;

            sut.wire();
            editingChannel.dispatchEvent('canvas:change-dom', {
              eventType: 'insert',
              chromeType: 'rendering',
              renderingInstanceId: 'renderingInstanceId',
              placeholderKey: 'placeholder',
              placement: { position: 'before', targetInstanceId: 'targetInstanceId' },
              renderingHtml: newRenderingHtml,
            });

            expect(rootElement.innerHTML.toString().trim()).toBe(expectedNewContent);
          });
        });

        it('should call Canvas API to reset Canvas app', () => {
          chromeManager.getByChromeId.and.returnValue(renderingChrome);

          sut.wire();
          editingChannel.dispatchEvent('canvas:change-dom', {
            eventType: 'insert',
            chromeType: 'rendering',
            renderingInstanceId: 'renderingInstanceId',
            placeholderKey: 'placeholder',
            placement: { position: 'after', targetInstanceId: 'targetInstanceId' },
            renderingHtml: newRenderingHtml,
          });

          expect(canvasApiSpy).toHaveBeenCalled();
        });
      });

      describe('AND event is Update rendering', () => {
        it('should update the rendering', () => {
          chromeManager.getByChromeId.and.returnValue(renderingChrome);

          sut.wire();
          editingChannel.dispatchEvent('canvas:change-dom', {
            eventType: 'update',
            chromeType: 'rendering',
            renderingInstanceId: 'renderingInstanceId',
            renderingHtml: newRenderingHtml,
          });

          expect(rootElement.innerHTML.toString().trim()).toBe(newRenderingHtml);
        });

        it('should call Canvas API to reset Canvas app', () => {
          chromeManager.getByChromeId.and.returnValue(renderingChrome);

          sut.wire();
          editingChannel.dispatchEvent('canvas:change-dom', {
            eventType: 'update',
            chromeType: 'rendering',
            renderingInstanceId: 'renderingInstanceId',
            renderingHtml: newRenderingHtml,
          });

          expect(canvasApiSpy).toHaveBeenCalled();
        });
      });

      describe('AND event is Remove rendering', () => {
        it('should remove rendering', () => {
          chromeManager.getByChromeId.and.returnValue(renderingChrome);

          sut.wire();
          editingChannel.dispatchEvent('canvas:change-dom', {
            eventType: 'remove',
            chromeType: 'rendering',
            renderingInstanceId: 'renderingInstanceId',
          });

          expect(rootElement.innerHTML.toString().trim()).toBe('');
        });

        it('should call Canvas API to reset Canvas app with rest selection option', () => {
          chromeManager.getByChromeId.and.returnValue(renderingChrome);

          sut.wire();
          editingChannel.dispatchEvent('canvas:change-dom', {
            eventType: 'remove',
            chromeType: 'rendering',
            renderingInstanceId: 'renderingInstanceId',
          });

          expect(canvasApiSpy).toHaveBeenCalledWith({ resetPrevSelection: true });
        });
      });
    });
  });
});
