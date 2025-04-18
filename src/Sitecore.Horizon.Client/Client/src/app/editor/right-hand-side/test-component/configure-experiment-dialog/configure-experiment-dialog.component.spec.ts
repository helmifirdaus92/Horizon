/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import {
  AccordionModule,
  DialogCloseHandle,
  DialogModule,
  IconButtonModule,
  InputLabelModule,
} from '@sitecore/ng-spd-lib';
import {
  BXComponentFlowDefinition,
  BXComponentVariant,
  BXSampleSizeConfig,
} from 'app/pages/left-hand-side/personalization/personalization.types';
import { ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { DirectivesModule } from 'app/shared/directives/directives/directives.module';
import { DialogCloseHandleStubModule } from 'app/testing/dialog-close-handle-stub.module';
import { TestBedInjectSpy, createSpyObserver } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { getFlowDefinition } from '../ab-test-component.utils';
import { ConfigureExperimentDialogComponent } from './configure-experiment-dialog.component';

describe(ConfigureExperimentDialogComponent.name, () => {
  let sut: ConfigureExperimentDialogComponent;
  let fixture: ComponentFixture<ConfigureExperimentDialogComponent>;
  let closeHandle: jasmine.SpyObj<DialogCloseHandle>;
  let de: DebugElement;

  const closeBtn = () => de.query(By.css('ng-spd-dialog-close-button button')).nativeElement;
  const saveBtn = () => de.query(By.css('ng-spd-dialog-actions [ngspdbutton="primary"]')).nativeElement;
  const inputEls = () => de.queryAll(By.css('input'));
  const emptyNameError = () => de.query(By.css('.error-block p'));

  const detectChanges = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const mockTraffic: any = {
    type: 'simpleTraffic',
    weightingAlgorithm: 'USER_DEFINED',
    modifiedAt: undefined,
    allocation: 100,
    splits: [{ ref: 'control', split: 100 }],
    coupled: false,
  };

  const mockVariants: BXComponentVariant[] = [{ ref: 'test', name: 'testVariant', isControl: false, tasks: [] }];
  const mockPageParameters = [{ matchCondition: 'Equals', parameterString: '' }] as any;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigureExperimentDialogComponent],
      imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        TranslateServiceStubModule,
        DialogCloseHandleStubModule,
        DialogModule,
        DirectivesModule,
        InputLabelModule,
        ContextServiceTestingModule,
        IconButtonModule,
        AccordionModule,
      ],
      providers: [
        {
          provide: DialogCloseHandle,
          useValue: jasmine.createSpyObj<DialogCloseHandle>('DialogCloseHandle', ['close']),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(waitForAsync(async () => {
    closeHandle = TestBedInjectSpy(DialogCloseHandle);
    fixture = TestBed.createComponent(ConfigureExperimentDialogComponent);
    de = fixture.debugElement;

    sut = fixture.componentInstance;

    sut.flowDefinition = getFlowDefinition();
    sut.isFormInValid = () => false;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('Test name input', () => {
    it('should display the test name input', () => {
      const testNameInput = inputEls()[0];

      expect(testNameInput.nativeElement.value).toContain('cph test');
    });

    it('should show an error message when the test name is empty', () => {
      // Arrange
      const testNameInput = inputEls()[0].nativeElement;

      // Act
      testNameInput.value = '';
      testNameInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Assert
      expect(emptyNameError).toBeTruthy();
      expect(emptyNameError().nativeElement.textContent).toContain('VALIDATION.VALIDATE_NAME.EMPTY');
    });

    it('should show error if test name is not in valid format', () => {
      // Arrange
      const testNameInput = inputEls()[0].nativeElement;

      // Act
      testNameInput.value = 'testName@';
      testNameInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Assert
      expect(emptyNameError).toBeTruthy();
      expect(emptyNameError().nativeElement.textContent).toContain('VALIDATION.VALIDATE_NAME.NOT_ALLOWED_CHARACTER');
    });

    it('should show error if test name already exists', async () => {
      // Arrange
      sut.existingNames = Promise.resolve(['cph test']);
      await detectChanges();

      // Act
      const testNameInput = inputEls()[0];
      testNameInput.nativeElement.value = 'cph test';
      testNameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Assert
      expect(emptyNameError).toBeTruthy();
      expect(emptyNameError().nativeElement.textContent).toContain('VALIDATION.VALIDATE_NAME.ALREADY_USED');
    });

    it('should disable the save button if the test name is not valid', () => {
      // Arrange
      sut.isFormInValid = () => true;
      fixture.detectChanges();

      // Assert
      expect(saveBtn().disabled).toBeTruthy();
    });
  });

  describe('Assign traffic', () => {
    it('should set [splitsAreInvalidStatic] based on splits allocation ', () => {
      // When splits are invalid
      sut.flowDefinition = getFlowDefinition({ ...mockTraffic, splits: [{ ref: 'control', split: 50 }] });
      fixture.detectChanges();

      expect(sut.splitsAreInvalidStatic).toBeTrue();

      // When splits are valid
      sut.flowDefinition = getFlowDefinition({
        ...mockTraffic,
        splits: [
          { ref: 'control', split: 50 },
          { ref: 'variant', split: 50 },
        ],
      });
      fixture.detectChanges();

      expect(sut.splitsAreInvalidStatic).toBeFalse();
    });

    it('should show an error message when the splits are invalid', () => {
      // Arrange
      sut.flowDefinition = getFlowDefinition({ ...mockTraffic, splits: [{ ref: 'control', split: 50 }] });
      fixture.detectChanges();

      const splitsErrorEl = fixture.debugElement.query(By.css('.splits-error')).nativeElement;

      // Assert
      expect(splitsErrorEl.textContent).toEqual(' COMPONENT_TESTING.CONFIGURE.SPLITS_ERROR ');
    });

    it('should distribute the splits evently among variants on distrubute button click', async () => {
      const testVariants: BXComponentVariant[] = [
        { ref: 'test', name: 'testVariant', isControl: false, tasks: [] },
        { ref: 'control', name: 'control', isControl: true, tasks: [] },
      ];

      // Arrange
      sut.flowDefinition = getFlowDefinition(
        {
          ...mockTraffic,
          splits: [
            { ref: 'control', split: 50 },
            { ref: 'variant', split: 40 },
          ],
        },
        testVariants,
      );
      fixture.detectChanges();

      // Act
      const distributeBtn = fixture.debugElement.query(
        By.css('.evenly-distribute [ngspdbutton="outline"]'),
      ).nativeElement;
      distributeBtn.click();
      await detectChanges();

      const splitsFieldInputs = fixture.debugElement.queryAll(By.css('.splits-input'));

      // Assert
      expect(splitsFieldInputs[0].nativeElement.value).toEqual('50');
      expect(splitsFieldInputs[1].nativeElement.value).toEqual('50');
    });
  });

  describe('Advanced options', () => {
    it('should set [sampleSizeConfigIsInvalidStatic] based on sample size config', () => {
      // When sample size config is valid
      const mockSampleSizeConfig: BXSampleSizeConfig = {
        baseValue: 0.05,
        minimumDetectableDifference: 0.02,
        confidenceLevel: 0.95,
      };
      sut.flowDefinition = getFlowDefinition(mockTraffic, mockVariants, mockPageParameters, mockSampleSizeConfig);
      fixture.detectChanges();

      expect(sut.sampleSizeConfigIsInvalidStatic).toBeFalse();

      // When sample size config is Invalid
      const testSampleSizeConfig = {
        baseValue: 0.002,
        minimumDetectableDifference: 0.02,
        confidenceLevel: 0.95,
      };
      sut.flowDefinition = getFlowDefinition(mockTraffic, mockVariants, mockPageParameters, testSampleSizeConfig);
      fixture.detectChanges();

      expect(sut.sampleSizeConfigIsInvalidStatic).toBeTrue();
    });

    it('should set [sampleSizeConfigIsInvalidStatic] to true if sample size config is valid but traffic allocation is invalid', () => {
      // Arrange
      sut.flowDefinition = getFlowDefinition({ ...mockTraffic, allocation: 150 });
      fixture.detectChanges();

      // Assert
      expect(sut.sampleSizeConfigIsInvalidStatic).toBeTrue();
    });

    it('should show advance options information in accordion header when sample size config is valid', () => {
      const mockSampleSizeConfig: BXSampleSizeConfig = {
        baseValue: 0.05,
        minimumDetectableDifference: 0.02,
        confidenceLevel: 0.95,
      };
      sut.flowDefinition = getFlowDefinition(mockTraffic, mockVariants, mockPageParameters, mockSampleSizeConfig);
      fixture.detectChanges();

      const informationsEls = fixture.debugElement.queryAll(By.css('.advance-options .header-options-info p'));

      expect(informationsEls[0].nativeElement.textContent).toContain(
        ' COMPONENT_TESTING.CONFIGURE.ADVANCED_OPTIONS.TRAFFIC_ALLOCATION: 100, ',
      );
      expect(informationsEls[1].nativeElement.textContent).toContain(
        ' COMPONENT_TESTING.CONFIGURE.ADVANCED_OPTIONS.BASE_RATE: 5,',
      );
      expect(informationsEls[2].nativeElement.textContent).toContain(
        ' COMPONENT_TESTING.CONFIGURE.ADVANCED_OPTIONS.DIFFERENCE: 2,',
      );
      expect(informationsEls[3].nativeElement.textContent).toContain(
        ' COMPONENT_TESTING.CONFIGURE.ADVANCED_OPTIONS.CONFIDENCE: 95, ',
      );
      expect(informationsEls[4].nativeElement.textContent).toContain(
        'COMPONENT_TESTING.CONFIGURE.ADVANCED_OPTIONS.TOTAL',
      );
    });

    describe('resetSampleSize()', () => {
      it('should reset base rate, minimum dectable difference, confidence level on reset button click', async () => {
        const advanceOptionsInputs = fixture.debugElement.queryAll(By.css('.advance-options input'));

        // Case 1: Change the value of base rate input
        const baseRateInput = advanceOptionsInputs[1].nativeElement;
        baseRateInput.value = '7';
        baseRateInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        const resetBtn = fixture.debugElement.query(By.css('.advance-options .reset-config')).nativeElement;
        resetBtn.click();
        await detectChanges();

        expect(baseRateInput.value).toEqual('2');

        // Case 2: Change the value of minimum detectable difference input
        const minimumDetectableDifferenceInput = advanceOptionsInputs[2].nativeElement;
        minimumDetectableDifferenceInput.value = '25';
        minimumDetectableDifferenceInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        resetBtn.click();
        await detectChanges();

        expect(minimumDetectableDifferenceInput.value).toEqual('20');

        // Case 3: Change the value of confidence level input
        const confidenceLevelInput = advanceOptionsInputs[3].nativeElement;
        confidenceLevelInput.value = '99';
        confidenceLevelInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        resetBtn.click();
        await detectChanges();

        expect(confidenceLevelInput.value).toEqual('95');
      });
    });
  });

  describe('Dialog actions', () => {
    it('should emit onSelect with status Canceled and close dialog on cancel', () => {
      // Arrange
      const onSelectSpy = createSpyObserver();
      sut.onSelect.subscribe(onSelectSpy);
      fixture.detectChanges();

      // Act
      closeBtn().click();

      // Assert
      expect(onSelectSpy.next).toHaveBeenCalledWith({ status: 'Canceled' });
      expect(closeHandle.close).toHaveBeenCalled();
      expect(onSelectSpy.complete).toHaveBeenCalled();
    });

    it('should emit onSelect with status `OK` and `flowDefinition` on submit click if form is valid', () => {
      // Arrange
      sut.isFormInValid = () => false;
      const onSelectSpy = createSpyObserver();
      sut.onSelect.subscribe(onSelectSpy);
      fixture.detectChanges();

      // Act
      saveBtn().click();

      // Assert
      expect(onSelectSpy.next).toHaveBeenCalledOnceWith({ status: 'OK', flowDefinition: sut.internalFlowDefinition });
      expect(onSelectSpy.complete).toHaveBeenCalled();
      expect(closeHandle.close).toHaveBeenCalled();
    });

    it('should make sampleSize undefined in SampleSizeConfig on saving changes', () => {
      // Arrange
      sut.isFormInValid = () => false;
      const onSelectSpy = createSpyObserver();
      sut.onSelect.subscribe(onSelectSpy);
      fixture.detectChanges();

      // Act
      sut.internalFlowDefinition.sampleSizeConfig.baseValue = 0.1;
      sut.internalFlowDefinition.sampleSizeConfig.sampleSize = 888888;
      saveBtn().click();

      // Assert
      const flowToSave = onSelectSpy.next.calls.mostRecent().args[0].flowDefinition as BXComponentFlowDefinition;
      expect(flowToSave.sampleSizeConfig.baseValue).toBe(0.1);
      expect(flowToSave.sampleSizeConfig.sampleSize).toBeUndefined();
    });
  });

  describe('ConfigureExperimentDialogComponent - On Completion Options', () => {
    it('should display the correct header for the on completion accordion', () => {
      const accordionHeader = fixture.nativeElement.querySelector('.on-completion .header-text');
      expect(accordionHeader.textContent).toContain('COMPONENT_TESTING.CONFIGURE.ON_COMPLETION.LABEL');
    });

    it('should display the correct options info when accordion is closed', () => {
      fixture.detectChanges();
      const optionsInfo = fixture.nativeElement.querySelector('.on-completion .completion-header p');
      expect(optionsInfo.textContent).toContain('COMPONENT_TESTING.CONFIGURE.ON_COMPLETION.IF_WINNING_VARIANT');
      expect(optionsInfo.textContent).toContain('COMPONENT_TESTING.CONFIGURE.ON_COMPLETION.IF_TEST_INCONCLUSIVE');
    });

    it('should correctly bind the selected value for conclusive action droplist', () => {
      const testValue = 'SET_TRAFFIC_TO_WINNING_VARIANT';
      sut.setPostTestActionConclusive(testValue);
      expect(sut.internalFlowDefinition.postTestAction?.conclusive).toBe(testValue);
    });

    it('should correctly bind the selected value for inconclusive action droplist', () => {
      const testValue = 'KEEP_RUNNING_TEST';
      sut.setPostTestActionInconclusive(testValue);
      expect(sut.internalFlowDefinition.postTestAction?.inconclusive).toBe(testValue);
    });
  });
});
