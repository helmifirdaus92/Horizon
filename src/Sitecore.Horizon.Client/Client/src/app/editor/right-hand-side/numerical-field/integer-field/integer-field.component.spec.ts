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
import { IntegerFieldComponent, INT_MAX_VALUE, INT_MIN_VALUE } from './integer-field.component';

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

describe(IntegerFieldComponent.name, () => {
  let sut: IntegerFieldComponent;
  let fixture: ComponentFixture<IntegerFieldComponent>;
  let de: DebugElement;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TranslateModule, TranslateServiceStubModule],
        declarations: [IntegerFieldComponent, NumericalFieldTestingComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(IntegerFieldComponent);
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
    expect(placeholder).toBe('EDITOR.INTEGER.VALUE_PLACEHOLDER');
  });

  describe('fieldValidator.isValidInput()', () => {
    it('should accept empty string as valid value', () => {
      expect(sut.fieldValidator.isValidInput('')).toBeTrue();
    });

    it('should accept valid integer number', () => {
      expect(sut.fieldValidator.isValidInput(INT_MAX_VALUE.toString())).toBeTrue();
      expect(sut.fieldValidator.isValidInput(INT_MIN_VALUE.toString())).toBeTrue();
    });

    it('should not accept non integer number', () => {
      expect(sut.fieldValidator.isValidInput('123.456')).toBeFalse();
    });

    it('should not accept integer bigger than 32 bit max integer number', () => {
      const value = (INT_MAX_VALUE + 1).toString();
      expect(sut.fieldValidator.isValidInput(value)).toBeFalse();
    });

    it('should not accept integer smaller than 32 bit smallest integer number', () => {
      const value = (INT_MIN_VALUE - 1).toString();
      expect(sut.fieldValidator.isValidInput(value)).toBeFalse();
    });

    it('should not accept not a number value', () => {
      expect(sut.fieldValidator.isValidInput('abc123')).toBeFalse();
    });
  });
});
