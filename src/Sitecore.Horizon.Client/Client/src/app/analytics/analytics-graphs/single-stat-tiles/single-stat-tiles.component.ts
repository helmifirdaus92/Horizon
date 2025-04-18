/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { formatNumber } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TrendType } from '@sitecore/ng-spd-lib';
import { calculateTrend } from 'app/analytics/analytics-util/analytics-utils';
import { AnalyticsRoute, BXSingleStat } from 'app/analytics/analytics.types';
import { ShortNumberPipe } from 'app/shared/pipes/short-number-pipe/short-number.pipe';
import { EMPTY, Observable } from 'rxjs';

export interface SingleStat {
  trend: TrendType | null;
  mainValue: string | number | null;
  trendValue: string | number | null;
}

@Component({
  selector: 'app-single-stat-tiles',
  templateUrl: './single-stat-tiles.component.html',
  styleUrls: ['./single-stat-tiles.component.scss'],
})
export class SingleStatTilesComponent implements OnChanges {
  @Input() activeSessionCountData?: BXSingleStat;
  @Input() visitorCountData?: BXSingleStat;
  @Input() avgSessionDurationData?: BXSingleStat;
  @Input() bounceRateData?: BXSingleStat;
  @Input() isLoading = true;
  @Input() disabled = false;
  private tileWithoutData = {
    mainValue: '--',
    trendValue: null,
    trend: null,
  };

  activeSessionCount: SingleStat = this.tileWithoutData;
  visitorCount: SingleStat = this.tileWithoutData;
  activeRouteState$: Observable<AnalyticsRoute> = EMPTY;
  avgSessionDuration: SingleStat = this.tileWithoutData;
  bounceRate: SingleStat = this.tileWithoutData;

  private shortNumber = new ShortNumberPipe().transform;
  private decimal = (value: number | null) => formatNumber(value || 0, 'en-US', '1.0-1');

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.activeSessionCountData ||
      changes.visitorCountData ||
      changes.avgSessionDurationData ||
      changes.bounceRateData
    ) {
      this.handleVisitorCount();
      this.handleSessionDuration();
      this.handleActiveSessionCount();
      this.handleBounceRateCount();
    }
  }
  private async handleVisitorCount(): Promise<void> {
    if (this.visitorCountData) {
      const res = this.visitorCountData;

      if (res && typeof res.data.current === 'number' && typeof res.data.historic === 'number') {
        const { current, historic } = res.data;
        const { variation, trend } = calculateTrend(current, historic);

        this.visitorCount = {
          mainValue: this.shortNumber(current),
          trendValue: this.shortNumber(variation),
          trend,
        };
      }
    } else {
      this.visitorCount = this.tileWithoutData;
    }
  }

  private async handleSessionDuration(): Promise<void> {
    if (this.avgSessionDurationData) {
      const res = this.avgSessionDurationData;

      if (res && typeof res.data.current === 'number' && typeof res.data.historic === 'number') {
        const { current, historic } = { current: res.data.current / 60, historic: res.data.historic / 60 };
        const { variation, trend } = calculateTrend(current, historic);

        this.avgSessionDuration = {
          mainValue: `${this.decimal(current)}m`,
          trendValue: `${this.decimal(variation)}m`,
          trend,
        };
      }
    } else {
      this.avgSessionDuration = this.tileWithoutData;
    }
  }

  private async handleActiveSessionCount(): Promise<void> {
    if (this.activeSessionCountData) {
      const res = this.activeSessionCountData;

      if (res && typeof res.data.current === 'number' && typeof res.data.historic === 'number') {
        const { current, historic } = res.data;
        const { variation, trend } = calculateTrend(current, historic);

        this.activeSessionCount = {
          mainValue: `${this.shortNumber(current)}`,
          trendValue: `${this.shortNumber(variation)}`,
          trend,
        };
      }
    } else {
      this.activeSessionCount = this.tileWithoutData;
    }
  }

  // '%' this will be removed/updated once the API send the data in correct units/format
  private async handleBounceRateCount() {
    if (this.bounceRateData) {
      const res = this.bounceRateData;

      if (res && typeof res.data.current === 'number' && typeof res.data.historic === 'number') {
        const { current, historic } = res.data;
        const { variation, trend } = calculateTrend(current, historic);

        this.bounceRate = {
          mainValue: `${this.decimal(current)}%`,
          trendValue: `${this.decimal(variation)}%`,
          trend,
        };
      }
    } else {
      this.bounceRate = this.tileWithoutData;
    }
  }
}
