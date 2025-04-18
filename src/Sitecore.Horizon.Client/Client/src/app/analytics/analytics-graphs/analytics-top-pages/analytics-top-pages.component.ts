/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { timeseriesWithoutData } from 'app/analytics/analytics-mock-data';
import { AnalyticsModeBase } from 'app/analytics/analytics-util/analytics-mode.base';
import { takeTopItems } from 'app/analytics/analytics-util/analytics-utils';
import { AnalyticsVariantFilterValue, BXHistogram, ChartData } from 'app/analytics/analytics.types';
import { HISTOGRAM_RECORDS_TO_DISPLAY } from '../../site-analytics/site-analytics.component';

@Component({
  selector: 'app-analytics-top-pages',
  templateUrl: './analytics-top-pages.component.html',
  styleUrls: ['./analytics-top-pages.component.scss'],
})
export class AnalyticsTopPagesComponent extends AnalyticsModeBase implements OnChanges {
  @Input() chartData?: BXHistogram;
  @Input() secondVariantChartData?: BXHistogram;
  @Input() isLoading = true;
  @Input() disabled = false;
  @Input() variants?: AnalyticsVariantFilterValue;

  manipulatedChartData: ChartData[] = [];

  constructor() {
    super();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.chartData || changes.secondVariantChartData) {
      this.handleData();
    }
  }

  private handleData(): void {
    if (this.chartData?.data.current.length) {
      const result = { ...this.chartData };
      this.manipulatedChartData = [
        {
          name: 'getPageViewsByGuestHist',
          series: takeTopItems(result.data.current, HISTOGRAM_RECORDS_TO_DISPLAY),
        },
      ];
    } else if (this.secondVariantChartData?.data.current.length) {
      const result = { ...this.secondVariantChartData };
      this.manipulatedChartData = [
        {
          name: 'getPageViewsByGuestHist',
          series: takeTopItems(result.data.current, HISTOGRAM_RECORDS_TO_DISPLAY),
        },
      ];
    } else {
      this.manipulatedChartData = timeseriesWithoutData;
    }
  }
}
