/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, IconButtonModule, ListModule, PopoverModule } from '@sitecore/ng-spd-lib';
import { UserInfoComponent } from './user-info.component';

@NgModule({
  imports: [CommonModule, TranslateModule, IconButtonModule, ButtonModule, ListModule, PopoverModule, A11yModule],
  declarations: [UserInfoComponent],
  exports: [UserInfoComponent],
})
export class UserInfoModule {}
