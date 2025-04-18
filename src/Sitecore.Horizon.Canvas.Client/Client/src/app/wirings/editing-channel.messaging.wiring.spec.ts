/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeHighlighter } from '../chrome/chrome-highlighter';
import { ChromeManager } from '../chrome/chrome-manager';
import * as renderingChrome from '../chrome/chrome.rendering';
import { RenderingChrome } from '../chrome/chrome.rendering';
import { FrameManager } from '../frame/frame-manager';
import {
  EditingCanvasRpcServices,
  PageStateUpdate,
  PlaceholderChromeInfo,
  RenderingChromeInfo,
} from '../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../messaging/messaging-service';
import { EditingChannelMessagingWiring } from './editing-channel.messaging.wiring';

describe(EditingChannelMessagingWiring.name, () => {
  let sut: EditingChannelMessagingWiring;

  const chromeManager = jasmine.createSpyObj<ChromeManager>('chromeManager', ['writeFields', 'getByChromeId', 'getByChromeSxaSource']);
  const chromeHighlighter = jasmine.createSpyObj<ChromeHighlighter>('chromeHighlighter', ['resetAllHighlightings']);
  const messagingService = jasmine.createSpyObj<MessagingService>('MessagingService', ['setEditingChannelRpcServices']);
  const frameManager = jasmine.createSpyObj<FrameManager>('FrameManager', ['highlightChromes', 'unhighlightChromes']);
  let rpcImplementation: EditingCanvasRpcServices;

  beforeEach(() => {
    sut = new EditingChannelMessagingWiring(chromeManager, messagingService, chromeHighlighter, frameManager);
    sut.wire();
    rpcImplementation = messagingService.setEditingChannelRpcServices.calls.mostRecent().args[0] as any;
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('WHEN wire', () => {
    describe('messaging does setEditingChannelRpcServices', () => {
      it('should set implementation of editing channel rpc', () => {
        expect(messagingService.setEditingChannelRpcServices).toHaveBeenCalled();
      });

      it('updatePageState', () => {
        const pageStateUpdate: PageStateUpdate = {
          fields: [{ fieldId: 'fieldId', itemId: 'itemId', itemVersion: 1, value: { rawValue: 'rawValue' }, reset: false }],
        };
        rpcImplementation.updatePageState(pageStateUpdate);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(chromeManager.writeFields).toHaveBeenCalledWith(pageStateUpdate.fields!);
      });

      it('selectChrome', () => {
        const chromeId = 'chromeId001';
        const chrome = jasmine.createSpyObj<RenderingChrome>('RenderingChrome', ['select']);
        chromeManager.getByChromeId.and.returnValue(chrome);

        rpcImplementation.selectChrome(chromeId);

        expect(chromeManager.getByChromeId).toHaveBeenCalledWith(chromeId);
        expect(chrome.select).toHaveBeenCalled();
      });

      it('deselectChrome', () => {
        rpcImplementation.deselectChrome();

        expect(chromeHighlighter.resetAllHighlightings).toHaveBeenCalled();
      });

      it('highlightPartialDesign', () => {
        const partialDesignId = 'partialDesignId001';
        const chrome = jasmine.createSpyObj<RenderingChrome>('RenderingChrome', ['select']);
        chromeManager.getByChromeSxaSource.and.returnValue([chrome]);

        rpcImplementation.highlightPartialDesign(partialDesignId);

        expect(frameManager.highlightChromes).toHaveBeenCalledWith([chrome]);
      });

      it('unhighlightPartialDesign', () => {
        rpcImplementation.unhighlightPartialDesign();

        expect(frameManager.unhighlightChromes).toHaveBeenCalled();
      });

      it('getChildRendering', () => {
        spyOn(renderingChrome, 'isRenderingChrome').and.returnValue(true);
        const chrome = jasmine.createSpyObj<RenderingChrome>('RenderingChrome', ['getChildRenderings']);
        const childRenderings: RenderingChromeInfo[] = [{ renderingInstanceId: 'id1' }, { renderingInstanceId: 'id2' }] as any;
        chrome.getChildRenderings.and.returnValue(childRenderings);
        chromeManager.getByChromeId.and.returnValue(chrome);

        const result = rpcImplementation.getChildRenderings('renderingInstanceId');

        expect(result).toBe(childRenderings);
      });

      it('getChildPlaceholders', () => {
        spyOn(renderingChrome, 'isRenderingChrome').and.returnValue(true);
        const chrome = jasmine.createSpyObj<RenderingChrome>('RenderingChrome', ['getChildPlaceholders']);
        const childPlaceholders: PlaceholderChromeInfo[] = [{ renderingInstanceId: 'id1' }, { renderingInstanceId: 'id2' }] as any;
        chrome.getChildPlaceholders.and.returnValue(childPlaceholders);
        chromeManager.getByChromeId.and.returnValue(chrome);

        const result = rpcImplementation.getChildPlaceholders('renderingInstanceId');

        expect(result).toBe(childPlaceholders);
      });
    });
  });
});
