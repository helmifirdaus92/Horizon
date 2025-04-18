/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Chrome } from '../chrome/chrome';
import { ChromeDom } from '../chrome/chrome-dom';
import { ChromeInlineEditorFactory } from '../chrome/chrome-inline-editor-factory';
import { ChromeReader } from '../chrome/chrome-reader';
import { FieldChrome, isFieldChrome } from '../chrome/chrome.field';
import { isPlaceholderChrome, PlaceholderChrome } from '../chrome/chrome.placeholder';
import { isRenderingChrome, RenderingChrome } from '../chrome/chrome.rendering';
import { InlineChromeParser } from '../chrome/read/inline-chrome-parser';
import { spyOnEvent } from '../messaging/event-emitter.testing';
import { DragInfo } from '../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../messaging/messaging-service';
import { setupTestDOM, teardownTestDOM } from '../utils/dom.testing';
import { ThrowingLogger } from '../utils/logger';
import { DesigningNativeEventsTranslator } from './designing-native-events-translator';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

describe(DesigningNativeEventsTranslator.name, () => {
  let rootElement: HTMLElement;

  let chromes: readonly Chrome[];
  let chromeDom: jasmine.SpyObj<ChromeDom>;
  let sut: DesigningNativeEventsTranslator;
  let abortController: AbortController;

  function makeDragInfo(element: Element, renderingId: string = 'renderingId', movedRendering?: RenderingChrome): DragInfo {
    const { left, top } = element.getBoundingClientRect();

    const elementsFromPoint = [element];
    if (movedRendering) {
      const designingOverlay = {} as HTMLElement;
      elementsFromPoint.unshift(designingOverlay);
    }
    chromeDom.elementsFromPoint.withArgs(left, top).and.returnValue(elementsFromPoint);

    return {
      clientX: left,
      clientY: top,
      renderingId,
      movedRendering,
    };
  }

  function findPlaceholder(key: 'ph' | 'ph/rnd/ph-ne' | 'empty'): PlaceholderChrome {
    return chromes.filter(isPlaceholderChrome).find((chrome) => chrome.placeholderKey === key)!;
  }

  function findRendering(key: 'rendering-outside-ph' | 'ph/rnd' | 'ph/rnd-ne'): RenderingChrome {
    return chromes.filter(isRenderingChrome).find((chrome) => chrome.renderingInstanceId === key)!;
  }

  function findField(id: 'ph/rnd/fld-txt'): FieldChrome {
    return chromes.filter(isFieldChrome).find((chrome) => chrome.fieldId === id)!;
  }

  beforeEach(async () => {
    rootElement = setupTestDOM(`
      <rendering id="rendering-outside-ph">
        <h1 class="renderingTitle">Foo</h1>
        <field type="image" id="rendering-outside-ph/fld-img" />
      </rendering>
      <placeholder key="empty"></placeholder>
      <placeholder key="ph">
        <rendering id="ph/rnd">
          <field type="single-line text" id="ph/rnd/fld-txt"></field>
          <p id="text-level-2">Some next on level 2</p>
          <placeholder key="ph/rnd/ph-ne" editable="false">
            <rendering id="ph/rnd/ph-ne/rnd">
              <div>Content</div>
            </rendering>
          </placeholder>
        </rendering>
        <rendering id="ph/rnd-ne" editable="false">
          <div>Content</div>
        </rendering>
      </placeholder>
      <div id="element-outside-chrome">content</div>
    `);

    chromeDom = jasmine.createSpyObj<ChromeDom>('FakeDom', { elementsFromPoint: [] });

    abortController = new AbortController();
    sut = new DesigningNativeEventsTranslator(chromeDom, abortController);
    const messagingService = jasmine.createSpyObj<MessagingService>('MessagingService', ['setEditingChannelRpcServices']);
    const chromeParser = new InlineChromeParser(
      new ChromeInlineEditorFactory(chromeDom, ThrowingLogger),
      messagingService,
      abortController,
    );
    chromes = await new ChromeReader(chromeParser).readChromes(rootElement);
    sut.setupEvents(chromes);
  });

  afterEach(() => {
    teardownTestDOM(rootElement);
  });

  it('should emit event on drag:start', () => {
    const handler = spyOnEvent(sut.onDragStart);

    sut.onNativeDragStart();

    expect(handler).toHaveBeenCalled();
  });

  it('should emit event on drag:end', () => {
    const handler = spyOnEvent(sut.onDragLeave);

    sut.onNativeDragEnd();

    expect(handler).toHaveBeenCalled();
  });

  it('should emit event on drag:leave', () => {
    const handler = spyOnEvent(sut.onDragLeave);

    sut.onNativeDragLeave();

    expect(handler).toHaveBeenCalled();
  });

  describe('drag:over', () => {
    describe('move rendering within Canvas', () => {
      it('should emit moved Rendering', () => {
        const handler = spyOnEvent(sut.onDragOver);
        const emptyPh = findPlaceholder('empty');
        const movedRenderingId = 'super-awesome-rendering-id';
        const movedRendering = { chromeId: movedRenderingId } as RenderingChrome;
        const dragInfo = makeDragInfo(emptyPh.startElement.nextElementSibling!, movedRenderingId, movedRendering);

        sut.onNativeDragOver(dragInfo);

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(jasmine.objectContaining({ renderingDefinitionId: movedRenderingId, movedRendering }));
      });
    });

    it('should emit rendering id', () => {
      const handler = spyOnEvent(sut.onDragOver);
      const emptyPh = findPlaceholder('empty');
      const dragInfo = makeDragInfo(emptyPh.startElement.nextElementSibling!, 'super-awesome-rendering-id');

      sut.onNativeDragOver(dragInfo);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(jasmine.objectContaining({ renderingDefinitionId: 'super-awesome-rendering-id' }));
    });

    it('should emit placeholder for drag over empty placeholder', () => {
      const handler = spyOnEvent(sut.onDragOver);
      const emptyPh = findPlaceholder('empty');
      const dragInfo = makeDragInfo(emptyPh.startElement.nextElementSibling!);

      sut.onNativeDragOver(dragInfo);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        jasmine.objectContaining({ hit: jasmine.objectContaining({ type: 'native', chrome: emptyPh }) }),
      );
    });

    it('should emit rendering for drag over rendering inside placeholder', () => {
      const handler = spyOnEvent(sut.onDragOver);
      const rendering = findRendering('ph/rnd');
      const dragInfo = makeDragInfo(rendering.startElement.nextElementSibling!);

      sut.onNativeDragOver(dragInfo);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        jasmine.objectContaining({ hit: jasmine.objectContaining({ type: 'native', chrome: rendering }) }),
      );
    });

    it('should emit field for drag over field inside placeholder', () => {
      const handler = spyOnEvent(sut.onDragOver);
      const field = findField('ph/rnd/fld-txt');
      const dragInfo = makeDragInfo(field.element);

      sut.onNativeDragOver(dragInfo);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(jasmine.objectContaining({ hit: jasmine.objectContaining({ type: 'native', chrome: field }) }));
    });

    it('should emit rendering for drag over non-editable rendering', () => {
      const handler = spyOnEvent(sut.onDragOver);
      const nonEditableRnd = findRendering('ph/rnd-ne');
      const dragInfo = makeDragInfo(nonEditableRnd.startElement.nextElementSibling!);

      sut.onNativeDragOver(dragInfo);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        jasmine.objectContaining({ hit: jasmine.objectContaining({ type: 'native', chrome: nonEditableRnd }) }),
      );
    });

    it('should emit rendering for drag over rendering outside of placeholder', () => {
      const handler = spyOnEvent(sut.onDragOver);
      const rendering = findRendering('rendering-outside-ph');
      const dragInfo = makeDragInfo(rendering.startElement.nextElementSibling!);

      sut.onNativeDragOver(dragInfo);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        jasmine.objectContaining({ hit: jasmine.objectContaining({ type: 'native', chrome: rendering }) }),
      );
    });

    it('should emit leave event if cannot find element under cursor', () => {
      const handler = spyOnEvent(sut.onDragLeave);

      sut.onNativeDragOver({ clientX: 42, clientY: 42, renderingId: '42' });

      expect(handler).toHaveBeenCalled();
    });

    it('should emit leave event if element does not belong to chrome', () => {
      const handler = spyOnEvent(sut.onDragLeave);
      const element = rootElement.querySelector('#element-outside-chrome')!;
      chromeDom.elementsFromPoint.withArgs(42, 42).and.returnValue([element]);

      sut.onNativeDragOver({ clientX: 42, clientY: 42, renderingId: '42' });

      expect(handler).toHaveBeenCalled();
    });

    it('should report event for custom drop zone', () => {
      const handler = spyOnEvent(sut.onDragOver);
      const adHocDropZoneElement = rootElement.appendChild(document.createElement('div'));
      const dragInfo = makeDragInfo(adHocDropZoneElement);
      const customData = { life: 'is difficult' };

      sut.registerCustomDropZone(adHocDropZoneElement, customData);
      sut.onNativeDragOver(dragInfo);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        jasmine.objectContaining({ hit: jasmine.objectContaining({ type: 'custom', data: customData }) }),
      );
    });
  });

  describe('drop', () => {
    it('should emit rendering id', () => {
      const handler = spyOnEvent(sut.onDrop);
      const emptyPh = findPlaceholder('empty');
      const dragInfo = makeDragInfo(emptyPh.startElement.nextElementSibling!, 'super-awesome-rendering-id');

      sut.onNativeDrop(dragInfo);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(jasmine.objectContaining({ renderingDefinitionId: 'super-awesome-rendering-id' }));
    });

    it('should emit placeholder for drop to empty placeholder', () => {
      const handler = spyOnEvent(sut.onDrop);
      const emptyPh = findPlaceholder('empty');
      const dragInfo = makeDragInfo(emptyPh.startElement.nextElementSibling!);

      sut.onNativeDrop(dragInfo);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        jasmine.objectContaining({ hit: jasmine.objectContaining({ type: 'native', chrome: emptyPh }) }),
      );
    });

    it('should emit rendering for drop to rendering inside placeholder', () => {
      const handler = spyOnEvent(sut.onDrop);
      const rendering = findRendering('ph/rnd');
      const dragInfo = makeDragInfo(rendering.startElement.nextElementSibling!);

      sut.onNativeDrop(dragInfo);

      expect(handler).toHaveBeenCalledTimes(1);
      const [phInfo] = handler.calls.mostRecent().args;
      expect(phInfo.hit).toEqual(jasmine.objectContaining({ type: 'native', chrome: rendering }));
    });

    it('should emit field for drop to field inside placeholder', () => {
      const handler = spyOnEvent(sut.onDrop);
      const field = findField('ph/rnd/fld-txt');
      const dragInfo = makeDragInfo(field.element);

      sut.onNativeDrop(dragInfo);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(jasmine.objectContaining({ hit: jasmine.objectContaining({ type: 'native', chrome: field }) }));
    });

    it('should emit rendering for drop to non-editable rendering', () => {
      const handler = spyOnEvent(sut.onDrop);
      const nonEditableRnd = findRendering('ph/rnd-ne');
      const dragInfo = makeDragInfo(nonEditableRnd.startElement.nextElementSibling!);

      sut.onNativeDrop(dragInfo);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        jasmine.objectContaining({ hit: jasmine.objectContaining({ type: 'native', chrome: nonEditableRnd }) }),
      );
    });

    it('should emit rendering for drop to rendering outside of placeholder', () => {
      const handler = spyOnEvent(sut.onDrop);
      const rendering = findRendering('rendering-outside-ph');
      const dragInfo = makeDragInfo(rendering.startElement.nextElementSibling!);

      sut.onNativeDrop(dragInfo);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        jasmine.objectContaining({ hit: jasmine.objectContaining({ type: 'native', chrome: rendering }) }),
      );
    });

    it('should emit leave event if cannot find element under cursor', () => {
      const handler = spyOnEvent(sut.onDragLeave);

      sut.onNativeDrop({ clientX: 42, clientY: 42, renderingId: '42' });

      expect(handler).toHaveBeenCalled();
    });

    it('should emit leave event if element does not belong to chrome', () => {
      const handler = spyOnEvent(sut.onDragLeave);
      const element = rootElement.querySelector('#element-outside-chrome')!;
      chromeDom.elementsFromPoint.withArgs(42, 42).and.returnValue([element]);

      sut.onNativeDrop({ clientX: 42, clientY: 42, renderingId: '42' });

      expect(handler).toHaveBeenCalled();
    });

    it('should report event for custom drop zone', () => {
      const handler = spyOnEvent(sut.onDrop);
      const adHocDropZoneElement = rootElement.appendChild(document.createElement('div'));
      const dragInfo = makeDragInfo(adHocDropZoneElement);
      const customData = { life: 'is difficult' };

      sut.registerCustomDropZone(adHocDropZoneElement, customData);
      sut.onNativeDrop(dragInfo);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(jasmine.objectContaining({ hit: { type: 'custom', data: customData } }));
    });
  });

  describe('Should not raise events after abort', () => {
    it('should not emit onDragOver', () => {
      const handler = spyOnEvent(sut.onDragOver);
      const emptyPh = findPlaceholder('empty');
      const dragInfo = makeDragInfo(emptyPh.startElement.nextElementSibling!);

      abortController.abort();
      sut.onNativeDragOver(dragInfo);

      expect(handler).not.toHaveBeenCalled();
      expect(handler).not.toHaveBeenCalled();
    });

    it('should not emit onDragOver from custom drop zone', () => {
      const handler = spyOnEvent(sut.onDragOver);
      const adHocDropZoneElement = rootElement.appendChild(document.createElement('div'));
      const dragInfo = makeDragInfo(adHocDropZoneElement);
      const customData = { life: 'is tough' };

      abortController.abort();
      sut.registerCustomDropZone(adHocDropZoneElement, customData);
      sut.onNativeDragOver(dragInfo);

      expect(handler).not.toHaveBeenCalled();
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
