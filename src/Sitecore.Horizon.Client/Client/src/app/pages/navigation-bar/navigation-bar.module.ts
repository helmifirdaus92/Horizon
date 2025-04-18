/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IconLabelButtonModule } from '@sitecore/ng-spd-lib';
import { NavigationBarComponent } from './navigation-bar.component';

@NgModule({
  imports: [CommonModule, IconLabelButtonModule, TranslateModule, RouterModule],
  exports: [NavigationBarComponent],
  declarations: [NavigationBarComponent],
})
export class NavigationBarModule {}
