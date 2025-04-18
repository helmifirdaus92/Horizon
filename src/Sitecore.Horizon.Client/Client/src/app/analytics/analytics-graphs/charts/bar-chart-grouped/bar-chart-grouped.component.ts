/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChangeDetectionStrategy, Component, ElementRef, Input, NgZone } from '@angular/core';
import { BaseChartComponent } from '../base-chart/base-chart.component';

@Component({
  selector: 'app-bar-chart-grouped',
  templateUrl: './bar-chart-grouped.component.html',
  styleUrls: ['./bar-chart-grouped.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartGroupedComponent extends BaseChartComponent {
  @Input() horizontal = false;
  noBarWhenZero = false;

  constructor(ngZone: NgZone, elementRef: ElementRef) {
    super(ngZone, elementRef);
  }
}
