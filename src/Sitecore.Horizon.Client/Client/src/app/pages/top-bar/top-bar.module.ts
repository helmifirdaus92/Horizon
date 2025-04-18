/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  ButtonModule,
  CheckboxModule,
  DroplistModule,
  IconButtonModule,
  ListModule,
  PopoverModule,
  SwitchModule,
  TabsModule,
} from '@sitecore/ng-spd-lib';
import { WorkflowModule } from 'app/editor/right-hand-side/workflow/workflow.module';
import { LayoutSwitchComponent } from 'app/editor/shared/site-language-switcher/site-language-dropdowns/layout-switch/layout-switch.component';
import { SiteLanguageSwitcherModule } from 'app/editor/shared/site-language-switcher/site-language-switcher.module';
import { SitecoreExtensibilityModule } from 'app/extensibility/sitecore-extensibility.module';
import { FeatureFlagsModule } from 'app/feature-flags/feature-flags.module';
import { ApplicationLinksModule } from 'app/pages/application-links/application-links.module';
import { PreviewLinkComponent } from 'app/pages/preview-link/preview-link.component';
import { CmUrlModule } from 'app/shared/pipes/platform-url/cm-url.module';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { NavigationBarModule } from '../navigation-bar/navigation-bar.module';
import { SaveUndoRedoModule } from '../save-undo-redo/save-undo-redo.module';
import { AiHypophysisButtonComponent } from './ai-hypophysis-button/ai-hypophysis-button.component';
import { ExtensionLibModule } from './extension-lib/extension-lib.module';
import { HzAppSwitcherComponent } from './hz-app-switcher/hz-app-switcher.component';
import { TopBarComponent } from './top-bar.component';
import { UserInfoModule } from './user-info/user-info.module';

@NgModule({
  imports: [
    CommonModule,
    ApplicationLinksModule,
    SitecoreExtensibilityModule,
    CmUrlModule,
    TranslateModule,
    IconButtonModule,
    ButtonModule,
    RouterModule,
    WorkflowModule,
    SaveUndoRedoModule,
    AppLetModule,
    CheckboxModule,
    ListModule,
    PopoverModule,
    TabsModule,
    A11yModule,
    DroplistModule,
    NavigationBarModule,
    SiteLanguageSwitcherModule,
    UserInfoModule,
    SwitchModule,
    ExtensionLibModule,
    FeatureFlagsModule,
  ],
  declarations: [
    TopBarComponent,
    PreviewLinkComponent,
    HzAppSwitcherComponent,
    AiHypophysisButtonComponent,
    LayoutSwitchComponent,
  ],
  exports: [TopBarComponent, LayoutSwitchComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TopBarModule {}
