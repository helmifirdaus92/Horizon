/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  ButtonModule,
  DroplistModule,
  EmptyStateModule,
  IconButtonModule,
  InputLabelModule,
  ListModule,
  TabsModule,
} from '@sitecore/ng-spd-lib';
// eslint-disable-next-line max-len
import { LocalDevelopmentSettingsModule } from 'app/editor/editor-workspace/editor-workspace-local-dev/local-dev-settings/local-dev-settings.module';
import { SitecoreExtensibilityModule } from 'app/extensibility/sitecore-extensibility.module';
// eslint-disable-next-line max-len
import { PersonalizationApiModule } from 'app/pages/left-hand-side/personalization/personalization-api/personalization.api.module';
import { NotificationsModule } from 'app/shared/notifications/notifications.module';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { AssetsPipeModule } from 'app/shared/utils/assets.module';
import { AnalyticsApiModule } from './analytics-api/analytics.api.module';
import { AnalyticsErrorBannerModule } from './analytics-error-banner/analytics-error-banner.module';
import { AnalyticsGraphsModule } from './analytics-graphs/analytics-graphs.module';
import { AnalyticsComponent } from './analytics.component';
import { PageAnalyticsComponent } from './page-analytics/page-analytics.component';
import { SiteAnalyticsComponent } from './site-analytics/site-analytics.component';

@NgModule({
  imports: [
    CommonModule,
    ButtonModule,
    DroplistModule,
    IconButtonModule,
    TranslateModule,
    AnalyticsGraphsModule,
    NotificationsModule,
    ListModule,
    EmptyStateModule,
    LocalDevelopmentSettingsModule,
    InputLabelModule,
    DroplistModule,
    PersonalizationApiModule,
    AnalyticsApiModule,
    SitecoreExtensibilityModule,
    TabsModule,
    AnalyticsErrorBannerModule,
    PipesModule,
    AssetsPipeModule,
  ],
  declarations: [AnalyticsComponent, PageAnalyticsComponent, SiteAnalyticsComponent],
  exports: [AnalyticsComponent, PageAnalyticsComponent, SiteAnalyticsComponent],
  providers: [DatePipe],
})
export class AnalyticsModule {}
