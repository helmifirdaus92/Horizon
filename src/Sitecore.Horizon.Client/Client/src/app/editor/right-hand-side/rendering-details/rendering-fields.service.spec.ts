/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* tslint:disable:no-unused-variable */

import { TestBed } from '@angular/core/testing';
import { RpcServicesImplementation } from '@sitecore/horizon-messaging';
import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import { EditingChannelDef } from 'app/shared/messaging/horizon-canvas.contract.defs';
import {
  EditingCanvasEvents,
  EditingCanvasRpcServices,
  EditingHorizonEvents,
  EditingHorizonRpcServices,
} from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { RenderingFieldsService } from './rendering-fields.service';

describe(RenderingFieldsService.name, () => {
  let sut: RenderingFieldsService;
  let messagingServiceSpy: jasmine.SpyObj<MessagingService>;
  let testgeneralChannelRpcSpy: jasmine.SpyObj<RpcServicesImplementation<EditingCanvasRpcServices>>;

  let testGeneralChannel: TestMessagingP2PChannel<
    EditingCanvasEvents,
    EditingHorizonEvents,
    EditingCanvasRpcServices,
    EditingHorizonRpcServices
  >;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RenderingFieldsService,
        {
          provide: MessagingService,
          useValue: jasmine.createSpyObj<MessagingService>('MessagingService', [
            'getEditingCanvasChannel',
            'connectEditingShell',
            'onCanvasDisconnect',
          ]),
        },
      ],
    });

    messagingServiceSpy = TestBedInjectSpy(MessagingService);
    testgeneralChannelRpcSpy = jasmine.createSpyObj<RpcServicesImplementation<EditingCanvasRpcServices>>(
      'EditingChannelRpc',
      ['getRenderingFields'],
    );
    testGeneralChannel = makeTestMessagingP2PChannelFromDef(EditingChannelDef, testgeneralChannelRpcSpy);
    messagingServiceSpy.getEditingCanvasChannel.and.returnValue(testGeneralChannel);
    sut = TestBed.inject(RenderingFieldsService);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });
});
