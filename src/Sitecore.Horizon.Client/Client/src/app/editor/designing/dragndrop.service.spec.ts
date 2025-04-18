/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TranslateService } from '@ngx-translate/core';
import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import { DesigningChannelDef } from 'app/shared/messaging/horizon-canvas.contract.defs';
import {
  DesigningCanvasEvents,
  DesigningCanvasRpcServices,
  DesigningHorizonEvents,
  DesigningHorizonRpcServices,
  DragInfo,
} from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { GlobalMessagingTesting } from 'app/testing/global-messaging-testing';
import { NEVER, of, Subject } from 'rxjs';
import { DragAndDropNewRenderingContract } from 'sdk/contracts/editing-canvas.contract';
import { CanvasLayoutServices, CanvasServices } from '../shared/canvas.services';
import { ComponentGalleryDialogService } from './component-gallery-dialog/component-gallery-dialog.service';
import { DesigningOverlay, DesigningOverlayService } from './designing-overlay.service';
import { DragndropService } from './dragndrop.service';

class DesigningOverlayMock implements Partial<DesigningOverlay> {
  allowDrop = false;
  destroy = jasmine.createSpy();
  dragenter$ = new Subject<void>();
  dragleave$ = new Subject<void>();
  dragover$ = new Subject<DragEvent>();
  drop$ = new Subject<DragEvent>();
  element = document.createElement('div');
}

describe(DragndropService.name, () => {
  let sut: DragndropService;
  let overlayServiceSpy: jasmine.SpyObj<DesigningOverlayService>;
  let overlay: DesigningOverlayMock;
  let timedNotificationService: jasmine.SpyObj<TimedNotificationsService>;
  let canvasLayoutServices: jasmine.SpyObj<CanvasLayoutServices>;
  let componentGalleryDialogService: jasmine.SpyObj<ComponentGalleryDialogService>;
  let designingChanel: TestMessagingP2PChannel<
    DesigningCanvasEvents,
    DesigningHorizonEvents,
    DesigningCanvasRpcServices,
    DesigningHorizonRpcServices
  >;
  const globalMessaging: GlobalMessagingTesting = new GlobalMessagingTesting();

  const renderingId = 'foo42';

  beforeEach(() => {
    overlay = new DesigningOverlayMock();
    overlayServiceSpy = jasmine.createSpyObj<DesigningOverlayService>('overlayService', {
      addOverlayOverIframe: overlay as any,
    });

    designingChanel = makeTestMessagingP2PChannelFromDef(DesigningChannelDef, {});
    const messagingServiceSpy = jasmine.createSpyObj<MessagingService>('messagingService', {
      getDesigningChannel: designingChanel,
    });
    componentGalleryDialogService = jasmine.createSpyObj<ComponentGalleryDialogService>({
      show: of('id'),
    });
    canvasLayoutServices = jasmine.createSpyObj<CanvasLayoutServices>({
      insertRendering: Promise.resolve(true),
      moveRendering: Promise.resolve(true),
    });
    const canvasServices = jasmine.createSpyObj<CanvasServices>({ getCurrentLayout: canvasLayoutServices });

    const translateService = jasmine.createSpyObj<TranslateService>({ get: NEVER });
    translateService.get.and.callFake((key) => of(key));

    timedNotificationService = jasmine.createSpyObj<TimedNotificationsService>({ push: undefined });

    sut = new DragndropService(
      overlayServiceSpy,
      messagingServiceSpy,
      canvasServices,
      translateService,
      timedNotificationService,
      globalMessaging,
      componentGalleryDialogService,
    );
  });

  describe('dragstart', () => {
    it('should send a "dragstart" message to designing channel', () => {
      sut.dragstart(renderingId);

      expect(designingChanel.getEmittedEvents('dragstart').length).toBe(1);
    });

    it('should create iframe overlay', () => {
      sut.dragstart(renderingId);

      expect(overlayServiceSpy.addOverlayOverIframe).toHaveBeenCalledTimes(1);
    });

    describe('AND the overlay emits dragenter', () => {
      it('should send a "dragenter" message to designing channel', () => {
        sut.dragstart(renderingId);
        overlay.dragenter$.next(undefined);

        expect(designingChanel.getEmittedEvents('dragenter').length).toBe(1);
      });
    });

    describe('AND the overlay emits dragleave', () => {
      it('should send a "dragleave" message to designing channel', () => {
        sut.dragstart(renderingId);
        overlay.dragleave$.next(undefined);

        expect(designingChanel.getEmittedEvents('dragleave').length).toBe(1);
      });
    });

    describe('AND the overlay emits dragover', () => {
      const [clientX, clientY] = [42, 903];

      it('should send a "dragover" message to designing channel with DragInfo', () => {
        sut.dragstart(renderingId);

        const dragEvent = new DragEvent('dragover', { clientX, clientY });
        overlay.dragover$.next(dragEvent);

        const expected: DragInfo = {
          clientX,
          clientY,
          renderingId,
        };
        expect(designingChanel.getEmittedEvents('dragover').length).toBe(1);
        expect(designingChanel.getEmittedEvents('dragover')[0]).toEqual(expected);
      });

      it('should ignore consecutive events with the same coordinates', () => {
        sut.dragstart(renderingId);

        overlay.dragover$.next(new DragEvent('dragover', { clientX, clientY }));
        overlay.dragover$.next(new DragEvent('dragover', { clientX, clientY }));

        expect(designingChanel.getEmittedEvents('dragover').length).toBe(1);

        overlay.dragover$.next(new DragEvent('dragover', { clientX: clientX - 1, clientY: clientY - 2 }));

        expect(designingChanel.getEmittedEvents('dragover').length).toBe(2);
      });
    });

    describe('AND the overlay emits drop', () => {
      it('should send a "drop" message to designing channel with DragInfo', () => {
        sut.dragstart(renderingId);

        const [clientX, clientY] = [42, 903];
        const dragEvent = new DragEvent('drop', { clientX, clientY });
        overlay.drop$.next(dragEvent);

        const expected: DragInfo = {
          clientX,
          clientY,
          renderingId,
        };

        expect(designingChanel.getEmittedEvents('drop').length).toBe(1);
        expect(designingChanel.getEmittedEvents('drop')[0]).toEqual(expected);
      });
    });

    describe('AND "allow-drop:change" message is received', () => {
      it('should set the value to the overlay allowDrop property', () => {
        sut.dragstart(renderingId);

        designingChanel.dispatchEvent('allow-drop:change', true);
        expect(overlay.allowDrop).toBe(true);
        designingChanel.dispatchEvent('allow-drop:change', false);
        expect(overlay.allowDrop).toBe(false);
      });
    });

    describe('AND dragend', () => {
      it('should send a "dragend" message to designing channel', () => {
        sut.dragstart(renderingId);
        sut.dragend();

        expect(designingChanel.getEmittedEvents('dragend').length).toBe(1);
      });

      it('should destroy the overlay and unsubscribe the channel', () => {
        sut.dragstart(renderingId);
        sut.dragend();

        expect(overlay.destroy).toHaveBeenCalledTimes(1);
        expect(designingChanel.getEventSubscribers('allow-drop:change').length).toBe(0);
      });
    });
  });

  describe('[messaging] insertRendering', () => {
    it('should insert rendering to layout', () => {
      designingChanel.registeredRpcServicesImpl!.insertRendering('test-rendering-def-id', 'test-ph-key', {
        position: 'before',
        targetInstanceId: 'target-rendering-instance-id',
      });

      expect(canvasLayoutServices.insertRendering).toHaveBeenCalledWith(
        'test-rendering-def-id',
        'test-ph-key',
        jasmine.objectContaining({
          position: 'before',
          target: 'target-rendering-instance-id',
        }),
      );
    });

    it('should not emit event if succeeded', async () => {
      canvasLayoutServices.insertRendering.and.returnValue(Promise.resolve(true));

      await designingChanel.registeredRpcServicesImpl!.insertRendering('id', 'ph-id', undefined);

      expect(designingChanel.getEmittedEvents('insertRendering:cancel').length).toBe(0);
    });

    it('should emit cancel event if failed', async () => {
      canvasLayoutServices.insertRendering.and.returnValue(Promise.resolve(false));

      await designingChanel.registeredRpcServicesImpl!.insertRendering('id', 'ph-id', undefined);

      expect(designingChanel.getEmittedEvents('insertRendering:cancel').length).toBe(1);
    });

    describe('insertion crashes', () => {
      it('should emit cancel event', async () => {
        canvasLayoutServices.insertRendering.and.returnValue(Promise.reject('FAIL'));

        await designingChanel.registeredRpcServicesImpl!.insertRendering('id', 'ph-id', undefined);

        expect(designingChanel.getEmittedEvents('insertRendering:cancel').length).toBe(1);
      });

      it('should show translated notification', async () => {
        canvasLayoutServices.insertRendering.and.returnValue(Promise.reject('FAIL'));

        await designingChanel.registeredRpcServicesImpl!.insertRendering('id', 'ph-id', undefined);

        expect(timedNotificationService.push).toHaveBeenCalledWith(
          jasmine.anything(),
          'EDITOR.RENDERING_INSERT_FAILED',
          jasmine.anything(),
        );
      });
    });
  });

  describe('[messaging] moveRendering', () => {
    it('should move rendering in layout', () => {
      designingChanel.registeredRpcServicesImpl!.moveRendering('test-rendering-def-id', 'test-ph-key', {
        position: 'before',
        targetInstanceId: 'target-rendering-instance-id',
      });

      expect(canvasLayoutServices.moveRendering).toHaveBeenCalledWith(
        'test-rendering-def-id',
        'test-ph-key',
        jasmine.objectContaining({
          position: 'before',
          target: 'target-rendering-instance-id',
        }),
      );
    });
  });

  describe('[globalMessaging] StartDragAndDrop/StopDragAndDrop', () => {
    it('should init drag and drop start', async () => {
      const renderingDefinitionId = 'renderingDefinition001';
      const spy = spyOn(sut, 'dragstart');

      const rpc = await globalMessaging.getRpc(DragAndDropNewRenderingContract);
      await rpc.startDragAndDrop(renderingDefinitionId);

      expect(spy).toHaveBeenCalledWith(renderingDefinitionId);
    });

    it('should stop drag and drop', async () => {
      const spy = spyOn(sut, 'dragend');

      const rpc = await globalMessaging.getRpc(DragAndDropNewRenderingContract);
      await rpc.stopDragAndDrop();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('[messaging] promptInsertRendering', () => {
    it('should prompt insert rendering dialog ', () => {
      const chromeDimension = { top: 0, left: 0, width: 0, height: 0 };
      const allowedRenderingIds = ['1', '2'];
      designingChanel.registeredRpcServicesImpl!.promptInsertRendering(
        'test-ph-key',
        allowedRenderingIds,
        chromeDimension,
      );

      expect(componentGalleryDialogService.show).toHaveBeenCalledWith({
        allowedRenderingIds,
        dimension: chromeDimension,
      });
      expect(canvasLayoutServices.insertRendering).toHaveBeenCalledWith('id', 'test-ph-key', undefined);
    });
  });
});
