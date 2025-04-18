/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NgModule } from '@angular/core';
import { PageHeaderComponent } from './page-header.component';
import { PagePaneComponent } from './page-pane.component';
import { PageComponent } from './page.component';

@NgModule({
  imports: [],
  exports: [PageHeaderComponent, PageComponent, PagePaneComponent],
  declarations: [PageHeaderComponent, PageComponent, PagePaneComponent],
  providers: [],
})
export class PageModule {}
