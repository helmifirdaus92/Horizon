/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  ButtonModule,
  HeaderWithButtonModule,
  HorizontalBarsLoadingIndicatorModule,
  InlineNotificationModule,
  ListModule,
  LoadingIndicatorModule,
} from '@sitecore/ng-spd-lib';
import { SlideInPanelModule } from 'app/component-lib/slide-in-panel/slide-in-panel.module';
import { NormalizeGuidPipeModule } from 'app/shared/utils/normalize-guid.module';
import { ItemTreeModule } from '../../../shared/item-tree/item-tree.module';
import { PagePickerComponent } from './page-picker.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    SlideInPanelModule,
    ButtonModule,
    ItemTreeModule,
    NormalizeGuidPipeModule,
    ListModule,
    LoadingIndicatorModule,
    InlineNotificationModule,
    HeaderWithButtonModule,
    HorizontalBarsLoadingIndicatorModule,
  ],
  exports: [PagePickerComponent],
  declarations: [PagePickerComponent],
  providers: [],
})
export class PagePickerModule {}
