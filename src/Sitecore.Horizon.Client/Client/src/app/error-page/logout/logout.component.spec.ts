/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { LogoutComponent } from './logout.component';

describe(LogoutComponent.name, () => {
  let sut: LogoutComponent;
  let fixture: ComponentFixture<LogoutComponent>;
  let auth: jasmine.SpyObj<AuthenticationService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LogoutComponent],
      providers: [
        {
          provide: AuthenticationService,
          useValue: jasmine.createSpyObj<AuthenticationService>(['logout']),
        },
      ],
    }).compileComponents();

    auth = TestBedInjectSpy(AuthenticationService);
    auth.logout.and.resolveTo();

    fixture = TestBed.createComponent(LogoutComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should call logout', () => {
    expect(auth.logout).toHaveBeenCalledTimes(1);
  });
});
