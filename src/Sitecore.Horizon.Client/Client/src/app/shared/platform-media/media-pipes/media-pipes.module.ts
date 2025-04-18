/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NgModule } from '@angular/core';
import { MediaFileSizePipe, ResizeMediaPipe } from './media.pipe';

@NgModule({
  exports: [MediaFileSizePipe, ResizeMediaPipe],
  declarations: [MediaFileSizePipe, ResizeMediaPipe],
})
export class MediaPipesModule {}
