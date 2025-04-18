/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TimedNotificationScope } from 'sdk/contracts/timed-notification.contract';
import { TimedNotification, TimedNotificationsService } from './timed-notifications.service';

@Component({
  selector: 'app-notifications',
  template: `
    <ng-spd-timed-notification>
      <ng-spd-timed-notification-item
        *ngFor="let notification of notifications; trackBy: trackByNotificationId"
        [severity]="notification.severity"
        [persistent]="notification.persistent"
        [text]="notification.innerHtml ? '' : notification.text"
        [hasCloseButton]="notification.closable"
        (dismiss)="removeNotificationById(notification.id)"
        [class]="notification.id"
      >
        <div *ngIf="notification.innerHtml" [innerHTML]="notification.innerHtml"></div>
        <button
          type="button"
          *ngIf="notification.action"
          [class]="'action-' + notification.textColorVariant"
          ngSpdTimedNotificationAction
          (click)="notification.action!.run()"
        >
          {{ notification.action!.title }}
        </button>
      </ng-spd-timed-notification-item>
    </ng-spd-timed-notification>
  `,
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: TimedNotification[] = [];

  private destroyed$ = new Subject();

  @Input() notificationScope: TimedNotificationScope = 'root';

  constructor(private timedNotificationsService: TimedNotificationsService) {}

  ngOnInit() {
    this.timedNotificationsService
      .getNotifications(this.notificationScope)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((notification) => {
        this.addNotification(notification);
      });
    this.timedNotificationsService
      .watchHideNotification()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((notificationId) => {
        this.removeNotificationById(notificationId);
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(undefined);
    this.destroyed$.complete();
  }

  addNotification(notification: TimedNotification) {
    const notifications = this.notifications;
    const index = notifications.findIndex((n) => n.id === notification.id);

    notifications.push(index === -1 ? notification : notifications.splice(index, 1)[0]);
  }

  removeNotificationById(notificationId: string) {
    this.notifications = this.notifications.filter((x) => x.id !== notificationId);
  }

  trackByNotificationId(_: number, notification: TimedNotification) {
    return notification.id;
  }
}
