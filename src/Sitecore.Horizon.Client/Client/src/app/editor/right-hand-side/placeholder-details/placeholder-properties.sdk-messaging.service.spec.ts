/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import {
  MessagingEventsEmitterChannel,
  MessagingRpcProvider,
  MessagingRpcServicesImplementation,
} from '@sitecore/page-composer-sdk';
import {
  PlaceholderDetails,
  PlaceholderPropertiesContract,
  PlaceholderPropertiesEvents,
  PlaceholderPropertiesRpc,
} from 'sdk/contracts/placeholder-properties.contract';
import { PlaceholderPropertiesSdkMessagingService } from './placeholder-properties.sdk-messaging.service';

describe(PlaceholderPropertiesSdkMessagingService.name, () => {
  let sut: PlaceholderPropertiesSdkMessagingService;
  let messaging: jasmine.SpyObj<NgGlobalMessaging>;
  let eventEmitterMock: jasmine.SpyObj<MessagingEventsEmitterChannel<PlaceholderPropertiesEvents>>;
  let createRpcMock: jasmine.SpyObj<MessagingRpcProvider>;
  let implementationMock: jasmine.SpyObj<MessagingRpcServicesImplementation<PlaceholderPropertiesRpc>>;

  let getContractAndImplementation: () => any[];

  const testPlaceholderDetails: PlaceholderDetails = {
    placeholderKey: 'phKey1',
    placeholderName: 'phName1',
    placeholderDisplayName: 'phDisplayName1',
  };

  beforeEach(() => {
    messaging = jasmine.createSpyObj<NgGlobalMessaging>('messagingSpy', ['createEventEmitter', 'createRpc']);

    createRpcMock = jasmine.createSpyObj<MessagingRpcProvider>('createRpcMock', ['disconnect']);
    messaging.createRpc.and.returnValue(createRpcMock);

    eventEmitterMock = jasmine.createSpyObj<MessagingEventsEmitterChannel<PlaceholderPropertiesEvents>>(
      'eventEmitterMock',
      ['emit'],
    );
    messaging.createEventEmitter.and.returnValue(eventEmitterMock);

    implementationMock = jasmine.createSpyObj<MessagingRpcServicesImplementation<PlaceholderPropertiesRpc>>(
      'implementation mock',
      ['getPlaceholderDetails'],
    );

    implementationMock.getPlaceholderDetails.and.returnValue(testPlaceholderDetails);

    getContractAndImplementation = () => {
      return messaging.createRpc.calls.mostRecent().args;
    };

    sut = new PlaceholderPropertiesSdkMessagingService(messaging);
  });

  describe('WHEN create an instance of the service', () => {
    it('should create event emitter', () => {
      expect(messaging.createEventEmitter).toHaveBeenCalledWith(PlaceholderPropertiesContract);
    });
  });

  describe('init()', () => {
    it('should create Global Messaging RPC and set empty implementation', () => {
      sut.init();

      const [contract, implementation] = getContractAndImplementation();

      expect(contract).toBe(PlaceholderPropertiesContract);
      expect(() => implementation.getPlaceholderDetails()).toThrowError('Service not available right now.');
    });
  });

  describe('setRpcImpl()', () => {
    it('should set implementation', () => {
      sut.setRpcImpl(implementationMock);
      sut.init();

      const [, implementation] = getContractAndImplementation();
      expect(implementation.getPlaceholderDetails()).toEqual(testPlaceholderDetails);
    });

    describe('AND then resetRpcImpl()', () => {
      it('should reset implementation', () => {
        sut.setRpcImpl(implementationMock);

        sut.resetRpcImpl();
        sut.init();

        const [, implementation] = getContractAndImplementation();
        expect(() => implementation.getPlaceholderDetails()).toThrowError('Service not available right now.');
      });
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
