/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HorizontalBarsLoadingIndicatorModule } from '@sitecore/ng-spd-lib';
import { ContentTreeModule } from '../content-tree/content-tree.module';
import { ContentTreeContainerComponent } from './content-tree-container.component';

@NgModule({
  imports: [CommonModule, TranslateModule, ContentTreeModule, HorizontalBarsLoadingIndicatorModule],
  exports: [ContentTreeContainerComponent],
  declarations: [ContentTreeContainerComponent],
})
export class ContentTreeContainerModule {}
