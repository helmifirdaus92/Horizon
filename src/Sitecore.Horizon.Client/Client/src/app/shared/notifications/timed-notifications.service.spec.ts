/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, tick } from '@angular/core/testing';
import { createSpyObserver } from 'app/testing/test.utils';
import { scheduled } from 'rxjs';
import { asyncScheduler } from 'rxjs/internal/scheduler/async';
import { TimedNotification, TimedNotificationsService } from './timed-notifications.service';

describe('TimedNotificationsService', () => {
  let service: TimedNotificationsService;
  beforeEach(() => {
    service = new TimedNotificationsService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('push()', () => {
    it('should emit pushed notifications', () => {
      const notification = new TimedNotification('id', 'text', 'error', 'root');
      const result: TimedNotification[] = [];

      service.getNotifications('root').forEach((x) => result.push(x));

      service.push(notification.id, notification.text, notification.severity);

      expect(result.length).toBe(1);
      expect(result[0].id).toContain(notification.id);
      expect(result[0].text).toContain(notification.text);
      expect(result[0].severity).toContain(notification.severity);
      expect(result[0].notificationScope).toContain(notification.notificationScope);
    });

    describe('AND text is Observable', () => {
      it('should emit pushed notifications once the text emits a value', fakeAsync(() => {
        const id = 'id';
        const text = 'hello Max';
        const text$ = scheduled([text], asyncScheduler);
        const spy = jasmine.createSpy('spy');
        service.getNotifications('root').subscribe(spy);

        service.push(id, text$);

        expect(spy).not.toHaveBeenCalled();
        tick();
        expect(spy).toHaveBeenCalledTimes(1);
        const notification: TimedNotification = spy.calls.argsFor(0)[0];
        expect(notification.text).toBe(text);
        flush();
      }));
    });
  });

  it('should watch for notification changes', () => {
    const subscriberSpy = createSpyObserver();
    service.watchHideNotification().subscribe(subscriberSpy);

    service.hideNotificationById('foo');

    expect(subscriberSpy.next).toHaveBeenCalled();
  });
});
