/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TableSorting } from '@sitecore/ng-spd-lib';
import { calculateTrend } from 'app/analytics/analytics-util/analytics-utils';
import { BXHistogram, LoadingState, TableHeader, TableRowData } from 'app/analytics/analytics.types';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-analytics-table',
  templateUrl: './analytics-table.component.html',
  styleUrls: ['./analytics-table.component.scss'],
})
export class AnalyticsTableComponent implements OnInit, OnChanges {
  @Input() chartData?: BXHistogram;
  @Input() isLoading = true;
  @Input() disabled = false;

  tableData: TableRowData[] | null = null;
  loadingState$ = new BehaviorSubject<LoadingState>('loading');
  sortParams: TableSorting = { fieldName: 'currentValue', direction: 'DESC' };
  headers?: TableHeader[];

  async ngOnInit(): Promise<void> {
    this.headers = [
      {
        fieldName: 'name',
        label: 'ANALYTICS.SITE_ANALYTICS.TABLE.NAME',
      },
      {
        fieldName: 'historicValue',
        label: 'ANALYTICS.SITE_ANALYTICS.TABLE.PREVIOUS_PERIOD',
      },
      {
        fieldName: 'currentValue',
        label: 'ANALYTICS.SITE_ANALYTICS.TABLE.RECENT_PERIOD',
        direction: 'DESC',
      },
      {
        fieldName: 'trendValue',
        label: 'ANALYTICS.SITE_ANALYTICS.TABLE.TREND',
      },
    ];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.chartData) {
      this.handleData();
    }
  }

  sortChange(sortParams: TableSorting) {
    this.sortParams = sortParams !== undefined ? sortParams : { fieldName: 'currentValue', direction: 'DESC' };
  }

  private async handleData(): Promise<void> {
    if (this.chartData) {
      const result = { ...this.chartData };
      this.tableData = result.data.current.map((currentData) => {
        const historicValue = result.data?.historic.find(
          (historicData) => historicData.name === currentData.name,
        )?.value;
        const { variation, trend } = calculateTrend(currentData.value, historicValue!);

        return {
          name: currentData.name,
          historicValue,
          currentValue: currentData.value,
          trendValue: variation,
          trend,
        };
      });
    } else {
      this.tableData = [];
    }
  }
}
