/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FeatureNotAvailableDialogComponent } from './feature-not-available-dialog/feature-not-available-dialog.component';
import { TemplatesViewComponent } from './templates-view.component';

describe(TemplatesViewComponent.name, () => {
  let sut: TemplatesViewComponent;
  let fixture: ComponentFixture<TemplatesViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [TemplatesViewComponent, FeatureNotAvailableDialogComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(TemplatesViewComponent);

    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });
});
