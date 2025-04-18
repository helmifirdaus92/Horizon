/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RecreateOnChangeDirective } from './recreate-on-change.directive';

@Component({
  template: ` <div *appRecreateOnChange="value; let val">{{ val }}</div> `,
})
class TestComponent {
  value = 'foo';
}

describe('RecreateOnChangeDirective', () => {
  let containerFixture: ComponentFixture<TestComponent>;
  const findDiv: () => HTMLDivElement = () => containerFixture.debugElement.query(By.css('div')).nativeElement;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent, RecreateOnChangeDirective],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    containerFixture = TestBed.createComponent(TestComponent);
    containerFixture.detectChanges();
  });

  it('should create render content', () => {
    const div = findDiv();
    expect(div).toBeTruthy();
    expect(div.textContent).toBe('foo');
  });

  it('should not re-render if value is not modified', () => {
    const oldDiv = findDiv();

    containerFixture.componentInstance.value = 'foo';
    containerFixture.detectChanges();

    const newDiv = findDiv();
    expect(newDiv).toBe(oldDiv);
  });

  it('should re-render if value is modified', () => {
    const oldDiv = findDiv();

    containerFixture.componentInstance.value = 'new foo';
    containerFixture.detectChanges();

    const newDiv = findDiv();
    expect(newDiv).not.toBe(oldDiv);
    expect(newDiv.textContent).toBe('new foo');
  });

  it('should not render if value is falsy', () => {
    containerFixture.componentInstance.value = '';
    containerFixture.detectChanges();

    const div = containerFixture.debugElement.query(By.css('div'));
    expect(div).toBeFalsy();
  });
});
