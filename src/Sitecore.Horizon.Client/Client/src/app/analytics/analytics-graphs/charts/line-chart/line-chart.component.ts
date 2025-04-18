/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChangeDetectionStrategy, Component, ElementRef, NgZone } from '@angular/core';
import { BaseChartComponent } from '../base-chart/base-chart.component';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChartComponent extends BaseChartComponent {
  override isLegendVisible = true;

  override paletteIndex = 3;

  constructor(ngZone: NgZone, elementRef: ElementRef) {
    super(ngZone, elementRef);
  }
}
