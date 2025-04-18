/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { PersonalizationVariant } from '../personalization.types';
import { VariantNameValidatorDirective } from './validate-variant-name.directive';

@Component({
  selector: 'test-drop',
  template: `
    <input #variantNameValidator="ngModel" type="text" [appValidateVariantName]="variants" [(ngModel)]="textValue" />

    <div class="error-block">
      <p *ngIf="variantNameValidator.errors?.isAlreadyUsed">isAlreadyUsed</p>
      <p *ngIf="variantNameValidator.errors?.maxLength">maxLength</p>
      <p *ngIf="variantNameValidator.errors?.minLength">minLength</p>
      <p *ngIf="variantNameValidator.errors?.notAllowedCharacter">notAllowedCharacter</p>
    </div>
  `,
})
class TestComponent {
  textValue?: string;
  variants?: PersonalizationVariant[];
}

describe('DropDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let testComponent: TestComponent;

  const inputEl = () => fixture.debugElement.query(By.css('input')).nativeElement;
  const errors = () => fixture.debugElement.query(By.css('.error-block')).nativeElement.innerText.trim() || null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VariantNameValidatorDirective, TestComponent],
      imports: [FormsModule],
    });

    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(testComponent).toBeTruthy();
  });

  it('should not emit errors if an input is not touched or dirty', () => {
    testComponent.textValue = '';
    fixture.detectChanges();

    expect(errors()).toBe(null);
  });

  it('should emit errors if an input is not touched or dirty', () => {
    testComponent.textValue = '';
    inputEl().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(errors()).toBe('minLength');
  });

  it('should emit errors if value changed', () => {
    // Set valid value
    inputEl().value = 'Valid value';
    inputEl().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(errors()).toBe(null);

    // Set invalid value
    inputEl().value = '';
    inputEl().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(errors()).toBe('minLength');

    // Set valid value
    inputEl().value = 'Valid value';
    inputEl().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(errors()).toBe(null);
  });

  describe('Min length', () => {
    it('should show an error', () => {
      inputEl().value = '';
      inputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(errors()).toBe('minLength');
    });
  });

  describe('Max length', () => {
    it('should show an error', () => {
      inputEl().value = 'exceeds length of 255 characters'.repeat(10);
      inputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(errors()).toBe('maxLength');
    });
  });

  describe('Not allowed characters', () => {
    it('should show an error', () => {
      // Case 1
      inputEl().value = 'value!value';
      inputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(errors()).toBe('notAllowedCharacter');

      // Case 2
      inputEl().value = 'value.value';
      inputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(errors()).toBe('notAllowedCharacter');

      // Case 3
      inputEl().value = 'value-value';
      inputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(errors()).toBe('notAllowedCharacter');

      // Case 4
      inputEl().value = 'valueабвгдvalue';
      inputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(errors()).toBe('notAllowedCharacter');

      // Case 5
      inputEl().value = 'value%value';
      inputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(errors()).toBe('notAllowedCharacter');

      // Case 6
      inputEl().value = ' value';
      inputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(errors()).toBe('notAllowedCharacter');
    });
  });

  describe('Name is already used', () => {
    it('should show an error', () => {
      testComponent.variants = [
        {
          variantName: ' Name 1      ',
        },
      ] as any;
      fixture.detectChanges();

      inputEl().value = '  name 1';
      inputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(errors()).toBe('isAlreadyUsed');
    });
  });
});
