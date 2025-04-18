/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { calculateTrend } from 'app/analytics/analytics-util/analytics-utils';
import { BXSingleStat } from 'app/analytics/analytics.types';
import { ShortNumberPipe } from 'app/shared/pipes/short-number-pipe/short-number.pipe';
import { SingleStat } from '../single-stat-tiles/single-stat-tiles.component';

@Component({
  selector: 'app-single-stat-page-analytics',
  templateUrl: './single-stat-page-analytics.component.html',
  styleUrls: ['./single-stat-page-analytics.component.scss'],
})
export class SingleStatPageAnalyticsComponent implements OnChanges {
  @Input() pageVariantVisitorsCount?: BXSingleStat;
  @Input() avgPageViewsBySessionCount?: BXSingleStat;
  @Input() sessionCount?: BXSingleStat;
  @Input() isLoading = true;
  @Input() disabled = false;
  @Input() isSecondVariant?: boolean;

  private tileWithoutData = {
    mainValue: '--',
    trendValue: null,
    trend: null,
  };

  pageVariantVisitorsCountData: SingleStat = this.tileWithoutData;
  avgPageViewCountData: SingleStat = this.tileWithoutData;
  sessionCountData: SingleStat = this.tileWithoutData;

  private shortNumber = new ShortNumberPipe().transform;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.pageVariantVisitorsCount || changes.avgPageViewCount || changes.sessionCount) {
      this.handlePageVariantViewCount();
      this.handleAvgPageViewCount();
      this.handleSessionCount();
    }
  }

  private handlePageVariantViewCount(): void {
    if (this.pageVariantVisitorsCount) {
      const res = this.pageVariantVisitorsCount;

      if (res && typeof res.data.current === 'number' && typeof res.data.historic === 'number') {
        const { current, historic } = res.data;
        const { variation, trend } = calculateTrend(current, historic);

        this.pageVariantVisitorsCountData = {
          mainValue: this.shortNumber(current),
          trendValue: this.shortNumber(variation),
          trend,
        };
      }
    } else {
      this.pageVariantVisitorsCountData = this.tileWithoutData;
    }
  }

  private handleAvgPageViewCount(): void {
    if (this.avgPageViewsBySessionCount) {
      const res = this.avgPageViewsBySessionCount;

      if (res && typeof res.data.current === 'number' && typeof res.data.historic === 'number') {
        const { current, historic } = res.data;
        const { variation, trend } = calculateTrend(current, historic);

        this.avgPageViewCountData = {
          mainValue: this.shortNumber(current),
          trendValue: this.shortNumber(variation),
          trend,
        };
      }
    } else {
      this.avgPageViewCountData = this.tileWithoutData;
    }
  }

  private handleSessionCount(): void {
    if (this.sessionCount) {
      const res = this.sessionCount;

      if (res && typeof res.data.current === 'number' && typeof res.data.historic === 'number') {
        const { current, historic } = res.data;
        const { variation, trend } = calculateTrend(current, historic);

        this.sessionCountData = {
          mainValue: this.shortNumber(current),
          trendValue: this.shortNumber(variation),
          trend,
        };
      }
    } else {
      this.sessionCountData = this.tileWithoutData;
    }
  }
}
