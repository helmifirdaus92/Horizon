/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ForbiddenNamesDirective } from '../validate-name/validate-name.directive';

@NgModule({
  declarations: [ForbiddenNamesDirective],
  imports: [CommonModule],
  exports: [ForbiddenNamesDirective],
})
export class DirectivesModule {}
