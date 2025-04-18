/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { LHSNavigationService } from './lhs-navigation.service';

describe(LHSNavigationService.name, () => {
  let sut: LHSNavigationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    sut = TestBed.inject(LHSNavigationService);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });
});
