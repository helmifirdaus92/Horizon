/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { Observable } from 'rxjs';
import {
  TimedNotificationContract,
  TimedNotificationScope,
  TimedNotificationSeverity,
} from 'sdk/contracts/timed-notification.contract';
import { TimedNotificationsService } from './timed-notifications.service';

@Injectable({ providedIn: 'root' })
export class TimedNotificationsSdkMessagingService {
  constructor(
    private readonly messaging: NgGlobalMessaging,
    private readonly timedNotificationsService: TimedNotificationsService,
  ) {}

  init() {
    this.messaging.createRpc(TimedNotificationContract, {
      push: (
        id: string,
        text: string | Observable<string>,
        severity: TimedNotificationSeverity = 'error',
        notificationScope: TimedNotificationScope = 'root',
      ) => this.timedNotificationsService.push(id, text, severity, notificationScope),
      hideById: (id: string) => this.timedNotificationsService.hideNotificationById(id),
    });
  }
}
