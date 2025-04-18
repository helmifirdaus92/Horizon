/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule, IconButtonModule, ListModule, PopoverModule } from '@sitecore/ng-spd-lib';
import { ErrorDialogModule } from 'app/shared/dialogs/error-dialog/error-dialog.module';
import { WarningDialogModule } from 'app/shared/dialogs/warning-dialog/warning-dialog.module';
import { DatasourcePickerContextMenuComponent } from './datasource-picker-context-menu.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    DialogModule,
    ErrorDialogModule,
    WarningDialogModule,
    ListModule,
    PopoverModule,
    IconButtonModule,
  ],
  exports: [DatasourcePickerContextMenuComponent],
  declarations: [DatasourcePickerContextMenuComponent],
  providers: [],
})
export class DatasourcePickerContextMenuModule {}
