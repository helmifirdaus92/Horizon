/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { PersonalizationVariant } from '../personalization.types';
import { PersonalizationService } from './personalization.service';

const variant: PersonalizationVariant = {
  variantId: 'variant 1',
  template: '{variantId: variant 1}',
  variantName: 'variant 1',
  audienceName: 'abc',
  conditionGroups: [],
};

describe(PersonalizationService.name, () => {
  let sut: PersonalizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    sut = TestBed.inject(PersonalizationService);
  });

  describe(PersonalizationService.name, () => {
    it('IsInPersonalizationMode', () => {
      sut.setIsInPersonalizationMode(false);
      expect(sut.getIsInPersonalizationMode()).toBe(false);

      sut.setIsInPersonalizationMode(true);
      expect(sut.getIsInPersonalizationMode()).toBe(true);
    });

    it('should update active variant', () => {
      sut.setActiveVariant(variant);
      expect(sut.getActiveVariant()).toBe(variant);

      sut.setActiveVariant(null);
      expect(sut.getActiveVariant()).toBe(null);
    });
  });
});
