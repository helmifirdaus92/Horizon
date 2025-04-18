/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, DialogModule, TabsModule } from '@sitecore/ng-spd-lib';
import { ContentHubDamProviderComponent } from './content-hub-dam-provider/content-hub-dam-provider.component';
import { MediaDetailsModule } from './media-details/media-details.module';
import { MediaDialogComponent } from './media-dialog.component';
import { MediaLibraryModule } from './platform-media-provider/media-library.module';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    DialogModule,
    ButtonModule,
    MediaDetailsModule,
    TabsModule,
    MediaLibraryModule,
  ],
  exports: [],
  declarations: [MediaDialogComponent, ContentHubDamProviderComponent],
  providers: [],
})
export class MediaDialogModule {}
