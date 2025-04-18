/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule, LoadingIndicatorModule } from '@sitecore/ng-spd-lib';
import { timeseriesWithoutData } from 'app/analytics/analytics-mock-data';
import { BXHistogram, ChartData } from 'app/analytics/analytics.types';
import {
  getDefaultSiteAnalytics,
  getDefaultVariantPageAnalytics,
  getEmptySiteAnalytics,
  getPageAnalyticsForVariant1,
} from 'app/testing/analytics-test-data';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { ChartsModule } from '../charts/charts.module';
import { AnalyticsTopCountriesComponent } from './analytics-top-countries.component';

@Component({
  template: `<app-analytics-top-countries
    [chartData]="chartData"
    [secondVariantChartData]="secondVariantChartData"
    [isLoading]="isLoading"
    [disabled]="disabled"
  ></app-analytics-top-countries>`,
})
class TopCountriesTestComponent {
  chartData?: BXHistogram;
  secondVariantChartData?: BXHistogram;
  isLoading = true;
  disabled = false;
}

describe(AnalyticsTopCountriesComponent.name, () => {
  let fixture: ComponentFixture<TopCountriesTestComponent>;
  let sut: AnalyticsTopCountriesComponent;
  let testComponent: TopCountriesTestComponent;
  let debugEl: DebugElement;

  const expectedChartData: ChartData[] = [
    {
      name: 'sessionsByCountryHist',
      series: getDefaultSiteAnalytics().sessionsByCountryHist.data.current,
    },
  ];

  const expectedEmptyData: ChartData[] = timeseriesWithoutData;
  const getChart = () => debugEl.query(By.css('app-bar-chart'));
  const groupChart = () => debugEl.query(By.css('app-bar-chart-grouped')).nativeElement;
  const getLoadingIndicator = () => debugEl.query(By.css('ng-spd-loading-indicator'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnalyticsTopCountriesComponent, TopCountriesTestComponent],
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
    fixture = TestBed.createComponent(TopCountriesTestComponent);
    testComponent = fixture.componentInstance;
    debugEl = fixture.debugElement;
    sut = fixture.debugElement.query(By.directive(AnalyticsTopCountriesComponent)).componentInstance;

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
      testComponent.chartData = getDefaultSiteAnalytics().sessionsByCountryHist;
      fixture.detectChanges();

      expect(sut.manipulatedChartData).toEqual(expectedChartData);
    });

    it('should show empty data WHEN no data', () => {
      testComponent.chartData = getEmptySiteAnalytics().sessionsByCountryHist;
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
});
