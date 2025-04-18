/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ItemPickerDalService } from './item-picker.dal.service';
import { ItemPickerService } from './item-picker.service';

describe(ItemPickerDalService.name, () => {
  let sut: ItemPickerService;
  let dalService: jasmine.SpyObj<ItemPickerDalService>;

  beforeEach(() => {
    dalService = jasmine.createSpyObj<ItemPickerDalService>(['getChildren', 'getAncestorsWithSiblings']);
    sut = new ItemPickerService(dalService);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('getChildren', () => {
    it('should use ItemDalService to get items', () => {
      sut.getChildren('path', 'language', 'site');

      expect(dalService.getChildren).toHaveBeenCalledWith('path', 'language', 'site');
    });
  });

  describe('getAncestorsWithSiblings', () => {
    it('should use ItemDalService to get ancestors with siblings', () => {
      sut.getAncestorsWithSiblings('path', 'language', 'site', ['roots']);

      expect(dalService.getAncestorsWithSiblings).toHaveBeenCalledWith('path', 'language', 'site', ['roots']);
    });
  });
});
