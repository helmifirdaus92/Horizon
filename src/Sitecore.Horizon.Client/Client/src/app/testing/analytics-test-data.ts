/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import {
  BXHeatmap,
  BXHistogram,
  BXSingleStat,
  BXTimeSeries,
  PageAnalytics,
  SiteAnalytics,
} from 'app/analytics/analytics.types';

// Default test data all endpoints (siteAnalytics & pageAnalytics)
const timeSeriesChartTestData = (): BXTimeSeries => {
  return {
    data: {
      current: [
        {
          value: 6541,
          name: '2022-02-28T13:57:33.597Z',
        },
        {
          value: 3677,
          name: '2022-03-28T13:57:33.597Z',
        },
      ],
      historic: [
        {
          value: 30,
          name: '2021-02-28T13:00:00.597Z',
        },
      ],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'TIMESERIES',
    },
  };
};

const histogramChartTestData = (): BXHistogram => {
  return {
    data: {
      current: [
        {
          name: 'Home Page',
          value: 100,
        },
        {
          name: 'About Us',
          value: 100,
        },
      ],
      historic: [
        {
          name: 'Home Page',
          value: 100,
        },
        {
          name: 'About Us',
          value: 50,
        },
      ],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HISTOGRAM',
    },
  };
};

const singleStatChartTestData = (): BXSingleStat => {
  return {
    data: {
      current: 40,
      historic: 50,
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'SINGLESTAT',
    },
  };
};

const heatmapChartTestData = (): BXHeatmap => {
  return {
    data: {
      current: [
        {
          name: '00:00',
          series: [
            {
              name: 'Mon',
              value: 543,
            },
            {
              name: 'Tue',
              value: 87,
            },
            {
              name: 'Wed',
              value: 543,
            },
            {
              name: 'Thu',
              value: 7,
            },
            {
              name: 'Fri',
              value: 543,
            },
            {
              name: 'Sat',
              value: 750,
            },
            {
              name: 'Sun',
              value: 543,
            },
          ],
        },
        {
          name: '01:00',
          series: [
            {
              name: 'Mon',
              value: 543,
            },
            {
              name: 'Tue',
              value: 1300,
            },
            {
              name: 'Wed',
              value: 543,
            },
            {
              name: 'Thu',
              value: 7,
            },
            {
              name: 'Fri',
              value: 543,
            },
            {
              name: 'Sat',
              value: 150,
            },
            {
              name: 'Sun',
              value: 543,
            },
          ],
        },
        {
          name: '02:00',
          series: [
            {
              name: 'Mon',
              value: 543,
            },
            {
              name: 'Tue',
              value: 97,
            },
            {
              name: 'Wed',
              value: 0,
            },
            {
              name: 'Thu',
              value: 0,
            },
            {
              name: 'Fri',
              value: 0,
            },
            {
              name: 'Sat',
              value: 750,
            },
            {
              name: 'Sun',
              value: 543,
            },
          ],
        },
        {
          name: '03:00',
          series: [
            {
              name: 'Mon',
              value: 543,
            },
            {
              name: 'Tue',
              value: 84,
            },
            {
              name: 'Wed',
              value: 543,
            },
            {
              name: 'Thu',
              value: 500,
            },
            {
              name: 'Fri',
              value: 622,
            },
            {
              name: 'Sat',
              value: 750,
            },
            {
              name: 'Sun',
              value: 543,
            },
          ],
        },
        {
          name: '04:00',
          series: [
            {
              name: 'Mon',
              value: 533,
            },
            {
              name: 'Tue',
              value: 400,
            },
            {
              name: 'Wed',
              value: 543,
            },
            {
              name: 'Thu',
              value: 95,
            },
            {
              name: 'Fri',
              value: 543,
            },
            {
              name: 'Sat',
              value: 750,
            },
            {
              name: 'Sun',
              value: 52,
            },
          ],
        },
        {
          name: '05:00',
          series: [
            {
              name: 'Mon',
              value: 543,
            },
            {
              name: 'Tue',
              value: 300,
            },
            {
              name: 'Wed',
              value: 543,
            },
            {
              name: 'Thu',
              value: 865,
            },
            {
              name: 'Fri',
              value: 543,
            },
            {
              name: 'Sat',
              value: 750,
            },
            {
              name: 'Sun',
              value: 543,
            },
          ],
        },
        {
          name: '06:00',
          series: [
            {
              name: 'Mon',
              value: 260,
            },
            {
              name: 'Tue',
              value: 0,
            },
            {
              name: 'Wed',
              value: 450,
            },
            {
              name: 'Thu',
              value: 420,
            },
            {
              name: 'Fri',
              value: 543,
            },
            {
              name: 'Sat',
              value: 750,
            },
            {
              name: 'Sun',
              value: 543,
            },
          ],
        },
        {
          name: '07:00',
          series: [
            {
              name: 'Mon',
              value: 130,
            },
            {
              name: 'Tue',
              value: 40,
            },
            {
              name: 'Wed',
              value: 230,
            },
            {
              name: 'Thu',
              value: 40,
            },
            {
              name: 'Fri',
              value: 330,
            },
            {
              name: 'Sat',
              value: 750,
            },
            {
              name: 'Sun',
              value: 430,
            },
          ],
        },
        {
          name: '08:00',
          series: [
            {
              name: 'Mon',
              value: 530,
            },
            {
              name: 'Tue',
              value: 40,
            },
            {
              name: 'Wed',
              value: 830,
            },
            {
              name: 'Thu',
              value: 40,
            },
            {
              name: 'Fri',
              value: 100,
            },
            {
              name: 'Sat',
              value: 750,
            },
            {
              name: 'Sun',
              value: 200,
            },
          ],
        },
        {
          name: '09:00',
          series: [
            {
              name: 'Mon',
              value: 0,
            },
            {
              name: 'Tue',
              value: 40,
            },
            {
              name: 'Wed',
              value: 543,
            },
            {
              name: 'Thu',
              value: 40,
            },
            {
              name: 'Fri',
              value: 120,
            },
            {
              name: 'Sat',
              value: 750,
            },
            {
              name: 'Sun',
              value: 220,
            },
          ],
        },
        {
          name: '10:00',
          series: [
            {
              name: 'Mon',
              value: 320,
            },
            {
              name: 'Tue',
              value: 40,
            },
            {
              name: 'Wed',
              value: 420,
            },
            {
              name: 'Thu',
              value: 40,
            },
            {
              name: 'Fri',
              value: 20,
            },
            {
              name: 'Sat',
              value: 750,
            },
            {
              name: 'Sun',
              value: 0,
            },
          ],
        },
        {
          name: '11:00',
          series: [
            {
              name: 'Mon',
              value: 100,
            },
            {
              name: 'Tue',
              value: 40,
            },
            {
              name: 'Wed',
              value: 543,
            },
            {
              name: 'Thu',
              value: 40,
            },
            {
              name: 'Fri',
              value: 543,
            },
            {
              name: 'Sat',
              value: 423,
            },
            {
              name: 'Sun',
              value: 543,
            },
          ],
        },
        {
          name: '12:00',
          series: [
            {
              name: 'Mon',
              value: 543,
            },
            {
              name: 'Tue',
              value: 40,
            },
            {
              name: 'Wed',
              value: 543,
            },
            {
              name: 'Thu',
              value: 40,
            },
            {
              name: 'Fri',
              value: 543,
            },
            {
              name: 'Sat',
              value: 43,
            },
            {
              name: 'Sun',
              value: 543,
            },
          ],
        },
        {
          name: '13:00',
          series: [
            {
              name: 'Mon',
              value: 543,
            },
            {
              name: 'Tue',
              value: 40,
            },
            {
              name: 'Wed',
              value: 543,
            },
            {
              name: 'Thu',
              value: 40,
            },
            {
              name: 'Fri',
              value: 543,
            },
            {
              name: 'Sat',
              value: 403,
            },
            {
              name: 'Sun',
              value: 543,
            },
          ],
        },
        {
          name: '14:00',
          series: [
            {
              name: 'Mon',
              value: 543,
            },
            {
              name: 'Tue',
              value: 40,
            },
            {
              name: 'Wed',
              value: 543,
            },
            {
              name: 'Thu',
              value: 40,
            },
            {
              name: 'Fri',
              value: 543,
            },
            {
              name: 'Sat',
              value: 603,
            },
            {
              name: 'Sun',
              value: 543,
            },
          ],
        },
        {
          name: '15:00',
          series: [
            {
              name: 'Mon',
              value: 543,
            },
            {
              name: 'Tue',
              value: 40,
            },
            {
              name: 'Wed',
              value: 543,
            },
            {
              name: 'Thu',
              value: 40,
            },
            {
              name: 'Fri',
              value: 543,
            },
            {
              name: 'Sat',
              value: 803,
            },
            {
              name: 'Sun',
              value: 543,
            },
          ],
        },
        {
          name: '16:00',
          series: [
            {
              name: 'Mon',
              value: 543,
            },
            {
              name: 'Tue',
              value: 40,
            },
            {
              name: 'Wed',
              value: 543,
            },
            {
              name: 'Thu',
              value: 40,
            },
            {
              name: 'Fri',
              value: 543,
            },
            {
              name: 'Sat',
              value: 0,
            },
            {
              name: 'Sun',
              value: 543,
            },
          ],
        },
        {
          name: '17:00',
          series: [
            {
              name: 'Mon',
              value: 543,
            },
            {
              name: 'Tue',
              value: 40,
            },
            {
              name: 'Wed',
              value: 543,
            },
            {
              name: 'Thu',
              value: 40,
            },
            {
              name: 'Fri',
              value: 543,
            },
            {
              name: 'Sat',
              value: 10,
            },
            {
              name: 'Sun',
              value: 543,
            },
          ],
        },
        {
          name: '18:00',
          series: [
            {
              name: 'Mon',
              value: 543,
            },
            {
              name: 'Tue',
              value: 40,
            },
            {
              name: 'Wed',
              value: 543,
            },
            {
              name: 'Thu',
              value: 40,
            },
            {
              name: 'Fri',
              value: 543,
            },
            {
              name: 'Sat',
              value: 20,
            },
            {
              name: 'Sun',
              value: 543,
            },
          ],
        },
        {
          name: '19:00',
          series: [
            {
              name: 'Mon',
              value: 543,
            },
            {
              name: 'Tue',
              value: 40,
            },
            {
              name: 'Wed',
              value: 543,
            },
            {
              name: 'Thu',
              value: 40,
            },
            {
              name: 'Fri',
              value: 543,
            },
            {
              name: 'Sat',
              value: 230,
            },
            {
              name: 'Sun',
              value: 543,
            },
          ],
        },
        {
          name: '20:00',
          series: [
            {
              name: 'Mon',
              value: 543,
            },
            {
              name: 'Tue',
              value: 40,
            },
            {
              name: 'Wed',
              value: 543,
            },
            {
              name: 'Thu',
              value: 40,
            },
            {
              name: 'Fri',
              value: 543,
            },
            {
              name: 'Sat',
              value: 750,
            },
            {
              name: 'Sun',
              value: 30,
            },
          ],
        },
        {
          name: '21:00',
          series: [
            {
              name: 'Mon',
              value: 10,
            },
            {
              name: 'Tue',
              value: 40,
            },
            {
              name: 'Wed',
              value: 80,
            },
            {
              name: 'Thu',
              value: 40,
            },
            {
              name: 'Fri',
              value: 800,
            },
            {
              name: 'Sat',
              value: 750,
            },
            {
              name: 'Sun',
              value: 0,
            },
          ],
        },
        {
          name: '22:00',
          series: [
            {
              name: 'Mon',
              value: 85,
            },
            {
              name: 'Tue',
              value: 40,
            },
            {
              name: 'Wed',
              value: 55,
            },
            {
              name: 'Thu',
              value: 94,
            },
            {
              name: 'Fri',
              value: 543,
            },
            {
              name: 'Sat',
              value: 750,
            },
            {
              name: 'Sun',
              value: 543,
            },
          ],
        },
        {
          name: '23:00',
          series: [
            {
              name: 'Mon',
              value: 543,
            },
            {
              name: 'Tue',
              value: 904,
            },
            {
              name: 'Wed',
              value: 543,
            },
            {
              name: 'Thu',
              value: 88,
            },
            {
              name: 'Fri',
              value: 543,
            },
            {
              name: 'Sat',
              value: 750,
            },
            {
              name: 'Sun',
              value: 543,
            },
          ],
        },
      ],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HEATMAP',
    },
  };
};

// Test data for variant1 (pageAnalytics)
const singleStatTestDataForVariant1 = (): BXSingleStat => {
  return {
    data: {
      current: 10,
      historic: 30,
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'SINGLESTAT',
    },
  };
};

const timeSeriesTestDataForVariant1 = (): BXTimeSeries => {
  return {
    data: {
      current: [
        {
          value: 541,
          name: '2022-02-28T13:57:33.597Z',
        },
        {
          value: 677,
          name: '2022-03-28T13:57:33.597Z',
        },
      ],
      historic: [
        {
          value: 30,
          name: '2022-02-28T13:00:00.597Z',
        },
      ],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'TIMESERIES',
    },
  };
};
const histogramTestDataForVariant1 = (): BXHistogram => {
  return {
    data: {
      current: [
        {
          name: 'Home Page',
          value: 232,
        },
        {
          name: 'About Us',
          value: 244,
        },
      ],
      historic: [
        {
          name: 'Home Page',
          value: 264,
        },
        {
          name: 'About Us',
          value: 213,
        },
      ],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HISTOGRAM',
    },
  };
};
const heatmapChartTestDataForVariant1 = (): BXHeatmap => {
  return heatmapChartTestData();
};

// Empty data points
const emptyTimeSeriesTestData = (): BXTimeSeries => {
  return {
    data: {
      current: [],
      historic: [],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'TIMESERIES',
    },
  };
};
const emptyHistogramTestData = (): BXHistogram => {
  return {
    data: {
      current: [],
      historic: [],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HISTOGRAM',
    },
  };
};

const emptySingleStatTestData = (): BXSingleStat => {
  return {
    data: {
      current: 0,
      historic: 0,
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'SINGLESTAT',
    },
  };
};

const emptyHeatmapTestData = (): BXHeatmap => {
  return {
    data: {
      current: [],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HEATMAP',
    },
  };
};

export function getDefaultSiteAnalytics(): SiteAnalytics {
  return {
    activeGuestCount: singleStatChartTestData(),
    activeSessionCount: singleStatChartTestData(),
    bouncedSessionCount: singleStatChartTestData(),
    pageViewCount: singleStatChartTestData(),
    sessionDurationAverage: singleStatChartTestData(),
    activeGuestTimeseries: timeSeriesChartTestData(),
    sessionTimeseries: timeSeriesChartTestData(),
    pageViewTimeseries: timeSeriesChartTestData(),
    sessionsByCountryHist: histogramChartTestData(),
    sessionsByDeviceHist: histogramChartTestData(),
    sessionsByFirstPageHist: histogramChartTestData(),
    sessionsByOperatingSystemHist: histogramChartTestData(),
    sessionsByRefererHist: histogramChartTestData(),
    viewsByPageHist: histogramChartTestData(),
    sessionHeatmap: heatmapChartTestData(),
  };
}

export function getEmptySiteAnalytics(): SiteAnalytics {
  return {
    activeGuestCount: emptySingleStatTestData(),
    activeSessionCount: emptySingleStatTestData(),
    bouncedSessionCount: emptySingleStatTestData(),
    pageViewCount: emptySingleStatTestData(),
    sessionDurationAverage: emptySingleStatTestData(),
    activeGuestTimeseries: emptyTimeSeriesTestData(),
    pageViewTimeseries: emptyTimeSeriesTestData(),
    sessionTimeseries: emptyTimeSeriesTestData(),
    sessionsByCountryHist: emptyHistogramTestData(),
    sessionsByDeviceHist: emptyHistogramTestData(),
    sessionsByFirstPageHist: emptyHistogramTestData(),
    sessionsByOperatingSystemHist: emptyHistogramTestData(),
    sessionsByRefererHist: emptyHistogramTestData(),
    viewsByPageHist: emptyHistogramTestData(),
    sessionHeatmap: emptyHeatmapTestData(),
  };
}

export function getDefaultVariantPageAnalytics(): PageAnalytics {
  return {
    sessionCount: singleStatChartTestData(),
    pageVariantViewBySessionRatio: singleStatChartTestData(),
    pageVariantViewCount: singleStatChartTestData(),
    pageVariantViewTimeseries: timeSeriesChartTestData(),
    pageVariantByCountryHist: histogramChartTestData(),
    pageVariantByDeviceHist: histogramChartTestData(),
    pageVariantByOperatingSystemHist: histogramChartTestData(),
    pageVariantByRefererHist: histogramChartTestData(),
    pageViewCountByPageVariantHist: histogramChartTestData(),
    pageVariantHeatmap: heatmapChartTestData(),
  };
}

export function getPageAnalyticsForVariant1(): PageAnalytics {
  return {
    sessionCount: singleStatTestDataForVariant1(),
    pageVariantViewBySessionRatio: singleStatTestDataForVariant1(),
    pageVariantViewCount: singleStatTestDataForVariant1(),
    pageVariantViewTimeseries: timeSeriesTestDataForVariant1(),
    pageVariantByCountryHist: histogramTestDataForVariant1(),
    pageVariantByDeviceHist: histogramTestDataForVariant1(),
    pageVariantByOperatingSystemHist: histogramTestDataForVariant1(),
    pageVariantByRefererHist: histogramTestDataForVariant1(),
    pageViewCountByPageVariantHist: histogramTestDataForVariant1(),
    pageVariantHeatmap: heatmapChartTestDataForVariant1(),
  };
}

export function getEmptyPageAnalytics(): PageAnalytics {
  return {
    sessionCount: emptySingleStatTestData(),
    pageVariantViewBySessionRatio: emptySingleStatTestData(),
    pageVariantViewCount: emptySingleStatTestData(),
    pageVariantViewTimeseries: emptyTimeSeriesTestData(),
    pageVariantByCountryHist: emptyHistogramTestData(),
    pageVariantByDeviceHist: emptyHistogramTestData(),
    pageVariantByOperatingSystemHist: emptyHistogramTestData(),
    pageVariantByRefererHist: emptyHistogramTestData(),
    pageViewCountByPageVariantHist: emptyHistogramTestData(),
    pageVariantHeatmap: emptyHeatmapTestData(),
  };
}
