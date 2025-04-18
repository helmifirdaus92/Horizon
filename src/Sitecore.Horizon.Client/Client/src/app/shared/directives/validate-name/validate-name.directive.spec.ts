/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ForbiddenNamesDirective } from './validate-name.directive';

@Component({
  selector: 'test-drop',
  template: `
    <input #nameValidator="ngModel" type="text" [appForbiddenNames]="existingNames" [(ngModel)]="textValue" />

    <div class="error-block">
      <p *ngIf="nameValidator.errors?.isForbidden">isAlreadyUsed</p>
    </div>
  `,
})
class TestComponent {
  textValue = 'name1';
  existingNames?: string[] = ['name1'];
}

describe(ForbiddenNamesDirective.name, () => {
  let fixture: ComponentFixture<TestComponent>;
  let testComponent: TestComponent;

  const inputEl = () => fixture.debugElement.query(By.css('input')).nativeElement;
  const errors = () => fixture.debugElement.query(By.css('.error-block')).nativeElement.innerText.trim() || null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ForbiddenNamesDirective, TestComponent],
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

  it('should show an error if name is already used', () => {
    testComponent.existingNames = ['name1'];
    fixture.detectChanges();

    inputEl().value = '  name1';
    inputEl().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(errors()).toBe('isAlreadyUsed');
  });

  it('should emit errors if value changed', () => {
    // Set valid value
    inputEl().value = 'Valid value';
    inputEl().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(errors()).toBe(null);

    // Set invalid value
    inputEl().value = 'name1';
    inputEl().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(errors()).toBe('isAlreadyUsed');

    // Set valid value
    inputEl().value = 'Valid value';
    inputEl().dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(errors()).toBe(null);
  });
});
