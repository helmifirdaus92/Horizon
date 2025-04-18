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
  DialogModule,
  DroplistModule,
  HeaderWithButtonModule,
  InfoButtonModule,
  InputLabelModule,
  ListModule,
  LoadingIndicatorModule,
  PopoverModule,
} from '@sitecore/ng-spd-lib';
import { SlideInPanelModule } from 'app/component-lib/slide-in-panel/slide-in-panel.module';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { CreateVersionComponent } from './create-version/create-version.component';
import { DuplicateVersionComponent } from './duplicate-version/duplicate-version.component';
import { RenameVersionComponent } from './rename-version/rename-version.component';
import { VersionListComponent } from './version-list/version-list.component';
import { VersionPublishingSettingsComponent } from './version-publishing-settings/version-publishing-settings.component';
import { VersionsComponent } from './versions.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    AppLetModule,
    InfoButtonModule,
    SlideInPanelModule,
    ButtonModule,
    LoadingIndicatorModule,
    PopoverModule,
    ListModule,
    InputLabelModule,
    HeaderWithButtonModule,
    PipesModule,
    DialogModule,
    DroplistModule,
    A11yModule,
  ],
  declarations: [
    VersionsComponent,
    VersionListComponent,
    VersionListComponent,
    CreateVersionComponent,
    RenameVersionComponent,
    VersionPublishingSettingsComponent,
    DuplicateVersionComponent,
  ],
  exports: [VersionsComponent],
})
export class VersionsModule {}
