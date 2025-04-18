/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NgModule } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BarChartGroupedComponent } from './bar-chart-grouped/bar-chart-grouped.component';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { BaseChartComponent } from './base-chart/base-chart.component';
import { ChartLegendComponent } from './chart-legend/chart-legend.component';
import { HeatmapChartComponent } from './heatmap-chart/heatmap-chart.component';
import { LineChartComponent } from './line-chart/line-chart.component';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { StackedColumnChartComponent } from './stacked-column-chart/stacked-column-chart.component';

@NgModule({
  imports: [NgxChartsModule],
  exports: [
    BarChartComponent,
    BarChartGroupedComponent,
    BaseChartComponent,
    ChartLegendComponent,
    HeatmapChartComponent,
    LineChartComponent,
    PieChartComponent,
    StackedColumnChartComponent,
  ],
  declarations: [
    BarChartComponent,
    BarChartGroupedComponent,
    BaseChartComponent,
    ChartLegendComponent,
    HeatmapChartComponent,
    LineChartComponent,
    PieChartComponent,
    StackedColumnChartComponent,
  ],
})
export class ChartsModule {}
