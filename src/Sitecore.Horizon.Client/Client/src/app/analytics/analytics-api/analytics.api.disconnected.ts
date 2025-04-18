/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { ApiResponse } from 'app/shared/utils/utils';
import {
  AnalyticsFilterOptions,
  BXHeatmap,
  BXHistogram,
  BXSingleStat,
  BXTimeSeries,
  PageAnalytics,
  SiteAnalytics,
  SiteAnalyticsFilterOptions,
} from '../analytics.types';
import { AnalyticsApiService } from './analytics.api.service';

function restoreMockDataFromStorage() {
  return {
    variant1ExtraData: JSON.parse(localStorage.getItem('mock-PA-V1') || '{}'),
    variant2ExtraData: JSON.parse(localStorage.getItem('mock-PA-V2') || '{}'),
    defaultExtraData: JSON.parse(localStorage.getItem('mock-PA-D') || '{}'),
  };
}

const testHeatmapData = (rows: number) => [
  {
    name: '00:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 345 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 345 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 345 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 324 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 432 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 324 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '01:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 345 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 345 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 345 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 324 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 432 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 324 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '02:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 345 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 345 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 345 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 324 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 432 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 324 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '03:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 345 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 345 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 345 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 324 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 432 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 324 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '04:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 324 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 564 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 798 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 12 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 876 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 122 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '05:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 986 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 546 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 432 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 324 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 123 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 890 : null,
      },
      {
        name: 'Sun',
        value: 654,
      },
    ],
  },
  {
    name: '06:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 213 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 876 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 654 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 978 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 345 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 765 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '07:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 234 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 876 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 546 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 76 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 345 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 23 : null,
      },
      {
        name: 'Sun',
        value: 3,
      },
    ],
  },
  {
    name: '08:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 12 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 321 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 213 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 54 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 765 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 54 : null,
      },
      {
        name: 'Sun',
        value: 43,
      },
    ],
  },
  {
    name: '09:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 345 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 345 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 345 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 324 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 432 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 324 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '10:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 345 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 345 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 345 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 324 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 432 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 324 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '11:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 345 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 345 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 345 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 324 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 432 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 324 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '12:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 345 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 345 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 345 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 324 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 432 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 324 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '13:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 345 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 345 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 345 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 324 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 432 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 324 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '14:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 345 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 345 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 345 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 324 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 432 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 324 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '15:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 345 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 564 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 324 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 32 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 545 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 324 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '16:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 675 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 345 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 567 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 56 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 654 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 321 : null,
      },
      {
        name: 'Sun',
        value: 324,
      },
    ],
  },
  {
    name: '17:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 9 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 43 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 876 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 567 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 45 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 532 : null,
      },
      {
        name: 'Sun',
        value: 40,
      },
    ],
  },
  {
    name: '18:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 423 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 234 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 234 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 754 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 546 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 123 : null,
      },
      {
        name: 'Sun',
        value: 645,
      },
    ],
  },
  {
    name: '19:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 532 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 233 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 756 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 234 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 923 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 745 : null,
      },
      {
        name: 'Sun',
        value: 123,
      },
    ],
  },
  {
    name: '20:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 543 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 233 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 342 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 432 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 754 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 665 : null,
      },
      {
        name: 'Sun',
        value: 123,
      },
    ],
  },
  {
    name: '21:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 213 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 345 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 212 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 122 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 465 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 325 : null,
      },
      {
        name: 'Sun',
        value: 1,
      },
    ],
  },
  {
    name: '22:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 342 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 213 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 654 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 45 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 1200 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 543 : null,
      },
      {
        name: 'Sun',
        value: 22,
      },
    ],
  },
  {
    name: '23:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 762 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 345 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 867 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 756 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 123 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 534 : null,
      },
      {
        name: 'Sun',
        value: 435,
      },
    ],
  },
];
const testHeatmapDataVariant2 = (rows: number) => [
  {
    name: '00:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 145 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 445 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 445 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 324 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 432 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 124 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '01:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 345 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 345 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 345 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 324 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 132 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 324 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '02:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 345 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 350 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 145 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 324 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 432 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 304 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '03:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 345 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 250 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 145 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 324 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 432 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 124 : null,
      },
      {
        name: 'Sun',
        value: 376,
      },
    ],
  },
  {
    name: '04:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 324 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 564 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 798 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 12 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 976 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 122 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '05:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 986 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 446 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 432 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 324 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 123 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 590 : null,
      },
      {
        name: 'Sun',
        value: 654,
      },
    ],
  },
  {
    name: '06:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 213 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 876 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 754 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 678 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 345 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 765 : null,
      },
      {
        name: 'Sun',
        value: 576,
      },
    ],
  },
  {
    name: '07:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 234 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 876 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 546 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 76 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 345 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 23 : null,
      },
      {
        name: 'Sun',
        value: 3,
      },
    ],
  },
  {
    name: '08:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 12 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 321 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 213 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 54 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 765 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 54 : null,
      },
      {
        name: 'Sun',
        value: 43,
      },
    ],
  },
  {
    name: '09:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 345 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 345 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 345 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 324 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 432 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 324 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '10:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 345 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 345 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 345 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 324 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 432 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 324 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '11:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 345 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 345 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 345 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 324 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 432 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 324 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '12:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 345 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 345 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 345 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 324 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 432 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 324 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '13:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 345 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 345 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 345 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 324 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 432 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 324 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '14:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 345 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 345 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 345 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 324 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 432 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 324 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '15:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 345 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 564 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 324 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 32 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 545 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 324 : null,
      },
      {
        name: 'Sun',
        value: 876,
      },
    ],
  },
  {
    name: '16:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 675 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 345 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 567 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 56 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 654 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 321 : null,
      },
      {
        name: 'Sun',
        value: 324,
      },
    ],
  },
  {
    name: '17:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 9 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 43 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 876 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 567 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 45 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 532 : null,
      },
      {
        name: 'Sun',
        value: 40,
      },
    ],
  },
  {
    name: '18:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 423 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 234 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 234 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 754 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 546 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 123 : null,
      },
      {
        name: 'Sun',
        value: 645,
      },
    ],
  },
  {
    name: '19:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 532 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 233 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 756 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 234 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 923 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 745 : null,
      },
      {
        name: 'Sun',
        value: 123,
      },
    ],
  },
  {
    name: '20:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 543 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 233 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 342 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 432 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 754 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 665 : null,
      },
      {
        name: 'Sun',
        value: 123,
      },
    ],
  },
  {
    name: '21:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 213 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 345 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 212 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 122 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 465 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 325 : null,
      },
      {
        name: 'Sun',
        value: 1,
      },
    ],
  },
  {
    name: '22:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 342 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 213 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 654 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 45 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 1200 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 543 : null,
      },
      {
        name: 'Sun',
        value: 22,
      },
    ],
  },
  {
    name: '23:00',
    series: [
      {
        name: 'Mon',
        value: rows === 7 ? 762 : null,
      },
      {
        name: 'Tue',
        value: rows >= 6 ? 345 : null,
      },
      {
        name: 'Wed',
        value: rows >= 5 ? 867 : null,
      },
      {
        name: 'Thu',
        value: rows >= 4 ? 756 : null,
      },
      {
        name: 'Fri',
        value: rows >= 3 ? 123 : null,
      },
      {
        name: 'Sat',
        value: rows >= 2 ? 534 : null,
      },
      {
        name: 'Sun',
        value: 435,
      },
    ],
  },
];
const variant1 = 'cfa85597e43545479aadc27df7ff134e';
const variant2 = 'ffa85597e43545479aadc27df7ff134e';
const defaultId = 'default';
@Injectable()
export class AnalyticsApiServiceDisconnected implements AnalyticsApiService {
  loadTime = true; // true = simulates slow loading time
  noData = false; // true = simulates response without data
  apiError = false; // true = simulates response with API errors

  // Mock data for siteAnalytics endpoints
  activeGuestTimeseries: BXTimeSeries = {
    data: {
      current: this.noData
        ? []
        : [
            {
              value: 641,
              name: '2022-02-22T13:57:33.597Z',
            },
            {
              value: 1707,
              name: '2022-02-23T13:57:33.597Z',
            },
            {
              value: 210,
              name: '2022-02-24T13:57:33.597Z',
            },
            {
              value: 501,
              name: '2022-02-25T13:57:33.597Z',
            },
            {
              value: 433,
              name: '2022-02-26T13:57:33.597Z',
            },
            {
              value: 511,
              name: '2022-02-27T13:57:33.597Z',
            },
            {
              value: 443,
              name: '2022-02-28T13:57:33.597Z',
            },
          ],
      historic: this.noData
        ? []
        : [
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

  pageViewTimeseries: BXTimeSeries = {
    data: {
      current: this.noData
        ? []
        : [
            {
              value: 6541,
              name: '2022-02-28T13:57:33.597Z',
            },
            {
              value: 3677,
              name: '2022-03-28T13:57:33.597Z',
            },
            {
              value: 2210,
              name: '2022-04-28T13:57:33.597Z',
            },
            {
              value: 5101,
              name: '2022-05-28T13:57:33.597Z',
            },
            {
              value: 4433,
              name: '2022-06-28T13:57:33.597Z',
            },
            {
              value: 5101,
              name: '2022-07-28T13:57:33.597Z',
            },
            {
              value: 4433,
              name: '2022-08-28T13:57:33.597Z',
            },
          ],
      historic: this.noData
        ? []
        : [
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

  sessionsByCountryHist: BXHistogram = {
    data: {
      current: this.noData
        ? []
        : [
            {
              name: 'New Zealand',
              value: 242,
            },
            {
              name: 'Canada',
              value: 234,
            },
            {
              name: 'Ireland',
              value: 185,
            },
            {
              name: 'Australia',
              value: 141,
            },
            {
              name: 'United Arab Emirates',
              value: 141,
            },
            {
              name: 'India',
              value: 125,
            },
            {
              name: 'Pakistan',
              value: 25,
            },
          ],
      historic: this.noData
        ? []
        : [
            {
              name: 'New Zealand',
              value: 284,
            },
            {
              name: 'Canada',
              value: 213,
            },
            {
              name: 'Ireland',
              value: 291,
            },
            {
              name: 'Australia',
              value: 200,
            },
            {
              name: 'United Arab Emirates',
              value: 141,
            },
            {
              name: 'India',
              value: 125,
            },
            {
              name: 'Pakistan',
              value: 25,
            },
          ],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HISTOGRAM',
    },
  };

  sessionsByDeviceHist: BXHistogram = {
    data: {
      current: this.noData
        ? []
        : [
            {
              name: 'Chrome',
              value: 242,
            },
            {
              name: 'Firefox',
              value: 234,
            },
            {
              name: 'Safari',
              value: 185,
            },
            {
              name: 'Opera',
              value: 141,
            },
            {
              name: 'Edge',
              value: 141,
            },
          ],
      historic: this.noData
        ? []
        : [
            {
              name: 'Chrome',
              value: 284,
            },
            {
              name: 'Firefox',
              value: 213,
            },
            {
              name: 'Safari',
              value: 291,
            },
            {
              name: 'Opera',
              value: 200,
            },
            {
              name: 'Edge',
              value: 141,
            },
          ],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HISTOGRAM',
    },
  };

  sessionsByOperatingSystemHist: BXHistogram = {
    data: {
      current: this.noData
        ? []
        : [
            {
              name: 'Windows 11',
              value: 242,
            },
            {
              name: 'Windows 10',
              value: 234,
            },
            {
              name: 'Android',
              value: 185,
            },
            {
              name: 'iOS',
              value: 141,
            },
          ],
      historic: this.noData
        ? []
        : [
            {
              name: 'Windows 11',
              value: 284,
            },
            {
              name: 'Windows 10',
              value: 213,
            },
            {
              name: 'Android',
              value: 291,
            },
            {
              name: 'iOS',
              value: 200,
            },
          ],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HISTOGRAM',
    },
  };

  viewsByPageHist: BXHistogram = {
    data: {
      current: this.noData
        ? []
        : [
            {
              value: 150,
              name: 'Home',
            },
            {
              value: 60,
              name: 'About Us',
            },
            {
              value: 50,
              name: 'Career',
            },
            {
              value: 40,
              name: 'What is new',
            },

            {
              name: 'News',
              value: 60,
            },
            {
              name: 'Privacy Policy',
              value: 3,
            },
          ],
      historic: this.noData
        ? []
        : [
            {
              value: 300,
              name: 'Home',
            },
            {
              value: 20,
              name: 'About Us',
            },
            {
              value: 40,
              name: 'Career',
            },
            {
              value: 40,
              name: 'What is new',
            },
            {
              name: 'News',
              value: 185,
            },
            {
              name: 'Privacy Policy',
              value: 3,
            },
          ],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HISTOGRAM',
    },
  };

  sessionsByFirstPageHist: BXHistogram = {
    data: {
      current: this.noData
        ? []
        : [
            {
              name: 'Home Page',
              value: 2420,
            },
            {
              name: 'About Us',
              value: 234,
            },
            {
              name: 'Whats new',
              value: 185,
            },
            {
              name: 'Career',
              value: 189,
            },
            {
              name: 'News',
              value: 200,
            },
            {
              name: 'Privacy Policy',
              value: 3,
            },
          ],
      historic: this.noData
        ? []
        : [
            {
              name: 'Home Page',
              value: 220,
            },
            {
              name: 'About Us',
              value: 24,
            },
            {
              name: 'Whats new',
              value: 120,
            },
            {
              name: 'Career',
              value: 155,
            },
            {
              name: 'News',
              value: 122,
            },
            {
              name: 'Privacy Policy',
              value: 3,
            },
          ],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HISTOGRAM',
    },
  };

  sessionsByRefererHist: BXHistogram = {
    data: {
      current: this.noData
        ? []
        : [
            {
              name: 'Home Page',
              value: 2420,
            },
            {
              name: 'About Us',
              value: 234,
            },

            {
              name: 'Whats new',
              value: 185,
            },
            {
              name: 'Career',
              value: 133,
            },
            {
              name: 'News',
              value: 144,
            },
            {
              name: 'Privacy Policy',
              value: 3,
            },
          ],
      historic: this.noData
        ? []
        : [
            {
              name: 'Home Page',
              value: 220,
            },
            {
              name: 'About Us',
              value: 24,
            },
            {
              name: 'Whats new',
              value: 15,
            },
            {
              name: 'Career',
              value: 185,
            },
            {
              name: 'News',
              value: 132,
            },
            {
              name: 'Privacy Policy',
              value: 3,
            },
          ],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HISTOGRAM',
    },
  };

  activeGuestCount: BXSingleStat = {
    data: {
      current: this.noData ? 0 : 50,
      historic: this.noData ? 0 : 90,
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'SINGLESTAT',
    },
  };

  activeSessionCount: BXSingleStat = {
    data: {
      current: this.noData ? 0 : 200,
      historic: this.noData ? 0 : 50,
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'SINGLESTAT',
    },
  };

  bouncedSessionCount: BXSingleStat = {
    data: {
      current: this.noData ? 0 : 80,
      historic: this.noData ? 0 : 50,
    },
    meta: {
      unitType: 'PERCENTAGE',
      widgetType: 'SINGLESTAT',
    },
  };

  pageViewCount: BXSingleStat = {
    data: {
      current: this.noData ? 0 : 500,
      historic: this.noData ? 0 : 200,
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'SINGLESTAT',
    },
  };

  sessionDurationAverage: BXSingleStat = {
    data: {
      current: this.noData ? 0 : 5,
      historic: this.noData ? 0 : 2,
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'SINGLESTAT',
    },
  };

  sessionHeatmap: BXHeatmap = {
    data: {
      current: this.noData ? [] : testHeatmapData(7),
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HEATMAP',
    },
  };

  // Mock data for pageAnalytics endpoints for pageVariant 1.
  pageVariantByCountryHistVariant1: BXHistogram = {
    data: {
      current: this.noData
        ? []
        : [
            {
              name: 'New Zealand',
              value: 242,
            },
            {
              name: 'Canada',
              value: 234,
            },
            {
              name: 'Ireland',
              value: 185,
            },
            {
              name: 'Australia',
              value: 141,
            },
            {
              name: 'United Arab Emirates',
              value: 141,
            },
            {
              name: 'India',
              value: 125,
            },
            {
              name: 'Pakistan',
              value: 25,
            },
          ],
      historic: this.noData
        ? []
        : [
            {
              name: 'New Zealand',
              value: 284,
            },
            {
              name: 'Canada',
              value: 213,
            },
            {
              name: 'Ireland',
              value: 291,
            },
            {
              name: 'Australia',
              value: 200,
            },
            {
              name: 'United Arab Emirates',
              value: 141,
            },
            {
              name: 'India',
              value: 125,
            },
            {
              name: 'Pakistan',
              value: 25,
            },
          ],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HISTOGRAM',
    },
  };

  pageVariantByDeviceHistVariant1: BXHistogram = {
    data: {
      current: this.noData
        ? []
        : [
            {
              name: 'Chrome',
              value: 242,
            },
            {
              name: 'Firefox',
              value: 234,
            },
            {
              name: 'Safari',
              value: 185,
            },
            {
              name: 'Opera',
              value: 141,
            },
            {
              name: 'Edge',
              value: 141,
            },
          ],
      historic: this.noData
        ? []
        : [
            {
              name: 'Chrome',
              value: 284,
            },
            {
              name: 'Firefox',
              value: 213,
            },
            {
              name: 'Safari',
              value: 291,
            },
            {
              name: 'Opera',
              value: 200,
            },
            {
              name: 'Edge',
              value: 141,
            },
          ],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HISTOGRAM',
    },
  };

  pageVariantByOperatingSystemHistVariant1: BXHistogram = {
    data: {
      current: this.noData
        ? []
        : [
            {
              name: 'Windows 11',
              value: 242,
            },
            {
              name: 'Windows 10',
              value: 234,
            },
            {
              name: 'Android',
              value: 185,
            },
            {
              name: 'iOS',
              value: 141,
            },
          ],
      historic: this.noData
        ? []
        : [
            {
              name: 'Windows 11',
              value: 284,
            },
            {
              name: 'Windows 10',
              value: 213,
            },
            {
              name: 'Android',
              value: 291,
            },
            {
              name: 'iOS',
              value: 200,
            },
          ],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HISTOGRAM',
    },
  };

  pageVariantByRefererHistVariant1: BXHistogram = {
    data: {
      current: this.noData
        ? []
        : [
            {
              name: 'Home Page',
              value: 2420,
            },
            {
              name: 'About Us',
              value: 234,
            },

            {
              name: 'Whats new',
              value: 185,
            },
            {
              name: 'Career',
              value: 133,
            },
            {
              name: 'News',
              value: 144,
            },
            {
              name: 'Privacy Policy',
              value: 3,
            },
          ],
      historic: this.noData
        ? []
        : [
            {
              name: 'Home Page',
              value: 220,
            },
            {
              name: 'About Us',
              value: 24,
            },
            {
              name: 'Whats new',
              value: 15,
            },
            {
              name: 'Career',
              value: 185,
            },
            {
              name: 'News',
              value: 132,
            },
            {
              name: 'Privacy Policy',
              value: 3,
            },
          ],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HISTOGRAM',
    },
  };

  pageVariantViewCountVariant1: BXSingleStat = {
    data: {
      current: this.noData ? 0 : 500,
      historic: this.noData ? 0 : 200,
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'SINGLESTAT',
    },
  };

  pageVariantActiveGuestCountVariant1: BXSingleStat = {
    data: {
      current: this.noData ? 0 : 50,
      historic: this.noData ? 0 : 90,
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'SINGLESTAT',
    },
  };

  pageVariantActiveSessionCountVariant1: BXSingleStat = {
    data: {
      current: this.noData ? 0 : 200,
      historic: this.noData ? 0 : 50,
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'SINGLESTAT',
    },
  };

  pageVariantViewTimeSeriesVariant1: BXTimeSeries = {
    data: {
      current: this.noData
        ? []
        : [
            {
              value: 6541,
              name: '2022-02-28T13:57:33.597Z',
            },
            {
              value: 3677,
              name: '2022-03-28T13:57:33.597Z',
            },
            {
              value: 2210,
              name: '2022-04-28T13:57:33.597Z',
            },
            {
              value: 5101,
              name: '2022-05-28T13:57:33.597Z',
            },
            {
              value: 4433,
              name: '2022-06-28T13:57:33.597Z',
            },
            {
              value: 5101,
              name: '2022-07-28T13:57:33.597Z',
            },
            {
              value: 4433,
              name: '2022-08-28T13:57:33.597Z',
            },
          ],
      historic: this.noData
        ? []
        : [
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
  pageVariantHeatmapVariant1: BXHeatmap = {
    data: {
      current: this.noData ? [] : testHeatmapData(7),
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HEATMAP',
    },
  };

  // Mock data for pageAnalytics endpoints for variant2.
  pageVariantByCountryHistVariant2: BXHistogram = {
    data: {
      current: this.noData
        ? []
        : [
            {
              name: 'New Zealand',
              value: 242,
            },
            {
              name: 'Canada',
              value: 234,
            },
            {
              name: 'Ireland',
              value: 185,
            },
            {
              name: 'Australia',
              value: 141,
            },
            {
              name: 'United Arab Emirates',
              value: 141,
            },
            {
              name: 'India',
              value: 125,
            },
            {
              name: 'Pakistan',
              value: 25,
            },
          ],
      historic: this.noData
        ? []
        : [
            {
              name: 'New Zealand',
              value: 284,
            },
            {
              name: 'Canada',
              value: 213,
            },
            {
              name: 'Ireland',
              value: 291,
            },
            {
              name: 'Australia',
              value: 200,
            },
            {
              name: 'United Arab Emirates',
              value: 141,
            },
            {
              name: 'India',
              value: 125,
            },
            {
              name: 'Pakistan',
              value: 25,
            },
          ],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HISTOGRAM',
    },
  };

  pageVariantByDeviceHistVariant2: BXHistogram = {
    data: {
      current: this.noData
        ? []
        : [
            {
              name: 'Chrome',
              value: 242,
            },
            {
              name: 'Firefox',
              value: 234,
            },
            {
              name: 'Safari',
              value: 185,
            },
            {
              name: 'Opera',
              value: 141,
            },
            {
              name: 'Edge',
              value: 141,
            },
          ],
      historic: this.noData
        ? []
        : [
            {
              name: 'Chrome',
              value: 284,
            },
            {
              name: 'Firefox',
              value: 213,
            },
            {
              name: 'Safari',
              value: 291,
            },
            {
              name: 'Opera',
              value: 200,
            },
            {
              name: 'Edge',
              value: 141,
            },
          ],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HISTOGRAM',
    },
  };

  pageVariantByOperatingSystemHistVariant2: BXHistogram = {
    data: {
      current: this.noData
        ? []
        : [
            {
              name: 'Windows 11',
              value: 242,
            },
            {
              name: 'Windows 10',
              value: 234,
            },
            {
              name: 'Android',
              value: 185,
            },
            {
              name: 'iOS',
              value: 141,
            },
          ],
      historic: this.noData
        ? []
        : [
            {
              name: 'Windows 11',
              value: 284,
            },
            {
              name: 'Windows 10',
              value: 213,
            },
            {
              name: 'Android',
              value: 291,
            },
            {
              name: 'iOS',
              value: 200,
            },
          ],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HISTOGRAM',
    },
  };

  pageVariantByRefererHistVariant2: BXHistogram = {
    data: {
      current: this.noData
        ? []
        : [
            {
              name: 'Home Page',
              value: 2420,
            },
            {
              name: 'About Us',
              value: 234,
            },

            {
              name: 'Whats new',
              value: 185,
            },
            {
              name: 'Career',
              value: 133,
            },
            {
              name: 'News',
              value: 144,
            },
            {
              name: 'Privacy Policy',
              value: 3,
            },
          ],
      historic: this.noData
        ? []
        : [
            {
              name: 'Home Page',
              value: 220,
            },
            {
              name: 'About Us',
              value: 24,
            },
            {
              name: 'Whats new',
              value: 15,
            },
            {
              name: 'Career',
              value: 185,
            },
            {
              name: 'News',
              value: 132,
            },
            {
              name: 'Privacy Policy',
              value: 3,
            },
          ],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HISTOGRAM',
    },
  };

  pageVariantViewCountVariant2: BXSingleStat = {
    data: {
      current: this.noData ? 0 : 200,
      historic: this.noData ? 0 : 500,
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'SINGLESTAT',
    },
  };

  pageVariantSessionCountVariant2: BXSingleStat = {
    data: {
      current: this.noData ? 0 : 70,
      historic: this.noData ? 0 : 40,
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'SINGLESTAT',
    },
  };

  pageVariantActiveSessionCountVariant2: BXSingleStat = {
    data: {
      current: this.noData ? 0 : 300,
      historic: this.noData ? 0 : 60,
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'SINGLESTAT',
    },
  };

  pageVariantViewTimeSeriesVariant2: BXTimeSeries = {
    data: {
      current: this.noData
        ? []
        : [
            {
              value: 4641,
              name: '2022-02-28T13:57:33.597Z',
            },
            {
              value: 5877,
              name: '2022-03-28T13:57:33.597Z',
            },
            {
              value: 1110,
              name: '2022-04-28T13:57:33.597Z',
            },
            {
              value: 3201,
              name: '2022-05-28T13:57:33.597Z',
            },
            {
              value: 2433,
              name: '2022-06-28T13:57:33.597Z',
            },
            {
              value: 5101,
              name: '2022-07-28T13:57:33.597Z',
            },
            {
              value: 3433,
              name: '2022-08-28T13:57:33.597Z',
            },
          ],
      historic: this.noData
        ? []
        : [
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
  pageVariantHeatmapVariant2: BXHeatmap = {
    data: {
      current: this.noData ? [] : testHeatmapDataVariant2(7),
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HEATMAP',
    },
  };

  // Mock data for pageAnalytics endpoints for default variant.
  pageVariantByCountryHistDefault: BXHistogram = {
    data: {
      current: this.noData
        ? []
        : [
            {
              name: 'New Zealand',
              value: 142,
            },
            {
              name: 'Canada',
              value: 134,
            },
            {
              name: 'Ireland',
              value: 285,
            },
            {
              name: 'Australia',
              value: 241,
            },
            {
              name: 'United Arab Emirates',
              value: 141,
            },
            {
              name: 'India',
              value: 150,
            },
            {
              name: 'Pakistan',
              value: 50,
            },
          ],
      historic: this.noData
        ? []
        : [
            {
              name: 'New Zealand',
              value: 290,
            },
            {
              name: 'Canada',
              value: 283,
            },
            {
              name: 'Ireland',
              value: 191,
            },
            {
              name: 'Australia',
              value: 200,
            },
            {
              name: 'United Arab Emirates',
              value: 241,
            },
            {
              name: 'India',
              value: 125,
            },
            {
              name: 'Pakistan',
              value: 50,
            },
          ],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HISTOGRAM',
    },
  };

  pageVariantByDeviceHistDefault: BXHistogram = {
    data: {
      current: this.noData
        ? []
        : [
            {
              name: 'Chrome',
              value: 262,
            },
            {
              name: 'Firefox',
              value: 134,
            },
            {
              name: 'Safari',
              value: 285,
            },
            {
              name: 'Opera',
              value: 151,
            },
            {
              name: 'Edge',
              value: 161,
            },
          ],
      historic: this.noData
        ? []
        : [
            {
              name: 'Chrome',
              value: 284,
            },
            {
              name: 'Firefox',
              value: 113,
            },
            {
              name: 'Safari',
              value: 391,
            },
            {
              name: 'Opera',
              value: 100,
            },
            {
              name: 'Edge',
              value: 241,
            },
          ],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HISTOGRAM',
    },
  };

  pageVariantByOperatingSystemHistDefault: BXHistogram = {
    data: {
      current: this.noData
        ? []
        : [
            {
              name: 'Windows 11',
              value: 252,
            },
            {
              name: 'Windows 10',
              value: 244,
            },
            {
              name: 'Android',
              value: 185,
            },
            {
              name: 'iOS',
              value: 241,
            },
          ],
      historic: this.noData
        ? []
        : [
            {
              name: 'Windows 11',
              value: 184,
            },
            {
              name: 'Windows 10',
              value: 313,
            },
            {
              name: 'Android',
              value: 281,
            },
            {
              name: 'iOS',
              value: 100,
            },
          ],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HISTOGRAM',
    },
  };

  pageVariantByRefererHistDefault: BXHistogram = {
    data: {
      current: this.noData
        ? []
        : [
            {
              name: 'Home Page',
              value: 2460,
            },
            {
              name: 'About Us',
              value: 264,
            },

            {
              name: 'Whats new',
              value: 195,
            },
            {
              name: 'Career',
              value: 233,
            },
            {
              name: 'News',
              value: 244,
            },
            {
              name: 'Privacy Policy',
              value: 5,
            },
          ],
      historic: this.noData
        ? []
        : [
            {
              name: 'Home Page',
              value: 1220,
            },
            {
              name: 'About Us',
              value: 224,
            },
            {
              name: 'Whats new',
              value: 35,
            },
            {
              name: 'Career',
              value: 150,
            },
            {
              name: 'News',
              value: 232,
            },
            {
              name: 'Privacy Policy',
              value: 2,
            },
          ],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HISTOGRAM',
    },
  };

  pageViewCountByPageVariantHistDefault: BXHistogram = {
    data: {
      current: this.noData
        ? []
        : [
            {
              value: 150,
              name: 'Visitor from Copenhagen',
            },
            {
              value: 60,
              name: 'Visitor from Oslo',
            },
            {
              value: 50,
              name: 'Default',
            }
          ],
      historic: [],
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HISTOGRAM',
    },
  };
  pageVariantViewCountDefault: BXSingleStat = {
    data: {
      current: this.noData ? 0 : 300,
      historic: this.noData ? 0 : 100,
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'SINGLESTAT',
    },
  };

  pageVariantActiveGuestCountDefault: BXSingleStat = {
    data: {
      current: this.noData ? 0 : 50,
      historic: this.noData ? 0 : 90,
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'SINGLESTAT',
    },
  };

  pageVariantActiveSessionCountDefault: BXSingleStat = {
    data: {
      current: this.noData ? 0 : 8,
      historic: this.noData ? 0 : 5,
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'SINGLESTAT',
    },
  };

  pageVariantViewTimeSeriesDefault: BXTimeSeries = {
    data: {
      current: this.noData
        ? []
        : [
            {
              value: 6551,
              name: '2022-02-28T13:57:33.597Z',
            },
            {
              value: 2677,
              name: '2022-03-28T13:57:33.597Z',
            },
            {
              value: 3210,
              name: '2022-04-28T13:57:33.597Z',
            },
            {
              value: 4101,
              name: '2022-05-28T13:57:33.597Z',
            },
            {
              value: 5433,
              name: '2022-06-28T13:57:33.597Z',
            },
            {
              value: 4101,
              name: '2022-07-28T13:57:33.597Z',
            },
            {
              value: 5433,
              name: '2022-08-28T13:57:33.597Z',
            },
          ],
      historic: this.noData
        ? []
        : [
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
  pageVariantHeatmapDefault: BXHeatmap = {
    data: {
      current: this.noData ? [] : testHeatmapData(7),
    },
    meta: {
      unitType: 'QUANTITY',
      widgetType: 'HEATMAP',
    },
  };

  sessionTimeseries = (durationType: 'd' | 'h'): BXTimeSeries => {
    return {
      data: {
        current: this.noData
          ? []
          : durationType === 'h'
          ? [
              { name: '2022-10-04 00:00:00+00', value: 6541 },
              { name: '2022-10-04 01:00:00+00', value: 3677 },
              { name: '2022-10-04 02:00:00+00', value: 2210 },
              { name: '2022-10-04 03:00:00+00', value: 6541 },
              { name: '2022-10-04 04:00:00+00', value: 3677 },
              { name: '2022-10-04 05:00:00+00', value: 2210 },
              { name: '2022-10-04 06:00:00+00', value: 5101 },
              { name: '2022-10-04 07:00:00+00', value: 4433 },
              { name: '2022-10-04 08:00:00+00', value: 5101 },
              { name: '2022-10-04 09:00:00+00', value: 4433 },
              { name: '2022-10-04 10:00:00+00', value: 6541 },
              { name: '2022-10-04 11:00:00+00', value: 3677 },
              { name: '2022-10-04 12:00:00+00', value: 2210 },
              { name: '2022-10-04 14:00:00+00', value: 5101 },
              { name: '2022-10-04 15:00:00+00', value: 4433 },
              { name: '2022-10-04 16:00:00+00', value: 5101 },
              { name: '2022-10-04 17:00:00+00', value: 4433 },
              { name: '2022-10-04 18:00:00+00', value: 4433 },
              { name: '2022-10-04 19:00:00+00', value: 5101 },
              { name: '2022-10-04 20:00:00+00', value: 4433 },
              { name: '2022-10-04 21:00:00+00', value: 4433 },
              { name: '2022-10-04 22:00:00+00', value: 5101 },
              { name: '2022-10-04 23:00:00+00', value: 4433 },
            ]
          : [
              { name: '2022-10-04 00:00:00+00', value: 6541 },
              { name: '2022-10-05 00:00:00+00', value: 3677 },
              { name: '2022-10-06 00:00:00+00', value: 2210 },
              { name: '2022-10-07 00:00:00+00', value: 5101 },
              { name: '2022-10-08 00:00:00+00', value: 4433 },
              { name: '2022-10-09 00:00:00+00', value: 5101 },
              { name: '2022-10-10 00:00:00+00', value: 4433 },
            ],
        historic: this.noData
          ? []
          : [
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

  public async loadSiteAnalytics(_: SiteAnalyticsFilterOptions): Promise<ApiResponse<SiteAnalytics>> {
    if (this.loadTime) {
      await this.fakeLoadingTime();
    }
    return {
      apiIsBroken: this.apiError,
      requestIsInvalid: this.apiError,
      data: {
        activeGuestCount: this.activeGuestCount,
        activeGuestTimeseries: this.activeGuestTimeseries,
        activeSessionCount: this.activeSessionCount,
        bouncedSessionCount: this.bouncedSessionCount,
        pageViewCount: this.pageViewCount,
        pageViewTimeseries: this.pageViewTimeseries,
        sessionDurationAverage: this.sessionDurationAverage,
        sessionTimeseries: this.sessionTimeseries(
          _.duration === '1d' || _.duration?.replace(/[0-9]/g, '') === 'h' ? 'h' : 'd',
        ),
        sessionsByCountryHist: this.sessionsByCountryHist,
        sessionsByDeviceHist: this.sessionsByDeviceHist,
        sessionsByFirstPageHist: this.sessionsByFirstPageHist,
        sessionsByOperatingSystemHist: this.sessionsByOperatingSystemHist,
        sessionsByRefererHist: this.sessionsByRefererHist,
        viewsByPageHist: this.viewsByPageHist,
        sessionHeatmap: this.sessionHeatmap,
      },
    };
  }

  public async loadPageAnalytics(filter: AnalyticsFilterOptions): Promise<ApiResponse<PageAnalytics>> {
    const analyticsData: ApiResponse<PageAnalytics> = {
      apiIsBroken: this.apiError,
      requestIsInvalid: this.apiError,
      data: null,
    };
    if (this.loadTime) {
      await this.fakeLoadingTime();
    }

    const { variant1ExtraData, variant2ExtraData, defaultExtraData } = restoreMockDataFromStorage();

    if (filter.pageVariantId.endsWith(variant1)) {
      analyticsData.data = {
        ...{
          sessionCount: this.pageVariantActiveGuestCountVariant1,
          pageVariantViewBySessionRatio: this.pageVariantActiveSessionCountVariant1,
          pageVariantViewCount: this.pageVariantViewCountVariant1,
          pageVariantViewTimeseries: this.pageVariantViewTimeSeriesVariant1,
          pageVariantByCountryHist: this.pageVariantByCountryHistVariant1,
          pageVariantByDeviceHist: this.pageVariantByDeviceHistVariant1,
          pageVariantByOperatingSystemHist: this.pageVariantByOperatingSystemHistVariant1,
          pageVariantByRefererHist: this.pageVariantByRefererHistVariant1,
          pageViewCountByPageVariantHist: this.pageViewCountByPageVariantHistDefault,
          pageVariantHeatmap: this.pageVariantHeatmapVariant1,
        },
        ...variant1ExtraData,
      };
    }
    if (filter.pageVariantId.endsWith(variant2)) {
      analyticsData.data = {
        ...{
          sessionCount: this.pageVariantSessionCountVariant2,
          pageVariantViewBySessionRatio: this.pageVariantActiveSessionCountVariant2,
          pageVariantViewCount: this.pageVariantViewCountVariant2,
          pageVariantViewTimeseries: this.pageVariantViewTimeSeriesVariant2,
          pageVariantByCountryHist: this.pageVariantByCountryHistVariant2,
          pageVariantByDeviceHist: this.pageVariantByDeviceHistVariant2,
          pageVariantByOperatingSystemHist: this.pageVariantByOperatingSystemHistVariant2,
          pageVariantByRefererHist: this.pageVariantByRefererHistVariant2,
          pageViewCountByPageVariantHist: this.pageViewCountByPageVariantHistDefault,

          pageVariantHeatmap: this.pageVariantHeatmapVariant2,
        },
        ...variant2ExtraData,
      };
    }
    if (filter.pageVariantId.endsWith(defaultId)) {
      analyticsData.data = {
        ...{
          sessionCount: this.pageVariantActiveGuestCountDefault,
          pageVariantViewBySessionRatio: this.pageVariantActiveSessionCountDefault,
          pageVariantViewCount: this.pageVariantViewCountDefault,
          pageVariantViewTimeseries: this.pageVariantViewTimeSeriesDefault,
          pageVariantByCountryHist: this.pageVariantByCountryHistDefault,
          pageVariantByDeviceHist: this.pageVariantByDeviceHistDefault,
          pageVariantByOperatingSystemHist: this.pageVariantByOperatingSystemHistDefault,
          pageVariantByRefererHist: this.pageVariantByRefererHistDefault,
          pageViewCountByPageVariantHist: this.pageViewCountByPageVariantHistDefault,

          pageVariantHeatmap: this.pageVariantHeatmapDefault,
        },
        ...defaultExtraData,
      };
    }
    return analyticsData;
  }

  private async fakeLoadingTime() {
    const time = Math.floor(Math.random() * (1500 - 750 + 1) + 750);
    await new Promise((resolve) => setTimeout(resolve, time));
  }
}
