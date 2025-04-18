/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import {
  MessagingContract,
  MessagingRpcProvider,
  MessagingRpcServicesImplementation,
} from '@sitecore/page-composer-sdk';
import { TimedNotificationContract, TimedNotificationRpc } from 'sdk/contracts/timed-notification.contract';
import { TimedNotificationsSdkMessagingService } from './timed-notifications.sdk-messaging.service';
import { TimedNotification, TimedNotificationsService } from './timed-notifications.service';

describe(TimedNotificationsSdkMessagingService.name, () => {
  let sut: TimedNotificationsSdkMessagingService;
  let timedNotificationsServiceMock: jasmine.SpyObj<TimedNotificationsService>;
  let messaging: jasmine.SpyObj<NgGlobalMessaging>;
  let createRpcMock: jasmine.SpyObj<MessagingRpcProvider>;

  beforeEach(() => {
    messaging = jasmine.createSpyObj<NgGlobalMessaging>('messagingSpy', ['createEventEmitter', 'createRpc']);

    createRpcMock = jasmine.createSpyObj<MessagingRpcProvider>('createRpcMock', ['disconnect']);
    messaging.createRpc.and.returnValue(createRpcMock);

    timedNotificationsServiceMock = jasmine.createSpyObj<TimedNotificationsService>('TimedNotificationsService mock', [
      'push',
      'hideNotificationById',
    ]);
    timedNotificationsServiceMock.push.and.callFake(async (id, text, severity) => {
      return new TimedNotification(id, text as string, severity);
    });

    sut = new TimedNotificationsSdkMessagingService(messaging, timedNotificationsServiceMock);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('init()', () => {
    it('should create Global Messaging RPC and proxy "push" method', async () => {
      sut.init();

      const [contract, implementation] = messaging.createRpc.calls.mostRecent().args as [
        MessagingContract<unknown, unknown>,
        MessagingRpcServicesImplementation<TimedNotificationRpc>,
      ];
      const { id, text, severity, notificationScope } = (await implementation.push(
        'id',
        'text',
        'success',
      )) as Partial<TimedNotification>;
      expect(contract).toBe(TimedNotificationContract);
      expect(timedNotificationsServiceMock.push).toHaveBeenCalledOnceWith('id', 'text', 'success', 'root');
      expect(id).toBe('id');
      expect(text).toBe('text');
      expect(severity).toBe('success');
      expect(notificationScope).toBe('root');
    });

    it('should create Global Messaging RPC and proxy "hide" method', async () => {
      sut.init();

      const [contract, implementation] = messaging.createRpc.calls.mostRecent().args as [
        MessagingContract<unknown, unknown>,
        MessagingRpcServicesImplementation<TimedNotificationRpc>,
      ];
      implementation.hideById('id');
      expect(contract).toBe(TimedNotificationContract);
      expect(timedNotificationsServiceMock.hideNotificationById).toHaveBeenCalledWith('id');
    });
  });
});
