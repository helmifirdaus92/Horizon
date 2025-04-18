/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsContextService } from 'app/analytics/analytics-context.service';
import { timeseriesWithoutData } from 'app/analytics/analytics-mock-data';
import { AnalyticsModeBase } from 'app/analytics/analytics-util/analytics-mode.base';
import { mapGroupedBarChartData } from 'app/analytics/analytics-util/analytics-utils';
import { AnalyticsRoute, AnalyticsVariantFilterValue, BXTimeSeries, ChartData } from 'app/analytics/analytics.types';
import { ANALYTICS_SITE_ANALYTICS_DEFAULT_DURATION } from 'app/analytics/site-analytics/site-analytics.component';
import { EMPTY, Observable, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-analytics-timeseries',
  templateUrl: './analytics-timeseries.component.html',
  styleUrls: ['./analytics-timeseries.component.scss'],
})
export class AnalyticsTimeseriesComponent extends AnalyticsModeBase implements OnChanges, OnInit {
  @Input() visitsChartData?: BXTimeSeries;
  @Input() secondVariantVisitsChartData?: BXTimeSeries;
  @Input() visitorsChartData?: BXTimeSeries;
  @Input() isLoading = true;
  @Input() disabled = false;
  @Input() duration = ANALYTICS_SITE_ANALYTICS_DEFAULT_DURATION;
  @Input() variants?: AnalyticsVariantFilterValue;

  activeRouteState$: Observable<AnalyticsRoute> = EMPTY;

  dataType = 'visits';
  chartType = 'line';
  chartData: ChartData[] = [];
  groupedData: ChartData[] = [];

  constructor(
    private readonly analyticsContextService: AnalyticsContextService,
    private readonly datePipe: DatePipe,
    private readonly translateService: TranslateService,
  ) {
    super();
  }

  ngOnInit() {
    this.activeRouteState$ = this.analyticsContextService.watchActiveRoute();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (
      changes.visitsChartData ||
      changes.visitorsChartData ||
      changes.duration ||
      changes.secondVariantVisitsChartData
    ) {
      await this.handleData();
      if (this.secondVariantVisitsChartData) {
        await this.handleDataGroupedBarChartData();
      }
    }
  }

  async handleData(): Promise<void> {
    if (this.dataType === 'visits') {
      await this.handleVisitsTimeseriesData();
    }
    if (this.dataType === 'visitors') {
      this.handleVisitorsTimeseriesData();
    }
  }

  private async handleVisitsTimeseriesData(): Promise<void> {
    if (!this.visitsChartData?.data.current.length && !this.secondVariantVisitsChartData?.data.current.length) {
      this.chartData = timeseriesWithoutData;
      return;
    }

    const defaultVariant = await firstValueFrom(this.translateService.get('ANALYTICS.DEFAULT_PAGE_VARIANT'));
    const v1 = { ...this.visitsChartData };
    const v2 = { ...this.secondVariantVisitsChartData };

    // fill empty values to missing timeline in each variant
    // post process only if both variants has data
    if (v1?.data?.current.length && v2?.data?.current.length) {
      const uniqueTimeline = new Set(v1.data.current.map((v) => v.name).concat(v2.data.current.map((v) => v.name)));
      for (const timeline of uniqueTimeline) {
        if (!v1.data.current.some((d) => d.name === timeline)) {
          v1.data.current.push({ name: timeline, value: 0 });
        }
        if (!v2.data.current.some((d) => d.name === timeline)) {
          v2.data.current.push({ name: timeline, value: 0 });
        }
      }
    }
    if (v1?.data?.current.length) {
      this.chartData = [
        {
          name: this.variants ? this.variants?.variantOne.variantName ?? defaultVariant : this.dataType,
          series: [...v1.data.current]
            .sort((a, b) => Date.parse(a.name) - Date.parse(b.name))
            .map((date) => {
              return { name: this.handleDate(date.name), value: date.value };
            }),
        },
      ];
    } else {
      this.chartData = [];
    }
    if (v2?.data?.current.length) {
      this.chartData.push({
        name: this.variants?.variantTwo?.variantName ?? '' + ',',
        series: [...v2.data.current]
          .sort((a, b) => Date.parse(a.name) - Date.parse(b.name))
          .map((date) => {
            return { name: this.handleDate(date.name), value: date.value };
          }),
      });
    }
  }

  private handleVisitorsTimeseriesData(): void {
    if (this.visitorsChartData?.data.current[0]) {
      const result = { ...this.visitorsChartData };
      this.chartData = [
        {
          name: this.dataType,
          series: [...result.data.current].reverse().map((date) => {
            return { name: this.handleDate(date.name), value: date.value };
          }),
        },
      ];
    } else {
      this.chartData = timeseriesWithoutData;
    }
  }

  private async handleDataGroupedBarChartData(): Promise<void> {
    if (this.chartData.length) {
      const variantOne = this.visitsChartData;
      if (variantOne) {
        variantOne.data.current = variantOne.data.current
          .map((data) => {
            return { name: this.handleDate(data.name), value: data.value };
          })
          .reverse();
      }
      const variantTwo = this.secondVariantVisitsChartData;
      if (variantTwo) {
        variantTwo.data.current = variantTwo.data.current
          .map((data) => {
            return { name: this.handleDate(data.name), value: data.value };
          })
          .reverse();
      }
      const defaultVariant = await firstValueFrom(this.translateService.get('ANALYTICS.DEFAULT_PAGE_VARIANT'));

      if (variantOne && variantTwo) {
        const mappedData = mapGroupedBarChartData(
          variantOne,
          variantTwo,
          this.variants?.variantOne.variantName ?? defaultVariant,
          this.variants?.variantTwo?.variantName,
        );
        this.groupedData = mappedData;
      }
    }
  }

  private handleDate(date: string): string {
    if (this.duration === '1d' || this.duration === '3h' || this.duration === '1h') {
      return this.datePipe.transform(date, 'HH:mm') as string;
    }

    return this.datePipe.transform(date, 'MMM d') as string;
  }
}
