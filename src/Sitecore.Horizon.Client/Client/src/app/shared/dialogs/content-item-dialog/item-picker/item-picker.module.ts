/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ItemTreeModule } from 'app/shared/item-tree/item-tree.module';
import { NormalizeGuidPipeModule } from 'app/shared/utils/normalize-guid.module';
import { ItemPickerComponent } from './item-picker.component';

@NgModule({
  imports: [CommonModule, ItemTreeModule, NormalizeGuidPipeModule],
  exports: [ItemPickerComponent],
  declarations: [ItemPickerComponent],
  providers: [],
})
export class ItemPickerModule {}
