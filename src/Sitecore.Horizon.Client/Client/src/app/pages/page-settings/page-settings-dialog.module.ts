/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  AccordionModule,
  ButtonModule,
  CheckboxModule,
  DroplistModule,
  IconButtonModule,
  InputLabelModule,
  ItemCardModule,
  LoadingIndicatorModule,
  PopoverModule,
} from '@sitecore/ng-spd-lib';
import { CmUrlModule } from 'app/shared/pipes/platform-url/cm-url.module';
import { RecreateOnChangeModule } from 'app/shared/utils/recreate-on-change/recreate-on-change.module';
import { PageDesignComponent } from './page-design/page-design.component';
import { PageDetailsComponent } from './page-details/page-details.component';
import { PageInsertOptionsComponent } from './page-insert-options/page-insert-options.component';
import { PageLanguagesComponent } from './page-languages/page-languages.component';
import { PageRenamingComponent } from './page-rename/page-rename.component';
import { PageSettingsDialogComponent } from './page-settings-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    IconButtonModule,
    TranslateModule,
    ItemCardModule,
    CmUrlModule,
    DroplistModule,
    InputLabelModule,
    ButtonModule,
    PopoverModule,
    LoadingIndicatorModule,
    AccordionModule,
    FormsModule,
    PageRenamingComponent,
    FormsModule,
    CheckboxModule,
    RouterModule,
    RecreateOnChangeModule,
  ],
  declarations: [
    PageSettingsDialogComponent,
    PageDetailsComponent,
    PageLanguagesComponent,
    PageDesignComponent,
    PageInsertOptionsComponent,
  ],
  exports: [PageSettingsDialogComponent],
})
export class PageSettingsDialogModule {}
