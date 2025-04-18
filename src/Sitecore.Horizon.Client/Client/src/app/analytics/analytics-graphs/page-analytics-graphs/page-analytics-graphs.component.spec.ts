/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule, DatePipe } from '@angular/common';
import { Component, DebugElement, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule, DroplistModule, LoadingIndicatorModule, TrendModule } from '@sitecore/ng-spd-lib';
import { AnalyticsErrorBannerModule } from 'app/analytics/analytics-error-banner/analytics-error-banner.module';
import { VariantIdToNamePipe } from 'app/analytics/analytics-util/variant-id-to-name.pipe';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { getDefaultVariantPageAnalytics, getPageAnalyticsForVariant1 } from 'app/testing/analytics-test-data';
import { nextTick } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { ChartsModule } from '../charts/charts.module';

import { PageAnalyticsGraphsComponent } from './page-analytics-graphs.component';

@Component({
  selector: 'app-single-stat-page-analytics',
  template: '',
})
class TilesTestComponent {
  @Input() pageVariantVisitorsCount: undefined;
  @Input() avgPageViewsBySessionCount: undefined;
  @Input() sessionCount: undefined;
  @Input() isLoading = true;
  @Input() disabled = false;
  @Input() isSecondVariant = true;
}

@Component({
  selector: 'app-analytics-timeseries',
  template: '',
})
class TimeSeriesTestComponent {
  @Input() visitsChartData: undefined;
  @Input() secondVariantVisitsChartData: undefined;
  @Input() isLoading = true;
  @Input() disabled = false;
  @Input() duration = '';
  @Input() variants: undefined;
  @Input() mode?: 'siteAnalytics' | 'pageAnalytics';
}
@Component({
  selector: 'app-analytics-heatmap',
  template: '',
})
class HeatMapTestComponent {
  @Input() chartData: undefined;
  @Input() isLoading = true;
  @Input() disabled = false;
  @Input() variantName: undefined;
  @Input() isSecondVariant = true;
}
@Component({
  selector: 'app-analytics-top-pages',
  template: '',
})
class TopPagesTestComponent {
  @Input() chartData: undefined;
  @Input() secondVariantChartData: undefined;
  @Input() isLoading = true;
  @Input() disabled = false;
  @Input() variants: undefined;
  @Input() mode?: 'siteAnalytics' | 'pageAnalytics';
}
@Component({
  selector: 'app-analytics-source',
  template: '',
})
class SourceTestComponent {
  @Input() chartData: undefined;
  @Input() secondVariantChartData: undefined;
  @Input() isLoading = true;
  @Input() disabled = false;
  @Input() variants: undefined;
}
@Component({
  selector: 'app-analytics-browser',
  template: '',
})
class BrowserTestComponent {
  @Input() chartData: undefined;
  @Input() secondVariantChartData: undefined;
  @Input() isLoading = true;
  @Input() disabled = false;
  @Input() variants: undefined;
  @Input() mode?: 'siteAnalytics' | 'pageAnalytics';
}
@Component({
  selector: 'app-analytics-operating-systems',
  template: '',
})
class OperatingSystemTestComponent {
  @Input() chartData: undefined;
  @Input() secondVariantChartData: undefined;
  @Input() isLoading = true;
  @Input() disabled = false;
  @Input() variants: undefined;
  @Input() mode?: 'siteAnalytics' | 'pageAnalytics';
}
@Component({
  selector: 'app-analytics-top-countries',
  template: '',
})
class TopCountriesTestComponent {
  @Input() chartData: undefined;
  @Input() secondVariantChartData: undefined;
  @Input() isLoading = true;
  @Input() disabled = false;
  @Input() variants: undefined;
}

describe(PageAnalyticsGraphsComponent.name, () => {
  let sut: PageAnalyticsGraphsComponent;
  let fixture: ComponentFixture<PageAnalyticsGraphsComponent>;
  let de: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        TrendModule,
        DroplistModule,
        TranslateModule,
        LoadingIndicatorModule,
        AnalyticsErrorBannerModule,
        TranslateServiceStubModule,
        PipesModule,
        CardModule,
        ChartsModule,
      ],
      declarations: [
        PageAnalyticsGraphsComponent,
        TilesTestComponent,
        TopPagesTestComponent,
        TopCountriesTestComponent,
        OperatingSystemTestComponent,
        BrowserTestComponent,
        SourceTestComponent,
        HeatMapTestComponent,
        TimeSeriesTestComponent,
        VariantIdToNamePipe,
      ],
      providers: [DatePipe],
    }).compileComponents();
  });

  const tileEl = () => de.query(By.directive(TilesTestComponent)).componentInstance;
  const timeseriesEl = () => de.query(By.directive(TimeSeriesTestComponent)).componentInstance;
  const heatMapEl = () => de.query(By.directive(HeatMapTestComponent)).componentInstance;
  const topPageEl = () => de.query(By.directive(TopPagesTestComponent)).componentInstance;
  const sourceChartEl = () => de.query(By.directive(SourceTestComponent)).componentInstance;
  const browserChartEl = () => de.query(By.directive(BrowserTestComponent)).componentInstance;
  const operatingChartEl = () => de.query(By.directive(OperatingSystemTestComponent)).componentInstance;
  const topCountryChartEl = () => de.query(By.directive(TopCountriesTestComponent)).componentInstance;

  beforeEach(async () => {
    fixture = TestBed.createComponent(PageAnalyticsGraphsComponent);
    de = fixture.debugElement;
    sut = fixture.componentInstance;
    sut.pageAnalytics = { variantOne: getDefaultVariantPageAnalytics(), variantTwo: getPageAnalyticsForVariant1() };
    sut.variants = {
      variantOne: { variantId: 'variant1', variantName: 'Default' },
    };
    fixture.detectChanges();
    await nextTick();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should update data bound property of [SingleStatPageAnalyticsComponent] based on parent component properties', () => {
    expect(tileEl().pageVariantVisitorsCount).toEqual(sut.pageAnalytics.variantOne?.pageVariantViewCount);
    expect(tileEl().avgPageViewsBySessionCount).toEqual(sut.pageAnalytics.variantOne?.pageVariantViewBySessionRatio);
    expect(tileEl().sessionCount).toEqual(sut.pageAnalytics.variantOne?.sessionCount);
    expect(tileEl().isLoading).toEqual(sut.isLoading);
    expect(tileEl().disabled).toEqual(!sut.isValidData);
  });

  it('should update data bound property of [AnalyticsTimeseriesComponent] based on parent component properties', () => {
    expect(timeseriesEl().visitsChartData).toEqual(sut.pageAnalytics.variantOne?.pageVariantViewTimeseries);
    expect(timeseriesEl().secondVariantVisitsChartData).toEqual(
      sut.pageAnalytics.variantTwo?.pageVariantViewTimeseries,
    );
    expect(timeseriesEl().isLoading).toEqual(sut.isLoading);
    expect(timeseriesEl().disabled).toEqual(!sut.isValidData);
    expect(timeseriesEl().duration).toEqual(sut.duration);
    expect(timeseriesEl().variants).toEqual(sut.variants);
  });

  it('should update data bound property of [AnalyticsHeatmapComponent] based on parent component properties', () => {
    expect(heatMapEl().chartData).toEqual(sut.pageAnalytics.variantOne?.pageVariantHeatmap);
    expect(heatMapEl().isLoading).toEqual(sut.isLoading);
    expect(heatMapEl().disabled).toEqual(!sut.isValidData);
  });

  it('should update data bound property of [AnalyticsTopPagesComponent] respective to parent component properties', () => {
    expect(topPageEl().chartData).toEqual(sut.pageAnalytics.variantOne?.pageVariantByCountryHist);
    expect(topPageEl().isLoading).toEqual(sut.isLoading);
    expect(topPageEl().variants).toEqual(sut.variants);
    expect(topPageEl().disabled).toEqual(!sut.isValidData);
  });

  it('should update data bound property of [AnalyticSourceComponent] respective to parent component properties', () => {
    expect(sourceChartEl().chartData).toEqual(sut.pageAnalytics.variantOne?.pageVariantByRefererHist);
    expect(sourceChartEl().secondVariantChartData).toEqual(sut.pageAnalytics.variantTwo?.pageVariantByRefererHist);
    expect(topPageEl().variants).toEqual(sut.variants);
    expect(sourceChartEl().isLoading).toEqual(sut.isLoading);
    expect(sourceChartEl().disabled).toEqual(!sut.isValidData);
  });

  it('should update data bound property of [AnalyticBrowserComponent] respective to parent component properties', () => {
    expect(browserChartEl().chartData).toEqual(sut.pageAnalytics.variantOne?.pageVariantByDeviceHist);
    expect(browserChartEl().secondVariantChartData).toEqual(sut.pageAnalytics.variantTwo?.pageVariantByDeviceHist);
    expect(topPageEl().variants).toEqual(sut.variants);
    expect(browserChartEl().isLoading).toEqual(sut.isLoading);
    expect(browserChartEl().disabled).toEqual(!sut.isValidData);
  });

  it('should update data bound property of [AnalyticsOperatingSystemsComponent] respective to parent component properties', () => {
    expect(operatingChartEl().chartData).toEqual(sut.pageAnalytics.variantOne?.pageVariantByOperatingSystemHist);
    expect(operatingChartEl().secondVariantChartData).toEqual(
      sut.pageAnalytics.variantTwo?.pageVariantByOperatingSystemHist,
    );
    expect(topPageEl().variants).toEqual(sut.variants);
    expect(operatingChartEl().isLoading).toEqual(sut.isLoading);
    expect(operatingChartEl().disabled).toEqual(!sut.isValidData);
  });

  it('should update data bound property of [AnalyticsTopCountriesComponent] respective to parent component properties', () => {
    expect(topCountryChartEl().chartData).toEqual(sut.pageAnalytics.variantOne?.pageVariantByCountryHist);
    expect(topCountryChartEl().secondVariantChartData).toEqual(sut.pageAnalytics.variantTwo?.pageVariantByCountryHist);
    expect(topPageEl().variants).toEqual(sut.variants);
    expect(topCountryChartEl().isLoading).toEqual(sut.isLoading);
    expect(topCountryChartEl().disabled).toEqual(!sut.isValidData);
  });
});
