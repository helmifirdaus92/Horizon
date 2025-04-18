/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  ButtonModule,
  IconButtonModule,
  ImageThumbnailModule,
  InlineNotificationModule,
  InputLabelModule,
  LoadingIndicatorModule,
  TreeModule,
} from '@sitecore/ng-spd-lib';
import { NotificationsModule } from 'app/shared/notifications/notifications.module';
import { CmUrlModule } from 'app/shared/pipes/platform-url/cm-url.module';
import { MediaPipesModule } from 'app/shared/platform-media/media-pipes/media-pipes.module';
import { AssetsPipeModule } from 'app/shared/utils/assets.module';
import { VirtualScrollModule } from 'app/shared/virtual-scroll/virtual-scroll-module';
import { MediaActionBarComponent } from './action-bar/media-action-bar.component';
import { MediaCardComponent } from './media-content/media-card.component';
import { MediaContentComponent } from './media-content/media-content.component';
import { MediaLibraryComponent } from './media-library.component';
import { MediaTreeComponent } from './media-tree/media-tree.component';

@NgModule({
  imports: [
    CommonModule,
    TreeModule,
    LoadingIndicatorModule,
    ImageThumbnailModule,
    VirtualScrollModule,
    TranslateModule,
    InlineNotificationModule,
    MediaPipesModule,
    CmUrlModule,
    NotificationsModule,
    FormsModule,
    IconButtonModule,
    AssetsPipeModule,
    InputLabelModule,
    ButtonModule,
  ],
  declarations: [
    MediaLibraryComponent,
    MediaTreeComponent,
    MediaContentComponent,
    MediaCardComponent,
    MediaActionBarComponent,
  ],
  exports: [MediaLibraryComponent],
})
export class MediaLibraryModule {}
