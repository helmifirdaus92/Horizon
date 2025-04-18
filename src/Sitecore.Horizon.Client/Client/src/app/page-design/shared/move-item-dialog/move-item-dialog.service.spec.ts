/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { MoveItemDialogComponent } from './move-item-dialog.component';
import { MoveItemDialogService } from './move-item-dialog.service';

describe(MoveItemDialogService.name, () => {
  let sut: MoveItemDialogService;
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
    sut = TestBed.inject(MoveItemDialogService);
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
        itemId: 'itemId',
        parentId: 'parentId',
        rootId: 'pageDesignId',
        itemName: 'itemName',
        templateId: 'templateId',
        language: 'language',
      });

      // assert
      expect(dialogOverlayServiceSpy.open).toHaveBeenCalled();
    });

    it('should set MoveDesignItemDialogComponent props value as returned by the service.open()', () => {
      // arrange
      const componentObj: Partial<MoveItemDialogComponent> = {
        itemId: '',
        parentId: '',
        rootId: '',
        itemName: '',
        templateId: '',
      };

      const itemId = 'itemId';
      const parentId = 'parentId';
      const rootId = 'pageDesignId';
      const itemName = 'itemName';
      const templateId = 'templateId';
      const language = 'language';

      dialogOverlayServiceSpy.open.and.returnValue({ component: componentObj } as any);

      // act
      sut.show({ itemId, parentId, rootId, itemName, templateId, language });

      // assert
      expect(componentObj.itemId).toEqual(itemId);
      expect(componentObj.parentId).toEqual(parentId);
      expect(componentObj.rootId).toEqual(rootId);
      expect(componentObj.itemName).toEqual(itemName);
      expect(componentObj.templateId).toEqual(templateId);
      expect(componentObj.language).toEqual(language);
    });
  });
});
