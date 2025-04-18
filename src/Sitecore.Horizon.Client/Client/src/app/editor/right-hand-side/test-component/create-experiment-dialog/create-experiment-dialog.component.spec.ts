/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseHandle, DialogModule, InputLabelModule } from '@sitecore/ng-spd-lib';
import { PersonalizationAPIService } from 'app/pages/left-hand-side/personalization/personalization-api/personalization.api.service';
import { BXComponentFlowDefinition } from 'app/pages/left-hand-side/personalization/personalization.types';
import { ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { DirectivesModule } from 'app/shared/directives/directives/directives.module';
import { ApiResponse } from 'app/shared/utils/utils';
import { DialogCloseHandleStubModule } from 'app/testing/dialog-close-handle-stub.module';
import { createSpyObserver, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { CreateExperimentDialogComponent } from './create-experiment-dialog.component';

describe(CreateExperimentDialogComponent.name, () => {
  let sut: CreateExperimentDialogComponent;
  let fixture: ComponentFixture<CreateExperimentDialogComponent>;
  let closeHandle: jasmine.SpyObj<DialogCloseHandle>;
  let personalizationAPIService: jasmine.SpyObj<PersonalizationAPIService>;

  const closeBtn = () => fixture.debugElement.query(By.css('ng-spd-dialog-close-button button'))?.nativeElement;
  const cancelBtn = () =>
    fixture.debugElement.query(By.css('ng-spd-dialog-actions button:nth-child(1)'))?.nativeElement;
  const createBtn = () =>
    fixture.debugElement.query(By.css('ng-spd-dialog-actions button:nth-child(2)'))?.nativeElement;
  const validationErrors = () => fixture.debugElement.query(By.css('.error-block'))?.nativeElement;
  const errorMessageEl = () =>
    fixture.debugElement.query(By.css('.error-block'))?.nativeElement?.innerText?.trim() || null;
  const experimentNameInputEl = () => fixture.debugElement.query(By.css('#experiment-name'))?.nativeElement;

  const detectChanges = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const personalizationComponentFlowDefinition: BXComponentFlowDefinition = {
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
      splits: [
        {
          ref: 'ctrl',
          split: 0.5,
        },
      ],
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
    variants: [{ ref: 'test', name: 'testVariant', isControl: false, tasks: [] }],
    subtype: 'EXPERIENCE',
    transpiledVariants: [],
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CreateExperimentDialogComponent],
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
      ],
      providers: [
        {
          provide: DialogCloseHandle,
          useValue: jasmine.createSpyObj<DialogCloseHandle>('DialogCloseHandle', ['close']),
        },
        {
          provide: PersonalizationAPIService,
          useValue: jasmine.createSpyObj<PersonalizationAPIService>('PersonalizationAPIService', [
            'createComponentFlowDefinition',
          ]),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateExperimentDialogComponent);
    closeHandle = TestBedInjectSpy(DialogCloseHandle);
    personalizationAPIService = TestBedInjectSpy(PersonalizationAPIService);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('Close dialog', () => {
    it('should close the dialog on "X" button click', () => {
      // Аct
      closeBtn().click();
      fixture.detectChanges();

      // Аssert
      expect(closeHandle.close).toHaveBeenCalled();
    });

    it('should close the dialog when press "Escape"', () => {
      // Аrrange
      const spy = spyOn(sut, 'close');
      const preventSpy = jasmine.createSpy();
      const event = { preventDefault: preventSpy, code: 'Escape' } as any;

      // Аct
      sut.onKeydownHandler(event);

      // Аssert
      expect(preventSpy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });

    it('should close the dialog when `Cancel` button is clicked', () => {
      cancelBtn().click();

      expect(closeHandle.close).toHaveBeenCalled();
    });
  });

  describe('Experiment name validation', () => {
    it('should show error block if experiment name field is invalid', () => {
      // Arrange
      experimentNameInputEl().value = '';

      // Act
      experimentNameInputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Assert
      expect(validationErrors()).toBeDefined();
    });

    it('should show error and disable create button if name is already in use', async () => {
      // Arrange
      sut.existingNamesPromise = new Promise((resolve) => resolve(['test01']));
      await detectChanges();

      // Act
      experimentNameInputEl().value = 'test01';
      experimentNameInputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Assert
      expect(createBtn().disabled).toBeTruthy();
      expect(errorMessageEl()).toBe('VALIDATION.VALIDATE_NAME.ALREADY_USED');
    });

    it('should show error and disable create button if name has invalid character', async () => {
      // Act
      experimentNameInputEl().value = 'value!value';
      experimentNameInputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Assert
      expect(createBtn().disabled).toBeTruthy();
      expect(errorMessageEl()).toBe('VALIDATION.VALIDATE_NAME.NOT_ALLOWED_CHARACTER');
    });

    it('should show error block and disable create button if name field is empty', () => {
      // Arrange
      experimentNameInputEl().value = '';

      // Act
      experimentNameInputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Assert
      expect(createBtn().disabled).toBeTruthy();
      expect(errorMessageEl()).toBe('VALIDATION.VALIDATE_NAME.EMPTY');
    });
  });

  describe('Create experiment', async () => {
    const mockSuccessCreateResult: ApiResponse<BXComponentFlowDefinition> = {
      apiIsBroken: false,
      data: personalizationComponentFlowDefinition,
      httpStatus: 200,
      requestIsInvalid: false,
    };

    const mockFailureCreateResult: ApiResponse<BXComponentFlowDefinition> = {
      apiIsBroken: true,
      data: null,
      httpStatus: 409,
      requestIsInvalid: true,
    };

    it('should emit onCreate with result data when validation passed', async () => {
      // Arrange
      personalizationAPIService.createComponentFlowDefinition.and.returnValue(Promise.resolve(mockSuccessCreateResult));
      const onCreateSpy = createSpyObserver();
      sut.onCreate.subscribe(onCreateSpy);
      await detectChanges();

      // Act
      await sut.createExperiment();

      // Assert
      expect(personalizationAPIService.createComponentFlowDefinition).toHaveBeenCalled();
      expect(onCreateSpy.next).toHaveBeenCalledWith(mockSuccessCreateResult.data);
      expect(onCreateSpy.complete).toHaveBeenCalled();
      expect(closeHandle.close).toHaveBeenCalled();
      expect(sut.apiErrorMessage).toBe(null);
    });

    it('should fail with validation status 409', async () => {
      // Arrange
      personalizationAPIService.createComponentFlowDefinition.and.returnValue(Promise.resolve(mockFailureCreateResult));
      sut.existingNamesPromise = new Promise((resolve) => resolve(['test01']));
      await detectChanges();

      // Act
      await sut.createExperiment();

      // Assert
      expect(mockFailureCreateResult.httpStatus).toBe(409);
      expect(sut.apiErrorMessage).toBe('COMPONENT_TESTING.CREATE_EXPERIMENT_DIALOG.NAME_ALREADY_EXISTS_ERROR');
    });
  });
});
