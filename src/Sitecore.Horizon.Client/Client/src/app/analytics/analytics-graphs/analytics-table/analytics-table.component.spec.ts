/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule, LoadingIndicatorModule, TableModule } from '@sitecore/ng-spd-lib';
import { BXHistogram, TableRowData } from 'app/analytics/analytics.types';
import { SortPipe } from 'app/shared/pipes/sort-pipe/sort.pipe';
import { getDefaultSiteAnalytics, getEmptySiteAnalytics } from 'app/testing/analytics-test-data';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { AnalyticsTableComponent } from './analytics-table.component';

@Component({
  template: `<app-analytics-table
    [chartData]="chartData"
    [isLoading]="isLoading"
    [disabled]="disabled"
  ></app-analytics-table>`,
})
class TableTestComponent {
  chartData?: BXHistogram;
  isLoading = true;
  disabled = false;
}

describe(AnalyticsTableComponent.name, () => {
  let fixture: ComponentFixture<TableTestComponent>;
  let sut: AnalyticsTableComponent;
  let testComponent: TableTestComponent;
  let debugEl: DebugElement;

  const expectedTableData: TableRowData[] = [
    {
      name: 'Home Page',
      currentValue: 100,
      historicValue: 100,
      trend: 'neutral',
      trendValue: 0,
    },
    {
      name: 'About Us',
      currentValue: 100,
      historicValue: 50,
      trend: 'up',
      trendValue: 50,
    },
  ];

  const getTable = () => debugEl.query(By.css('ng-spd-table'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnalyticsTableComponent, TableTestComponent, SortPipe],
      imports: [
        TableModule,
        CardModule,
        NoopAnimationsModule,
        TranslateServiceStubModule,
        TranslateModule,
        LoadingIndicatorModule,
      ],
      providers: [SortPipe],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableTestComponent);
    testComponent = fixture.componentInstance;
    debugEl = fixture.debugElement;
    sut = debugEl.query(By.directive(AnalyticsTableComponent)).componentInstance;

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

      const table = getTable().nativeElement;
      expect(table.getAttribute('ng-reflect-loading')).toBe('true');
    });

    it('should show table WHEN not loading', () => {
      testComponent.isLoading = false;
      fixture.detectChanges();

      const table = getTable().nativeElement;
      expect(table.getAttribute('ng-reflect-loading')).toBe('false');
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
      testComponent.chartData = getDefaultSiteAnalytics().sessionsByFirstPageHist;
      fixture.detectChanges();

      expect(sut.tableData).toEqual(expectedTableData);
    });

    it('should show empty data WHEN no data', () => {
      testComponent.chartData = getEmptySiteAnalytics().sessionsByFirstPageHist;
      fixture.detectChanges();

      expect(sut.tableData).toEqual([]);
    });
  });
});
