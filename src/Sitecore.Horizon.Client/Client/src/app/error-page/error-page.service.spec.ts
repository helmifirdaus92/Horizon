/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TestBedInjectSpy } from 'app/testing/test.utils';

import { ErrorPageService } from './error-page.service';

describe(ErrorPageService.name, () => {
  let sut: ErrorPageService;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: jasmine.createSpyObj<Router>({
            navigateByUrl: Promise.resolve(true),
          }),
        },
      ],
    });

    router = TestBedInjectSpy(Router);
    sut = TestBed.inject(ErrorPageService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('goToErrorPage', () => {
    it('should go to "No organization" page case', () => {
      sut.goToErrorPage('noOrganization');

      expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/error/no-organization');
    });

    it('should go to "No tenant" page case', () => {
      sut.goToErrorPage('noTenant');

      expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/error/no-tenant');
    });

    it('should go to "Default error" page case', () => {
      sut.goToErrorPage('default');

      expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/error');
    });

    it('should go to "Default error" page if not match', () => {
      sut.goToErrorPage('wrong type' as any);

      expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/error');
    });
  });
});
