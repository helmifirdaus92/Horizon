/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { heatmapWithoutData } from 'app/analytics/analytics-mock-data';
import { BXHeatmap, ChartData } from 'app/analytics/analytics.types';

@Component({
  selector: 'app-analytics-heatmap',
  templateUrl: './analytics-heatmap.component.html',
  styleUrls: ['./analytics-heatmap.component.scss'],
})
export class AnalyticsHeatmapComponent implements OnChanges {
  @Input() chartData?: BXHeatmap;
  @Input() isLoading = true;
  @Input() disabled = false;
  @Input() isSecondVariant?: boolean;
  @Input() variantName?: string | null;

  manipulatedChartData: ChartData[] | null = null;
  rowCount = 7;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.chartData) {
      this.handleData();
    }
  }

  private async handleData(): Promise<void> {
    if (this.chartData?.data.current[0]) {
      const result = { ...this.chartData };

      this.manipulatedChartData = result?.data.current?.map((data) => {
        return {
          name: data.name,
          series: [...data.series]
            .filter((date) => date.value !== null)
            .reverse()
            .map((date) => {
              return {
                name: date.name,
                value: date.value,
              };
            }),
        };
      });
    } else {
      this.manipulatedChartData = heatmapWithoutData;
    }

    this.handleRowsCount();
  }

  private handleRowsCount() {
    const data = this.manipulatedChartData;
    if (data) {
      const uniqueEntries = new Set();
      data.forEach((item) => item.series.forEach((entry) => uniqueEntries.add(entry.name)));

      this.rowCount = uniqueEntries.size;
    }
  }
}
