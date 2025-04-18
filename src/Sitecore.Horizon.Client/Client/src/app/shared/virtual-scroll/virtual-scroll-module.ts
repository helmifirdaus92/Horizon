/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CdkVirtualForOf, CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { NgModule } from '@angular/core';
import { GridVirtualScrollDirective } from './grid-virtual-scroll';

@NgModule({
  imports: [ScrollingModule],
  exports: [GridVirtualScrollDirective, CdkVirtualForOf, CdkVirtualScrollViewport],
  declarations: [GridVirtualScrollDirective],
  providers: [],
})
export class VirtualScrollModule {}
