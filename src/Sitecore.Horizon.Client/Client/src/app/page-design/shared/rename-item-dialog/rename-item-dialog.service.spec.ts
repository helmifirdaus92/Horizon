/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { RenameItemDialogComponent } from './rename-item-dialog.component';

import { RenameItemDialogService } from './rename-item-dialog.service';

describe(RenameItemDialogService.name, () => {
  let sut: RenameItemDialogService;
  let dialogOverlayServiceSpy: jasmine.SpyObj<DialogOverlayService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DialogOverlayService,
          useValue: jasmine.createSpyObj<DialogOverlayService>(['open']),
        },
      ],
    });
    dialogOverlayServiceSpy = TestBedInjectSpy(DialogOverlayService);
    sut = TestBed.inject(RenameItemDialogService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('show()', () => {
    it('should call open() of given service', () => {
      // arrange
      dialogOverlayServiceSpy.open.and.returnValue({ component: {} } as any);

      // act
      sut.show({
        existingNames: ['name1', 'name2'],
        itemId: 'id',
        itemName: 'templateId',
      });

      // assert
      expect(dialogOverlayServiceSpy.open).toHaveBeenCalled();
    });

    it('should set RenameDesignItemDialogComponent props value as returned by the service.open()', () => {
      // arrange
      const componentObj: Partial<RenameItemDialogComponent> = {
        existingNames: [],
        itemId: '',
        itemName: '',
      };

      const existingNames = ['name1', 'name2'];
      const designItemId = 'id';
      const designItemName = 'name';

      dialogOverlayServiceSpy.open.and.returnValue({ component: componentObj } as any);

      // act
      sut.show({ existingNames, itemId: designItemId, itemName: designItemName });

      // assert
      expect(componentObj.existingNames).toEqual(existingNames);
      expect(componentObj.itemId).toEqual(designItemId);
      expect(componentObj.itemName).toEqual(designItemName);
    });
  });
});
