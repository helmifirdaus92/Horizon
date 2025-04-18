/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { DatePipe } from '@angular/common';
import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule, LoadingIndicatorModule } from '@sitecore/ng-spd-lib';
import { heatmapWithoutData } from 'app/analytics/analytics-mock-data';
import { BXHeatmap, ChartData } from 'app/analytics/analytics.types';
import { getDefaultSiteAnalytics, getEmptySiteAnalytics } from 'app/testing/analytics-test-data';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { ChartsModule } from '../charts/charts.module';
import { AnalyticsHeatmapComponent } from './analytics-heatmap.component';

@Component({
  template: `<app-analytics-heatmap
    [chartData]="chartData"
    [isLoading]="isLoading"
    [disabled]="disabled"
  ></app-analytics-heatmap>`,
})
class AnalyticsHeatmapTestComponent {
  chartData?: BXHeatmap;
  isLoading = true;
  disabled = false;
}

describe('AnalyticsHeatmapComponent', () => {
  let fixture: ComponentFixture<AnalyticsHeatmapTestComponent>;
  let sut: AnalyticsHeatmapComponent;
  let testComponent: AnalyticsHeatmapTestComponent;
  let debugEl: DebugElement;
  const expectedChartData: ChartData[] = [];

  [...getDefaultSiteAnalytics().sessionHeatmap.data.current].forEach((data) => {
    expectedChartData.push({ name: data.name, series: [...data.series].reverse() });
  });

  const expectedEmptyData: ChartData[] = heatmapWithoutData;
  const getChart = () => debugEl.query(By.css('app-heatmap-chart'));
  const getLoadingIndicator = () => debugEl.query(By.css('ng-spd-loading-indicator'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnalyticsHeatmapComponent, AnalyticsHeatmapTestComponent],
      imports: [
        ChartsModule,
        CardModule,
        NoopAnimationsModule,
        TranslateServiceStubModule,
        TranslateModule,
        LoadingIndicatorModule,
      ],
      providers: [DatePipe],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsHeatmapTestComponent);
    testComponent = fixture.componentInstance;
    sut = fixture.debugElement.query(By.directive(AnalyticsHeatmapComponent)).componentInstance;
    debugEl = fixture.debugElement;

    testComponent.isLoading = false;
    testComponent.disabled = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(testComponent).toBeTruthy();
    expect(sut).toBeTruthy();
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
      testComponent.chartData = getDefaultSiteAnalytics().sessionHeatmap;
      fixture.detectChanges();

      expect(sut.manipulatedChartData).toEqual(expectedChartData);
    });

    it('should show empty data WHEN no data', () => {
      testComponent.chartData = getEmptySiteAnalytics().sessionHeatmap;
      fixture.detectChanges();

      expect(sut.manipulatedChartData).toEqual(expectedEmptyData);
    });
  });
});
