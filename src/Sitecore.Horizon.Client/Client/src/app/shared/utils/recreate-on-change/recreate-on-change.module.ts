/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NgModule } from '@angular/core';
import { RecreateOnChangeDirective } from './recreate-on-change.directive';
import { RecreateOnPropertyChangeDirective } from './recreate-on-property-change.directive';

@NgModule({
  imports: [],
  exports: [RecreateOnChangeDirective, RecreateOnPropertyChangeDirective],
  declarations: [RecreateOnChangeDirective, RecreateOnPropertyChangeDirective],
  providers: [],
})
export class RecreateOnChangeModule {}
