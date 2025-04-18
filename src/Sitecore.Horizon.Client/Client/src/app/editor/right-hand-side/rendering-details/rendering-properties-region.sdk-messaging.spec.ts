/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import {
  MessagingEventsEmitterChannel,
  MessagingRpcProvider,
  MessagingRpcServicesImplementation,
} from '@sitecore/page-composer-sdk';
import { firstValueFrom } from 'rxjs';
import { RenderingDetails, RenderingPropertiesContract, RenderingPropertiesEvents, RenderingPropertiesRpc } from 'sdk';
import { RenderingPropertiesSdkMessagingService } from './rendering-properties.sdk-messaging.service';

describe('RenderingPropertiesSdkMessagingService', () => {
  let sut: RenderingPropertiesSdkMessagingService;
  let messaging: jasmine.SpyObj<NgGlobalMessaging>;
  let eventEmitterMock: jasmine.SpyObj<MessagingEventsEmitterChannel<RenderingPropertiesEvents>>;
  let createRpcMock: jasmine.SpyObj<MessagingRpcProvider>;
  let implementationMock: jasmine.SpyObj<MessagingRpcServicesImplementation<RenderingPropertiesRpc>>;
  let implementationPostMessageSpy: jasmine.Spy;
  let implementationSetRenderingDetailsSpy: jasmine.Spy;

  let getContractAndImplementation: () => any[];

  const testMessage = 'test message';
  const testProtocols = ['protocols'];
  const testRenderingDetails: RenderingDetails = {
    instanceId: 'instanceId1',
    renderingId: 'renderingId1',
    placeholderKey: 'phKey1',
    dataSource: 'ds1',
    parameters: {
      key1: 'value1',
      key2: 'value2',
    },
  };
  const testIsInPersonalizationMode = true;

  beforeEach(() => {
    messaging = jasmine.createSpyObj<NgGlobalMessaging>('messagingSpy', ['createEventEmitter', 'createRpc']);

    createRpcMock = jasmine.createSpyObj<MessagingRpcProvider>('createRpcMock', ['disconnect']);
    messaging.createRpc.and.returnValue(createRpcMock);

    eventEmitterMock = jasmine.createSpyObj<MessagingEventsEmitterChannel<RenderingPropertiesEvents>>(
      'eventEmitterMock',
      ['emit'],
    );
    messaging.createEventEmitter.and.returnValue(eventEmitterMock);

    implementationMock = jasmine.createSpyObj<MessagingRpcServicesImplementation<RenderingPropertiesRpc>>(
      'implementation mock',
      [
        'getInlineEditorProtocols',
        'postInlineEditorMessage',
        'getRenderingDetails',
        'setRenderingDetails',
        'getIsInPersonalizationMode',
      ],
    );
    implementationMock.getInlineEditorProtocols.and.returnValue(testProtocols);
    implementationMock.getIsInPersonalizationMode.and.returnValue(testIsInPersonalizationMode);
    implementationPostMessageSpy = jasmine.createSpy();
    implementationMock.postInlineEditorMessage.and.callFake((message) => {
      implementationPostMessageSpy(message);
    });
    implementationSetRenderingDetailsSpy = jasmine.createSpy();
    implementationMock.getRenderingDetails.and.returnValue(testRenderingDetails);
    implementationMock.setRenderingDetails.and.callFake((details) => {
      implementationSetRenderingDetailsSpy(details);
    });

    getContractAndImplementation = () => {
      return messaging.createRpc.calls.mostRecent().args;
    };

    sut = new RenderingPropertiesSdkMessagingService(messaging);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('WHEN create an instance of the service', () => {
    it('should create event emitter', () => {
      expect(messaging.createEventEmitter).toHaveBeenCalledWith(RenderingPropertiesContract);
    });
  });

  describe('init()', () => {
    it('should create Global Messaging RPC and set empty implementation', () => {
      sut.init();

      const [contract, implementation] = getContractAndImplementation();

      expect(contract).toBe(RenderingPropertiesContract);
      expect(() => implementation.postInlineEditorMessage('message')).toThrowError('Service not available right now.');
      expect(() => implementation.getInlineEditorProtocols()).toThrowError('Service not available right now.');
      expect(() => implementation.getRenderingDetails()).toThrowError('Service not available right now.');
      expect(() => implementation.setRenderingDetails({})).toThrowError('Service not available right now.');
      expect(() => implementation.getIsInPersonalizationMode()).toThrowError('Service not available right now.');
    });
  });

  describe('setRpcImpl()', () => {
    it('should set implementation', () => {
      sut.setRpcImpl(implementationMock);
      sut.init();

      const [, implementation] = getContractAndImplementation();
      implementation.postInlineEditorMessage(testMessage);
      implementation.setRenderingDetails(testRenderingDetails);

      expect(implementation.getInlineEditorProtocols()).toEqual(testProtocols);
      expect(implementation.getIsInPersonalizationMode()).toEqual(testIsInPersonalizationMode);
      expect(implementationPostMessageSpy).toHaveBeenCalledWith(testMessage);
      expect(implementation.getRenderingDetails()).toEqual(testRenderingDetails);
      expect(implementationSetRenderingDetailsSpy).toHaveBeenCalledWith(testRenderingDetails);
    });

    it('should set messaging status to connected', async () => {
      sut.init();
      sut.setRpcImpl(implementationMock);

      const status = await firstValueFrom(sut.messagingStatus$);

      expect(status).toEqual('connected');
    });

    describe('AND then resetRpcImpl()', () => {
      it('should reset implementation', () => {
        sut.setRpcImpl(implementationMock);

        sut.resetRpcImpl();
        sut.init();

        const [, implementation] = getContractAndImplementation();

        expect(() => implementation.postInlineEditorMessage('message')).toThrowError(
          'Service not available right now.',
        );
        expect(() => implementation.getInlineEditorProtocols()).toThrowError('Service not available right now.');
        expect(() => implementation.getRenderingDetails()).toThrowError('Service not available right now.');
        expect(() => implementation.setRenderingDetails({})).toThrowError('Service not available right now.');
      });

      it('should set messaging status to disconnected', async () => {
        sut.setRpcImpl(implementationMock);

        sut.resetRpcImpl();
        sut.init();

        const status = await firstValueFrom(sut.messagingStatus$);

        expect(status).toEqual('disconnected');
      });
    });
  });

  describe('emitOnInlineEditorMessageEvent()', () => {
    it('should emit the event', () => {
      const msg = 'message';
      sut.emitOnInlineEditorMessageEvent(msg);

      expect(eventEmitterMock.emit).toHaveBeenCalledWith('onInlineEditorMessage', msg);
    });
  });

  describe('emitReconnectEvent()', () => {
    it('should emit the event', () => {
      sut.emitReconnectEvent();
      const emitEventName = eventEmitterMock.emit.calls.mostRecent().args[0];
      const emitEventArgs = eventEmitterMock.emit.calls.mostRecent().args[1];

      expect(emitEventName).toBe('reconnect');
      expect(emitEventArgs).toBe(undefined);
    });
  });
});
