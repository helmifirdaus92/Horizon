/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TrendType } from '@sitecore/ng-spd-lib';
import { emptyData } from '../analytics-mock-data';
import {
  AnalyticsFilterOptions,
  BXHistogram,
  BXHistogramDataCurrent,
  BXTimeSeries,
  ChartData,
  PageAnalytics,
  SiteAnalytics,
} from '../analytics.types';

export function calculateTrend(
  currentValue: number,
  historicValue: number,
): { variation: number | null; trend: TrendType | null } {
  const countChange = currentValue - historicValue;

  const absCountChange = Math.abs(countChange);

  const result = Math.round(absCountChange * 10) / 10;
  if (countChange === 0) {
    return { variation: result, trend: 'neutral' };
  }
  if (countChange > 0) {
    return { variation: result, trend: 'up' };
  }
  if (countChange < 0) {
    return { variation: result, trend: 'down' };
  }
  // Default
  return { variation: null, trend: null };
}

export function checkCdpIsConfigured(
  isConnectedMode: boolean,
  configuration: { cdpAppUrl?: string; cdpApiUrl?: string },
): boolean {
  if (!isConnectedMode) {
    return true;
  }

  if (configuration.cdpAppUrl && configuration.cdpApiUrl) {
    return true;
  }

  return false;
}

export function checkPosIdentifierIsDefined(sitePos: string | null): boolean {
  if (!!sitePos) {
    return true;
  }

  return false;
}

export function checkAnalyticsHasData(analytics: SiteAnalytics | PageAnalytics | null): boolean {
  return (
    !!analytics &&
    !Object.values(analytics).every((dataPoint) => {
      return (
        dataPoint?.data?.current === undefined ||
        dataPoint.data.current === 0 ||
        dataPoint.data.current?.length === 0 ||
        dataPoint.meta.widgetType === 'HEATMAP'
      );
    })
  );
}

export function takeTopItems(value: BXHistogramDataCurrent[], numberOfRecords: number): BXHistogramDataCurrent[] {
  return value.sort((a, b) => b.value - a.value).slice(0, numberOfRecords) ?? [];
}

export function buildAnalyticsQueryString(
  metrics: 'siteMetrics' | 'pageMetrics',
  filter: Partial<AnalyticsFilterOptions>,
): string {
  const queryString = new URLSearchParams();
  // By default 'all' pointOfSale data will return from boxever side
  if (filter.pointOfSale) {
    queryString.set('pointOfSale', filter.pointOfSale);
  }
  // By default '1h' duration data will return from boxever side
  if (filter.duration) {
    queryString.set('duration', filter.duration);
  }
  // Timezone Offset is only for heatmap if not passed data will return in UTC
  if (filter.timezoneOffset) {
    queryString.set('timezoneOffset', filter.timezoneOffset.toString());
  }
  // PageVariantId is the required query parameter for the pageMetrics only
  if (metrics === 'pageMetrics' && filter.pageVariantId) {
    queryString.set('pageVariantId', filter.pageVariantId);
  }
  return `${metrics}?${queryString.toString()}`;
}

export function mapGroupedBarChartData(
  chartData: BXHistogram | BXTimeSeries,
  secondVariantChartData: BXHistogram | BXTimeSeries,
  variantOne: string,
  variantTwo?: string | null,
): ChartData[] {
  const chartDataOne = chartData.data.current.length ? chartData.data.current : emptyData;
  const chartDataTwo = secondVariantChartData.data.current.length ? secondVariantChartData.data.current : emptyData;

  const uniqueEntries: Set<string> = new Set();
  (!chartData.data.current.length && !secondVariantChartData.data.current.length
    ? [emptyData]
    : [chartData.data.current, secondVariantChartData.data.current]
  ).forEach((data) => data.forEach((entry) => uniqueEntries.add(entry.name)));

  const result = [...uniqueEntries].map((entry) => {
    const series = [
      {
        name: variantOne + ',',
        value: chartDataOne.find((firstEntry) => firstEntry.name === entry)?.value ?? 0,
      },
      {
        name: variantTwo + ',',
        value: chartDataTwo.find((secondEntry) => secondEntry.name === entry)?.value ?? 0,
      },
    ];

    return {
      name: entry,
      series,
    };
  });
  return result;
}
