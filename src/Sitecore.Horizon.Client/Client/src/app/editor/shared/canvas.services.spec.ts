/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { createSpyObserver } from 'app/testing/test.utils';
import { RhsEditorMessagingReconnectable } from '../right-hand-side/rhs-editor-messaging';
import {
  CanvasLayoutServices,
  CanvasServices,
  CanvasServicesImpl,
  ChromeSelectEvent,
  ChromeSelection,
} from './canvas.services';

describe(CanvasServices.name, () => {
  let sut: CanvasServices;

  beforeEach(() => {
    sut = new CanvasServices();
  });

  describe('chromeSelect$', () => {
    it('should emit undefined by default', () => {
      const observer = createSpyObserver();

      sut.chromeSelect$.subscribe(observer);

      expect(observer.next).toHaveBeenCalledWith({ selection: undefined, eventSource: undefined });
    });

    it('should emit set chrome', () => {
      const observer = createSpyObserver();
      sut.chromeSelect$.subscribe(observer);

      const selection: ChromeSelection = {
        chrome: {} as ChromeInfo,
        messaging: {} as RhsEditorMessagingReconnectable,
      };
      const selectionEvent: ChromeSelectEvent = {
        selection,
        eventSource: undefined,
      };

      sut.setSelectedChrome(selectionEvent);

      expect(observer.next).toHaveBeenCalledWith(selectionEvent);
    });

    it('should re-emit set chrome on late subscription', () => {
      const observer = createSpyObserver();
      const selection: ChromeSelection = {
        chrome: {} as ChromeInfo,
        messaging: {} as RhsEditorMessagingReconnectable,
      };
      const selectionEvent: ChromeSelectEvent = {
        selection,
        eventSource: undefined,
      };

      sut.setSelectedChrome(selectionEvent);
      sut.chromeSelect$.subscribe(observer);

      expect(observer.next).toHaveBeenCalledWith(selectionEvent);
    });
  });

  describe('getCurrentLayout', () => {
    it('should forward layout calls to impl layout', () => {
      const layout = jasmine.createSpyObj<CanvasLayoutServices>({ removeRendering: undefined });
      const impl = jasmine.createSpyObj<CanvasServicesImpl>({}, { layout });
      const renderingInstanceId = 'TEST-RENDERING-ID';

      sut.setCanvasServicesImpl(impl);
      sut.getCurrentLayout().removeRendering(renderingInstanceId);

      expect(layout.removeRendering).toHaveBeenCalledWith(renderingInstanceId);
    });

    it('should fail if impl is not set', () => {
      const renderingInstanceId = 'TEST-RENDERING-ID';

      expect(() => sut.getCurrentLayout().findRendering(renderingInstanceId)).toThrow();
    });

    it('should fail after impl reset', () => {
      const layout = jasmine.createSpyObj<CanvasLayoutServices>({ removeRendering: undefined });
      const impl = jasmine.createSpyObj<CanvasServicesImpl>({}, { layout });
      const renderingInstanceId = 'TEST-RENDERING-ID';

      sut.setCanvasServicesImpl(impl);
      sut.resetCanvasServicesImpl();

      expect(() => sut.getCurrentLayout().findRendering(renderingInstanceId)).toThrow();
    });

    it('should work with latest layout for cached layout object', () => {
      const layout1 = jasmine.createSpyObj<CanvasLayoutServices>({ removeRendering: undefined });
      const impl1 = jasmine.createSpyObj<CanvasServicesImpl>({}, { layout: layout1 });
      const layout2 = jasmine.createSpyObj<CanvasLayoutServices>({ removeRendering: undefined });
      const impl2 = jasmine.createSpyObj<CanvasServicesImpl>({}, { layout: layout2 });
      const renderingInstanceId = 'TEST-RENDERING-ID';

      sut.setCanvasServicesImpl(impl1);
      const currentLayout = sut.getCurrentLayout();
      sut.setCanvasServicesImpl(impl2);
      currentLayout.removeRendering(renderingInstanceId);

      expect(layout2.removeRendering).toHaveBeenCalledWith(renderingInstanceId);
      expect(layout1.removeRendering).not.toHaveBeenCalled();
    });
  });
});
