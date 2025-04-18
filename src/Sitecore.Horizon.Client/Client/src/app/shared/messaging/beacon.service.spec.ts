/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import { nextTick } from 'app/testing/test.utils';
import { ContextService } from '../client-state/context.service';
import { RenderingHostService } from '../rendering-host/rendering-host.service';
import { BeaconService } from './beacon.service';
import {
  BeaconCanvasEvents,
  BeaconCanvasRpcServices,
  BeaconHorizonEvents,
  BeaconHorizonRpcServices,
  BeaconState,
} from './horizon-canvas.contract.parts';
import { MessagingService } from './messaging.service';

describe('BeaconService', () => {
  let service: BeaconService;
  let messagingServiceMock: jasmine.SpyObj<MessagingService>;
  let contextServiceMock: jasmine.SpyObj<ContextService>;
  let renderingHostServiceMock: jasmine.SpyObj<RenderingHostService>;
  let testBeaconChannel: TestMessagingP2PChannel<
    BeaconCanvasEvents,
    BeaconHorizonEvents,
    BeaconCanvasRpcServices,
    BeaconHorizonRpcServices
  >;

  beforeEach(() => {
    messagingServiceMock = jasmine.createSpyObj('MessagingService', ['getBeaconCanvasChannel']);
    contextServiceMock = jasmine.createSpyObj('ContextService', ['updateContext'], {
      variant: 'cur-variant',
    });
    renderingHostServiceMock = jasmine.createSpyObj('RenderingHostService', ['isDirectIntegrationEnabled']);
    renderingHostServiceMock.isDirectIntegrationEnabled.and.returnValue(Promise.resolve(false));

    testBeaconChannel = makeTestMessagingP2PChannelFromDef(BeaconService, {});
    messagingServiceMock.getBeaconCanvasChannel.and.returnValue(testBeaconChannel);

    TestBed.configureTestingModule({
      providers: [
        BeaconService,
        { provide: MessagingService, useValue: messagingServiceMock },
        { provide: ContextService, useValue: contextServiceMock },
        { provide: RenderingHostService, useValue: renderingHostServiceMock },
      ],
    });

    service = TestBed.inject(BeaconService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize and listen to beacon channel messages', () => {
    service.init();

    expect(testBeaconChannel.getEventSubscribers('state').length).toBeGreaterThan(0);
  });

  it('should synchronize context with beacon', async () => {
    const beaconState: BeaconState = {
      itemId: 'item1',
      itemVersion: 2,
      language: 'da',
      siteName: 'site1',
      variant: 'var1',
    };
    service.init();

    await testBeaconChannel.dispatchEvent('state', beaconState);
    await nextTick();

    expect(contextServiceMock.updateContext).toHaveBeenCalledWith(beaconState, { eventSource: 'CANVAS_BEACON' });
  });

  it('should not overwrite a variant  when direct rendering host integration is enabled', async () => {
    const beaconState: BeaconState = {
      itemId: 'item1',
      itemVersion: 2,
      language: 'da',
      siteName: 'site1',
      variant: 'var1',
    };
    service.init();
    renderingHostServiceMock.isDirectIntegrationEnabled.and.returnValue(Promise.resolve(true));
    await testBeaconChannel.dispatchEvent('state', beaconState);
    await nextTick();

    expect(renderingHostServiceMock.isDirectIntegrationEnabled).toHaveBeenCalled();
    expect(contextServiceMock.updateContext).toHaveBeenCalledWith(
      { ...beaconState, variant: 'cur-variant' },
      { eventSource: 'CANVAS_BEACON' },
    );
  });
});
