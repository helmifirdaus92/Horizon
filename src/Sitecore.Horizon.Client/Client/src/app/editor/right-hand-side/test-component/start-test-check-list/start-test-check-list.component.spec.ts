/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { PersonalizationLayoutService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.layout.service';
import {
  BXComponentGoals,
  BXComponentVariant,
  BXSampleSizeConfig,
} from 'app/pages/left-hand-side/personalization/personalization.types';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { AbTestInfo } from '../../editor-rhs.component';
import { getAbTestInfo } from '../ab-test-component.utils';
import { StartTestCheckListComponent } from './start-test-check-list.component';

@Component({
  template: `<app-start-test-check-list
    [abTest]="abTest"
    (closePopover)="closePopover.emit()"
    (goToConfiguration)="goToConfiguration.emit()"
    (startTest)="startTest.emit()"
  ></app-start-test-check-list>`,
})
class TestComponent {
  @Input() abTest: AbTestInfo;

  @Output() closePopover = new EventEmitter<unknown>();
  @Output() goToConfiguration = new EventEmitter<unknown>();
  @Output() startTest = new EventEmitter<unknown>();
}

describe(StartTestCheckListComponent.name, () => {
  let sut: StartTestCheckListComponent;
  let testComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let personalizationLayoutServiceSpy: jasmine.SpyObj<PersonalizationLayoutService>;

  const infoTextEls = () => fixture.debugElement.queryAll(By.css('.list p'));
  const detectChanges = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StartTestCheckListComponent, TestComponent],
      imports: [CommonModule, FormsModule, TranslateModule, TranslateServiceStubModule],
      providers: [
        {
          provide: PersonalizationLayoutService,
          useValue: jasmine.createSpyObj<PersonalizationLayoutService>('PersonalizationLayoutService', [
            'isVariantUsedInAnyRule',
          ]),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    personalizationLayoutServiceSpy = TestBedInjectSpy(PersonalizationLayoutService);
    personalizationLayoutServiceSpy.isVariantUsedInAnyRule.and.returnValue(Promise.resolve(false));

    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;

    sut = fixture.debugElement.query(By.directive(StartTestCheckListComponent)).componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('[ngOnChanges] when abTest changes', () => {
    describe('[variantsLengthIsValid] rule', () => {
      it('should be false when there are less than 2 variants', () => {
        // Arrange
        const variants: BXComponentVariant[] = [{ ref: 'control', name: 'control', isControl: true, tasks: [] }];

        // Act
        testComponent.abTest = getAbTestInfo(variants);
        fixture.detectChanges();

        // Assert
        expect(sut.variantsLengthIsValid).toBeFalse();
      });

      it('should be true when there are at least 2 variants', () => {
        // Arrange
        const variants: BXComponentVariant[] = [
          { ref: 'test', name: 'testVariant', isControl: false, tasks: [] },
          { ref: 'control', name: 'control', isControl: true, tasks: [] },
        ];

        // Act
        testComponent.abTest = getAbTestInfo(variants);
        fixture.detectChanges();

        // Assert
        expect(sut.variantsLengthIsValid).toBeTrue();
      });

      it('should show the correct info text when invalid', () => {
        // Arrange
        const variants: BXComponentVariant[] = [{ ref: 'control', name: 'control', isControl: true, tasks: [] }];

        // Act
        testComponent.abTest = getAbTestInfo(variants);
        fixture.detectChanges();

        const textEl = infoTextEls()[0].nativeElement;

        // Assert
        expect(textEl.textContent).toContain('COMPONENT_TESTING.START.VARIANTS_LENGTH');
      });

      it('should emit closePopover on text element click', () => {
        // Arrange
        const variants: BXComponentVariant[] = [{ ref: 'control', name: 'control', isControl: true, tasks: [] }];
        spyOn(testComponent.closePopover, 'emit');

        // Act
        testComponent.abTest = getAbTestInfo(variants);
        fixture.detectChanges();

        const textEl = infoTextEls()[0].nativeElement;
        textEl.click();

        // Assert
        expect(testComponent.closePopover.emit).toHaveBeenCalled();
      });
    });

    describe('[variantsArePopulated] rule', () => {
      it('should be true if variant id is not defined', () => {
        // Arrange
        const variants: BXComponentVariant[] = [{ ref: 'test', name: 'testVariant', isControl: false, tasks: [] }];

        // Act
        testComponent.abTest = getAbTestInfo(variants);
        fixture.detectChanges();

        // Assert
        expect(sut.variantsArePopulated).toBeTrue();
      });

      it('should be true if variant is a control variant', () => {
        // Arrange
        const variants: BXComponentVariant[] = [{ ref: 'test', name: 'testVariant', isControl: true, tasks: [] }];

        // Act
        testComponent.abTest = getAbTestInfo(variants);
        fixture.detectChanges();

        // Assert
        expect(sut.variantsArePopulated).toBeTrue();
      });

      it('should be true if variantId is define, variant is not control variant and is used in any rule', async () => {
        // Arrange
        testComponent.abTest = getAbTestInfo();
        personalizationLayoutServiceSpy.isVariantUsedInAnyRule.and.returnValue(Promise.resolve(true));

        // Act
        await detectChanges();

        // Assert
        expect(sut.variantsArePopulated).toBeTrue();
      });

      it('should be false if variantId is define, variant is not control variant and is not used in any rule', async () => {
        // Arrange
        testComponent.abTest = getAbTestInfo();
        personalizationLayoutServiceSpy.isVariantUsedInAnyRule.and.returnValue(Promise.resolve(false));

        // Act
        await detectChanges();

        // Assert
        expect(sut.variantsArePopulated).toBeFalse();
      });

      it('should show the correct info text when invalid', async () => {
        // Arrange
        testComponent.abTest = getAbTestInfo();
        personalizationLayoutServiceSpy.isVariantUsedInAnyRule.and.returnValue(Promise.resolve(false));

        // Act
        await detectChanges();

        const textEl = infoTextEls()[1].nativeElement;

        // Assert
        expect(textEl.textContent).toContain('COMPONENT_TESTING.START.POPULATED_VARIANTS');
      });

      it('should emit closePopover on text element click', async () => {
        // Arrange
        testComponent.abTest = getAbTestInfo();
        personalizationLayoutServiceSpy.isVariantUsedInAnyRule.and.returnValue(Promise.resolve(false));
        spyOn(testComponent.closePopover, 'emit');

        // Act
        await detectChanges();

        const textEl = infoTextEls()[1].nativeElement;
        textEl.click();

        // Assert
        expect(testComponent.closePopover.emit).toHaveBeenCalled();
      });
    });

    describe('[trafficAllocationIsValid] rule', () => {
      it('should be false when splits are invalid', () => {
        // Act
        testComponent.abTest = getAbTestInfo();
        fixture.detectChanges();

        // Assert
        expect(sut.trafficAllocationIsValid).toBeFalse();
      });

      it('should show the correct info text when invalid', async () => {
        // Act
        testComponent.abTest = getAbTestInfo();
        await detectChanges();

        const textEl = infoTextEls()[2].nativeElement;

        // Assert
        expect(textEl.textContent).toContain('COMPONENT_TESTING.START.TRAFFIC_IS_VALID');
      });

      it('should emit goToConfiguration on text element click', async () => {
        // Arrange
        spyOn(testComponent.goToConfiguration, 'emit');

        // Act
        testComponent.abTest = getAbTestInfo();
        await detectChanges();

        const textEl = infoTextEls()[2].nativeElement;
        textEl.click();

        // Assert
        expect(testComponent.goToConfiguration.emit).toHaveBeenCalled();
      });

      it('should be true when splits are valid', () => {
        // Arrange
        const traffic: any = {
          type: 'simpleTraffic',
          weightingAlgorithm: 'USER_DEFINED',
          modifiedAt: undefined,
          allocation: 100,
          splits: [{ ref: 'control', split: 100 }],
          coupled: false,
        };

        // Act
        testComponent.abTest = getAbTestInfo(undefined, traffic);
        fixture.detectChanges();

        // Assert
        expect(sut.trafficAllocationIsValid).toBeTrue();
      });
    });

    describe('[targetPagesLengthIsValid] rule', () => {
      it('should be false when there are no target pages', async () => {
        // Act
        testComponent.abTest = getAbTestInfo();
        await detectChanges();

        // Assert
        expect(sut.targetPagesLengthIsValid).toBeFalse();
      });

      it('should show the correct info text when invalid', async () => {
        // Act
        testComponent.abTest = getAbTestInfo();
        await detectChanges();

        const textEl = infoTextEls()[3].nativeElement;

        // Assert
        expect(textEl.textContent).toContain('COMPONENT_TESTING.START.GOALS_ARE_VALID');
      });

      it('should emit goToConfiguration on text element click', async () => {
        // Arrange
        spyOn(testComponent.goToConfiguration, 'emit');

        // Act
        testComponent.abTest = getAbTestInfo();
        await detectChanges();

        const textEl = infoTextEls()[3].nativeElement;
        textEl.click();

        // Assert
        expect(testComponent.goToConfiguration.emit).toHaveBeenCalled();
      });

      it('should be true when there is at least 1 target page', () => {
        // Arrange
        const goals: BXComponentGoals = {
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
        };

        // Act
        testComponent.abTest = getAbTestInfo(undefined, undefined, goals);
        fixture.detectChanges();

        // Assert
        expect(sut.targetPagesLengthIsValid).toBeTrue();
      });
    });

    describe('[sampleSizeConfigIsValid] rule', () => {
      it('should be false when sample size config is invalid', async () => {
        // Act
        testComponent.abTest = getAbTestInfo();
        await detectChanges();

        // Assert
        expect(sut.sampleSizeConfigIsValid).toBeFalse();
      });

      it('should show the correct info text when invalid', async () => {
        // Act
        testComponent.abTest = getAbTestInfo();
        await detectChanges();

        const textEl = infoTextEls()[4].nativeElement;

        // Assert
        expect(textEl.textContent).toContain('COMPONENT_TESTING.START.SAMPLE_SIZE_CONFIG_IS_VALID');
      });

      it('should emit goToConfiguration on text element click', async () => {
        // Arrange
        spyOn(testComponent.goToConfiguration, 'emit');

        // Act
        testComponent.abTest = getAbTestInfo();
        await detectChanges();

        const textEl = infoTextEls()[4].nativeElement;
        textEl.click();

        // Assert
        expect(testComponent.goToConfiguration.emit).toHaveBeenCalled();
      });

      it('should be true when sample size config is valid', () => {
        // Arrange
        const sampleSizeConfig: BXSampleSizeConfig = {
          baseValue: 0.15,
          minimumDetectableDifference: 0.02,
          confidenceLevel: 0.95,
        };

        // Act
        testComponent.abTest = getAbTestInfo(undefined, undefined, undefined, sampleSizeConfig);
        fixture.detectChanges();

        // Assert
        expect(sut.sampleSizeConfigIsValid).toBeTrue();
      });

      it('should be false if traffic allocation is greater than 100', () => {
        // Arrange
        const sampleSizeConfig: BXSampleSizeConfig = {
          baseValue: 0.15,
          minimumDetectableDifference: 0.02,
          confidenceLevel: 0.95,
        };

        const traffic: any = {
          type: 'simpleTraffic',
          weightingAlgorithm: 'USER_DEFINED',
          modifiedAt: undefined,
          allocation: 150,
          splits: [{ ref: 'control', split: 99 }],
          coupled: false,
        };

        // Act
        testComponent.abTest = getAbTestInfo(undefined, traffic, undefined, sampleSizeConfig);
        fixture.detectChanges();

        // Assert
        expect(sut.sampleSizeConfigIsValid).toBeFalse();
      });

      it('should be true if traffic allocation is less than 100', () => {
        // Arrange
        const sampleSizeConfig = {} as any;

        const traffic: any = {
          type: 'simpleTraffic',
          weightingAlgorithm: 'USER_DEFINED',
          modifiedAt: undefined,
          allocation: 99,
          splits: [{ ref: 'control', split: 99 }],
          coupled: false,
        };

        // Act
        testComponent.abTest = getAbTestInfo(undefined, traffic, undefined, sampleSizeConfig);
        fixture.detectChanges();

        // Assert
        expect(sut.sampleSizeConfigIsValid).toBeTrue();
      });
    });

    describe('[configurationIsValid] rule', () => {
      it('should render correct template when all rules are valid', async () => {
        // Arrange
        const variants: BXComponentVariant[] = [
          { ref: 'test', name: 'testVariant', isControl: false, tasks: [] },
          { ref: 'control', name: 'control', isControl: true, tasks: [] },
        ];

        const sampleSizeConfig: BXSampleSizeConfig = {
          baseValue: 0.15,
          minimumDetectableDifference: 0.02,
          confidenceLevel: 0.95,
        };

        const traffic: any = {
          type: 'simpleTraffic',
          weightingAlgorithm: 'USER_DEFINED',
          modifiedAt: undefined,
          allocation: 100,
          splits: [{ ref: 'control', split: 100 }],
          coupled: false,
        };

        const goals: BXComponentGoals = {
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
        };

        // Act
        testComponent.abTest = getAbTestInfo(variants, traffic, goals, sampleSizeConfig);
        await detectChanges();

        const headerTextEl = fixture.debugElement.query(By.css('h3')).nativeElement;
        const descriptionTextEl = fixture.debugElement.query(By.css('p')).nativeElement;

        // Assert
        expect(sut.configurationIsValid).toBeTrue();
        expect(headerTextEl.textContent).toContain('COMPONENT_TESTING.START.TITLE');
        expect(descriptionTextEl.textContent).toContain('COMPONENT_TESTING.START.DESCRIPTION');
      });
    });
  });
});
