/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule, IconButtonModule, ListModule, PopoverModule } from '@sitecore/ng-spd-lib';
import { FeatureFlagsModule } from 'app/feature-flags/feature-flags.module';
import { ErrorDialogModule } from 'app/shared/dialogs/error-dialog/error-dialog.module';
import { WarningDialogModule } from 'app/shared/dialogs/warning-dialog/warning-dialog.module';
import { ContentTreeContextComponent } from './content-tree-context.component';

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
    A11yModule,
    FeatureFlagsModule,
  ],
  exports: [ContentTreeContextComponent],
  declarations: [ContentTreeContextComponent],
  providers: [],
})
export class ContentTreeContextModule {}
