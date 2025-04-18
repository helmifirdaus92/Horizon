/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TimedNotificationModule } from '@sitecore/ng-spd-lib';
import { NotificationsComponent } from './notifications.component';

@NgModule({
  imports: [CommonModule, TimedNotificationModule],
  exports: [NotificationsComponent],
  declarations: [NotificationsComponent],
})
export class NotificationsModule {}
