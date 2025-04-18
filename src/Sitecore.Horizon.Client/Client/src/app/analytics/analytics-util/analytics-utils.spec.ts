/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import {
  getDefaultVariantPageAnalytics,
  getEmptyPageAnalytics,
  getPageAnalyticsForVariant1,
} from 'app/testing/analytics-test-data';
import { groupedBarChartWithoutData } from '../analytics-mock-data';
import { BXHistogramDataCurrent, ChartData, SiteAnalytics } from '../analytics.types';
import {
  buildAnalyticsQueryString,
  calculateTrend,
  checkAnalyticsHasData,
  checkCdpIsConfigured,
  checkPosIdentifierIsDefined,
  mapGroupedBarChartData,
  takeTopItems,
} from './analytics-utils';

describe('Analytics Utils', () => {
  describe('calculateTrend()', () => {
    it('should return difference between the value as `calculatedTrendValue`', () => {
      const currentValue = 20;
      const historicValue = 17;
      const result = calculateTrend(currentValue, historicValue);
      expect(result.variation).toEqual(3);
    });

    it('should round the `calculatedTrendValue` to one decimal place', () => {
      const currentValue = 20.157;
      const historicValue = 19;
      const result = calculateTrend(currentValue, historicValue);
      expect(result.variation).toEqual(1.2);
    });

    it('should return [trend= `up`] if current value is higher than historic value', () => {
      const currentValue = 20;
      const historicValue = 19;
      const result = calculateTrend(currentValue, historicValue);
      expect(result.trend).toBe('up');
    });

    it('should return [trend=`down`] if current value is less than historic value', () => {
      const currentValue = 17;
      const historicValue = 20;
      const result = calculateTrend(currentValue, historicValue);
      expect(result.trend).toBe('down');
    });

    it('should return [trend=`neutral`] if current value is equal to historic value', () => {
      const currentValue = 17;
      const historicValue = 17;
      const result = calculateTrend(currentValue, historicValue);
      expect(result.trend).toBe('neutral');
    });
  });

  describe(checkCdpIsConfigured.name, () => {
    it('should return True if is Disconnected mode', () => {
      expect(checkCdpIsConfigured(false, { cdpAppUrl: '', cdpApiUrl: '' })).toBe(true);
    });

    it('should return True if is Cdp App and Url properties are configured', () => {
      expect(checkCdpIsConfigured(true, { cdpAppUrl: 'cdpAppUrl', cdpApiUrl: 'cdpApiUrl' })).toBe(true);
    });

    it('should return False if is Cdp App or Url property is not configured', () => {
      expect(checkCdpIsConfigured(true, { cdpAppUrl: 'cdpAppUrl', cdpApiUrl: '' })).toBe(false);
      expect(checkCdpIsConfigured(true, { cdpAppUrl: '', cdpApiUrl: 'cdpApiUrl' })).toBe(false);
    });
  });

  describe(checkPosIdentifierIsDefined.name, () => {
    it('should return True if site Pos is configured', () => {
      expect(checkPosIdentifierIsDefined('sitePos')).toBe(true);
    });

    it('should return False if site Pos is not configured', () => {
      expect(checkPosIdentifierIsDefined(null)).toBe(false);
    });
  });

  describe(checkAnalyticsHasData.name, () => {
    it('should return False if no data', () => {
      expect(checkAnalyticsHasData(null)).toBe(false);
    });

    it('should return True if there is data [Case 1]', () => {
      expect(
        checkAnalyticsHasData({
          activeGuestCount: {
            data: {
              current: 123,
            },
            meta: {
              widgetType: 'SINGLESTAT',
            },
          },
          pageViewTimeseries: {
            data: {
              current: [
                {
                  value: 123,
                  name: 'name 1',
                },
              ],
            },
            meta: {
              widgetType: 'TIMESERIES',
            },
          },
        } as SiteAnalytics),
      ).toBe(true);
    });

    it('should return True if there is data [Case 2]', () => {
      expect(
        checkAnalyticsHasData({
          activeGuestCount: {
            data: {
              current: 123,
            },
            meta: {
              widgetType: 'SINGLESTAT',
            },
          },
          pageViewTimeseries: {
            data: {
              current: [] as any,
            },
            meta: {
              widgetType: 'TIMESERIES',
            },
          },
        } as SiteAnalytics),
      ).toBe(true);
    });

    it('should return True if there is data [Case 3]', () => {
      expect(
        checkAnalyticsHasData({
          activeGuestCount: {
            data: {
              current: 0,
            },
            meta: {
              widgetType: 'SINGLESTAT',
            },
          },
          pageViewTimeseries: {
            data: {
              current: [
                {
                  value: 123,
                  name: 'name 1',
                },
              ],
            },
            meta: {
              widgetType: 'TIMESERIES',
            },
          },
        } as SiteAnalytics),
      ).toBe(true);
    });

    it('should return False if there is no data [Case 4]', () => {
      expect(
        checkAnalyticsHasData({
          activeGuestCount: {
            data: {
              current: 0,
            },
            meta: {
              widgetType: 'SINGLESTAT',
            },
          },
          pageViewTimeseries: {
            data: {
              current: [] as any,
            },
            meta: {
              widgetType: 'TIMESERIES',
            },
          },
        } as SiteAnalytics),
      ).toBe(false);
    });
  });

  describe('takeTopItems', () => {
    it(`should return top items in descending order`, () => {
      const expectedResult: BXHistogramDataCurrent[] = [
        {
          name: 'Device 3',
          value: 42,
        },
        {
          name: 'Device 7',
          value: 30,
        },
        {
          name: 'Device 5',
          value: 26,
        },
        {
          name: 'Device 1',
          value: 25,
        },
        {
          name: 'Device 4',
          value: 15,
        },
      ];

      const input: BXHistogramDataCurrent[] = [
        {
          name: 'Device 1',
          value: 25,
        },
        {
          name: 'Device 2',
          value: 10,
        },
        {
          name: 'Device 3',
          value: 42,
        },
        {
          name: 'Device 4',
          value: 15,
        },
        {
          name: 'Device 5',
          value: 26,
        },
        {
          name: 'Device 6',
          value: 10,
        },
        {
          name: 'Device 7',
          value: 30,
        },
      ];

      const result = takeTopItems(input, 5);

      expect(result.length).toBe(5);
      expect(result).toEqual(expectedResult);
    });

    it(`should return all items in descending order when total items are less than requested items`, () => {
      const expectedResult: BXHistogramDataCurrent[] = [
        {
          name: 'Device 3',
          value: 42,
        },
        {
          name: 'Device 7',
          value: 30,
        },
      ];

      const input: BXHistogramDataCurrent[] = [
        {
          name: 'Device 7',
          value: 30,
        },
        {
          name: 'Device 3',
          value: 42,
        },
      ];

      const result = takeTopItems(input, 5);

      expect(result.length).toBe(2);
      expect(result).toEqual(expectedResult);
    });

    it(`should be able to return empty items `, () => {
      const input: BXHistogramDataCurrent[] = [];
      const result = takeTopItems(input, 5);
      expect(result.length).toBe(0);
    });
  });

  describe('buildAnalyticsQueryString', () => {
    it('should set query parameter & build the query string for siteMetrics', () => {
      const queryParams = {
        duration: '1hr',
        pointOfSale: 'pos',
        timezoneOffset: 2,
      };
      const queryString = buildAnalyticsQueryString('siteMetrics', queryParams);

      expect(queryString).toEqual('siteMetrics?pointOfSale=pos&duration=1hr&timezoneOffset=2');
    });

    it('should set only the defined parameter to build the query string', () => {
      const queryParams = {
        pointOfSale: 'pos1',
      };
      const queryString = buildAnalyticsQueryString('siteMetrics', queryParams);

      expect(queryString).toEqual('siteMetrics?pointOfSale=pos1');
    });

    it('should set [pageVariantId] in the query string if data endpoint is pageMetrics', () => {
      const queryParams = {
        duration: '2hr',
        pointOfSale: 'site',
        pageVariantId: 'variant1',
      };

      const queryString = buildAnalyticsQueryString('pageMetrics', queryParams);

      expect(queryString).toEqual('pageMetrics?pointOfSale=site&duration=2hr&pageVariantId=variant1');
    });
  });

  describe('mapGroupedBarChartData', () => {
    it('should map the analytic data from two different variant', () => {
      const variant1Data = getDefaultVariantPageAnalytics().pageVariantByCountryHist;
      const variant2Data = getPageAnalyticsForVariant1().pageVariantByCountryHist;

      const expectedResult: ChartData[] = [
        {
          name: 'Home Page',
          series: [
            {
              name: 'Default' + ',',
              value: 100,
            },
            {
              name: 'Variant 2' + ',',
              value: 232,
            },
          ],
        },
        {
          name: 'About Us',
          series: [
            {
              name: 'Default' + ',',
              value: 100,
            },
            {
              name: 'Variant 2' + ',',
              value: 244,
            },
          ],
        },
      ];

      const actualResult = mapGroupedBarChartData(variant1Data, variant2Data, 'Default', 'Variant 2');

      expect(actualResult).toEqual(expectedResult);
    });

    it('should return [groupedBarChartWithoutData] WHEN there is no data for both variants', () => {
      const expectedEmptyData: ChartData[] = groupedBarChartWithoutData;

      const variant1Data = getEmptyPageAnalytics().pageVariantByCountryHist;
      const variant2Data = getEmptyPageAnalytics().pageVariantByCountryHist;

      const result = mapGroupedBarChartData(variant1Data, variant2Data, 'Default', 'Variant 2');

      expect(result).toEqual(expectedEmptyData);
    });

    it('should return empty data for first variant WHEN there is no data for first variants', () => {
      const expectedEmptyData: ChartData[] = [
        {
          name: 'Home Page',
          series: [
            {
              name: 'Default,',
              value: 0,
            },
            {
              name: 'Variant 2,',
              value: 232,
            },
          ],
        },
        {
          name: 'About Us',
          series: [
            {
              name: 'Default,',
              value: 0,
            },
            {
              name: 'Variant 2,',
              value: 244,
            },
          ],
        },
      ];

      const variant1Data = getEmptyPageAnalytics().pageVariantByCountryHist;
      const variant2Data = getPageAnalyticsForVariant1().pageVariantByCountryHist;

      const result = mapGroupedBarChartData(variant1Data, variant2Data, 'Default', 'Variant 2');

      expect(result).toEqual(expectedEmptyData);
    });

    it('should return empty data for second variant WHEN their is no data for second variant', () => {
      const expectedEmptyData: ChartData[] = [
        {
          name: 'Home Page',
          series: [
            {
              name: 'Default,',
              value: 100,
            },
            {
              name: 'Variant 2,',
              value: 0,
            },
          ],
        },
        {
          name: 'About Us',
          series: [
            {
              name: 'Default,',
              value: 100,
            },
            {
              name: 'Variant 2,',
              value: 0,
            },
          ],
        },
      ];

      const variant1Data = getDefaultVariantPageAnalytics().pageVariantByCountryHist;
      const variant2Data = getEmptyPageAnalytics().pageVariantByCountryHist;

      const result = mapGroupedBarChartData(variant1Data, variant2Data, 'Default', 'Variant 2');

      expect(result).toEqual(expectedEmptyData);
    });
  });
});
