/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule, LoadingIndicatorModule, TrendModule } from '@sitecore/ng-spd-lib';
import { BXSingleStat } from 'app/analytics/analytics.types';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { getDefaultVariantPageAnalytics } from 'app/testing/analytics-test-data';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';

import { SingleStatPageAnalyticsComponent } from './single-stat-page-analytics.component';

@Component({
  template: `<app-single-stat-page-analytics
    [pageVariantVisitorsCount]="pageVariantVisitorsCount"
    [avgPageViewsBySessionCount]="avgPageViewsBySessionCount"
    [sessionCount]="sessionCount"
    [isLoading]="isLoading"
    [disabled]="disabled"
    [isSecondVariant]="isSecondVariant"
  ></app-single-stat-page-analytics>`,
})
class TestComponent {
  @Input() pageVariantVisitorsCount: BXSingleStat | null = null;
  @Input() avgPageViewsBySessionCount: BXSingleStat | null = null;
  @Input() sessionCount: BXSingleStat | null = null;
  @Input() isLoading = true;
  @Input() disabled = false;
  @Input() isSecondVariant = false;
}

describe(SingleStatPageAnalyticsComponent.name, () => {
  let sut: SingleStatPageAnalyticsComponent;
  let testComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  const getTrendsEl = () => fixture.debugElement.queryAll(By.css('ng-spd-trend'));
  const loadingEl = () => fixture.debugElement.query(By.css('ng-spd-loading-indicator')).nativeElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        PipesModule,
        TranslateModule,
        TranslateServiceStubModule,
        LoadingIndicatorModule,
        TrendModule,
        NoopAnimationsModule,
        CardModule,
      ],
      declarations: [SingleStatPageAnalyticsComponent, TestComponent],
    }).compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    sut = fixture.debugElement.query(By.directive(SingleStatPageAnalyticsComponent)).componentInstance;

    testComponent.avgPageViewsBySessionCount = getDefaultVariantPageAnalytics().pageVariantViewBySessionRatio;
    testComponent.pageVariantVisitorsCount = getDefaultVariantPageAnalytics().pageVariantViewCount;
    testComponent.sessionCount = getDefaultVariantPageAnalytics().sessionCount;
    testComponent.isLoading = false;
    testComponent.isSecondVariant = false;
    testComponent.disabled = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
    expect(testComponent).toBeTruthy();
  });

  describe('ngOnchanges()', () => {
    describe('WHEN single stat analytics data changes', () => {
      it('should update the value for Visitors', () => {
        const visitorCountData = getTrendsEl()[0].nativeElement;

        expect(visitorCountData.innerText).toContain('40');
        expect(visitorCountData.innerText).toContain('10');
      });

      it('should update value for Avg. Page View per Session', () => {
        const avgPageViewPerSession = getTrendsEl()[1].nativeElement;

        expect(avgPageViewPerSession.innerText).toContain('40');
        expect(avgPageViewPerSession.innerText).toContain('10');
      });

      it('should update value for Sessions count', () => {
        const sessionCount = getTrendsEl()[2].nativeElement;

        expect(sessionCount.innerText).toContain('40');
        expect(sessionCount.innerText).toContain('10');
      });

      it('should disable card if disabled property is true', () => {
        testComponent.disabled = true;
        fixture.detectChanges();
        const card = fixture.debugElement.query(By.css('ng-spd-card .disabled')).nativeElement;

        expect(card).toBeDefined();
      });

      it('should show loading indicator while updating data', () => {
        testComponent.isLoading = true;
        fixture.detectChanges();

        expect(loadingEl()).toBeDefined();
      });
    });
  });

  describe('WHEN no count is registered', () => {
    it('should show empty values', async () => {
      testComponent.pageVariantVisitorsCount = null;
      testComponent.avgPageViewsBySessionCount = null;
      testComponent.sessionCount = null;
      testComponent.isLoading = false;
      testComponent.disabled = false;
      fixture.detectChanges();

      const visitorsCountCard = getTrendsEl()[0].nativeElement;
      const avgPageViewCount = getTrendsEl()[1].nativeElement;
      const sessionCount = getTrendsEl()[2].nativeElement;

      expect(visitorsCountCard.innerText).toContain('--');
      expect(visitorsCountCard.innerText).toContain('--');

      expect(avgPageViewCount.innerText).toContain('--');
      expect(avgPageViewCount.innerText).toContain('--');

      expect(sessionCount.innerText).toContain('--');
      expect(sessionCount.innerText).toContain('--');
    });
  });
});
