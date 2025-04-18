/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  CheckboxModule,
  IconButtonModule,
  LoadingIndicatorModule,
  PopoverModule,
  SearchInputModule,
  TreeModule,
} from '@sitecore/ng-spd-lib';
import { EmptyStateComponent } from 'app/page-design/empty-state/empty-state.component';
import { ItemTreeModule } from 'app/shared/item-tree/item-tree.module';
import { AssetsPipeModule } from 'app/shared/utils/assets.module';
import { ContentTreeSearchComponent } from './content-tree-search.component';

@NgModule({
  declarations: [ContentTreeSearchComponent],
  exports: [ContentTreeSearchComponent],
  imports: [
    CommonModule,
    TreeModule,
    TranslateModule,
    SearchInputModule,
    ItemTreeModule,
    IconButtonModule,
    PopoverModule,
    AssetsPipeModule,
    CheckboxModule,
    LoadingIndicatorModule,
    EmptyStateComponent,
  ],
})
export class ContentTreeSearchModule {}
