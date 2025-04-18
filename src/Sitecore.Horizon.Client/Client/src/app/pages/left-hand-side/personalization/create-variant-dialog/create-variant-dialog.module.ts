/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, DialogModule, InputLabelModule, LoadingIndicatorModule } from '@sitecore/ng-spd-lib';
import { StepperModule } from '../stepper/stepper.module';
import { CreateVariantDialogComponent } from './create-variant-dialog.component';
import { VariantNameValidatorDirective } from './validate-variant-name.directive';

@NgModule({
  declarations: [CreateVariantDialogComponent, VariantNameValidatorDirective],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    DialogModule,
    ButtonModule,
    LoadingIndicatorModule,
    InputLabelModule,
    StepperModule,
  ],
})
export class CreateVariantDialogModule {}
