/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { nextTick } from '@sitecore/horizon-messaging/dist/utils';
import { CardModule, LoadingIndicatorModule } from '@sitecore/ng-spd-lib';
import { timeseriesWithoutData } from 'app/analytics/analytics-mock-data';
import { getSpdCardHeader } from 'app/analytics/analytics-util/analytics.test-utils';
import { AnalyticsVariantFilterValue, BXHistogram, ChartData } from 'app/analytics/analytics.types';
import {
  getDefaultSiteAnalytics,
  getDefaultVariantPageAnalytics,
  getEmptySiteAnalytics,
  getPageAnalyticsForVariant1,
} from 'app/testing/analytics-test-data';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { ChartsModule } from '../charts/charts.module';
import { AnalyticsOperatingSystemsComponent } from './analytics-operating-systems.component';

@Component({
  template: `<app-analytics-operating-systems
    [chartData]="chartData"
    [secondVariantChartData]="secondVariantChartData"
    [isLoading]="isLoading"
    [disabled]="disabled"
    [mode]="mode"
    [variants]="variants"
  ></app-analytics-operating-systems>`,
})
class OperatingSystemsTestComponent {
  secondVariantChartData?: BXHistogram;
  chartData?: BXHistogram;
  isLoading = true;
  disabled = false;
  variants?: AnalyticsVariantFilterValue;
  mode?: 'siteAnalytics' | 'pageAnalytics';
}

describe(AnalyticsOperatingSystemsComponent.name, () => {
  let fixture: ComponentFixture<OperatingSystemsTestComponent>;
  let sut: AnalyticsOperatingSystemsComponent;
  let testComponent: OperatingSystemsTestComponent;
  let debugEl: DebugElement;

  async function detectChanges() {
    fixture.detectChanges();
    await nextTick();
    fixture.detectChanges();
  }

  const expectedChartData: ChartData[] = [
    {
      name: 'sessionsByOperatingSystemHist',
      series: getDefaultSiteAnalytics().sessionsByOperatingSystemHist.data.current,
    },
  ];

  const expectedEmptyData: ChartData[] = timeseriesWithoutData;
  const getChart = () => debugEl.query(By.css('app-bar-chart'));
  const groupChart = () => debugEl.query(By.css('app-bar-chart-grouped')).nativeElement;
  const getLoadingIndicator = () => debugEl.query(By.css('ng-spd-loading-indicator'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnalyticsOperatingSystemsComponent, OperatingSystemsTestComponent],
      imports: [
        ChartsModule,
        CardModule,
        NoopAnimationsModule,
        TranslateServiceStubModule,
        TranslateModule,
        LoadingIndicatorModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatingSystemsTestComponent);
    testComponent = fixture.componentInstance;
    sut = fixture.debugElement.query(By.directive(AnalyticsOperatingSystemsComponent)).componentInstance;
    debugEl = fixture.debugElement;

    testComponent.isLoading = false;
    testComponent.disabled = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
    expect(testComponent).toBeTruthy();
  });

  describe('Loading state', () => {
    it('should show loading indicator WHEN loading', () => {
      testComponent.isLoading = true;
      fixture.detectChanges();

      expect(getChart()).toBeFalsy();
      expect(getLoadingIndicator()).toBeTruthy();
    });

    it('should show chart WHEN not loading', () => {
      testComponent.isLoading = false;
      fixture.detectChanges();

      expect(getChart()).toBeTruthy();
      expect(getLoadingIndicator()).toBeFalsy();
    });
  });

  describe('API error', () => {
    it('should disable card WHEN disabled property is set as "true"', () => {
      testComponent.disabled = true;
      fixture.detectChanges();

      const card = fixture.debugElement.query(By.css('ng-spd-card .disabled')).nativeElement;

      expect(card).toBeDefined();
    });
  });

  describe('HandleData()', () => {
    it('should handle the chartData WHEN property value changes', () => {
      testComponent.chartData = getDefaultSiteAnalytics().sessionsByOperatingSystemHist;
      fixture.detectChanges();

      expect(sut.manipulatedChartData).toEqual(expectedChartData);
    });

    it('should show empty data WHEN no data', () => {
      testComponent.chartData = getEmptySiteAnalytics().sessionsByOperatingSystemHist;
      fixture.detectChanges();

      expect(sut.manipulatedChartData).toEqual(expectedEmptyData);
    });
  });

  describe('manipulatedGroupChartData', () => {
    it('should load grouped bar chart ', () => {
      sut.isLoading = false;
      testComponent.chartData = getDefaultVariantPageAnalytics().pageVariantByCountryHist;
      testComponent.secondVariantChartData = getPageAnalyticsForVariant1().pageVariantByCountryHist;
      fixture.detectChanges();

      expect(groupChart()).toBeDefined();
    });
  });

  describe('analytics mode toggling', () => {
    afterEach(() => {
      testComponent.mode = undefined;
    });

    it('should render Site Analytics translations if mode is not defined', () => {
      const headerCmpt = getSpdCardHeader(fixture);

      expect(headerCmpt!.tooltipText).toBe('ANALYTICS.SITE_ANALYTICS.DESCRIPTIONS.OPERATING_SYSTEM');
    });

    it('should render Site Analytics translations if mode is `siteAnalytics`', () => {
      testComponent.mode = 'siteAnalytics';
      fixture.detectChanges();

      const headerCmpt = getSpdCardHeader(fixture);
      expect(headerCmpt!.tooltipText).toBe('ANALYTICS.SITE_ANALYTICS.DESCRIPTIONS.OPERATING_SYSTEM');
    });

    it('should render Page Analytics translations if mode is `pageAnalytics`', () => {
      testComponent.mode = 'pageAnalytics';
      fixture.detectChanges();

      const headerCmpt = getSpdCardHeader(fixture);
      expect(headerCmpt!.tooltipText).toBe('ANALYTICS.PAGE_ANALYTICS.DESCRIPTIONS.OPERATING_SYSTEM');
    });
  });

  describe('handleDataGroupedBarChartData', () => {
    it('should fill 0 values to all non-existing entries in variants', async () => {
      testComponent.variants = {
        variantOne: { variantId: 'variant1', variantName: 'Default' },
        variantTwo: { variantId: 'variant2', variantName: 'Variant 2' },
      };
      testComponent.chartData = {
        data: {
          current: [
            {
              value: 6541,
              name: '1',
            },
            {
              value: 3677,
              name: '2',
            },
          ],
          historic: [],
        },
        meta: {
          unitType: 'QUANTITY',
          widgetType: 'TIMESERIES',
        },
      };
      testComponent.secondVariantChartData = {
        data: {
          current: [
            {
              value: 6541,
              name: '3',
            },
            {
              value: 3677,
              name: '4',
            },
          ],
          historic: [],
        },
        meta: {
          unitType: 'QUANTITY',
          widgetType: 'TIMESERIES',
        },
      };
      await detectChanges();

      const expectedGroupChartData = [
        {
          name: '1',
          series: [
            {
              name: 'Default' + ',',
              value: 6541,
            },
            {
              name: 'Variant 2' + ',',
              value: 0,
            },
          ],
        },
        {
          name: '2',
          series: [
            {
              name: 'Default' + ',',
              value: 3677,
            },
            {
              name: 'Variant 2' + ',',
              value: 0,
            },
          ],
        },
        {
          name: '3',
          series: [
            {
              name: 'Default' + ',',
              value: 0,
            },
            {
              name: 'Variant 2' + ',',
              value: 6541,
            },
          ],
        },
        {
          name: '4',
          series: [
            {
              name: 'Default' + ',',
              value: 0,
            },
            {
              name: 'Variant 2' + ',',
              value: 3677,
            },
          ],
        },
      ];

      expect(sut.manipulatedGroupChartData).toEqual(expectedGroupChartData);
    });
  });
});
