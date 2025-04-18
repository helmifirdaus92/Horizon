/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { DatePipe } from '@angular/common';
import { Component, DebugElement, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule, DroplistModule, LoadingIndicatorModule } from '@sitecore/ng-spd-lib';
import { AnalyticsContextService } from 'app/analytics/analytics-context.service';
import { timeseriesWithoutData } from 'app/analytics/analytics-mock-data';
import { getSpdCardHeader } from 'app/analytics/analytics-util/analytics.test-utils';
import { AnalyticsVariantFilterValue, BXTimeSeries, ChartData } from 'app/analytics/analytics.types';
import {
  getDefaultSiteAnalytics,
  getDefaultVariantPageAnalytics,
  getEmptySiteAnalytics,
  getPageAnalyticsForVariant1,
} from 'app/testing/analytics-test-data';
import { TestBedInjectSpy, nextTick } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { AnalyticsTimeseriesComponent } from './analytics-timeseries.component';

@Component({
  template: `<app-analytics-timeseries
    [visitsChartData]="visitsChartData"
    [visitorsChartData]="visitorsChartData"
    [secondVariantVisitsChartData]="secondVariantVisitsChartData"
    [isLoading]="isLoading"
    [disabled]="disabled"
    [variants]="variants"
    [mode]="mode"
  ></app-analytics-timeseries>`,
})
class TimeseriesTestComponent {
  visitsChartData?: BXTimeSeries;
  visitorsChartData?: BXTimeSeries;
  secondVariantVisitsChartData?: BXTimeSeries;
  variants?: AnalyticsVariantFilterValue;
  isLoading = true;
  disabled = false;
  mode?: 'siteAnalytics' | 'pageAnalytics';
}
@Component({
  selector: 'app-line-chart',
  template: '',
})
class LineChartTestComponent {
  @Input() isLegendVisible = false;
  @Input() items: any;
  @Input() isReversedPalette: any;
}
@Component({
  selector: 'app-bar-chart',
  template: '',
})
class BarChartTestComponent {
  @Input() isLegendVisible = false;
  @Input() items: any;
  @Input() isReversedPalette: any;
}
@Component({
  selector: 'app-bar-chart-grouped',
  template: '',
})
class BarChartGroupedTestComponent {
  @Input() isLegendVisible = false;
  @Input() items: any;
  @Input() isReversedPalette: any;
  @Input() paletteIndex: any;
}

describe(AnalyticsTimeseriesComponent.name, () => {
  let fixture: ComponentFixture<TimeseriesTestComponent>;
  let sut: AnalyticsTimeseriesComponent;
  let testComponent: TimeseriesTestComponent;
  let debugEl: DebugElement;
  let analyticsContextService: jasmine.SpyObj<AnalyticsContextService>;

  const expectedVisitorsSeries = [
    {
      name: 'Mar 28',
      value: 3677,
    },
    {
      name: 'Feb 28',
      value: 6541,
    },
  ];

  const expectedVisitsSeries = [
    {
      name: 'Feb 28',
      value: 6541,
    },
    {
      name: 'Mar 28',
      value: 3677,
    },
  ];

  const expectedVisitsChartData: ChartData[] = [
    {
      name: 'visits',
      series: [...expectedVisitsSeries],
    },
  ];

  const expectedVisitorsChartData: ChartData[] = [
    {
      name: 'visitors',
      series: [...expectedVisitorsSeries],
    },
  ];

  const expectedEmptyData: ChartData[] = timeseriesWithoutData;

  async function detectChanges() {
    fixture.detectChanges();
    await nextTick();
    fixture.detectChanges();
  }

  function openChartTypeSwitcher() {
    const droplists = debugEl.queryAll(By.css('ng-spd-droplist'));
    const droplistBtn = droplists[1].query(By.css('button')).nativeElement as HTMLButtonElement;
    droplistBtn.click();

    detectChanges();
  }

  function openViewsSwitcher() {
    const droplists = debugEl.queryAll(By.css('ng-spd-droplist'));
    const droplistBtn = droplists[0].query(By.css('button')).nativeElement as HTMLButtonElement;
    droplistBtn.click();

    detectChanges();
  }

  async function switchChartType(type: 'line' | 'bar') {
    openChartTypeSwitcher();

    const droplistItems = debugEl.queryAll(By.css('ng-spd-droplist-item'));

    if (type === 'line') {
      const lineChartBtn = droplistItems[0].nativeElement;
      lineChartBtn.click();
    } else if (type === 'bar') {
      const barChartBtn = droplistItems[1].nativeElement;
      barChartBtn.click();
    }

    await detectChanges();
  }

  function switchView(view: 'visits' | 'visitors') {
    openViewsSwitcher();

    const droplistItems = debugEl.queryAll(By.css('ng-spd-droplist-item'));

    if (view === 'visits') {
      const visitsBtn = droplistItems[0].nativeElement;
      visitsBtn.click();
    } else if (view === 'visitors') {
      const visitorsBtn = droplistItems[1].nativeElement;
      visitorsBtn.click();
    }

    detectChanges();
  }

  const getLineChart = () => debugEl.query(By.css('app-line-chart'));
  const getBarChart = () => debugEl.query(By.css('app-bar-chart'));
  const groupChart = () => debugEl.query(By.css('app-bar-chart-grouped')).nativeElement;
  const getLoadingIndicator = () => debugEl.query(By.css('ng-spd-loading-indicator'));
  const cardHeaderEl = () => debugEl.query(By.css('ng-spd-card h4')).nativeElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AnalyticsTimeseriesComponent,
        TimeseriesTestComponent,
        LineChartTestComponent,
        BarChartGroupedTestComponent,
        BarChartTestComponent,
      ],
      imports: [
        CardModule,
        DroplistModule,
        NoopAnimationsModule,
        TranslateServiceStubModule,
        TranslateModule,
        LoadingIndicatorModule,
      ],
      providers: [
        DatePipe,
        {
          provide: AnalyticsContextService,
          useValue: jasmine.createSpyObj<AnalyticsContextService>('AnalyticsContextService', ['watchActiveRoute']),
        },
      ],
    }).compileComponents();
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(TimeseriesTestComponent);
    testComponent = fixture.componentInstance;
    debugEl = fixture.debugElement;
    sut = debugEl.query(By.directive(AnalyticsTimeseriesComponent)).componentInstance;
    analyticsContextService = TestBedInjectSpy(AnalyticsContextService);
    analyticsContextService.watchActiveRoute.and.returnValue(of('site'));

    testComponent.visitsChartData = getDefaultSiteAnalytics().sessionTimeseries;
    testComponent.visitorsChartData = getDefaultSiteAnalytics().activeGuestTimeseries;
    testComponent.isLoading = false;
    testComponent.disabled = false;

    await detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();

    expect(testComponent).toBeTruthy();
  });

  describe('View toggle', () => {
    it('When visits is selected', () => {
      switchView('visits');

      expect(sut.dataType).toBe('visits');
    });

    it('should update card header to `Visits`', () => {
      switchView('visits');

      expect(cardHeaderEl().innerText).toEqual('ANALYTICS.SITE_ANALYTICS.TITLES.VISITS');
    });

    it('When visitors is selected', () => {
      switchView('visitors');

      expect(sut.dataType).toBe('visitors');
    });

    it('should update card header to `Visitors`', () => {
      switchView('visitors');

      expect(cardHeaderEl().innerText).toEqual('ANALYTICS.SITE_ANALYTICS.TITLES.VISITORS');
    });
  });

  describe('Chart type toggle', () => {
    it('When line chart is selected', async () => {
      await switchChartType('line');

      expect(getLineChart()).toBeTruthy();
      expect(getBarChart()).toBeFalsy();
    });

    it('When bar chart is selected', async () => {
      await switchChartType('bar');

      expect(getLineChart()).toBeFalsy();
      expect(getBarChart()).toBeTruthy();
    });
  });

  describe('Loading state', () => {
    it('should show loading indicator WHEN loading', () => {
      testComponent.isLoading = true;
      detectChanges();

      expect(getLineChart()).toBeFalsy();
      expect(getLoadingIndicator()).toBeTruthy();
    });

    it('should show chart WHEN not loading', () => {
      testComponent.isLoading = false;
      detectChanges();

      expect(getLineChart()).toBeTruthy();
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
    it('should handle the visitsChartData WHEN dataType value changes to "visits"', () => {
      testComponent.visitsChartData = getDefaultSiteAnalytics().sessionTimeseries;
      detectChanges();

      expect(sut.chartData).toEqual(expectedVisitsChartData);
    });

    it('should handle the visitorsChartData WHEN dataType value changes to "visitors"', () => {
      testComponent.visitorsChartData = getDefaultSiteAnalytics().activeGuestTimeseries;
      detectChanges();

      switchView('visitors');
      detectChanges();

      expect(sut.chartData).toEqual(expectedVisitorsChartData);
    });

    it('should show empty data WHEN no data', () => {
      testComponent.visitsChartData = getEmptySiteAnalytics().sessionTimeseries;
      fixture.detectChanges();

      expect(sut.chartData).toEqual(expectedEmptyData);
    });
  });

  describe('pageAnalytics', () => {
    it('should show group bar chart if second variant data is defined & bar chat is selected', async () => {
      testComponent.secondVariantVisitsChartData = getPageAnalyticsForVariant1().pageVariantViewTimeseries;
      fixture.detectChanges();

      await switchChartType('bar');

      expect(groupChart()).toBeDefined();
    });

    it('should show chart legend for line chart if second variant data is defined', () => {
      testComponent.secondVariantVisitsChartData = getPageAnalyticsForVariant1().pageVariantViewTimeseries;
      fixture.detectChanges();

      const line = fixture.debugElement.query(By.directive(LineChartTestComponent)).componentInstance;
      expect(line.isLegendVisible).toBe(true);
    });

    describe('handleDataGroupedBarChartData', () => {
      it('should fill 0 values to all non-existing entries in variants and should sort on date', async () => {
        testComponent.variants = {
          variantOne: { variantId: 'variant1', variantName: 'Default' },
          variantTwo: { variantId: 'variant2', variantName: 'Variant 2' },
        };
        testComponent.visitsChartData = {
          data: {
            current: [
              {
                value: 6541,
                name: '2022-04-28T13:57:33.597Z',
              },
              {
                value: 3677,
                name: '2022-03-28T13:57:33.597Z',
              },
            ],
            historic: [],
          },
          meta: {
            unitType: 'QUANTITY',
            widgetType: 'TIMESERIES',
          },
        };
        testComponent.secondVariantVisitsChartData = {
          data: {
            current: [
              {
                value: 6541,
                name: '2022-02-28T13:57:33.597Z',
              },
              {
                value: 3677,
                name: '2022-01-28T13:57:33.597Z',
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
            name: 'Jan 28',
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
          {
            name: 'Feb 28',
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
            name: 'Mar 28',
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
            name: 'Apr 28',
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
        ];

        expect(sut.groupedData).toEqual(expectedGroupChartData);
      });

      it('should map the chart data for different variants if data is defined', async () => {
        testComponent.variants = {
          variantOne: { variantId: 'variant1', variantName: 'Default' },
          variantTwo: { variantId: 'variant2', variantName: 'Variant 2' },
        };
        testComponent.visitorsChartData = getDefaultVariantPageAnalytics().pageVariantViewTimeseries;
        testComponent.secondVariantVisitsChartData = getPageAnalyticsForVariant1().pageVariantViewTimeseries;
        await detectChanges();

        const expectedGroupChartData = [
          {
            name: 'Mar 28',
            series: [
              {
                name: 'Default' + ',',
                value: 3677,
              },
              {
                name: 'Variant 2' + ',',
                value: 677,
              },
            ],
          },
          {
            name: 'Feb 28',
            series: [
              {
                name: 'Default' + ',',
                value: 6541,
              },
              {
                name: 'Variant 2' + ',',
                value: 541,
              },
            ],
          },
        ];

        expect(sut.groupedData).toEqual(expectedGroupChartData);
      });
    });
  });

  describe('analytics mode toggling', () => {
    afterEach(() => {
      testComponent.mode = undefined;
    });

    it('should render Site Analytics translations if mode is not defined', () => {
      const headerCmpt = getSpdCardHeader(fixture);

      expect(headerCmpt!.tooltipText).toBe('ANALYTICS.SITE_ANALYTICS.DESCRIPTIONS.VISITORS_VISITS_TIMESERIES');
    });

    it('should render Site Analytics translations if mode is `siteAnalytics`', () => {
      testComponent.mode = 'siteAnalytics';
      fixture.detectChanges();

      const headerCmpt = getSpdCardHeader(fixture);
      expect(headerCmpt!.tooltipText).toBe('ANALYTICS.SITE_ANALYTICS.DESCRIPTIONS.VISITORS_VISITS_TIMESERIES');
    });

    it('should render Page Analytics translations if mode is `pageAnalytics`', () => {
      testComponent.mode = 'pageAnalytics';
      fixture.detectChanges();

      const headerCmpt = getSpdCardHeader(fixture);
      expect(headerCmpt!.tooltipText).toBe('ANALYTICS.PAGE_ANALYTICS.DESCRIPTIONS.VISITS_TIMESERIES');
    });
  });
});
