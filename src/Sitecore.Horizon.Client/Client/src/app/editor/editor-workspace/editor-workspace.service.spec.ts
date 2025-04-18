/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { RpcServicesImplementation } from '@sitecore/horizon-messaging';
import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import { EditingChannelDef } from 'app/shared/messaging/horizon-canvas.contract.defs';
import {
  EditingCanvasRpcServices,
  EditingHorizonEvents,
  EditingHorizonRpcServices,
} from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { createSpyObserver, TestBedInjectSpy } from 'app/testing/test.utils';
import { EditingCanvasEvents } from 'sdk';
import { EditorWorkspaceService } from './editor-workspace.service';

describe(EditorWorkspaceService.name, () => {
  let sut: EditorWorkspaceService;

  let messagingServiceSpy: jasmine.SpyObj<MessagingService>;

  let editingTestChannel: TestMessagingP2PChannel<
    EditingCanvasEvents,
    EditingHorizonEvents,
    EditingCanvasRpcServices,
    EditingHorizonRpcServices
  >;

  const canvasEditingChannelRpcSpy = jasmine.createSpyObj<RpcServicesImplementation<EditingCanvasRpcServices>>(
    'EditingChannelRpc',
    ['updatePageState', 'selectChrome', 'getChildRenderings', 'getChildPlaceholders'],
  );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MessagingService,
          useValue: jasmine.createSpyObj<MessagingService>('MessagingService', ['getEditingCanvasChannel']),
        },
      ],
    });
    messagingServiceSpy = TestBedInjectSpy(MessagingService);

    editingTestChannel = makeTestMessagingP2PChannelFromDef(EditingChannelDef, canvasEditingChannelRpcSpy);
    messagingServiceSpy.getEditingCanvasChannel.and.returnValue(editingTestChannel);

    sut = TestBed.inject(EditorWorkspaceService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('iframe loading state', () => {
    describe('WHEN setLoadingState is set to true', () => {
      it('should return value true', () => {
        const resultSpy = createSpyObserver();

        sut.setCanvasLoadState({ isLoading: true });
        sut.watchCanvasLoadState().subscribe(resultSpy);

        expect(resultSpy.next).toHaveBeenCalledWith({ isLoading: true });
      });
    });

    describe('WHEN setLoadingState is set to false', () => {
      it('should return value false', () => {
        const resultSpy = createSpyObserver();

        const canvasLoadingState = { isLoading: false, itemId: 'itemId001', language: 'en' };
        sut.setCanvasLoadState(canvasLoadingState);
        sut.watchCanvasLoadState().subscribe(resultSpy);

        expect(resultSpy.next).toHaveBeenCalledWith(canvasLoadingState);
      });
    });
  });
});
