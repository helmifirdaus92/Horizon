/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule, DroplistModule, LoadingIndicatorModule, TrendModule } from '@sitecore/ng-spd-lib';
import { AnalyticsContextService } from 'app/analytics/analytics-context.service';
import { BXSingleStat } from 'app/analytics/analytics.types';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { getDefaultSiteAnalytics } from 'app/testing/analytics-test-data';
import { nextTick } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { SingleStatTilesComponent } from './single-stat-tiles.component';

@Component({
  template: `<app-single-stat-tiles
    [activeSessionCountData]="activeSessionCountData"
    [visitorCountData]="visitorCountData"
    [avgSessionDurationData]="avgSessionDurationData"
    [bounceRateData]="bounceRateData"
    [isLoading]="isLoading"
    [disabled]="disabled"
  ></app-single-stat-tiles>`,
})
class TileTestComponent {
  activeSessionCountData: BXSingleStat | null = null;
  visitorCountData: BXSingleStat | null = null;
  avgSessionDurationData: BXSingleStat | null = null;
  bounceRateData?: BXSingleStat | null = null;
  isLoading = true;
  disabled = false;
}

describe(SingleStatTilesComponent.name, () => {
  let fixture: ComponentFixture<TileTestComponent>;
  let sut: SingleStatTilesComponent;
  let testComponent: TileTestComponent;

  async function detectChanges() {
    fixture.detectChanges();
    await nextTick();
    fixture.detectChanges();
  }

  function getTrendsEl() {
    return fixture.debugElement.queryAll(By.css('ng-spd-trend'));
  }

  const loadingEl = () => fixture.debugElement.query(By.css('ng-spd-loading-indicator')).nativeElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SingleStatTilesComponent, TileTestComponent],
      imports: [
        DroplistModule,
        PipesModule,
        TrendModule,
        CardModule,
        TranslateModule,
        TranslateServiceStubModule,
        NoopAnimationsModule,
        LoadingIndicatorModule,
        AppLetModule,
      ],
      providers: [
        {
          provide: AnalyticsContextService,
          useValue: jasmine.createSpyObj<AnalyticsContextService>('AnalyticsContextService', ['watchActiveRoute']),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(TileTestComponent);
    testComponent = fixture.componentInstance;
    sut = fixture.debugElement.query(By.directive(SingleStatTilesComponent)).componentInstance;
    await detectChanges();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
    expect(testComponent).toBeTruthy();
  });

  describe('ngOnChanges()', () => {
    beforeEach(async () => {
      testComponent.visitorCountData = getDefaultSiteAnalytics().activeGuestCount;
      testComponent.avgSessionDurationData = getDefaultSiteAnalytics().sessionDurationAverage;
      testComponent.activeSessionCountData = getDefaultSiteAnalytics().activeSessionCount;
      testComponent.bounceRateData = getDefaultSiteAnalytics().bouncedSessionCount;
      testComponent.isLoading = false;
      testComponent.disabled = false;
      await detectChanges();
    });

    describe('When analytics data changs', () => {
      it('should update value for Visitors', () => {
        const visitorsCountCard = getTrendsEl()[0].nativeElement;

        expect(visitorsCountCard.innerText).toContain('40');
        expect(visitorsCountCard.innerText).toContain('10');
      });

      it('should update value for Avg. Time On Site', () => {
        const avgSessionDurationCountCard = getTrendsEl()[1].nativeElement;

        expect(avgSessionDurationCountCard.innerText).toContain('0.7m');
        expect(avgSessionDurationCountCard.innerText).toContain('0.2m');
      });

      it('should update value for Sessions', () => {
        const activeSessionCountCard = getTrendsEl()[2].nativeElement;

        expect(activeSessionCountCard.innerText).toContain('40');
        expect(activeSessionCountCard.innerText).toContain('10');
      });

      it('should update Bounce rate value for site analytics only', () => {
        const bounceSessionsCountCard = getTrendsEl()[3].nativeElement;

        expect(bounceSessionsCountCard.innerText).toContain('40%');
        expect(bounceSessionsCountCard.innerText).toContain('10%');
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
      testComponent.visitorCountData = null;
      testComponent.avgSessionDurationData = null;
      testComponent.activeSessionCountData = null;
      testComponent.bounceRateData = null;
      testComponent.isLoading = false;
      testComponent.disabled = false;
      await detectChanges();

      const visitorsCountCard = getTrendsEl()[0].nativeElement;
      const avgSessionDurationCountCard = getTrendsEl()[1].nativeElement;
      const activeSessionCountCard = getTrendsEl()[2].nativeElement;
      const bounceSessionsCountCard = getTrendsEl()[3].nativeElement;

      expect(visitorsCountCard.innerText).toContain('--');
      expect(visitorsCountCard.innerText).toContain('--');

      expect(avgSessionDurationCountCard.innerText).toContain('--');
      expect(avgSessionDurationCountCard.innerText).toContain('--');

      expect(bounceSessionsCountCard.innerText).toContain('--');
      expect(bounceSessionsCountCard.innerText).toContain('--');

      expect(activeSessionCountCard.innerText).toContain('--');
      expect(activeSessionCountCard.innerText).toContain('--');
    });
  });
});
