/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { SortingDirection, TrendType } from '@sitecore/ng-spd-lib';

export type AnalyticsRoute = 'site' | 'page';

export type LoadingState = 'loading' | 'done' | 'noData' | 'error';

export type SiteAnalyticsFilterOptions = Omit<AnalyticsFilterOptions, 'pageVariantId'>;

export interface AnalyticsFilterOptions {
  pointOfSale?: string | null;
  duration?: string;
  timezoneOffset?: number;
  pageVariantId: string;
}

export interface ChartData {
  name: string;
  series: ChartDataItem[];
}

export interface ChartDataItem {
  value: number | null;
  name: string;
}
export interface TableRowData {
  name: string;
  historicValue?: number | null;
  currentValue: number | null;
  trendValue: number | null;
  trend: TrendType | null;
}

export interface TableHeader {
  fieldName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  label: any;
  direction?: SortingDirection | null;
}

export interface SelectedHeatmapData {
  name: string;
  date?: string;
  value: number;
  label?: string;
  series?: string;
}

export interface BXMeta {
  widgetType: 'SINGLESTAT' | 'TIMESERIES' | 'HEATMAP' | 'HISTOGRAM';
  unitType: 'QUANTITY' | 'PERCENTAGE';
}

export interface BXSingleStat {
  meta: BXMeta;
  data: BXSingleStatData;
}

export interface BXSingleStatData {
  current: number | null;
  historic: number | null;
}

export interface BXHeatmap {
  meta: BXMeta;
  data: BXHeatmapData;
}

export interface BXHeatmapData {
  current: BXHeatmapDataCurrent[];
}

export interface BXHeatmapDataCurrent {
  name: string;
  series: BXSeries[];
}

export interface BXHistogram {
  meta: BXMeta;
  data: BXHistogramData;
}

export interface BXHistogramData {
  current: BXHistogramDataCurrent[];
  historic: BXHistogramDataCurrent[];
}

export interface BXHistogramDataCurrent {
  name: string;
  value: number;
}

export interface BXTimeSeries {
  meta: BXMeta;
  data: BXTimeSeriesData;
}

export interface BXTimeSeriesData {
  current: BXTimeSeriesDataCurrent[];
  historic: BXTimeSeriesDataCurrent[];
}

export interface BXTimeSeriesDataCurrent {
  value: number;
  name: string;
}

export interface BXRange {
  end: string;
  start: string;
}

export interface BXSeries {
  name: string;
  value: number | null;
}

export interface SiteAnalytics {
  activeGuestCount: BXSingleStat;
  activeSessionCount: BXSingleStat;
  sessionDurationAverage: BXSingleStat;
  bouncedSessionCount: BXSingleStat;
  pageViewCount: BXSingleStat;

  pageViewTimeseries: BXTimeSeries;
  activeGuestTimeseries: BXTimeSeries;
  sessionTimeseries: BXTimeSeries;

  sessionsByCountryHist: BXHistogram;
  sessionsByDeviceHist: BXHistogram;
  sessionsByFirstPageHist: BXHistogram;
  sessionsByOperatingSystemHist: BXHistogram;
  sessionsByRefererHist: BXHistogram;
  viewsByPageHist: BXHistogram;

  sessionHeatmap: BXHeatmap;
}

export interface PageAnalytics {
  pageVariantViewBySessionRatio: BXSingleStat;
  pageVariantViewCount: BXSingleStat;
  sessionCount: BXSingleStat;

  pageVariantViewTimeseries: BXTimeSeries;

  pageVariantByCountryHist: BXHistogram;
  pageVariantByDeviceHist: BXHistogram;
  pageVariantByOperatingSystemHist: BXHistogram;
  pageVariantByRefererHist: BXHistogram;
  pageViewCountByPageVariantHist: BXHistogram;

  pageVariantHeatmap: BXHeatmap;
}

export interface PageAnalyticsVariantsData {
  variantOne: PageAnalytics | null;
  variantTwo: PageAnalytics | null;
}

export interface SiteAnalyticsState {
  siteAnalyticsData: SiteAnalytics | null;
  duration: string;
  hasData: boolean;
  isPosIdentifierDefined: boolean;
}

export interface PageAnalyticsState {
  pageAnalyticsData: PageAnalyticsVariantsData;
  durationFilter: AnalyticsTimeFilterOption;
  variantFilter: AnalyticsVariantFilterValue;
  hasData: boolean;
  isPosIdentifierDefined: boolean;
}

export interface AnalyticsTimeFilterOption {
  id: '1H' | '3H' | '1D' | '7D' | '14D' | '30D' | 'customRange';
  value: '1h' | '3h' | '1d' | '7d' | '14d' | '30d';
}

export interface AnalyticsVariantFilterValue {
  variantOne: AnalyticsVariantFilterOption;
  variantTwo?: AnalyticsVariantFilterOption;
}

export interface AnalyticsVariantFilterOption {
  variantName: string | null;
  variantId: 'default' | string;
}
