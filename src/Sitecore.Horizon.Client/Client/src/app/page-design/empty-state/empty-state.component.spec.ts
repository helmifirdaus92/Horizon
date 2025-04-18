/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { EmptyStateComponent } from './empty-state.component';

describe(EmptyStateComponent.name, () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set correct path and alt for the image', () => {
    const imagePath = 'http://:0/image/path1';
    component.title = 'title1';
    component.path = imagePath;
    fixture.detectChanges();

    const image = fixture.debugElement.query(By.css('img'));

    expect(image.attributes.alt).toEqual('title1');
    expect(image.attributes.src).toEqual(imagePath);
  });

  it('should set correct title, description and button text to the elements', () => {
    component.title = 'title2';
    component.description = 'description text';
    component.btnText = 'Click';
    fixture.detectChanges();

    const title = fixture.debugElement.query(By.css('.title')).nativeElement;
    const description = fixture.debugElement.query(By.css('.description')).nativeElement;
    const button = fixture.debugElement.query(By.css('.create-action')).nativeElement;

    expect(title.textContent).toEqual('title2');
    expect(description.textContent).toEqual('description text');
    expect(button.textContent).toEqual('Click');
  });

  it('should add disabled class to button if isDisable is true', () => {
    component.isDisabled = true;
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('.create-action')).nativeElement;

    expect(button.classList).toContain('disabled');
  });
});
