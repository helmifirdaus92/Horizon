/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { TranslateModule } from '@ngx-translate/core';
import {
  AccordionModule,
  ButtonModule,
  CheckboxModule,
  DialogModule,
  DroplistModule,
  IconButtonModule,
  ImageThumbnailModule,
  InputLabelModule,
  ListModule,
  LoadingIndicatorModule,
  PopoverModule,
  SpdDirectivesModule,
  TabsModule,
} from '@sitecore/ng-spd-lib';
import { TagComponent } from 'app/component-lib/tag/tag.component';
import { ItemTreeModule } from 'app/shared/item-tree/item-tree.module';
import { NotificationsModule } from 'app/shared/notifications/notifications.module';
import { CmUrlModule } from 'app/shared/pipes/platform-url/cm-url.module';
import { MediaPipesModule } from 'app/shared/platform-media/media-pipes/media-pipes.module';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { EmailLinkComponent } from '../right-hand-side/general-link-field/general-link/email-link/email-link.component';
import { ExternalLinkModule } from '../right-hand-side/general-link-field/general-link/external-link/external-link.module';
import { InternalLinkModule } from '../right-hand-side/general-link-field/general-link/internal-link/internal-link.module';
import { MediaLinkModule } from '../right-hand-side/general-link-field/general-link/media-link/media-link.module';
import { DataViewComponent } from './data-view/data-view.component';
import { FieldHeaderComponent } from './data-view/field-header/field-header.component';
import { CheckboxChecklistFieldComponent } from './data-view/fields/checkbox-checklist-field/checkbox-checklist-field.component';
import { DateFormatPipe } from './data-view/fields/datetime-field/date-format.pipe';
import { DatetimeFieldComponent } from './data-view/fields/datetime-field/datetime-field.component';
import { DroptreeFieldComponent } from './data-view/fields/droptree-field/droptree-field.component';
import { FileFieldComponent } from './data-view/fields/file-field/file-field.component';
import { GeneralLinkFieldComponent } from './data-view/fields/general-link-field/general-link-field.component';
import { GroupedDroplinkFieldComponent } from './data-view/fields/grouped-droplink-field/grouped-droplink-field.component';
import { GroupedDroplistFieldComponent } from './data-view/fields/grouped-droplist-field/grouped-droplist-field.component';
import { ImageFieldComponent } from './data-view/fields/image-field/image-field.component';
import { MultilistFieldComponent } from './data-view/fields/multilist-field/multilist-field.component';
import { NumericalFieldComponent } from './data-view/fields/numerical-field/numerical-field.component';
import { RichTextFieldComponent } from './data-view/fields/rich-text-field/rich-text-field.component';
import { TreelistTypeFieldComponent } from './data-view/fields/treelist-type-field/treelist-type-field.component';
import { TreelistExFieldComponent } from './data-view/fields/treelistEx-field/treelistEx-field.component';
import { TreelistExItemPickerComponent } from './data-view/fields/treelistEx-field/treelistEx-item-picker/treelistEx-item-picker.component';
import { PageDataViewComponent } from './data-view/page-data-view/page-data-view.component';
import { LhsPanelComponent } from './lhs-panel.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PopoverModule,
    DroplistModule,
    InputLabelModule,
    CKEditorModule,
    CheckboxModule,
    AccordionModule,
    TagComponent,
    IconButtonModule,
    ButtonModule,
    ItemTreeModule,
    LoadingIndicatorModule,
    ImageThumbnailModule,
    MediaPipesModule,
    CmUrlModule,
    NotificationsModule,
    ListModule,
    AppLetModule,
    ExternalLinkModule,
    InternalLinkModule,
    MediaLinkModule,
    EmailLinkComponent,
    DialogModule,
    TabsModule,
    SpdDirectivesModule,
  ],
  declarations: [
    LhsPanelComponent,
    PageDataViewComponent,
    DataViewComponent,
    MultilistFieldComponent,
    TreelistTypeFieldComponent,
    CheckboxChecklistFieldComponent,
    ImageFieldComponent,
    FileFieldComponent,
    RichTextFieldComponent,
    GeneralLinkFieldComponent,
    DatetimeFieldComponent,
    DateFormatPipe,
    FieldHeaderComponent,
    DroptreeFieldComponent,
    GroupedDroplinkFieldComponent,
    GroupedDroplistFieldComponent,
    NumericalFieldComponent,
    TreelistExFieldComponent,
    TreelistExItemPickerComponent,
  ],
  exports: [LhsPanelComponent, DataViewComponent],
})
export class LhsPanelModule {}
