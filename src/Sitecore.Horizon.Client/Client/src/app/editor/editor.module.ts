/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TextFieldModule } from '@angular/cdk/text-field';
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
  InputLabelModule,
  ListModule,
  LoadingIndicatorModule,
  PopoverModule,
  SearchInputModule,
} from '@sitecore/ng-spd-lib';
import { TagComponent } from 'app/component-lib/tag/tag.component';
import { SitecoreExtensibilityModule } from 'app/extensibility/sitecore-extensibility.module';
import { SaveUndoRedoModule } from 'app/pages/save-undo-redo/save-undo-redo.module';
import { DeviceSelectorModule } from 'app/pages/top-bar/device-controls/device-selector.module';
import { ReloadCanvasButtonComponent } from 'app/pages/top-bar/reload-canvas-button/reload-canvas-button.component';
import { AssetsPipeModule } from 'app/shared/utils/assets.module';
import { RecreateOnChangeModule } from 'app/shared/utils/recreate-on-change/recreate-on-change.module';
import { ComponentGalleryDialogComponent } from './designing/component-gallery-dialog/component-gallery-dialog.component';
import { ComponentGalleryModule } from './designing/component-gallery/component-gallery.module';
import { EditorHeaderComponent } from './editor-header/editor-header.component';
import { RenderingHostSelectorComponent } from './editor-header/rendering-host-selector/rendering-host-selector.component';
import { LocalDevelopmentSettingsModule } from './editor-workspace/editor-workspace-local-dev/local-dev-settings/local-dev-settings.module';
import { EditorWorkspaceComponent } from './editor-workspace/editor-workspace.component';
import { WorkspaceErrorComponent } from './editor-workspace/workspace-error/workspace-error.component';
import { EditorComponent } from './editor.component';
import { LhsPanelModule } from './lhs-panel/lhs-panel.module';
import { VersionsModule } from './right-hand-side/versions/versions.module';
import { SiteLanguageSwitcherModule } from './shared/site-language-switcher/site-language-switcher.module';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    SitecoreExtensibilityModule,
    LoadingIndicatorModule,
    RecreateOnChangeModule,
    AssetsPipeModule,
    IconButtonModule,
    PopoverModule,
    ListModule,
    LocalDevelopmentSettingsModule,
    ComponentGalleryModule,
    DialogModule,
    ButtonModule,
    DroplistModule,
    FormsModule,
    InputLabelModule,
    SaveUndoRedoModule,
    SiteLanguageSwitcherModule,
    DeviceSelectorModule,
    VersionsModule,
    CKEditorModule,
    CheckboxModule,
    AccordionModule,
    TextFieldModule,
    SearchInputModule,
    TagComponent,
    LhsPanelModule,
  ],
  declarations: [
    EditorComponent,
    EditorWorkspaceComponent,
    ComponentGalleryDialogComponent,
    EditorHeaderComponent,
    WorkspaceErrorComponent,
    RenderingHostSelectorComponent,
    ReloadCanvasButtonComponent,
  ],
  exports: [EditorComponent],
})
export class EditorModule {}
