/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { EmptyStateModule } from '@sitecore/ng-spd-lib';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { NoTenantComponent } from './no-tenant.component';

@Component({
  selector: 'app-logout-link',
  template: '',
})
class TestLogoutLinkComponent {}

describe(NoTenantComponent.name, () => {
  let component: NoTenantComponent;
  let fixture: ComponentFixture<NoTenantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NoTenantComponent, TestLogoutLinkComponent],
      imports: [EmptyStateModule, TranslateServiceStubModule, TranslateModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoTenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
