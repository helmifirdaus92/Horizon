/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { PropertiesEditorContract, RenderingInlineEditorFactory } from '../../sdk';
import { setupTestDOM, teardownTestDOM } from '../utils/dom.testing';
import { Logger } from '../utils/logger';
import { ChromeDom } from './chrome-dom';
import { ChromeInlineEditorFactory } from './chrome-inline-editor-factory';
import { DefaultRenderingChromeInlineEditor } from './chrome.rendering.inline-editor';
function nextTick() {
  return new Promise((resolve) => setTimeout(resolve));
}

describe('ChromeInlineEditorFactory', () => {
  let sut: ChromeInlineEditorFactory;
  let chromeDom: jasmine.SpyObj<ChromeDom>;
  let loggerSpy: jasmine.SpyObj<Logger>;

  let rootElement: HTMLElement;
  let renderingStartElement: HTMLElement;
  let renderingEndElement: HTMLElement;

  beforeEach(() => {
    chromeDom = jasmine.createSpyObj<ChromeDom>({
      getGlobalFunction: undefined,
    });
    loggerSpy = jasmine.createSpyObj<Logger>({
      warn: undefined,
      error: undefined,
    });
    sut = new ChromeInlineEditorFactory(chromeDom, loggerSpy);

    rootElement = setupTestDOM(`<rendering id="rnd"></rendering>`);
    renderingStartElement = rootElement.querySelector('code[kind=open][chromeType=rendering]') as HTMLElement;
    renderingEndElement = rootElement.querySelector('code[kind=close][chromeType=rendering]') as HTMLElement;
  });

  afterEach(() => {
    teardownTestDOM(rootElement);
  });

  describe('rendering', () => {
    it('should create default editor if not specified', async () => {
      const result = await sut.createRenderingChromeEditor(rootElement, rootElement, undefined);

      expect(result).toBeInstanceOf(DefaultRenderingChromeInlineEditor);
    });

    it('should use global function as a factory', async () => {
      const inlineEditorGlobalFunc = jasmine.createSpy<RenderingInlineEditorFactory>();
      inlineEditorGlobalFunc.and.returnValue(Promise.resolve({ editorProtocols: ['t-proto1', 't-proto2'] }));
      chromeDom.getGlobalFunction.withArgs('test-func').and.returnValue(inlineEditorGlobalFunc);

      const result = await sut.createRenderingChromeEditor(renderingStartElement, renderingEndElement, 'func:test-func');

      expect(result.inlineEditorMessagingProtocols).toEqual(['t-proto1', 't-proto2']);
      expect(inlineEditorGlobalFunc).toHaveBeenCalledWith({
        startElement: renderingStartElement,
        endElement: renderingEndElement,
        messaging: jasmine.anything() as any,
      });
    });

    it('messaging passed to global function should be wired', async () => {
      // arrange
      const inlineEditorGlobalFunc = jasmine.createSpy<RenderingInlineEditorFactory>();
      inlineEditorGlobalFunc.and.returnValue(Promise.resolve({ editorProtocols: [] }));
      chromeDom.getGlobalFunction.and.returnValue(inlineEditorGlobalFunc);

      const eventHandler = jasmine.createSpy();

      // act
      const result = await sut.createRenderingChromeEditor(renderingStartElement, renderingEndElement, 'func:some-func');
      result.connectMessaging();

      // assert
      const globalMessaging = inlineEditorGlobalFunc.calls.mostRecent().args[0].messaging;
      const inlineEditorMsg = result.getInlineEditorMessaging();

      globalMessaging.getEventReceiver(PropertiesEditorContract).on('onPropertiesEditorMessage', eventHandler);
      inlineEditorMsg.emit('onPropertiesEditorMessage', 'test-value-42');
      await nextTick();

      expect(eventHandler).toHaveBeenCalledWith('test-value-42');
    });

    it('should log warning and fallback if global function is not defined', async () => {
      const result = await sut.createRenderingChromeEditor(renderingStartElement, renderingEndElement, 'func:nonexistingfunc');

      expect(result).toBeInstanceOf(DefaultRenderingChromeInlineEditor);
      expect(loggerSpy.warn).toHaveBeenCalledWith(jasmine.stringMatching(/nonexistingfunc/));
    });

    it('should log warning and fallback for unknown schema', async () => {
      const result = await sut.createRenderingChromeEditor(renderingStartElement, renderingEndElement, 'wrong:something');

      expect(result).toBeInstanceOf(DefaultRenderingChromeInlineEditor);
      expect(loggerSpy.warn).toHaveBeenCalledWith(jasmine.stringMatching(/Unknown schema.*wrong:something/));
    });
  });
});
