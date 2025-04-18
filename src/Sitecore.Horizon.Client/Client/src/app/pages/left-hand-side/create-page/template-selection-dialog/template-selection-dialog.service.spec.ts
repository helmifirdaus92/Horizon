/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TemplateSelectionDialogComponent } from './template-selection-dialog.component';
import { TemplateSelectionDialogService } from './template-selection-dialog.service';

describe(TemplateSelectionDialogService.name, () => {
  let sut: TemplateSelectionDialogService;
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
    sut = TestBed.inject(TemplateSelectionDialogService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('show()', () => {
    it('should call open() of given service', () => {
      // arrange
      dialogOverlayServiceSpy.open.and.returnValue({ component: {} } as any);

      // act
      sut.show('item-id', 'test-desginId');

      // assert
      expect(dialogOverlayServiceSpy.open).toHaveBeenCalled();
    });

    it('should set TemplateSelectionDialogComponent props value as returned by the service.open()', () => {
      // arrange
      const itemId = 'templateId';
      const itemName = 'template';
      const componentObj: Partial<TemplateSelectionDialogComponent> = {
        itemId,
        itemName,
      };

      dialogOverlayServiceSpy.open.and.returnValue({ component: componentObj } as any);

      // act
      sut.show(itemId, itemName);

      // assert
      expect(componentObj.itemId).toEqual(itemId);
      expect(componentObj.itemName).toEqual(itemName);
    });
  });
});
