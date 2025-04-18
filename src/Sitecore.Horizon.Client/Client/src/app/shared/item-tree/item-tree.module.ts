/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ContentEditableModule, LoadingIndicatorModule, TreeModule } from '@sitecore/ng-spd-lib';
import { ItemTreeComponent } from './item-tree.component';

@NgModule({
  imports: [CommonModule, TreeModule, LoadingIndicatorModule, ContentEditableModule],
  exports: [ItemTreeComponent],
  declarations: [ItemTreeComponent],
  providers: [],
})
export class ItemTreeModule {}
