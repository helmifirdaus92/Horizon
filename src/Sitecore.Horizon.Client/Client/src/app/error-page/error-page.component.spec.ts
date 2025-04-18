/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { EmptyStateModule } from '@sitecore/ng-spd-lib';

import { NotificationsModule } from 'app/shared/notifications/notifications.module';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { ErrorPageRoutingModule } from './error-page-routing.module';
import { ErrorPageComponent } from './error-page.component';
import { ErrorPageService } from './error-page.service';

@Component({
  selector: 'app-top-bar',
  template: '',
})
class AppHeaderStubComponent {
  @Input() renderSiteLanguageSwitcher?: boolean;
  @Input() renderGlobalElementsRegion?: boolean;
}

@Component({
  template: '',
})
class NoComponent {}

describe(ErrorPageComponent.name, () => {
  let sut: ErrorPageComponent;
  let fixture: ComponentFixture<ErrorPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NotificationsModule,
        EmptyStateModule,
        ErrorPageRoutingModule,
        RouterTestingModule.withRoutes([]),
        TranslateServiceStubModule,
        TranslateModule,
        NoopAnimationsModule,
      ],
      declarations: [ErrorPageComponent, AppHeaderStubComponent, NoComponent],
      providers: [
        {
          provide: ErrorPageService,
          useValue: jasmine.createSpyObj<ErrorPageService>('ErrorPageService', { goToErrorPage: undefined }),
        },
        ErrorPageService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorPageComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });
});
