/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { CreateItemDialogComponent } from './create-item-dialog.component';
import { CreateItemDialogService } from './create-item-dialog.service';

describe(CreateItemDialogService.name, () => {
  let sut: CreateItemDialogService;
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
    sut = TestBed.inject(CreateItemDialogService);
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
        language: 'en',
        parentId: 'id',
        templateId: 'templateId',
        type: 'page-design',
      });

      // assert
      expect(dialogOverlayServiceSpy.open).toHaveBeenCalled();
    });

    it('should set CreateDesignItemDialogComponent props value as returned by the service.open()', () => {
      // arrange
      const componentObj: Partial<CreateItemDialogComponent> = {
        existingNames: [],
        language: '',
        parentId: '',
      };

      const existingNames = ['name1', 'name2'];
      const language = 'en';
      const parentId = 'id';
      const templateId = 'templateId';
      const type = 'page-design';

      dialogOverlayServiceSpy.open.and.returnValue({ component: componentObj } as any);

      // act
      sut.show({ existingNames, parentId, language, templateId, type });

      // assert
      expect(componentObj.existingNames).toEqual(existingNames);
      expect(componentObj.language).toEqual(language);
      expect(componentObj.parentId).toEqual(parentId);
    });
  });
});
