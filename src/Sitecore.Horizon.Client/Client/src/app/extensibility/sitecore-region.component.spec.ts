/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SitecoreRegionComponent } from './sitecore-region.component';

describe('SitecoreRegionComponent', () => {
  let component: SitecoreRegionComponent;
  let fixture: ComponentFixture<SitecoreRegionComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SitecoreRegionComponent],
        imports: [],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SitecoreRegionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should assign region name', () => {
    component.name = 'test-region-name';
    fixture.detectChanges();

    const regionElement = fixture.debugElement.query(By.css('sitecore-region'));
    expect(regionElement.nativeElement.getAttribute('name')).toEqual('test-region-name');
  });

  it('should assign region input property', () => {
    component.input = 'test-input-value';
    fixture.detectChanges();

    const regionElement = fixture.debugElement.query(By.css('sitecore-region'));
    expect(regionElement.nativeElement.input).toEqual('test-input-value');
  });

  it('should assign region filter property', () => {
    const testFilter = () => false;
    component.filterFn = testFilter;
    fixture.detectChanges();

    const regionElement = fixture.debugElement.query(By.css('sitecore-region'));
    expect(regionElement.nativeElement.filter).toBe(testFilter);
  });
});
