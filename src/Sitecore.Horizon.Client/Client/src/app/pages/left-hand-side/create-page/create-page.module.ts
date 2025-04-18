/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  ButtonModule,
  DialogModule,
  IconButtonModule,
  InlineNotificationModule,
  ItemCardModule,
  ListModule,
  LoadingIndicatorModule,
} from '@sitecore/ng-spd-lib';
import { SlideInPanelModule } from 'app/component-lib/slide-in-panel/slide-in-panel.module';
import { EmptyStateComponent } from 'app/page-design/empty-state/empty-state.component';
import { CmUrlModule } from 'app/shared/pipes/platform-url/cm-url.module';
import { CreateFolderComponent } from './create-folder.component';
import { TemplateSelectionDialogComponent } from './template-selection-dialog/template-selection-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    InlineNotificationModule,
    SlideInPanelModule,
    ListModule,
    LoadingIndicatorModule,
    TranslateModule,
    DialogModule,
    ItemCardModule,
    CmUrlModule,
    EmptyStateComponent,
    ButtonModule,
    IconButtonModule,
  ],
  exports: [CreateFolderComponent, TemplateSelectionDialogComponent],
  declarations: [CreateFolderComponent, TemplateSelectionDialogComponent],
  providers: [],
})
export class CreatePageModule {}
