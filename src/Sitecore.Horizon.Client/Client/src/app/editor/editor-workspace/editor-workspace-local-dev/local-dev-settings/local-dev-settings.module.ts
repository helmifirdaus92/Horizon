/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IconButtonModule, ListModule, PopoverModule } from '@sitecore/ng-spd-lib';
import { LocalDevelopmentSettingsComponent } from './local-dev-settings.component';

@NgModule({
  imports: [CommonModule, TranslateModule, IconButtonModule, PopoverModule, ListModule],
  exports: [LocalDevelopmentSettingsComponent],
  declarations: [LocalDevelopmentSettingsComponent],
  providers: [],
})
export class LocalDevelopmentSettingsModule {}
