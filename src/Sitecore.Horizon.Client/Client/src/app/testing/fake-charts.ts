/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */

import { Component, Input, NgModule } from '@angular/core';

class FakeChartBase {
  @Input() items: any;
  @Input() nameFormatter: any;
  @Input() valueFormatter: any;
  @Input() showYAxis: any;
  @Input() yScaleMin: any;
  @Input() yScaleMax: any;
  @Input() autoScale: any;
  @Input() usePerformancePalette: any;
}

@Component({
  selector: 'app-line-chart',
  template: '⚡⚡⚡ FAKE LINE CHART ⚡⚡⚡',
})
export class FakeLineChartComponent extends FakeChartBase {}

@Component({
  selector: 'app-bar-chart',
  template: '⚡⚡⚡ FAKE COLUMN CHART ⚡⚡⚡',
})
export class FakeColumnChartComponent extends FakeChartBase {}

@Component({
  selector: 'app-pie-chart',
  template: '⚡⚡⚡ FAKE PIE CHART ⚡⚡⚡',
})
export class FakePieChartComponent extends FakeChartBase {}

@NgModule({
  declarations: [FakeLineChartComponent, FakeColumnChartComponent, FakePieChartComponent],
  exports: [FakeLineChartComponent, FakeColumnChartComponent, FakePieChartComponent],
})
export class FakeChartsModule {}
