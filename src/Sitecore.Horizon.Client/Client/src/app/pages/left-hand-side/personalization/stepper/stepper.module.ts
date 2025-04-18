/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { StepperComponent } from './stepper.component';

@NgModule({
  imports: [CommonModule, TranslateModule],
  declarations: [StepperComponent],
  exports: [StepperComponent],
})
export class StepperModule {}
