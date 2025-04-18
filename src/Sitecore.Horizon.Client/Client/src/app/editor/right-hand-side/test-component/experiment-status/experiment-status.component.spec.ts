/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BadgeModule, IconButtonModule } from '@sitecore/ng-spd-lib';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { ExperimentStatusComponent } from './experiment-status.component';

describe(ExperimentStatusComponent.name, () => {
  let sut: ExperimentStatusComponent;
  let fixture: ComponentFixture<ExperimentStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, TranslateModule, TranslateServiceStubModule, IconButtonModule, BadgeModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentStatusComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should display "LIVE" when status is "PRODUCTION" and isPagePublished is true', () => {
    sut.status = 'PRODUCTION';
    sut.isPagePublished = true;
    fixture.detectChanges();

    const statusElement = fixture.nativeElement;
    expect(statusElement.textContent).toContain('COMPONENT_TESTING.LIVE');
  });

  it('should display "PENDING" when status is "PRODUCTION" and isPagePublished is false', () => {
    sut.status = 'PRODUCTION';
    sut.isPagePublished = false;
    fixture.detectChanges();

    const statusElement = fixture.nativeElement;
    expect(statusElement.textContent).toContain('COMPONENT_TESTING.PENDING');
  });

  it('should display "ENDED" when status is "COMPLETED" and isPagePublished is true', () => {
    sut.status = 'COMPLETED';
    sut.isPagePublished = true;
    fixture.detectChanges();

    const statusElement = fixture.nativeElement;
    expect(statusElement.textContent).toContain('COMPONENT_TESTING.ENDED');
  });

  it('should display "PENDING" when status is "COMPLETED" and isPagePublished is false', () => {
    sut.status = 'COMPLETED';
    sut.isPagePublished = false;
    fixture.detectChanges();

    const statusElement = fixture.nativeElement;
    expect(statusElement.textContent).toContain('COMPONENT_TESTING.PENDING');
  });

  it('should display "DRAFT" when status is "DRAFT"', () => {
    sut.status = 'DRAFT';
    fixture.detectChanges();

    const statusElement = fixture.nativeElement;
    expect(statusElement.textContent).toContain('DRAFT');
  });
});
