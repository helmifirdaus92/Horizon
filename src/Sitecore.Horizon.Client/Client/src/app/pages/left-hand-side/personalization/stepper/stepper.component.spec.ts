/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { StepperComponent } from './stepper.component';

@Component({
  selector: 'test-component',
  template: '<app-stepper [activeStepIndex]= "activeStepIndex"></app-stepper>',
})
class TestComponent {
  @Input() activeStepIndex?: number;
}

describe(StepperComponent.name, () => {
  let testComponent: TestComponent;
  let component: StepperComponent;
  let fixture: ComponentFixture<TestComponent>;

  const steps = () => {
    return {
      steps: fixture.debugElement.query(By.css('.steps')).nativeElement,
      text: fixture.debugElement.queryAll(By.css('.text')),
    };
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule],
      declarations: [TestComponent, StepperComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(StepperComponent)).componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(testComponent).toBeTruthy();
  });

  it('should show the current number of steps', () => {
    expect(steps().text.length).toBe(2);
  });

  it('should set active class when activeStepsIndex is defined', () => {
    testComponent.activeStepIndex = 0;
    fixture.detectChanges();

    expect(steps().steps.classList).toContain('active');
  });
});
