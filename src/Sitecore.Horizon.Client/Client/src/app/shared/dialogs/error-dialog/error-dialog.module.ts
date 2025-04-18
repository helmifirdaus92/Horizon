/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule, DialogModule } from '@sitecore/ng-spd-lib';
import { ErrorDialogComponent } from './error-dialog.component';

@NgModule({
  imports: [CommonModule, DialogModule, ButtonModule],
  declarations: [ErrorDialogComponent],
})
export class ErrorDialogModule {}
