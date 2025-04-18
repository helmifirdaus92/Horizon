/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SplitPaneComponent } from './split-pane.component';

@NgModule({
  imports: [CommonModule],
  exports: [SplitPaneComponent],
  declarations: [SplitPaneComponent],
  providers: [],
})
export class SplitPaneModule {}
