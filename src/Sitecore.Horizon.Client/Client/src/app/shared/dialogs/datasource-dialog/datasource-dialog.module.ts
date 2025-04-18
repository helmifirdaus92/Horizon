/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, DialogModule } from '@sitecore/ng-spd-lib';
import { NotificationsModule } from '../../notifications/notifications.module';
import { DatasourcePickerModule } from '../datasource-picker/datasource-picker.module';
import { DatasourceDialogComponent } from './datasource-dialog.component';

@NgModule({
  imports: [CommonModule, DatasourcePickerModule, DialogModule, ButtonModule, TranslateModule, NotificationsModule],
  exports: [DatasourceDialogComponent],
  declarations: [DatasourceDialogComponent],
  providers: [],
})
export class DatasourceDialogModule {}
