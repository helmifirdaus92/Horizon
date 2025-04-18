/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';

import { HzAppSwitcherComponent } from './hz-app-switcher.component';

@Component({
  selector: 'app-switcher',
})
class AppSwitcherMockComponent {}

describe(HzAppSwitcherComponent.name, () => {
  let sut: HzAppSwitcherComponent;
  let fixture: ComponentFixture<HzAppSwitcherComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaticConfigurationServiceStubModule],
      declarations: [HzAppSwitcherComponent, AppSwitcherMockComponent],
      providers: [
        {
          provide: AuthenticationService,
          useValue: jasmine.createSpyObj<AuthenticationService>({
            getBearerToken: undefined,
            changeAuthParams: undefined,
          }),
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HzAppSwitcherComponent);

    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('loginWithRedirect', () => {
    it('should call refreshUserLoggedInSession when prompt is login', () => {
      const refreshUserLoggedInSessionSpy = spyOn(sut, 'refreshUserLoggedInSession').and.callFake(() => {});

      const params = {
        prompt: 'login',
        organization: 'org001',
      };
      sut.loginWithRedirect(params);

      expect(refreshUserLoggedInSessionSpy).toHaveBeenCalled();
    });

    it('should not call changeOrganization when prompt is login', () => {
      spyOn(sut, 'refreshUserLoggedInSession').and.callFake(() => {});
      const changeOrganizationSpy = spyOn(sut, 'changeOrganization').and.callFake(() => Promise.resolve());

      const params = {
        prompt: 'login',
        organization: 'org001',
      };
      sut.loginWithRedirect(params);

      expect(changeOrganizationSpy).not.toHaveBeenCalled();
    });

    it('should not call refreshUserLoggedInSession when params includes org id and prompt is not login', () => {
      const refreshUserLoggedInSessionSpy = spyOn(sut, 'refreshUserLoggedInSession').and.callFake(() => {});
      spyOn(sut, 'changeOrganization').and.callFake(() => Promise.resolve());

      const params = {
        prompt: '',
        organization: 'org001',
      };
      sut.loginWithRedirect(params);

      expect(refreshUserLoggedInSessionSpy).not.toHaveBeenCalled();
    });

    it('should call changeOrganization when params includes org id and prompt is not login', () => {
      const changeOrganizationSpy = spyOn(sut, 'changeOrganization').and.callFake(() => Promise.resolve());

      const params = {
        organization_id: 'org001',
        prompt: '',
      };
      sut.loginWithRedirect(params);

      expect(changeOrganizationSpy).toHaveBeenCalled();
    });
  });
});
