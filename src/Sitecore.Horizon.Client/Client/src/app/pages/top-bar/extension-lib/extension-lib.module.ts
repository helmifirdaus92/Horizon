/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, IconButtonModule, ImageThumbnailModule, ListModule, PopoverModule } from '@sitecore/ng-spd-lib';
import { SitecoreExtensibilityModule } from 'app/extensibility/sitecore-extensibility.module';
import { FeatureFlagsModule } from 'app/feature-flags/feature-flags.module';
import { ExtensionLibComponent } from './extension-lib.component';
import { LhsPanelExtensionWrapperComponent } from './lhs-panel-extension-wrapper/lhs-panel-extension-wrapper.component';

@NgModule({
  imports: [
    CommonModule,
    PopoverModule,
    ListModule,
    IconButtonModule,
    ButtonModule,
    SitecoreExtensibilityModule,
    TranslateModule,
    A11yModule,
    ImageThumbnailModule,
    FeatureFlagsModule,
  ],
  declarations: [ExtensionLibComponent, LhsPanelExtensionWrapperComponent],
  exports: [ExtensionLibComponent],
})
export class ExtensionLibModule {}
