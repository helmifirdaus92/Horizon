/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By, DomSanitizer } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, PopoverModule } from '@sitecore/ng-spd-lib';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { TokenCustomClaimKeysEnum } from 'app/authentication/library/types';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import {
  StaticConfigurationServiceStub,
  StaticConfigurationServiceStubModule,
} from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { UserInfoComponent } from './user-info.component';

describe(UserInfoComponent.name, () => {
  let sut: UserInfoComponent;
  let fixture: ComponentFixture<UserInfoComponent>;

  let staticConfigurationServiceStub: StaticConfigurationServiceStub;
  let authenticationServiceSpy: jasmine.SpyObj<AuthenticationService>;

  const getUserInfoLogoBtn = () => fixture.debugElement.query(By.css('button#userInfo'))?.nativeElement;

  const popoverEl: () => HTMLElement | undefined = () =>
    fixture.debugElement.query(By.css('ng-spd-popover'))?.nativeElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        TranslateModule,
        TranslateServiceStubModule,
        StaticConfigurationServiceStubModule,
        PopoverModule,
        ButtonModule,
      ],
      providers: [
        {
          provide: AuthenticationService,
          useValue: jasmine.createSpyObj<AuthenticationService>(
            'AuthenticationService',
            { logout: undefined },
            { authProvider: { user: {} as any } as any },
          ),
        },
      ],
      declarations: [UserInfoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserInfoComponent);
    sut = fixture.componentInstance;

    staticConfigurationServiceStub = TestBed.inject(StaticConfigurationServiceStub);
    authenticationServiceSpy = TestBedInjectSpy(AuthenticationService);
    TestBed.inject(DomSanitizer);
    ConfigurationService.organization = 'test-organization';
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(sut).toBeTruthy();
  });

  it('should not render content if there is no user', () => {
    authenticationServiceSpy.authProvider.user = undefined;
    fixture.detectChanges();

    expect(getUserInfoLogoBtn()).toBeFalsy();
  });

  it('should render Info', () => {
    authenticationServiceSpy.authProvider.user = {
      picture: 'picture-url',
      email: 'user-email',
      name: 'user-name',
      [TokenCustomClaimKeysEnum.ORG_DISPLAY_NAME]: 'user-org-name',
    } as any;
    staticConfigurationServiceStub.auth0Settings.domain = 'pages-staging';
    fixture.detectChanges();

    getUserInfoLogoBtn().click();

    fixture.detectChanges();

    expect(popoverEl()!.innerText).toContain('user-org-name');
    expect(popoverEl()!.innerText).toContain('user-name');
    expect(popoverEl()!.innerText).toContain('user-email');
  });

  it('should render link to manage user', () => {
    authenticationServiceSpy.authProvider.user = {
      email: 'user-email',
      name: 'user-name',
      [TokenCustomClaimKeysEnum.ORG_DISPLAY_NAME]: 'user-org-name',
    } as any;
    fixture.detectChanges();

    getUserInfoLogoBtn().click();

    fixture.detectChanges();

    expect(popoverEl()!.querySelector('a')?.getAttribute('href')).toContain(
      'https://portal-app-url.com/profile?organization=test-organization',
    );
  });

  it('should logout', () => {
    authenticationServiceSpy.authProvider.user = {
      email: 'user-email',
      name: 'user-name',
      [TokenCustomClaimKeysEnum.ORG_DISPLAY_NAME]: 'user-org-name',
    } as any;
    fixture.detectChanges();
    getUserInfoLogoBtn().click();
    fixture.detectChanges();

    fixture.debugElement.query(By.css('button#userInfoLogOut'))?.nativeElement.click();
    fixture.detectChanges();

    expect(authenticationServiceSpy.logout).toHaveBeenCalled();
  });
});
