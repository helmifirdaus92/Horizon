/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, DialogModule, InputLabelModule } from '@sitecore/ng-spd-lib';
import { RenameItemDialogComponent } from './rename-item-dialog.component';

@NgModule({
  imports: [CommonModule, DialogModule, ButtonModule, TranslateModule, InputLabelModule, FormsModule],
  declarations: [RenameItemDialogComponent],
})
export class RenameItemDialogModule {}
