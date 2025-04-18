/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IconButtonModule, ListModule } from '@sitecore/ng-spd-lib';
import { SplitPaneModule } from 'app/component-lib/split-pane/split-pane.module';
import { ComponentGalleryModule } from 'app/editor/designing/component-gallery/component-gallery.module';
import { FEaaSComponentsGalleryModule } from 'app/editor/designing/feaas-components-gallery/feaas-components-gallery.module';
import { VersionsModule } from 'app/editor/right-hand-side/versions/versions.module';
import { FeatureFlagsModule } from 'app/feature-flags/feature-flags.module';
import { PageDesignModule } from 'app/page-design/page-design.module';
import { PagesRoutingModule } from 'app/pages/pages-routing.module';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { SitecoreExtensibilityModule } from '../../extensibility/sitecore-extensibility.module';
import { ContentTreePanelModule } from './content-tree-panel/content-tree-panel.module';
import { ExternalComponentsComponent } from './external-components/external-components.component';
import { LeftHandSideComponent } from './left-hand-side.component';
import { PersonalizationModule } from './personalization/personalization.module';

@NgModule({
  exports: [LeftHandSideComponent],
  declarations: [LeftHandSideComponent, ExternalComponentsComponent],
  imports: [
    CommonModule,
    ComponentGalleryModule,
    ContentTreePanelModule,
    TranslateModule,
    PersonalizationModule,
    AppLetModule,
    VersionsModule,
    ListModule,
    SplitPaneModule,
    PagesRoutingModule,
    SitecoreExtensibilityModule,
    PageDesignModule,
    FEaaSComponentsGalleryModule,
    FeatureFlagsModule,
    IconButtonModule,
  ],
})
export class LeftHandSideModule {}
