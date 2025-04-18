/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  ButtonModule,
  CheckboxModule,
  ContainedAccordionModule,
  IconButtonModule,
  InputLabelModule,
} from '@sitecore/ng-spd-lib';
import { ContentItemDialogModule } from 'app/shared/dialogs/content-item-dialog/content-item-dialog.module';
import { InternalLinkComponent } from './internal-link.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CheckboxModule,
    TranslateModule,
    ButtonModule,
    ContentItemDialogModule,
    ContainedAccordionModule,
    InputLabelModule,
    IconButtonModule,
  ],
  exports: [InternalLinkComponent],
  declarations: [InternalLinkComponent],
  providers: [],
})
export class InternalLinkModule {}
