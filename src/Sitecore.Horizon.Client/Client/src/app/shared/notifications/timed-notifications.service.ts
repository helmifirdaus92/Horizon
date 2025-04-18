/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { filter, firstValueFrom, Observable, Subject } from 'rxjs';
import {
  TimedNotificationAction,
  TimedNotificationResult,
  TimedNotificationScope,
  TimedNotificationSeverity,
} from 'sdk/contracts/timed-notification.contract';

export class TimedNotification implements TimedNotificationResult {
  private _action: TimedNotificationAction | undefined;

  persistent = false;
  closable = false;
  innerHtml = '';
  textColorVariant?: TimedNotificationSeverity;

  constructor(
    public id: string,
    public text: string,
    public severity: TimedNotificationSeverity = 'error',
    public notificationScope: TimedNotificationScope = 'root',
  ) {}

  get action(): TimedNotificationAction | undefined {
    return this._action;
  }

  set action(value: TimedNotificationAction | undefined) {
    this._action = value;

    // only persistent timed notifications support actions
    if (value) {
      this.persistent = true;
    }
  }
}

@Injectable({ providedIn: 'root' })
export class TimedNotificationsService {
  private notifications$ = new Subject<TimedNotification>();
  private _hideNotification$ = new Subject<string>();

  async push(
    id: string,
    text: string | Observable<string>,
    severity: TimedNotificationSeverity = 'error',
    notificationScope: TimedNotificationScope = 'root',
  ): Promise<TimedNotification> {
    if (text instanceof Observable) {
      text = await firstValueFrom(text);
    }
    const notification = new TimedNotification(id, text, severity, notificationScope);
    this.notifications$.next(notification);
    return notification;
  }

  pushNotification(notification: TimedNotification): void {
    this.notifications$.next(notification);
  }

  hideNotificationById(notificationId: string) {
    this._hideNotification$.next(notificationId);
  }

  watchHideNotification(): Observable<string> {
    return this._hideNotification$.asObservable();
  }

  getNotifications(notificationScope: TimedNotificationScope): Observable<TimedNotification> {
    return this.notifications$.asObservable().pipe(filter((item) => item.notificationScope === notificationScope));
  }
}
