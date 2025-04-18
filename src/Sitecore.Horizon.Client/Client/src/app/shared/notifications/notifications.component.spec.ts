/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TimedNotificationModule } from '@sitecore/ng-spd-lib';
import { TimedNotification, TimedNotificationsService } from '../notifications/timed-notifications.service';
import { NotificationsComponent } from './notifications.component';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  let service: TimedNotificationsService;

  const notification = new TimedNotification('foo', 'bar');
  const notification2 = new TimedNotification('baz', 'foz');

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationsComponent],
      imports: [TimedNotificationModule],
      providers: [TimedNotificationsService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    service = TestBed.inject(TimedNotificationsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render a button, when the notification has no action', () => {
    component.addNotification(notification);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('button'))).toBeFalsy();
  });

  it('should render a button, when the notification has an action', () => {
    const notificationWithAction = new TimedNotification('foo', 'bar');
    notificationWithAction.action = { run: () => {}, title: 'baz' };

    component.addNotification(notificationWithAction);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('button'))).toBeTruthy();
  });

  describe('on init', () => {
    it('should add notification to [notifications], when notification is pushed to TimedNotificationService', () => {
      service.pushNotification(notification);

      expect(component.notifications.length).toBe(1);
      expect(component.notifications[0]).toBe(notification);
    });

    it('should hide notification from [notifications] in case we need to show new notification', () => {
      component.notifications = [notification, notification2];

      service.hideNotificationById('foo');
      expect(component.notifications.length).toBe(1);
      expect(component.notifications[0]).toBe(notification2);
    });

    it('should move duplicate notification to the end of [notifications]', () => {
      service.pushNotification(notification);
      service.pushNotification(notification2);
      service.pushNotification(notification);

      expect(component.notifications.length).toBe(2);
      expect(component.notifications[0]).toBe(notification2);
      expect(component.notifications[1]).toBe(notification);
    });
  });

  describe('on destroy', () => {
    it('should no longer add notification to [notifications], when notification is pushed to TimedNotificationService', () => {
      component.ngOnDestroy();

      service.pushNotification(notification);

      expect(component.notifications.length).toBe(0);
    });
  });

  describe('removeNotificationById()', () => {
    it('should remove notification with given id from [notifications]', () => {
      component.notifications = [notification, notification2];

      component.removeNotificationById('foo');

      expect(component.notifications.length).toBe(1);
      expect(component.notifications[0]).toBe(notification2);
    });
  });

  describe('trackByNotificationId()', () => {
    it('should return id of given notification', () => {
      expect(component.trackByNotificationId(0, notification)).toBe('foo');
    });
  });
});
