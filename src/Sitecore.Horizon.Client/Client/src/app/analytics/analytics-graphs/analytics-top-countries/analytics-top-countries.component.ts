/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { timeseriesWithoutData } from 'app/analytics/analytics-mock-data';
import { mapGroupedBarChartData, takeTopItems } from 'app/analytics/analytics-util/analytics-utils';
import { AnalyticsVariantFilterValue, BXHistogram, ChartData } from 'app/analytics/analytics.types';
import { firstValueFrom } from 'rxjs';
import { HISTOGRAM_RECORDS_TO_DISPLAY } from '../../site-analytics/site-analytics.component';

@Component({
  selector: 'app-analytics-top-countries',
  templateUrl: './analytics-top-countries.component.html',
  styleUrls: ['./analytics-top-countries.component.scss'],
})
export class AnalyticsTopCountriesComponent implements OnChanges {
  @Input() chartData?: BXHistogram;
  @Input() secondVariantChartData?: BXHistogram;
  @Input() isLoading = true;
  @Input() disabled = false;
  @Input() variants?: AnalyticsVariantFilterValue;

  manipulatedChartData: ChartData[] = [];
  manipulatedGroupChartData: ChartData[] = [];

  constructor(private readonly translateService: TranslateService) {}

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.chartData || changes.secondVariantChartData) {
      this.handleData();
      if (this.chartData && this.secondVariantChartData) {
        const defaultVariant = await firstValueFrom(this.translateService.get('ANALYTICS.DEFAULT_PAGE_VARIANT'));
        const mappedData = mapGroupedBarChartData(
          this.chartData,
          this.secondVariantChartData,
          this.variants?.variantOne.variantName ?? defaultVariant,
          this.variants?.variantTwo?.variantName,
        );
        this.manipulatedGroupChartData = mappedData;
      }
    }
  }

  private handleData(): void {
    if (this.chartData?.data.current[0]) {
      const result = { ...this.chartData };
      this.manipulatedChartData = [
        {
          name: 'sessionsByCountryHist',
          series: takeTopItems(result.data.current, HISTOGRAM_RECORDS_TO_DISPLAY),
        },
      ];
    } else {
      this.manipulatedChartData = timeseriesWithoutData;
    }
  }
}
