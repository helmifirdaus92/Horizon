/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { EmptyStateModule } from '@sitecore/ng-spd-lib';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { GeneralErrorComponent } from './general-error.component';

@Component({
  selector: 'app-logout-link',
  template: '',
})
class TestLogoutLinkComponent {}

describe(GeneralErrorComponent.name, () => {
  let sut: GeneralErrorComponent;
  let fixture: ComponentFixture<GeneralErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeneralErrorComponent, TestLogoutLinkComponent],
      imports: [EmptyStateModule, TranslateServiceStubModule, TranslateModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralErrorComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });
});
