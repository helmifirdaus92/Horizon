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
import { takeTopItems } from 'app/analytics/analytics-util/analytics-utils';
import { getSpdCardHeader } from 'app/analytics/analytics-util/analytics.test-utils';
import { BXHistogram, ChartData } from 'app/analytics/analytics.types';
import { getDefaultSiteAnalytics, getEmptySiteAnalytics } from 'app/testing/analytics-test-data';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { HISTOGRAM_RECORDS_TO_DISPLAY } from '../../site-analytics/site-analytics.component';
import { ChartsModule } from '../charts/charts.module';
import { AnalyticsTopPagesComponent } from './analytics-top-pages.component';

@Component({
  template: `<app-analytics-top-pages
    [chartData]="chartData"
    [secondVariantChartData]="secondVariantChartData"
    [isLoading]="isLoading"
    [disabled]="disabled"
    [mode]="mode"
  ></app-analytics-top-pages>`,
})
class TopPagesTestComponent {
  chartData?: BXHistogram;
  secondVariantChartData?: BXHistogram;
  isLoading = true;
  disabled = false;
  mode?: 'siteAnalytics' | 'pageAnalytics';
}

describe(AnalyticsTopPagesComponent.name, () => {
  let fixture: ComponentFixture<TopPagesTestComponent>;
  let sut: AnalyticsTopPagesComponent;
  let testComponent: TopPagesTestComponent;
  let debugEl: DebugElement;

  const expectedChartData: ChartData[] = [
    {
      name: 'getPageViewsByGuestHist',
      series: takeTopItems(getDefaultSiteAnalytics().sessionsByDeviceHist.data.current, HISTOGRAM_RECORDS_TO_DISPLAY),
    },
  ];

  const expectedEmptyData: ChartData[] = timeseriesWithoutData;
  const getChart = () => debugEl.query(By.css('app-bar-chart'));
  const getLoadingIndicator = () => debugEl.query(By.css('ng-spd-loading-indicator'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnalyticsTopPagesComponent, TopPagesTestComponent],
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
    fixture = TestBed.createComponent(TopPagesTestComponent);
    testComponent = fixture.componentInstance;
    debugEl = fixture.debugElement;
    sut = fixture.debugElement.query(By.directive(AnalyticsTopPagesComponent)).componentInstance;

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
      testComponent.chartData = getDefaultSiteAnalytics().sessionsByDeviceHist;
      fixture.detectChanges();

      expect(sut.manipulatedChartData).toEqual(expectedChartData);
    });

    it('should show empty data WHEN no data', () => {
      testComponent.chartData = getEmptySiteAnalytics().sessionsByDeviceHist;
      fixture.detectChanges();

      expect(sut.manipulatedChartData).toEqual(expectedEmptyData);
    });
  });

  describe('analytics mode toggling', () => {
    afterEach(() => {
      testComponent.mode = undefined;
    });

    it('should render Site Analytics translations', () => {
      const headerCmpt = getSpdCardHeader(fixture);

      expect(headerCmpt!.title).toBe('ANALYTICS.SITE_ANALYTICS.TITLES.TOP_PAGES');
      expect(headerCmpt!.tooltipText).toBe('ANALYTICS.SITE_ANALYTICS.DESCRIPTIONS.TOP_PAGES');
    });

    it('should render Site Analytics translations', () => {
      testComponent.mode = 'siteAnalytics';
      fixture.detectChanges();

      const headerCmpt = getSpdCardHeader(fixture);
      expect(headerCmpt!.title).toBe('ANALYTICS.SITE_ANALYTICS.TITLES.TOP_PAGES');
      expect(headerCmpt!.tooltipText).toBe('ANALYTICS.SITE_ANALYTICS.DESCRIPTIONS.TOP_PAGES');
    });

    it('should render Page Analytics translations', () => {
      testComponent.mode = 'pageAnalytics';
      fixture.detectChanges();

      const headerCmpt = getSpdCardHeader(fixture);
      expect(headerCmpt!.title).toBe('ANALYTICS.PAGE_ANALYTICS.TITLES.TOP_PAGES');
      expect(headerCmpt!.tooltipText).toBe('ANALYTICS.PAGE_ANALYTICS.DESCRIPTIONS.TOP_PAGES');
    });
  });
});
