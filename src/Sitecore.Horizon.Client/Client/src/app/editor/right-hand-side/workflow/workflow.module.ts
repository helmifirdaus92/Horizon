/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  ButtonModule,
  CheckboxModule,
  DialogModule,
  IconButtonModule,
  InlineNotificationModule,
  ListModule,
  LoadingIndicatorModule,
  PopoverModule,
  SplitButtonModule,
} from '@sitecore/ng-spd-lib';
import { SlideInPanelModule } from 'app/component-lib/slide-in-panel/slide-in-panel.module';
import { PublishButtonComponent } from './publish-button/publish-button.component';
import { WorkflowBarComponent } from './workflow-bar/workflow-bar.component';
import { WorkflowConfirmationDialogComponent } from './workflow-confirmation-dialog/workflow-confirmation-dialog.component';

@NgModule({
  declarations: [WorkflowBarComponent, PublishButtonComponent, WorkflowConfirmationDialogComponent],
  imports: [
    CommonModule,
    TranslateModule,
    ButtonModule,
    FormsModule,
    SlideInPanelModule,
    SplitButtonModule,
    InlineNotificationModule,
    PopoverModule,
    ListModule,
    DialogModule,
    LoadingIndicatorModule,
    A11yModule,
    CheckboxModule,
    IconButtonModule,
  ],
  exports: [WorkflowBarComponent, PublishButtonComponent],
})
export class WorkflowModule {}
