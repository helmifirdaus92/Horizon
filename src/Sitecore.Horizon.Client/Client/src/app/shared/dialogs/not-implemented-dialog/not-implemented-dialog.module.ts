/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonModule, DialogModule } from '@sitecore/ng-spd-lib';
import { NotImplementedDialogComponent } from './not-implemented-dialog.component';

@NgModule({
  imports: [CommonModule, DialogModule, ButtonModule],
  declarations: [NotImplementedDialogComponent],
})
export class NotImplementedDialogModule {}
