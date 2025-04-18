/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChangeDetectionStrategy, Component, ElementRef, NgZone } from '@angular/core';
import { BaseChartComponent } from '../base-chart/base-chart.component';

@Component({
  selector: 'app-stacked-column-chart',
  templateUrl: './stacked-column-chart.component.html',
  styleUrls: ['./stacked-column-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackedColumnChartComponent extends BaseChartComponent {
  override isLegendVisible = true;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  isStackedSeries = true;

  constructor(ngZone: NgZone, elementRef: ElementRef) {
    super(ngZone, elementRef);
  }
}
