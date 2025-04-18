/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  AccordionModule,
  ButtonModule,
  EmptyStateModule,
  IconButtonModule,
  ImageThumbnailModule,
  LoadingIndicatorModule,
} from '@sitecore/ng-spd-lib';
import { SlideInPanelModule } from 'app/component-lib/slide-in-panel/slide-in-panel.module';
import { CmUrlModule } from 'app/shared/pipes/platform-url/cm-url.module';
import { FEaaSComponentsGalleryComponent } from './feaas-components-gallery.component';

@NgModule({
  imports: [
    AccordionModule,
    IconButtonModule,
    SlideInPanelModule,
    CommonModule,
    EmptyStateModule,
    ImageThumbnailModule,
    CmUrlModule,
    LoadingIndicatorModule,
    TranslateModule,
    ButtonModule,
  ],
  exports: [FEaaSComponentsGalleryComponent],
  declarations: [FEaaSComponentsGalleryComponent],
  providers: [],
})
export class FEaaSComponentsGalleryModule {}
