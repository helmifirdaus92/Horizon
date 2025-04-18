/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import { EditingChannelDef } from 'app/shared/messaging/horizon-canvas.contract.defs';
import {
  EditingCanvasEvents,
  EditingCanvasRpcServices,
  EditingHorizonEvents,
  EditingHorizonRpcServices,
  RenderingFieldsdData,
} from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { firstValueFrom } from 'rxjs';
import { first } from 'rxjs/operators';
import { DesigningService } from './designing.service';

describe('DesigningService', () => {
  let sut: DesigningService;
  let editingTestChannel: TestMessagingP2PChannel<
    EditingCanvasEvents,
    EditingHorizonEvents,
    EditingCanvasRpcServices,
    EditingHorizonRpcServices
  >;

  beforeEach(() => {
    editingTestChannel = makeTestMessagingP2PChannelFromDef(EditingChannelDef, {
      updatePageState: () => {},
      selectChrome: () => {},
      deselectChrome: () => {},
      highlightPartialDesign: () => {},
      unhighlightPartialDesign: () => {},
      getChildRenderings: () => [],
      getChildPlaceholders: () => [],
      selectRendering: () => {},
      getRenderingFields: () => ({}) as RenderingFieldsdData,
      getPageFields: () => [],
    });
    const messagingService = jasmine.createSpyObj<MessagingService>('MessagingService', {
      getEditingCanvasChannel: editingTestChannel,
    });

    sut = new DesigningService(messagingService);
    sut.init();
  });

  describe('droppable rendering ids', () => {
    it('should push nothing before event is emitted', () => {
      let value: readonly string[] | undefined;

      sut.droppableRenderingIds.subscribe((ids) => (value = ids));

      expect(value).toBeUndefined();
    });

    it('should push emitted value', () => {
      let value: readonly string[] | undefined;
      sut.droppableRenderingIds.subscribe((ids) => (value = ids));

      editingTestChannel.dispatchEvent('page:load', {
        droppableRenderingIds: ['42', '24'],
        fields: [],
        layout: '',
        layoutDeviceId: '',
        styles: {},
      });

      expect(value).toEqual(['42', '24']);
    });

    it('should repeat last value on late subscription', async () => {
      editingTestChannel.dispatchEvent('page:load', {
        droppableRenderingIds: ['42', '24'],
        fields: [],
        layout: '',
        layoutDeviceId: '',
        styles: {},
      });

      const value = await firstValueFrom(sut.droppableRenderingIds.pipe(first()));

      expect(value).toEqual(['42', '24']);
    });
  });
});
