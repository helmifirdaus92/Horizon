/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToggleButtonsComponent } from './toggle-buttons.component';

@Component({
  template: `
    <app-toggle-buttons [orientation]="orientation" [hasBorder]="hasBorder">
      <p>Test Content</p>
    </app-toggle-buttons>
  `,
})
class TestHostComponent {
  orientation: 'horizontal' | 'vertical' = 'horizontal';
  hasBorder: boolean = false;
}

describe('ToggleButtonComponent.name', () => {
  let component: ToggleButtonsComponent;
  let fixture: ComponentFixture<ToggleButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleButtonsComponent],
      declarations: [TestHostComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToggleButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have default orientation as horizontal', () => {
    expect(component.orientation).toBe('horizontal');
  });

  it('should have default hasBorder as false', () => {
    expect(component.hasBorder).toBeFalse();
  });

  it('should apply horizontal class by default', () => {
    const divElement: HTMLElement = fixture.nativeElement.querySelector('div');

    expect(divElement.classList.contains('horizontal')).toBeTrue();
  });

  it('should update to vertical class when orientation is changed', () => {
    component.orientation = 'vertical';
    fixture.detectChanges();

    const divElement: HTMLElement = fixture.nativeElement.querySelector('div');

    expect(divElement.classList.contains('vertical')).toBeTrue();
    expect(divElement.classList.contains('horizontal')).toBeFalse();
  });

  it('should apply border class when hasBorder is true', () => {
    component.hasBorder = true;
    fixture.detectChanges();

    const divElement: HTMLElement = fixture.nativeElement.querySelector('div');

    expect(divElement.classList.contains('border')).toBeTrue();
  });

  it('should remove border class when hasBorder is set to false', () => {
    component.hasBorder = true;
    fixture.detectChanges();

    component.hasBorder = false;
    fixture.detectChanges();

    const divElement: HTMLElement = fixture.nativeElement.querySelector('div');

    expect(divElement.classList.contains('border')).toBeFalse();
  });

  it('should apply correct class when both inputs are changed', () => {
    component.orientation = 'vertical';
    component.hasBorder = true;
    fixture.detectChanges();

    const divElement: HTMLElement = fixture.nativeElement.querySelector('div');

    expect(divElement.classList.contains('vertical')).toBeTrue();
    expect(divElement.classList.contains('border')).toBeTrue();
  });
});
