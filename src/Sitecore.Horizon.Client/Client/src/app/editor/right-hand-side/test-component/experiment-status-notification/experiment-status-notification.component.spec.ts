/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { InlineNotificationModule } from '@sitecore/ng-spd-lib';
import { BXComponentFlowDefinition } from 'app/pages/left-hand-side/personalization/personalization.types';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { ExperimentStatusNotificationComponent } from './experiment-status-notification.component';

const flowDefinition: BXComponentFlowDefinition = {
  siteId: 'e1d1a1a5-728d-4a5d-82a2-c2dd356af043',
  ref: 'ref',
  archived: false,
  businessProcess: 'interactive_v1',
  name: 'morning visitor',
  friendlyId: 'embedded_foo1bar2baz30000aaaabbbbcccc1234_1',
  channels: ['WEB'],
  sampleSizeConfig: {
    baseValue: 0.15,
    minimumDetectableDifference: 0.02,
    confidenceLevel: 0.95,
  },
  traffic: {
    type: 'simpleTraffic',
    weightingAlgorithm: 'USER_DEFINED',
    modifiedAt: undefined,
    allocation: 100,
    splits: [],
    coupled: false,
  },
  goals: {
    primary: {
      type: 'pageViewGoal',
      name: '',
      friendlyId: '',
      ref: '',
      description: '',
      goalCalculation: {
        type: 'binary',
        calculation: 'INCREASE',
        target: 'conversionPerSession',
      },
      pageParameters: [
        {
          matchCondition: 'Equals',
          parameterString: '',
        },
      ],
    },
  },
  schedule: {
    type: 'simpleSchedule',
    startDate: '01/08/2021',
  },
  status: 'PRODUCTION',
  tags: [],
  triggers: [],
  type: 'INTERACTIVE_API_FLOW',
  variants: [
    {
      ref: '2b83749d-629a-404d-8c71-84bdcc4254b7',
      name: 'Variant B',
      isControl: false,
      tasks: [
        {
          implementation: 'templateRenderTask',
          input: {
            inputType: 'templateRenderTaskInput',
            type: 'application/json',
            template: '{"variantId":"02fb730a14b34b9ca533cbff0f74d5dd_2b83749d629a404d8c7184bdcc4254b7"}',
          },
        },
      ],
    },
  ],
  subtype: 'EXPERIENCE',
  transpiledVariants: [],
  result: {
    processedAt: '2024-07-21T20:00:00Z',
    outcome: 'CONCLUSIVE',
  },
};
describe(ExperimentStatusNotificationComponent.name, () => {
  let sut: ExperimentStatusNotificationComponent;
  let fixture: ComponentFixture<ExperimentStatusNotificationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ExperimentStatusNotificationComponent],
      imports: [CommonModule, FormsModule, InlineNotificationModule, TranslateModule, TranslateServiceStubModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentStatusNotificationComponent);
    sut = fixture.componentInstance;
    sut.flowDefinition = { ...flowDefinition };
    sut.isPagePublished = true;
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('test status warning', () => {
    it('should display TEST_LIVE_WARNING when status is PRODUCTION and live page has all variants', () => {
      sut.flowDefinition = { ...flowDefinition, result: undefined };
      sut.isPagePublished = true;
      fixture.detectChanges();

      const notificationElement = fixture.debugElement.query(By.css('ng-spd-inline-notification'));
      expect(notificationElement.nativeElement.textContent).toContain('COMPONENT_TESTING.TEST_LIVE_WARNING');
    });

    it('should display PAGE_PUBLISH_PENDING_WARNING when status is PRODUCTION and live page does not have all variants', () => {
      sut.flowDefinition = { ...flowDefinition, result: undefined };
      sut.isPagePublished = false;
      fixture.detectChanges();

      const notificationElement = fixture.debugElement.query(By.css('ng-spd-inline-notification'));
      expect(notificationElement.nativeElement.textContent).toContain('COMPONENT_TESTING.PAGE_PUBLISH_PENDING_WARNING');
    });

    it('should not display any warning when status is DRAFT', () => {
      sut.flowDefinition = { ...flowDefinition, status: 'DRAFT' };
      fixture.detectChanges();

      const notificationElement = fixture.debugElement.query(By.css('ng-spd-inline-notification'));
      expect(notificationElement).toBeNull();
    });

    it('should display AB_TEST_STATISTICAL_SIGNIFICANCE_ACHIEVED when flowDefinition has result', () => {
      fixture.detectChanges();

      const notificationElement = fixture.debugElement.query(By.css('ng-spd-inline-notification'));
      expect(notificationElement.nativeElement.textContent).toContain(
        'COMPONENT_TESTING.AB_TEST_STATISTICAL_SIGNIFICANCE_ACHIEVED',
      );
    });
  });
});
