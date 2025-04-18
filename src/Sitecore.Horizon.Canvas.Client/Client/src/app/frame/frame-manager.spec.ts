/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Chrome } from '../chrome/chrome';
import { WindowDom } from '../chrome/chrome-dom';
import { ChromeInlineEditorFactory } from '../chrome/chrome-inline-editor-factory';
import { ChromeReader } from '../chrome/chrome-reader';
import { FieldChrome, isFieldChrome } from '../chrome/chrome.field';
import { isRenderingChrome, RenderingChrome } from '../chrome/chrome.rendering';
import { InlineChromeParser } from '../chrome/read/inline-chrome-parser';
import { spyOnEvent } from '../messaging/event-emitter.testing';
import { MessagingService } from '../messaging/messaging-service';
import { setupTestDOM, teardownTestDOM } from '../utils/dom.testing';
import { ThrowingLogger } from '../utils/logger';
import { FrameManager } from './frame-manager';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

describe(FrameManager.name, () => {
  const pageElementOutlineSelector = 'div[class*="sc-page-element-outline"]';
  const frameSelector = 'div[class*="sc-frame"]';

  let sut: FrameManager;
  let rootElement: HTMLElement;
  let windowDom: WindowDom;
  let chromes: readonly Chrome[];
  let abortController: AbortController;

  function rendering(): RenderingChrome {
    return chromes.find(isRenderingChrome)!;
  }

  function field(): FieldChrome {
    return chromes.find(isFieldChrome)!;
  }

  beforeEach(async () => {
    rootElement = setupTestDOM(`
      <rendering>
        <field />
      </rendering>
    `);

    abortController = new AbortController();
    windowDom = new WindowDom();
    sut = new FrameManager(new WindowDom(), new AbortController());
    const messagingService = jasmine.createSpyObj<MessagingService>('MessagingService', ['setEditingChannelRpcServices']);
    const chromeParser = new InlineChromeParser(
      new ChromeInlineEditorFactory(windowDom, ThrowingLogger),
      messagingService,
      abortController,
    );
    chromes = await new ChromeReader(chromeParser).readChromes(rootElement);
  });

  afterEach(() => {
    sut.deselect();
    teardownTestDOM(rootElement);
  });

  describe('select', () => {
    describe('emit onMoveRenderingStart and onMoveRenderingEnd', () => {
      it('it should emit onMoveRenderingStart', () => {
        const spy = spyOnEvent(sut.onMoveRenderingStart);

        sut.select(rendering());
        const pageElementOutline = document.querySelector(pageElementOutlineSelector) as HTMLElement;
        pageElementOutline.dispatchEvent(new DragEvent('dragstart'));

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(rendering());
      });

      it('it should emit onMoveRenderingEnd', () => {
        const spy = spyOnEvent(sut.onMoveRenderingEnd);

        sut.select(rendering());
        const pageElementOutline = document.querySelector(pageElementOutlineSelector) as HTMLElement;
        pageElementOutline.dispatchEvent(new DragEvent('dragend'));

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(rendering());
      });
    });

    describe('parent frame', () => {
      it('it should not show parent frame WHEN a rendering chrome is selected', () => {
        sut.select(rendering());
        const frames = document.querySelectorAll(frameSelector);

        expect(frames.length).toBe(1);
      });

      it('it should show parent frame WHEN a field chrome is selected', () => {
        sut.select(field());
        const frames = document.querySelectorAll(frameSelector);

        expect(frames.length).toBe(2);
      });
    });
  });

  describe('deselect', () => {
    it('it should deselect', () => {
      sut.select(rendering());

      sut.deselect();

      const pageElementOutline = document.querySelector(pageElementOutlineSelector) as HTMLElement;
      expect(pageElementOutline).toBeFalsy();
    });
  });
});
