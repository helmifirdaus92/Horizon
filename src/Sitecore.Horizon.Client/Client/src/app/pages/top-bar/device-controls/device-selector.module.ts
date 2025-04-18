/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CheckboxModule, DroplistModule, ListModule, PopoverModule, TabsModule } from '@sitecore/ng-spd-lib';
import { CmUrlModule } from 'app/shared/pipes/platform-url/cm-url.module';
import { DeviceSelectorComponent } from './device-selector.component';

@NgModule({
  imports: [
    CommonModule,
    TabsModule,
    CmUrlModule,
    PopoverModule,
    ListModule,
    A11yModule,
    CheckboxModule,
    DroplistModule,
  ],
  exports: [DeviceSelectorComponent],
  declarations: [DeviceSelectorComponent],
})
export class DeviceSelectorModule {}
