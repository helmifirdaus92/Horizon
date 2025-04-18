/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SitecoreRegionComponent } from './sitecore-region.component';

@NgModule({
  imports: [CommonModule],
  declarations: [SitecoreRegionComponent],
  exports: [SitecoreRegionComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SitecoreExtensibilityModule {}
