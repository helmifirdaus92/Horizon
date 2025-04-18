/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CheckboxModule, ContainedAccordionModule, InputLabelModule } from '@sitecore/ng-spd-lib';
import { ExternalLinkComponent } from './external-link.component';

@NgModule({
  imports: [CommonModule, FormsModule, CheckboxModule, TranslateModule, ContainedAccordionModule, InputLabelModule],
  exports: [ExternalLinkComponent],
  declarations: [ExternalLinkComponent],
  providers: [],
})
export class ExternalLinkModule {}
