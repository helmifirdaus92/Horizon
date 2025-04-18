/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule, DroplistModule, LoadingIndicatorModule, TableModule, TrendModule } from '@sitecore/ng-spd-lib';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { getDefaultSiteAnalytics } from 'app/testing/analytics-test-data';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { AnalyticsErrorBannerModule } from '../../analytics-error-banner/analytics-error-banner.module';
import { ChartsModule } from '../charts/charts.module';
import { SiteAnalyticsGraphsComponent } from './site-analytics-graphs.component';

@Component({
  selector: 'app-single-stat-tiles',
  template: '',
})
class TilesTestComponent {
  @Input() activeSessionCountData?: undefined;
  @Input() visitorCountData: undefined;
  @Input() avgSessionDurationData: undefined;
  @Input() bounceRateData: undefined;
  @Input() isLoading = true;
  @Input() disabled = false;
  @Input() indicatorBg = 'primary';
}

@Component({
  selector: 'app-analytics-timeseries',
  template: '',
})
class TimeSeriesTestComponent {
  @Input() visitsChartData: undefined;
  @Input() visitorsChartData: undefined;
  @Input() isLoading = true;
  @Input() disabled = false;
  @Input() duration = '';
}

@Component({
  selector: 'app-analytics-heatmap',
  template: '',
})
class HeatMapTestComponent {
  @Input() chartData: undefined;
  @Input() isLoading = true;
  @Input() disabled = false;
}
@Component({
  selector: 'app-analytics-top-pages',
  template: '',
})
class TopPagesTestComponent {
  @Input() chartData: undefined;
  @Input() isLoading = true;
  @Input() disabled = false;
}

@Component({
  selector: 'app-analytics-table',
  template: '',
})
class TableTestComponent {
  @Input() chartData: undefined;
  @Input() isLoading = true;
  @Input() disabled = false;
}

@Component({
  selector: 'app-analytics-source',
  template: '',
})
class SourceTestComponent {
  @Input() chartData: undefined;
  @Input() isLoading = true;
  @Input() disabled = false;
}

@Component({
  selector: 'app-analytics-browser',
  template: '',
})
class BrowserTestComponent {
  @Input() chartData: undefined;
  @Input() isLoading = true;
  @Input() disabled = false;
}

@Component({
  selector: 'app-analytics-operating-systems',
  template: '',
})
class OperatingSystemTestComponent {
  @Input() chartData: undefined;
  @Input() isLoading = true;
  @Input() disabled = false;
}

@Component({
  selector: 'app-analytics-top-countries',
  template: '',
})
class TopCountriesTestComponent {
  @Input() chartData: undefined;
  @Input() isLoading = true;
  @Input() disabled = false;
}

describe('SiteAnalyticsGraphsComponent', () => {
  let sut: SiteAnalyticsGraphsComponent;
  let fixture: ComponentFixture<SiteAnalyticsGraphsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        CardModule,
        TrendModule,
        DroplistModule,
        TranslateModule,
        PipesModule,
        LoadingIndicatorModule,
        TableModule,
        AnalyticsErrorBannerModule,
        TranslateServiceStubModule,
        ChartsModule,
      ],
      declarations: [
        SiteAnalyticsGraphsComponent,
        TilesTestComponent,
        TimeSeriesTestComponent,
        HeatMapTestComponent,
        TopPagesTestComponent,
        TableTestComponent,
        SourceTestComponent,
        BrowserTestComponent,
        OperatingSystemTestComponent,
        TopCountriesTestComponent,
      ],
      providers: [DatePipe],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteAnalyticsGraphsComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should update data bound property of [SingleStatTilesComponent] respective to parent component properties', () => {
    sut.siteAnalytics = getDefaultSiteAnalytics();
    fixture.detectChanges();
    const tileEl = fixture.debugElement.query(By.directive(TilesTestComponent)).componentInstance;

    expect(tileEl.activeSessionCountData).toEqual(sut.siteAnalytics.activeSessionCount);
    expect(tileEl.visitorCountData).toEqual(sut.siteAnalytics.activeGuestCount);
    expect(tileEl.avgSessionDurationData).toEqual(sut.siteAnalytics.sessionDurationAverage);
    expect(tileEl.bounceRateData).toEqual(sut.siteAnalytics.bouncedSessionCount);
    expect(tileEl.isLoading).toEqual(sut.isLoading);
    expect(tileEl.disabled).toEqual(!sut.isValidData);
  });

  it('should update data bound property of [AnalyticsTimeseriesComponent] component respective to parent component properties', () => {
    sut.siteAnalytics = getDefaultSiteAnalytics();
    fixture.detectChanges();
    const timeseriesEl = fixture.debugElement.query(By.directive(TimeSeriesTestComponent)).componentInstance;

    expect(timeseriesEl.visitsChartData).toEqual(sut.siteAnalytics.sessionTimeseries);
    expect(timeseriesEl.visitorsChartData).toEqual(sut.siteAnalytics.activeGuestTimeseries);
    expect(timeseriesEl.isLoading).toEqual(sut.isLoading);
    expect(timeseriesEl.disabled).toEqual(!sut.isValidData);
    expect(timeseriesEl.duration).toEqual(sut.duration);
  });

  it('should update data bound property of [AnalyticsHeatmapComponent] component respective to parent component properties', () => {
    sut.siteAnalytics = getDefaultSiteAnalytics();
    fixture.detectChanges();
    const heatMapEl = fixture.debugElement.query(By.directive(HeatMapTestComponent)).componentInstance;

    expect(heatMapEl.chartData).toEqual(sut.siteAnalytics.sessionHeatmap);
    expect(heatMapEl.isLoading).toEqual(sut.isLoading);
    expect(heatMapEl.disabled).toEqual(!sut.isValidData);
  });

  it('should update data bound property of [AnalyticsTopPagesComponent] respective to parent component properties', () => {
    sut.siteAnalytics = getDefaultSiteAnalytics();
    fixture.detectChanges();
    const topPageEl = fixture.debugElement.query(By.directive(TopPagesTestComponent)).componentInstance;

    expect(topPageEl.chartData).toEqual(sut.siteAnalytics.viewsByPageHist);
    expect(topPageEl.isLoading).toEqual(sut.isLoading);
    expect(topPageEl.disabled).toEqual(!sut.isValidData);
  });

  it('should update data bound property of [AnalyticsTableComponent] respective to parent component properties', () => {
    sut.siteAnalytics = getDefaultSiteAnalytics();
    fixture.detectChanges();
    const tableEl = fixture.debugElement.query(By.directive(TableTestComponent)).componentInstance;

    expect(tableEl.chartData).toEqual(sut.siteAnalytics.sessionsByFirstPageHist);
    expect(tableEl.isLoading).toEqual(sut.isLoading);
    expect(tableEl.disabled).toEqual(!sut.isValidData);
  });

  it('should update data bound property of [AnalyticSourceComponent] respective to parent component properties', () => {
    sut.siteAnalytics = getDefaultSiteAnalytics();
    fixture.detectChanges();
    const sourceChartEl = fixture.debugElement.query(By.directive(SourceTestComponent)).componentInstance;

    expect(sourceChartEl.chartData).toEqual(sut.siteAnalytics.sessionsByRefererHist);
    expect(sourceChartEl.isLoading).toEqual(sut.isLoading);
    expect(sourceChartEl.disabled).toEqual(!sut.isValidData);
  });

  it('should update data bound property of [AnalyticBrowserComponent] respective to parent component properties', () => {
    sut.siteAnalytics = getDefaultSiteAnalytics();
    fixture.detectChanges();
    const browserChartEl = fixture.debugElement.query(By.directive(BrowserTestComponent)).componentInstance;

    expect(browserChartEl.chartData).toEqual(sut.siteAnalytics.sessionsByDeviceHist);
    expect(browserChartEl.isLoading).toEqual(sut.isLoading);
    expect(browserChartEl.disabled).toEqual(!sut.isValidData);
  });

  it('should update data bound property of [AnalyticsOperatingSystemsComponent] respective to parent component properties', () => {
    sut.siteAnalytics = getDefaultSiteAnalytics();
    fixture.detectChanges();
    const operatingChartEl = fixture.debugElement.query(By.directive(OperatingSystemTestComponent)).componentInstance;

    expect(operatingChartEl.chartData).toEqual(sut.siteAnalytics.sessionsByOperatingSystemHist);
    expect(operatingChartEl.isLoading).toEqual(sut.isLoading);
    expect(operatingChartEl.disabled).toEqual(!sut.isValidData);
  });

  it('should update data bound property of [AnalyticsTopCountriesComponent] respective to parent component properties', () => {
    sut.siteAnalytics = getDefaultSiteAnalytics();
    fixture.detectChanges();
    const topCountryChartEl = fixture.debugElement.query(By.directive(TopCountriesTestComponent)).componentInstance;

    expect(topCountryChartEl.chartData).toEqual(sut.siteAnalytics.sessionsByCountryHist);
    expect(topCountryChartEl.isLoading).toEqual(sut.isLoading);
    expect(topCountryChartEl.disabled).toEqual(!sut.isValidData);
  });
});
