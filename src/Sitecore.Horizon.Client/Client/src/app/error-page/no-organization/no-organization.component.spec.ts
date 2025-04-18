/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { EmptyStateModule } from '@sitecore/ng-spd-lib';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { NoOrganizationComponent } from './no-organization.component';

@Component({
  selector: 'app-logout-link',
  template: '',
})
class TestLogoutLinkComponent {}

describe(NoOrganizationComponent.name, () => {
  let sut: NoOrganizationComponent;
  let fixture: ComponentFixture<NoOrganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NoOrganizationComponent, TestLogoutLinkComponent],
      imports: [EmptyStateModule, TranslateServiceStubModule, TranslateModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoOrganizationComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });
});
