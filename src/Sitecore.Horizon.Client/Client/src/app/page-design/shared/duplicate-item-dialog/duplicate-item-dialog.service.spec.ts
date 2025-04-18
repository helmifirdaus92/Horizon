/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { DuplicateItemDialogComponent } from './duplicate-item-dialog.component';
import { DuplicateItemDialogService } from './duplicate-item-dialog.service';

describe(DuplicateItemDialogService.name, () => {
  let sut: DuplicateItemDialogService;
  let dialogOverlayServiceSpy: jasmine.SpyObj<DialogOverlayService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateServiceStubModule, TranslateModule],
      providers: [
        {
          provide: DialogOverlayService,
          useValue: jasmine.createSpyObj<DialogOverlayService>(['open']),
        },
      ],
    });
    dialogOverlayServiceSpy = TestBedInjectSpy(DialogOverlayService);
    sut = TestBed.inject(DuplicateItemDialogService);
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
        itemId: 'templateId',
        parentId: 'parentId',
        pageDesignId: 'pageDesignId',
        name: 'test item',
      });

      // assert
      expect(dialogOverlayServiceSpy.open).toHaveBeenCalled();
    });

    it('should set DuplicateDesignItemDialogComponent props value as returned by the service.open()', () => {
      // arrange
      const componentObj: Partial<DuplicateItemDialogComponent> = {
        existingNames: [],
        itemId: '',
        parentId: '',
        pageDesignId: '',
        itemName: '',
      };

      const existingNames = ['name1', 'name2'];
      const itemId = 'templateId';
      const parentId = 'parentId';
      const pageDesignId = 'pageDesignId';
      const name = 'test item';

      dialogOverlayServiceSpy.open.and.returnValue({ component: componentObj } as any);

      // act
      sut.show({ existingNames, itemId, parentId, name, pageDesignId });

      // assert
      expect(componentObj.existingNames).toEqual(existingNames);
      expect(componentObj.itemId).toEqual(itemId);
      expect(componentObj.parentId).toEqual(parentId);
      expect(componentObj.pageDesignId).toEqual(pageDesignId);
    });
  });
});
