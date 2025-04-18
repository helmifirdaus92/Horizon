/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { CreatePageDesignDialogComponent } from './create-page-design-dialog.component';
import { CreatePageDesignDialogService } from './create-page-design-dialog.service';

describe(CreatePageDesignDialogService.name, () => {
  let sut: CreatePageDesignDialogService;
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
    sut = TestBed.inject(CreatePageDesignDialogService);
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
        existingDesignNames: ['design1', 'design2'],
        language: 'en',
        parentId: 'parentId',
        templateId: 'templateId',
      });

      // assert
      expect(dialogOverlayServiceSpy.open).toHaveBeenCalled();
    });

    it('should set InsertOptionsConfigurationsDialogComponent props value as returned by the service.open()', () => {
      // arrange
      const componentObj: Partial<CreatePageDesignDialogComponent> = {
        existingDesignNames: [],
        language: '',
        pageDesignParentId: '',
        pageDesignTemplateId: '',
      };

      dialogOverlayServiceSpy.open.and.returnValue({ component: componentObj } as any);

      // act
      sut.show({
        existingDesignNames: ['name1', 'name2'],
        language: 'en',
        parentId: 'parentId',
        templateId: 'tempalteId',
      });

      // assert
      expect(componentObj.pageDesignParentId).toEqual('parentId');
      expect(componentObj.pageDesignTemplateId).toEqual('tempalteId');
      expect(componentObj.existingDesignNames).toEqual(['name1', 'name2']);
      expect(componentObj.language).toEqual('en');
    });
  });
});
