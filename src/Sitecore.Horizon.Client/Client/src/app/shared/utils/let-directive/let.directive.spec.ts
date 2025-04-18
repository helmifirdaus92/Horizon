/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LetDirective } from './let.directive';

@Component({
  template: ` <div *appLet="value as val">{{ val }}</div> `,
})
class TestComponent {
  value = 'foo';
}

describe('LetDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  const findDiv: () => HTMLDivElement = () => fixture.debugElement.query(By.css('div')).nativeElement;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent, LetDirective],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create render content', () => {
    const div = findDiv();
    expect(div.textContent).toBe('foo');
  });

  it('should update when value changes', () => {
    component.value = 'bar';
    fixture.detectChanges();

    const div = findDiv();
    expect(div.textContent).toBe('bar');
  });

  it('should not re-render when value changes', () => {
    const oldDiv = findDiv();

    component.value = 'bar';
    fixture.detectChanges();

    const newDiv = findDiv();
    expect(newDiv).toBe(oldDiv);
  });
});
