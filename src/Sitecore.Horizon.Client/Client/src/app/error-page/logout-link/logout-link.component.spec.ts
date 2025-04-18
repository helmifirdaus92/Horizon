/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';

import { LogoutLinkComponent } from './logout-link.component';

describe(LogoutLinkComponent.name, () => {
  let sut: LogoutLinkComponent;
  let fixture: ComponentFixture<LogoutLinkComponent>;
  let auth: jasmine.SpyObj<AuthenticationService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LogoutLinkComponent],
      providers: [
        {
          provide: AuthenticationService,
          useValue: jasmine.createSpyObj<AuthenticationService>(['logout']),
        },
      ],
    }).compileComponents();

    auth = TestBedInjectSpy(AuthenticationService);
    auth.logout.and.resolveTo();

    fixture = TestBed.createComponent(LogoutLinkComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should log out', () => {
    const logoutBtn = fixture.debugElement.query(By.css('a:last-child')).nativeElement;

    logoutBtn.click();
    fixture.detectChanges();

    expect(auth.logout).toHaveBeenCalledTimes(1);
  });
});
