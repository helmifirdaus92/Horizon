/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  AccordionModule,
  ButtonModule,
  CheckboxModule,
  EmptyStateModule,
  IconButtonModule,
  ImageThumbnailModule,
  LoadingIndicatorModule,
  PopoverModule,
  SearchInputModule,
} from '@sitecore/ng-spd-lib';
import { FeatureFlagsModule } from 'app/feature-flags/feature-flags.module';
import { EmptyStateComponent } from 'app/page-design/empty-state/empty-state.component';
import { PageDesignModule } from 'app/page-design/page-design.module';
import { CmUrlModule } from 'app/shared/pipes/platform-url/cm-url.module';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { AssetsPipeModule } from '../../../shared/utils/assets.module';
import { ComponentFilterContextComponent } from '../component-filter-context/component-filter-context.component';
import { FEaaSComponentsGalleryModule } from '../feaas-components-gallery/feaas-components-gallery.module';
import { FormsComponentsGalleryModuleModule } from '../forms-components-gallery/forms-components-gallery.module';
import { ComponentGalleryComponent } from './component-gallery.component';
import { GalleryItemComponent } from './gallery-item.component';

@NgModule({
  exports: [ComponentGalleryComponent],
  declarations: [ComponentGalleryComponent, GalleryItemComponent, ComponentFilterContextComponent],
  providers: [],
  imports: [
    AccordionModule,
    CommonModule,
    EmptyStateModule,
    ImageThumbnailModule,
    CmUrlModule,
    LoadingIndicatorModule,
    TranslateModule,
    FEaaSComponentsGalleryModule,
    FormsComponentsGalleryModuleModule,
    FeatureFlagsModule,
    ButtonModule,
    IconButtonModule,
    SearchInputModule,
    AppLetModule,
    PageDesignModule,
    CheckboxModule,
    PopoverModule,
    AssetsPipeModule,
    EmptyStateComponent,
  ],
})
export class ComponentGalleryModule {}
