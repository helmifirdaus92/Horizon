/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import * as placeholderChrome from '../chrome/chrome.placeholder';
import { PlaceholderChrome } from '../chrome/chrome.placeholder';
import * as renderingChrome from '../chrome/chrome.rendering';
import { RenderingChrome } from '../chrome/chrome.rendering';
import { spyOnEvent } from '../messaging/event-emitter.testing';
import { DesigningDropTargetResolver } from './designing-drop-target-resolver';
import { DesigningManager, DropTarget } from './designing-manager';
import { DesigningHitEvent } from './designing-native-events-translator';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

function createDummyHitEvent(init: Partial<DesigningHitEvent> = {}): DesigningHitEvent {
  return {
    renderingDefinitionId: 'renderingId',
    hit: { type: 'custom', data: 'some data' },

    ...init,
  };
}

describe('DesigningFrameManager', () => {
  let sut: DesigningManager;
  let dropTargetResolver: jasmine.SpyObj<DesigningDropTargetResolver>;
  let placeholderSpy: jasmine.SpyObj<PlaceholderChrome>;

  const returnDropTarget = (target: DropTarget) => dropTargetResolver.resolveDropTarget.and.returnValue(target);

  beforeEach(() => {
    dropTargetResolver = jasmine.createSpyObj<DesigningDropTargetResolver>('DropTargetResolver', {
      resetCache: undefined,
      resolveDropTarget: undefined,
    });

    sut = new DesigningManager(dropTargetResolver);

    placeholderSpy = jasmine.createSpyObj<PlaceholderChrome>('ph', { canDropRendering: true });
  });

  it('should reset cache on drag:start', () => {
    sut.dragStart();

    expect(dropTargetResolver.resetCache).toHaveBeenCalled();
  });

  describe('dragOver', () => {
    it('should highlight placeholder', () => {
      const handler = spyOnEvent(sut.onHighlightDropTarget);
      const renderingSpy = jasmine.createSpyObj<RenderingChrome>('rendering', { getChromeInfo: undefined });
      const dropTarget: DropTarget = { placeholder: placeholderSpy, anchor: { target: renderingSpy, position: 'after' } };
      returnDropTarget(dropTarget);
      const hitEvent = createDummyHitEvent();

      sut.dragOver(hitEvent);

      expect(handler).toHaveBeenCalledWith({ canDrop: true, target: dropTarget });
    });

    [true, false].forEach((canDrop) =>
      it(`[canDrop: ${canDrop}] should return correct canDrop`, () => {
        const handler = spyOnEvent(sut.onHighlightDropTarget);
        placeholderSpy.canDropRendering.and.returnValue(canDrop);
        returnDropTarget({ placeholder: placeholderSpy });
        const hitEvent = createDummyHitEvent();

        sut.dragOver(hitEvent);

        expect(handler).toHaveBeenCalledWith(jasmine.objectContaining({ canDrop }));
      }),
    );

    it('should pass correct rendering id to canDrop', () => {
      returnDropTarget({ placeholder: placeholderSpy });
      const hitEvent = createDummyHitEvent({ renderingDefinitionId: 'id-forty-two' });

      sut.dragOver(hitEvent);

      expect(placeholderSpy.canDropRendering).toHaveBeenCalledWith('id-forty-two');
    });

    it('should emit clear highighting if cannot resolve drop target', () => {
      const highlightHandler = spyOnEvent(sut.onHighlightDropTarget);
      const clearHighlightingHandler = spyOnEvent(sut.onClearHighlightingDropTarget);
      dropTargetResolver.resolveDropTarget.and.returnValue(undefined);
      const hitEvent = createDummyHitEvent();

      sut.dragOver(hitEvent);

      expect(highlightHandler).not.toHaveBeenCalled();
      expect(clearHighlightingHandler).toHaveBeenCalled();
    });

    describe('show/hide guide drop zones', () => {
      it('should emit onShowGuideDropZones when drop target is not resolved and is dragged over rendering', () => {
        const showGuideDropZonesHandler = spyOnEvent(sut.onShowGuideDropZones);
        dropTargetResolver.resolveDropTarget.and.returnValue(undefined);
        const hitEvent = createDummyHitEvent({
          hit: { type: 'native', chrome: { parentChrome: { editable: true } as any } as RenderingChrome, clientY: 0 },
        });
        spyOn(renderingChrome, 'isRenderingChrome').and.returnValue(true);
        spyOn(placeholderChrome, 'isPlaceholderChrome').and.returnValue(true);

        sut.dragOver(hitEvent);

        expect(showGuideDropZonesHandler).toHaveBeenCalled();
      });

      it('should emit onClearGuideDropZones when parent placeholder is not editable', () => {
        const showGuideDropZonesHandler = spyOnEvent(sut.onShowGuideDropZones);
        const onClearGuideDropZones = spyOnEvent(sut.onClearGuideDropZones);
        dropTargetResolver.resolveDropTarget.and.returnValue(undefined);
        const hitEvent = createDummyHitEvent({
          hit: { type: 'native', chrome: { parentChrome: { editable: false } as any } as RenderingChrome, clientY: 0 },
        });
        spyOn(renderingChrome, 'isRenderingChrome').and.returnValue(true);
        spyOn(placeholderChrome, 'isPlaceholderChrome').and.returnValue(true);

        sut.dragOver(hitEvent);

        expect(showGuideDropZonesHandler).not.toHaveBeenCalled();
        expect(onClearGuideDropZones).toHaveBeenCalled();
      });

      it('should emit onClearGuideDropZones when drop target is not resolved and is dragged not over rendering', () => {
        const onClearGuideDropZones = spyOnEvent(sut.onClearGuideDropZones);
        const showGuideDropZonesHandler = spyOnEvent(sut.onShowGuideDropZones);

        dropTargetResolver.resolveDropTarget.and.returnValue(undefined);
        const hitEvent = createDummyHitEvent({ hit: { type: 'native', chrome: { parentChrome: {} } as RenderingChrome, clientY: 0 } });
        spyOn(renderingChrome, 'isRenderingChrome').and.returnValue(false);

        sut.dragOver(hitEvent);

        expect(onClearGuideDropZones).toHaveBeenCalled();
        expect(showGuideDropZonesHandler).not.toHaveBeenCalled();
      });

      it('should emit onClearGuideDropZones when drop target is resolved', () => {
        const onClearGuideDropZones = spyOnEvent(sut.onClearGuideDropZones);
        const showGuideDropZonesHandler = spyOnEvent(sut.onShowGuideDropZones);

        const dropTarget: DropTarget = { placeholder: placeholderSpy, anchor: { target: {} as any, position: 'after' } };
        returnDropTarget(dropTarget);
        const hitEvent = createDummyHitEvent({ hit: { type: 'native', chrome: { parentChrome: {} } as RenderingChrome, clientY: 0 } });

        sut.dragOver(hitEvent);

        expect(onClearGuideDropZones).toHaveBeenCalled();
        expect(showGuideDropZonesHandler).not.toHaveBeenCalled();
      });
    });
  });

  describe('dropRendering', () => {
    it('should emit drop event when rendering is dropped', () => {
      const handler = spyOnEvent(sut.onDropped);
      const renderingSpy = jasmine.createSpyObj<RenderingChrome>('rendering', { getChromeInfo: undefined });
      const dropTarget: DropTarget = { placeholder: placeholderSpy, anchor: { target: renderingSpy, position: 'after' } };
      returnDropTarget(dropTarget);
      const droppedRenderingDefinitionId = 'TEST_DROPPED_RENDERING_DEF_IF';
      const hitEvent = createDummyHitEvent({ renderingDefinitionId: droppedRenderingDefinitionId });

      sut.dropRendering(hitEvent);

      expect(handler).toHaveBeenCalledWith({
        placeholder: dropTarget.placeholder,
        anchor: dropTarget.anchor,
        renderingDefinitionId: droppedRenderingDefinitionId,
        movedRendering: undefined,
      });
    });

    it('should pass correct rendering id to canDrop', () => {
      returnDropTarget({ placeholder: placeholderSpy });
      const hitEvent = createDummyHitEvent({ renderingDefinitionId: 'id-forty-two' });

      sut.dropRendering(hitEvent);

      expect(placeholderSpy.canDropRendering).toHaveBeenCalledWith('id-forty-two');
    });

    it('should do nothing if cannot resolve drop target', () => {
      const highlightHandler = spyOnEvent(sut.onHighlightDropTarget);
      const clearHighlightingHandler = spyOnEvent(sut.onClearHighlightingDropTarget);
      const droppedHandler = spyOnEvent(sut.onDropped);
      dropTargetResolver.resolveDropTarget.and.returnValue(undefined);
      const hitEvent = createDummyHitEvent();

      sut.dropRendering(hitEvent);

      expect(highlightHandler).not.toHaveBeenCalled();
      expect(clearHighlightingHandler).not.toHaveBeenCalled();
      expect(droppedHandler).not.toHaveBeenCalled();
    });

    it('should do nothing if rendering is not compatible', () => {
      const highlightHandler = spyOnEvent(sut.onHighlightDropTarget);
      const clearHighlightingHandler = spyOnEvent(sut.onClearHighlightingDropTarget);
      const droppedHandler = spyOnEvent(sut.onDropped);
      returnDropTarget({ placeholder: placeholderSpy });
      placeholderSpy.canDropRendering.and.returnValue(false);
      const hitEvent = createDummyHitEvent();

      sut.dropRendering(hitEvent);

      expect(highlightHandler).not.toHaveBeenCalled();
      expect(clearHighlightingHandler).not.toHaveBeenCalled();
      expect(droppedHandler).not.toHaveBeenCalled();
    });
  });

  describe('dragLeave', () => {
    it('should clear highlighting', () => {
      const handler = spyOnEvent(sut.onClearHighlightingDropTarget);

      sut.dragLeave();

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('cancelDrop', () => {
    it('should emit event', () => {
      const handler = spyOnEvent(sut.onDroppedCanceled);

      sut.cancelDrop();

      expect(handler).toHaveBeenCalled();
    });
  });
});
