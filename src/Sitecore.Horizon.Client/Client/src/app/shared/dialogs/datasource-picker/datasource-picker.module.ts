/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  ButtonModule,
  HeaderWithButtonModule,
  InlineNotificationModule,
  ListModule,
  LoadingIndicatorModule,
} from '@sitecore/ng-spd-lib';
import { SlideInPanelModule } from 'app/component-lib/slide-in-panel/slide-in-panel.module';
import { NormalizeGuidPipeModule } from 'app/shared/utils/normalize-guid.module';
import { ItemTreeModule } from '../../../shared/item-tree/item-tree.module';
import { DatasourcePickerContextMenuModule } from './context-menu/datasource-picker-context-menu.module';
import { DatasourcePickerComponent } from './datasource-picker.component';
import { DatasourceTemplatePickerComponent } from './datasource-template-picker/datasource-template-picker.component';

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
    DatasourcePickerContextMenuModule,
    HeaderWithButtonModule,
  ],
  exports: [DatasourcePickerComponent],
  declarations: [DatasourcePickerComponent, DatasourceTemplatePickerComponent],
  providers: [],
})
export class DatasourcePickerModule {}
