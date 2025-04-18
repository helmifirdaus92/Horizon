/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, DebugElement, Input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { FieldChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { RhsEditorMessaging } from '../../rhs-editor-messaging';
import { NumericFieldInputValidator } from '../numerical-field.component';
import { NumberFieldComponent } from './number-field.component';

@Component({
  selector: 'app-numerical-field',
  template: '<input type="text" [placeholder]="placeholderText">',
})
class NumericalFieldTestingComponent {
  @Input() placeholderText?: string;
  @Input() chrome?: FieldChromeInfo;
  @Input() rhsMessaging?: RhsEditorMessaging;
  @Input() fieldValidator?: NumericFieldInputValidator;
}

describe(NumberFieldComponent.name, () => {
  let sut: NumberFieldComponent;
  let fixture: ComponentFixture<NumberFieldComponent>;
  let de: DebugElement;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TranslateModule, TranslateServiceStubModule],
        declarations: [NumberFieldComponent, NumericalFieldTestingComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(NumberFieldComponent);
      de = fixture.debugElement;
      sut = fixture.componentInstance;

      sut.rhsMessaging = undefined;
      sut.chrome = undefined;

      fixture.detectChanges();
    }),
  );

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should pass placeholder text to child input component', () => {
    const placeholder = (de.query(By.css('input')).nativeElement as HTMLInputElement).getAttribute('placeholder');
    expect(placeholder).toBe('EDITOR.NUMBER.VALUE_PLACEHOLDER');
  });

  describe('fieldValidator.isValidInput()', () => {
    it('input is empty string', () => {
      expect(sut.fieldValidator.isValidInput('')).toBeTrue();
    });

    it('should accept a number', () => {
      expect(sut.fieldValidator.isValidInput(Number.MAX_VALUE.toString())).toBeTrue();
      expect(sut.fieldValidator.isValidInput((-Number.MAX_VALUE).toString())).toBeTrue();
    });

    it('should not accept a number bigger than a number max value', () => {
      const value = '1.8e+308'.toString();
      expect(sut.fieldValidator.isValidInput(value)).toBeFalse();
    });

    it('should not accept a number smaller than a number min negative value', () => {
      const value = '-1.8e+308'.toString();
      expect(sut.fieldValidator.isValidInput(value)).toBeFalse();
    });

    it('should not accept not a number', () => {
      expect(sut.fieldValidator.isValidInput('abc123')).toBeFalse();
    });
  });
});
