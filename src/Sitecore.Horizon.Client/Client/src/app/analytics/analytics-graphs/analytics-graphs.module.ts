/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule, DroplistModule, LoadingIndicatorModule, TableModule, TrendModule } from '@sitecore/ng-spd-lib';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { AnalyticsModeBase } from '../analytics-util/analytics-mode.base';
import { VariantIdToNamePipe } from '../analytics-util/variant-id-to-name.pipe';
import { AnalyticsBrowserComponent } from './analytics-browser/analytics-browser.component';
import { AnalyticsHeatmapComponent } from './analytics-heatmap/analytics-heatmap.component';
// eslint-disable-next-line max-len
import { AnalyticsOperatingSystemsComponent } from './analytics-operating-systems/analytics-operating-systems.component';
import { AnalyticsSourceComponent } from './analytics-source/analytics-source.component';
import { AnalyticsTableComponent } from './analytics-table/analytics-table.component';
import { AnalyticsTimeseriesComponent } from './analytics-timeseries/analytics-timeseries.component';
import { AnalyticsTopCountriesComponent } from './analytics-top-countries/analytics-top-countries.component';
import { AnalyticsTopPagesComponent } from './analytics-top-pages/analytics-top-pages.component';
import { ChartsModule } from './charts/charts.module';
import { PageAnalyticsGraphsComponent } from './page-analytics-graphs/page-analytics-graphs.component';
import { SingleStatPageAnalyticsComponent } from './single-stat-page-analytics/single-stat-page-analytics.component';
import { SingleStatTilesComponent } from './single-stat-tiles/single-stat-tiles.component';
import { SiteAnalyticsGraphsComponent } from './site-analytics-graphs/site-analytics-graphs.component';

@NgModule({
  imports: [
    CommonModule,
    CardModule,
    TrendModule,
    DroplistModule,
    TranslateModule,
    PipesModule,
    LoadingIndicatorModule,
    TableModule,
    AppLetModule,
    NgxChartsModule,
    ChartsModule,
  ],
  declarations: [
    SingleStatTilesComponent,
    SiteAnalyticsGraphsComponent,
    AnalyticsTimeseriesComponent,
    AnalyticsHeatmapComponent,
    AnalyticsTopPagesComponent,
    AnalyticsTopCountriesComponent,
    AnalyticsOperatingSystemsComponent,
    AnalyticsBrowserComponent,
    AnalyticsSourceComponent,
    AnalyticsTableComponent,
    PageAnalyticsGraphsComponent,
    SingleStatPageAnalyticsComponent,
    VariantIdToNamePipe,
    AnalyticsModeBase,
  ],
  exports: [
    SingleStatTilesComponent,
    SiteAnalyticsGraphsComponent,
    AnalyticsTimeseriesComponent,
    AnalyticsHeatmapComponent,
    AnalyticsTopPagesComponent,
    AnalyticsTopCountriesComponent,
    AnalyticsOperatingSystemsComponent,
    AnalyticsBrowserComponent,
    AnalyticsSourceComponent,
    AnalyticsTableComponent,
    PageAnalyticsGraphsComponent,
  ],
})
export class AnalyticsGraphsModule {}
