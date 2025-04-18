/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChangeDetectionStrategy, Component, ElementRef, NgZone } from '@angular/core';
import { BaseChartComponent } from '../base-chart/base-chart.component';

@Component({
  selector: 'app-heatmap-chart',
  templateUrl: './heatmap-chart.component.html',
  styleUrls: ['./heatmap-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeatmapChartComponent extends BaseChartComponent {
  override isLegendVisible = false;

  constructor(ngZone: NgZone, elementRef: ElementRef) {
    super(ngZone, elementRef);
  }
}
