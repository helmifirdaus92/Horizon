/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ImageThumbnailModule } from '@sitecore/ng-spd-lib';
import { CmUrlModule } from 'app/shared/pipes/platform-url/cm-url.module';
import { MediaPipesModule } from 'app/shared/platform-media/media-pipes/media-pipes.module';
import { AssetsPipeModule } from 'app/shared/utils/assets.module';
import { MediaDetailsComponent } from './media-details.component';

@NgModule({
  imports: [CommonModule, ImageThumbnailModule, TranslateModule, MediaPipesModule, CmUrlModule, AssetsPipeModule],
  exports: [MediaDetailsComponent],
  declarations: [MediaDetailsComponent],
})
export class MediaDetailsModule {}
