/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  AccordionModule,
  BadgeModule,
  ButtonModule,
  CheckboxModule,
  ContentEditableModule,
  DialogModule,
  DroplistModule,
  EmptyStateModule,
  HorizontalBarsLoadingIndicatorModule,
  IconButtonGroupModule,
  IconButtonModule,
  ImageThumbnailModule,
  InfoButtonModule,
  InlineNotificationModule,
  InputLabelModule,
  ListModule,
  LoadingIndicatorModule,
  PopoverModule,
  SplitButtonModule,
  SwitchModule,
  TabsModule,
} from '@sitecore/ng-spd-lib';
import { SlideInPanelModule } from 'app/component-lib/slide-in-panel/slide-in-panel.module';
import { SitecoreExtensibilityModule } from 'app/extensibility/sitecore-extensibility.module';
import { FeatureFlagsModule } from 'app/feature-flags/feature-flags.module';
import { LayoutAlignmentComponent } from 'app/pages/layout-alignment/layout-alignment.component';
import { PersonalizationApiModule } from 'app/pages/left-hand-side/personalization/personalization-api/personalization.api.module';
import { PaddingSettingComponent } from 'app/pages/padding-setting/padding-setting.component';
import { DatasourceDialogModule } from 'app/shared/dialogs/datasource-dialog/datasource-dialog.module';
import { MediaDialogModule } from 'app/shared/dialogs/media-dialog/media-dialog.module';
import { PagePickerModule } from 'app/shared/dialogs/page-picker/page-picker.module';
import { EditSourceCodeDialogModule } from 'app/shared/dialogs/source-code-dialog/source-code-dialog.module';
import { DirectivesModule } from 'app/shared/directives/directives/directives.module';
import { NotificationsModule } from 'app/shared/notifications/notifications.module';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { CmUrlModule } from 'app/shared/pipes/platform-url/cm-url.module';
import { MediaPipesModule } from 'app/shared/platform-media/media-pipes/media-pipes.module';
import { AssetsPipeModule } from 'app/shared/utils/assets.module';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { RecreateOnChangeModule } from 'app/shared/utils/recreate-on-change/recreate-on-change.module';
import { TagComponent } from '../../component-lib/tag/tag.component';
import { ToggleButtonsComponent } from '../../component-lib/toggle-buttons/toggle-buttons.component';
import { ContentTreeSearchModule } from '../../pages/content-tree-search/content-tree-search.module';
import { ComponentGalleryModule } from '../designing/component-gallery/component-gallery.module';
import { LhsPanelModule } from '../lhs-panel/lhs-panel.module';
import { AiHypophysisPanelComponent } from './ai-hypophysis-panel/ai-hypophysis-panel.component';
import {
  ChromeRhsEditorCaseDirective,
  ChromeRhsEditorSwitchDirective,
  ChromeRhsFieldEditorCaseDirective,
} from './chrome-rhs-editor.directive';
import { DateFieldComponent } from './date-field/date-field.component';
import { EditorRhsComponent } from './editor-rhs.component';
import { ExternalRhsSlidingPanelComponent } from './external-rhs-sliding-panel/external-rhs-sliding-panel.component';
import { FeaasRhsRegionComponent } from './feaas-rhs-region/feaas-rhs-region.component';
import { GeneralLinkFieldModule } from './general-link-field/general-link-field.module';
import { ImageFieldComponent } from './image-field/image-field.component';
import { ColumnAppendDialogComponent } from './layout-container-details/column-append-dialog/column-append-dialog.component';
import { LayoutContainerDetailsComponent } from './layout-container-details/layout-container-details.component';
import { NumericalFieldModule } from './numerical-field/numerical-field.module';
import { OptimizationConfirmationDialogComponent } from './optimize-content/optimization-confirmation-dialog/optimization-confirmation-dialog.component';
import { OptimizeContentButtonComponent } from './optimize-content/optimize-content-button/optimize-content-button.component';
import { OptimizeContentModalComponent } from './optimize-content/optimize-content-modal/optimize-content-modal.component';
import { OptimizeContentPanelComponent } from './optimize-content/optimize-content-panel/optimize-content-panel.component';
import { OptimizeContentPromptComponent } from './optimize-content/optimize-content-prompt/optimize-content-prompt.component';
import { PlaceholderDetailsComponent } from './placeholder-details/placeholder-details.component';
import { RenderingDataSourceComponent } from './rendering-details/rendering-data-source/rendering-data-source.component';
import { RenderingDetailsPersonalizedComponent } from './rendering-details/rendering-details-personalized/rendering-details-personalized.component';
import { RenderingDetailsComponent } from './rendering-details/rendering-details.component';
import { RichTextEditorModule } from './rich-text-editor/rich-text-editor.module';
import { ConfigureExperimentDialogComponent } from './test-component/configure-experiment-dialog/configure-experiment-dialog.component';
import { CreateExperimentDialogComponent } from './test-component/create-experiment-dialog/create-experiment-dialog.component';
import { EndExperimentDialogComponent } from './test-component/end-experiment-dialog/end-experiment-dialog.component';
import { ExperimentStatusNotificationComponent } from './test-component/experiment-status-notification/experiment-status-notification.component';
import { ExperimentStatusComponent } from './test-component/experiment-status/experiment-status.component';
import { GoalSettingComponent } from './test-component/goal-setting/goal-setting.component';
import { StartTestCheckListComponent } from './test-component/start-test-check-list/start-test-check-list.component';
import { TestComponentComponent } from './test-component/test-component.component';
import { VariantActionsContextMenuComponent } from './test-component/variant-actions-context-menu/variant-actions-context-menu.component';
import { WorkflowModule } from './workflow/workflow.module';

@NgModule({
  declarations: [
    EditorRhsComponent,
    ImageFieldComponent,
    ChromeRhsEditorSwitchDirective,
    ChromeRhsEditorCaseDirective,
    ChromeRhsFieldEditorCaseDirective,
    PlaceholderDetailsComponent,
    ExternalRhsSlidingPanelComponent,
    FeaasRhsRegionComponent,
    LayoutContainerDetailsComponent,
    PaddingSettingComponent,
    LayoutAlignmentComponent,
    ColumnAppendDialogComponent,
    DateFieldComponent,
    ConfigureExperimentDialogComponent,
    CreateExperimentDialogComponent,
    EndExperimentDialogComponent,
    TestComponentComponent,
    GoalSettingComponent,
    StartTestCheckListComponent,
    AiHypophysisPanelComponent,
    ExperimentStatusNotificationComponent,
    RenderingDetailsComponent,
    RenderingDetailsPersonalizedComponent,
    OptimizeContentPromptComponent,
    OptimizeContentPanelComponent,
    RenderingDataSourceComponent,
    OptimizeContentButtonComponent,
    OptimizationConfirmationDialogComponent,
    OptimizeContentModalComponent,
  ],
  exports: [EditorRhsComponent],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ButtonModule,
    AppLetModule,
    InfoButtonModule,
    InputLabelModule,
    IconButtonGroupModule,
    IconButtonModule,
    SlideInPanelModule,
    SplitButtonModule,
    ImageThumbnailModule,
    InlineNotificationModule,
    MediaDialogModule,
    MediaPipesModule,
    CmUrlModule,
    GeneralLinkFieldModule,
    NumericalFieldModule,
    SitecoreExtensibilityModule,
    RichTextEditorModule,
    AccordionModule,
    AppLetModule,
    EmptyStateModule,
    RecreateOnChangeModule,
    WorkflowModule,
    TabsModule,
    ContentEditableModule,
    DroplistModule,
    PopoverModule,
    CheckboxModule,
    SwitchModule,
    FeatureFlagsModule,
    DialogModule,
    PersonalizationApiModule,
    ComponentGalleryModule,
    LoadingIndicatorModule,
    BadgeModule,
    ListModule,
    A11yModule,
    PagePickerModule,
    ContentTreeSearchModule,
    DirectivesModule,
    NotificationsModule,
    TagComponent,
    VariantActionsContextMenuComponent,
    DatasourceDialogModule,
    PipesModule,
    AssetsPipeModule,
    EditSourceCodeDialogModule,
    LhsPanelModule,
    ExperimentStatusComponent,
    HorizontalBarsLoadingIndicatorModule,
    ToggleButtonsComponent,
  ],
})
export class EditorRhsModule {}
