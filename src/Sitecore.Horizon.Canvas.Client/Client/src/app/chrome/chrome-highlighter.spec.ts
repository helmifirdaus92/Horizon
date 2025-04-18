/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-unsafe-return */

import { spyOnEvent } from '../messaging/event-emitter.testing';
import { MessagingService } from '../messaging/messaging-service';
import { setupTestDOM, teardownTestDOM, triggerClick, triggerMouseOut, triggerMouseOver } from '../utils/dom.testing';
import { ThrowingLogger } from '../utils/logger';
import { Chrome } from './chrome';
import { WindowDom } from './chrome-dom';
import { ChromeHighlighter } from './chrome-highlighter';
import { ChromeInlineEditorFactory } from './chrome-inline-editor-factory';
import { ChromeReader } from './chrome-reader';
import { FieldChrome, isFieldChrome } from './chrome.field';
import { isPlaceholderChrome, PlaceholderChrome } from './chrome.placeholder';
import { isRenderingChrome, RenderingChrome } from './chrome.rendering';
import { InlineChromeParser } from './read/inline-chrome-parser';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

describe(ChromeHighlighter.name, () => {
  let rootElement: HTMLElement;
  let windowDom: WindowDom;
  let chromes: readonly Chrome[];
  let sut: ChromeHighlighter;
  let abortController: AbortController;

  function findPlaceholder(key: string): PlaceholderChrome {
    return chromes.filter(isPlaceholderChrome).find((chrome) => chrome.placeholderKey === key)!;
  }

  function findRendering(key: string): RenderingChrome {
    return chromes.filter(isRenderingChrome).find((chrome) => chrome.renderingInstanceId === key)!;
  }

  function findField(id: string): FieldChrome {
    return chromes.filter(isFieldChrome).find((chrome) => chrome.fieldId === id)!;
  }

  beforeEach(async () => {
    rootElement = setupTestDOM(`
      <rendering id='rnd'>
        <h1>Foo</h1>
        <field type="image" id="image1" />
      </rendering>
      <placeholder key="empty"></placeholder>
      <placeholder key="ph">
        <rendering id="ph/rnd">
          <div>
            <placeholder key="ph/rnd/ph">
              <rendering id="ph/rnd/ph/rnd">
                <div>Content</div>
              </rendering>
            </placeholder>
          </div>
          <p id="text-level-2">Some next on level 2</p>
          <placeholder key="ph/rnd/ph2">
            <rendering id='ph/rnd/ph2/rnd-ne' editable="false">
              <div>Content</div>
            </rendering>
          </placeholder>
        </rendering>
      </placeholder>
      <rendering id='rnd-ne' editable="false">
        <div>Content</div>
      </rendering>
    `);

    abortController = new AbortController();
    windowDom = new WindowDom();
    sut = new ChromeHighlighter(windowDom, abortController);
    const messagingService = jasmine.createSpyObj<MessagingService>('MessagingService', ['setEditingChannelRpcServices']);
    const chromeParser = new InlineChromeParser(
      new ChromeInlineEditorFactory(windowDom, ThrowingLogger),
      messagingService,
      abortController,
    );
    chromes = await new ChromeReader(chromeParser).readChromes(rootElement);
    sut.setupChromes(chromes, rootElement);
  });

  afterEach(() => {
    teardownTestDOM(rootElement);
  });

  it('should be created', () => {
    expect(sut).toBeDefined();
  });

  describe('onSelect()', () => {
    it('should select rendering when clicking on element inside rendering', () => {
      // arrange
      const spy = spyOnEvent(sut.onSelect);
      const testRendering = findRendering('rnd');
      const renderingTitle = testRendering.startElement.nextElementSibling!;

      // act
      triggerClick(renderingTitle);

      // assert
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(testRendering);
    });

    it('should select empty placeholder when clicking on space holder', () => {
      // arrange
      const spy = spyOnEvent(sut.onSelect);
      const emptyPlaceholderChrome = findPlaceholder('empty');

      // act
      triggerClick(emptyPlaceholderChrome.startElement.nextElementSibling!);

      // assert
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(emptyPlaceholderChrome);
    });

    it('clicking on the image field should not trigger rendering chrome to be selected', () => {
      // arrange
      const spy = spyOnEvent(sut.onSelect);
      const imageChrome = findField('image1');

      // act
      triggerClick(imageChrome.element);

      // assert
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(imageChrome);
    });

    it('should select deeply nested rendering', () => {
      const spy = spyOnEvent(sut.onSelect);
      const rendering = findRendering('ph/rnd/ph/rnd');

      triggerClick(rendering.startElement.nextElementSibling!);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(rendering);
    });

    it('should select rendering which contains other renderings', () => {
      const spy = spyOnEvent(sut.onSelect);
      const rendering = findRendering('ph/rnd');

      triggerClick(rendering.startElement.nextElementSibling!);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(rendering);
    });

    it('should highlight deeply nested rendering', () => {
      const spy = spyOnEvent(sut.onEnter);
      const rendering = findRendering('ph/rnd/ph/rnd');

      triggerMouseOver(rendering.startElement.nextElementSibling!);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(rendering);
    });

    it('should not highlight disabled rendering', () => {
      const spy = spyOnEvent(sut.onEnter);
      const rendering = findRendering('rnd-ne');

      triggerMouseOver(rendering.startElement.nextElementSibling!);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not select disabled rendering', () => {
      const spy = spyOnEvent(sut.onSelect);
      const rendering = findRendering('rnd-ne');

      triggerClick(rendering.startElement.nextElementSibling!);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should highlight parent rendering when holding mouse over disabled', () => {
      const spy = spyOnEvent(sut.onEnter);
      const editableRendering = findRendering('ph/rnd');
      const nonEditableRendering = findRendering('ph/rnd/ph2/rnd-ne');

      triggerMouseOver(nonEditableRendering.startElement.nextElementSibling!);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(editableRendering);
    });

    it('should select parent rendering when clicking on disabled', () => {
      const spy = spyOnEvent(sut.onSelect);
      const editableRendering = findRendering('ph/rnd');
      const nonEditableRendering = findRendering('ph/rnd/ph2/rnd-ne');

      triggerClick(nonEditableRendering.startElement.nextElementSibling!);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(editableRendering);
    });

    it('should set selectedChrome property when select', () => {
      // arrange
      // const spy = spyOnEvent(sut.onSelect);
      const testRendering = findRendering('rnd');
      const renderingTitle = testRendering.startElement.nextElementSibling!;

      // act
      triggerClick(renderingTitle);

      // assert
      expect(sut.selectedChrome).toBe(testRendering);
    });

    it('should NOT emit selection when click on the selected chrome', () => {
      // arrange
      // const spy = spyOnEvent(sut.onSelect);
      const testRendering = findRendering('rnd');
      const renderingTitle = testRendering.startElement.nextElementSibling!;
      const selectSpy = jasmine.createSpy('selectSpy');

      // act
      sut.onSelect.on(() => selectSpy());
      triggerClick(renderingTitle);
      triggerClick(renderingTitle);

      // assert
      expect(selectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('resetAllHighlightings', () => {
    it('should clear selection', () => {
      const clearSelectionSpy = spyOn(windowDom, 'clearSelection').and.callThrough();
      sut.resetAllHighlightings();

      expect(clearSelectionSpy).toHaveBeenCalled();
    });

    it('should reset selectedChrome', () => {
      sut.resetAllHighlightings();

      expect(sut.selectedChrome).toBeUndefined();
    });

    it('should emit onLeave', () => {
      const spy = jasmine.createSpy();
      sut.onLeave.on(() => spy());

      sut.resetAllHighlightings();

      expect(spy).toHaveBeenCalled();
    });

    it('should emit onDeselect', () => {
      const spy = jasmine.createSpy();
      sut.onDeselect.on(() => spy());

      sut.resetAllHighlightings();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Should not raise events after abort', () => {
    it('should not emit onEnter on mouseOver event', () => {
      // arrange
      const spy = spyOnEvent(sut.onEnter);
      const rendering = findRendering('ph/rnd/ph/rnd');

      // act
      abortController.abort();
      triggerMouseOver(rendering.startElement.nextElementSibling!);

      // assert
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not emit onLeave on mouseLeave event', () => {
      // arrange
      const spy = spyOnEvent(sut.onLeave);
      const rendering = findRendering('ph/rnd/ph/rnd');

      // act
      abortController.abort();
      triggerMouseOut(rendering.startElement.nextElementSibling!);

      // assert
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not emit onSelect on mouseclick event', () => {
      // arrange
      const spy = spyOnEvent(sut.onSelect);
      const testRendering = findRendering('rnd');
      const renderingTitle = testRendering.startElement.nextElementSibling!;

      // act
      abortController.abort();
      triggerClick(renderingTitle);

      // assert
      expect(spy).not.toHaveBeenCalled();
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
