/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingIndicatorModule } from '@sitecore/ng-spd-lib';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { DateDifferenceModule } from 'app/shared/pipes/date-difference/date-difference.pipe';
import { LocalTimeZoneDateModule } from 'app/shared/pipes/local-time-zone/local-time-zone-date.pipe';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { AbTestPerformanceDalService } from '../services/ab-test-performance.dal.service';
import { PerformanceCalculatorService } from '../services/performance-calculator-service';
import { PageAbPerformanceComponent } from './page-ab-test-performance.component';

describe('PageAbPerformanceComponent', () => {
  let component: PageAbPerformanceComponent;
  let fixture: ComponentFixture<PageAbPerformanceComponent>;
  let timedNotificationService: jasmine.SpyObj<TimedNotificationsService>;

  beforeEach(async(() => {
    const timedNotificationServiceSpy = jasmine.createSpyObj('TimedNotificationsService', ['pushNotification']);

    TestBed.configureTestingModule({
      imports: [
        TranslateModule,
        TranslateServiceStubModule,
        LoadingIndicatorModule,
        StaticConfigurationServiceStubModule,
        DatePipe,
        LocalTimeZoneDateModule,
        DateDifferenceModule,
      ],
      declarations: [PageAbPerformanceComponent],
      providers: [
        {
          provide: AbTestPerformanceDalService,
          useValue: jasmine.createSpyObj<AbTestPerformanceDalService>(['getAbTestPerformance']),
        },
        {
          provide: PerformanceCalculatorService,
          useValue: jasmine.createSpyObj<PerformanceCalculatorService>(['calculateVariantsPerformance']),
        },

        { provide: TimedNotificationsService, useValue: timedNotificationServiceSpy },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAbPerformanceComponent);
    component = fixture.componentInstance;
    timedNotificationService = TestBedInjectSpy(TimedNotificationsService);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
