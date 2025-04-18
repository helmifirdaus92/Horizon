/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseHandle, DialogModule, InputLabelModule } from '@sitecore/ng-spd-lib';
import { BXComponentVariant } from 'app/pages/left-hand-side/personalization/personalization.types';
import { ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { DirectivesModule } from 'app/shared/directives/directives/directives.module';
import { DialogCloseHandleStubModule } from 'app/testing/dialog-close-handle-stub.module';
import { createSpyObserver, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { EndExperimentDialogComponent } from './end-experiment-dialog.component';

describe(EndExperimentDialogComponent.name, () => {
  let sut: EndExperimentDialogComponent;
  let fixture: ComponentFixture<EndExperimentDialogComponent>;
  let closeHandle: jasmine.SpyObj<DialogCloseHandle>;

  const closeBtn = (): HTMLButtonElement =>
    fixture.debugElement.query(By.css('ng-spd-dialog-close-button button')).nativeElement;

  const saveBtn = (): HTMLButtonElement =>
    fixture.debugElement.query(By.css('ng-spd-dialog-actions [ngspdbutton="primary"]')).nativeElement;

  const mockVariants: BXComponentVariant[] = [
    {
      ref: 'test',
      name: 'testVariant',
      isControl: false,
      tasks: [
        {
          implementation: 'templateRenderTask',
          input: {
            inputType: 'templateRenderTaskInput',
            type: 'application/json',
            template: '{"variantId":"' + 'testInstanceId_default' + '"}',
          },
        },
      ],
    },
    {
      ref: 'control',
      name: 'controlVariant',
      isControl: false,
      tasks: [
        {
          implementation: 'templateRenderTask',
          input: {
            inputType: 'templateRenderTaskInput',
            type: 'application/json',
            template: '{"variantId":"' + 'control_default' + '"}',
          },
        },
      ],
    },
  ];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EndExperimentDialogComponent],
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
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndExperimentDialogComponent);
    closeHandle = TestBedInjectSpy(DialogCloseHandle);

    sut = fixture.componentInstance;
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('Variant list', () => {
    it('should display the list of variants', () => {
      // Arrange
      sut.variants = mockVariants;
      fixture.detectChanges();

      const variantOptionsEl = fixture.debugElement.queryAll(By.css('.variant-option'));

      // Assert
      expect(variantOptionsEl.length).toBe(2);
      expect(variantOptionsEl[0].nativeElement.textContent).toContain('testVariant');
      expect(variantOptionsEl[1].nativeElement.textContent).toContain('controlVariant');
    });

    it('should not select any variant by default', () => {
      // Arrange
      sut.variants = mockVariants;
      fixture.detectChanges();

      const radioButtons = fixture.nativeElement.querySelectorAll('input[type="radio"]');
      const variant1Radio = radioButtons[0];
      const variant2Radio = radioButtons[1];

      // Assert
      expect(sut.selectedVariant).toBeUndefined();
      expect(variant1Radio.checked).toBeFalse();
      expect(variant2Radio.checked).toBeFalse();
    });

    it('should update selectedVariant when a radio button is clicked', () => {
      // Arrange
      sut.variants = mockVariants;
      fixture.detectChanges();

      const radioButtons = fixture.nativeElement.querySelectorAll('input[type="radio"]');
      const variant1Radio = radioButtons[0];
      const variant2Radio = radioButtons[1];

      // Act
      variant1Radio.click();
      fixture.detectChanges();

      // Assert
      expect(sut.selectedVariant).toEqual(sut.variants[0]);

      // Act
      variant2Radio.click();
      fixture.detectChanges();

      // Assert
      expect(sut.selectedVariant).toEqual(sut.variants[1]);
    });
  });

  describe('Dialog actions', () => {
    it('should close the dialog on "X" button click', () => {
      // Arrange
      closeBtn().click();
      fixture.detectChanges();

      // Assert
      expect(closeHandle.close).toHaveBeenCalled();
    });

    it('should close the dialog on "Escape" key press', () => {
      // Arrange
      const spy = spyOn(sut, 'close');
      const preventSpy = jasmine.createSpy();
      const event = { preventDefault: preventSpy, code: 'Escape' } as any;

      // Act
      sut.onKeydownHandler(event);

      // Assert
      expect(preventSpy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });

    it('should emit selected variant on save', () => {
      // Arrange
      sut.selectedVariant = mockVariants[0];
      const onSaveSpy = createSpyObserver();
      sut.onSave.subscribe(onSaveSpy);
      fixture.detectChanges();

      // Act
      saveBtn().click();

      // Assert
      expect(onSaveSpy.next).toHaveBeenCalledWith(mockVariants[0]);
    });

    it('should close the dialog on save', () => {
      // Act
      saveBtn().click();

      // Assert
      expect(closeHandle.close).toHaveBeenCalled();
    });

    it('should close dialog and complete onSave subscription on "Cancel" button click', () => {
      // Arrange
      const onSaveSpy = createSpyObserver();
      sut.onSave.subscribe(onSaveSpy);
      const cancelBtn = fixture.debugElement.query(By.css('ng-spd-dialog-actions [ngspdbutton="basic"]')).nativeElement;
      fixture.detectChanges();

      // Act
      cancelBtn.click();

      // Assert
      expect(closeHandle.close).toHaveBeenCalled();
      expect(onSaveSpy.complete).toHaveBeenCalled();
    });
  });

  it('should display the statistical significance note when statistical significance not reached', () => {
    // Arrange
    sut.isStatisticalSignificanceReached = false;
    fixture.detectChanges();

    const noteEl = fixture.debugElement.query(By.css('.statistical-significance-note'));

    // Assert
    expect(noteEl).toBeTruthy();
    expect(noteEl.nativeElement.textContent).toContain(
      'COMPONENT_TESTING.END_EXPERIMENT_DIALOG.STATISTICAL_SIGNIFICANCE_NOTE',
    );
  });

  it('should not display the statistical significance note when statistical significance reached', () => {
    // Arrange
    sut.isStatisticalSignificanceReached = true;
    fixture.detectChanges();

    const noteEl = fixture.debugElement.query(By.css('.statistical-significance-note'));

    // Assert
    expect(noteEl).toBeNull();
  });
});
