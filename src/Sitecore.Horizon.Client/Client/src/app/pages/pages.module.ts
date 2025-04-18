/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IconButtonModule } from '@sitecore/ng-spd-lib';
import { PageModule } from 'app/component-lib/page/page.module';
import { SplitPaneModule } from 'app/component-lib/split-pane/split-pane.module';
import { EditorModule } from 'app/editor/editor.module';
import { EditorRhsModule } from 'app/editor/right-hand-side/editor-rhs.module';
import { SiteLanguageSwitcherModule } from 'app/editor/shared/site-language-switcher/site-language-switcher.module';
import { SitecoreExtensibilityModule } from 'app/extensibility/sitecore-extensibility.module';
import { FeatureFlagsModule } from 'app/feature-flags/feature-flags.module';
import { LeftHandSideModule } from 'app/pages/left-hand-side/left-hand-side.module';
import { TopBarModule as TopBar } from 'app/pages/top-bar/top-bar.module';
import { NotificationsModule } from 'app/shared/notifications/notifications.module';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { ApplicationLinksModule } from './application-links/application-links.module';
import { PageAbTestsDialogModule } from './page-ab-tests/page-ab-tests-dialog.module';
import { PageSettingsDialogModule } from './page-settings/page-settings-dialog.module';
import { PagesRoutingModule } from './pages-routing.module';
import { PagesComponent } from './pages.component';

@NgModule({
  imports: [
    CommonModule,
    IconButtonModule,
    PageModule,
    SplitPaneModule,
    TranslateModule,
    NotificationsModule,
    SiteLanguageSwitcherModule,
    ApplicationLinksModule,
    EditorRhsModule,
    SitecoreExtensibilityModule,
    PagesRoutingModule,
    FeatureFlagsModule,
    TopBar,
    LeftHandSideModule,
    EditorModule,
    PageSettingsDialogModule,
    PageAbTestsDialogModule,
    AppLetModule,
  ],
  declarations: [PagesComponent],
  exports: [PagesComponent],
})
export class PagesModule {}
