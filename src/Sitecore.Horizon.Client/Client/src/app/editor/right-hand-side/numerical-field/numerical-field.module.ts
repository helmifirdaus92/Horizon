/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputLabelModule } from '@sitecore/ng-spd-lib';
import { IntegerFieldComponent } from './integer-field/integer-field.component';
import { NumberFieldComponent } from './number-field/number-field.component';
import { NumericalFieldComponent } from './numerical-field.component';

@NgModule({
  imports: [CommonModule, FormsModule, TranslateModule, InputLabelModule],
  declarations: [NumericalFieldComponent, IntegerFieldComponent, NumberFieldComponent],
  exports: [IntegerFieldComponent, NumberFieldComponent],
})
export class NumericalFieldModule {}
