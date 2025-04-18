/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GeneralLinkFieldComponent } from './general-link-field.component';
import { GeneralLinkModule } from './general-link/general-link.module';

@NgModule({
  imports: [CommonModule, GeneralLinkModule],
  exports: [GeneralLinkFieldComponent],
  declarations: [GeneralLinkFieldComponent],
  providers: [],
})
export class GeneralLinkFieldModule {}
