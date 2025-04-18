/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, DialogModule } from '@sitecore/ng-spd-lib';
import { SiteLanguageDropdownsModule } from 'app/editor/shared/site-language-switcher/site-language-dropdowns/site-language-dropdowns.module';
import { RecreateOnChangeModule } from 'app/shared/utils/recreate-on-change/recreate-on-change.module';
import { PagePickerModule } from '../page-picker/page-picker.module';
import { ContentItemDialogComponent } from './content-item-dialog.component';
import { ItemPickerModule } from './item-picker/item-picker.module';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    DialogModule,
    ButtonModule,
    ItemPickerModule,
    SiteLanguageDropdownsModule,
    PagePickerModule,
    RecreateOnChangeModule,
  ],
  exports: [],
  declarations: [ContentItemDialogComponent],
  providers: [],
})
export class ContentItemDialogModule {}
