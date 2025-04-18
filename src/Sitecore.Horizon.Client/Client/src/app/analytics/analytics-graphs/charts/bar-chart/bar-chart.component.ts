/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChangeDetectionStrategy, Component, ElementRef, Input, NgZone } from '@angular/core';
import { BaseChartComponent } from '../base-chart/base-chart.component';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartComponent extends BaseChartComponent {
  noBarWhenZero = false;

  @Input() horizontal = false;

  constructor(ngZone: NgZone, elementRef: ElementRef) {
    super(ngZone, elementRef);
  }
}
