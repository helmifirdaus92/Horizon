/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';

import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { InsertOptionsConfigurationsDialogComponent } from './insert-options-configurations-dialog.component';
import { InsertOptionsConfigurationsDialogService } from './insert-options-configurations-dialog.service';

describe(InsertOptionsConfigurationsDialogService.name, () => {
  let sut: InsertOptionsConfigurationsDialogService;
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
    sut = TestBed.inject(InsertOptionsConfigurationsDialogService);
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
        templatesList: [{ template: { name: 'template', templateId: 'templateId' }, pageDesign: null }],
        templateId: 'templateId',
      });

      // assert
      expect(dialogOverlayServiceSpy.open).toHaveBeenCalled();
    });

    it('should set InsertOptionsConfigurationsDialogComponent props value as returned by the service.open()', () => {
      // arrange
      const componentObj: Partial<InsertOptionsConfigurationsDialogComponent> = {
        templateId: '',
        templatesList: [],
      };

      const templateId = 'templateId';
      const templatesList = [{ template: { name: 'template', templateId: 'templateId' }, pageDesign: null }];

      dialogOverlayServiceSpy.open.and.returnValue({ component: componentObj } as any);

      // act
      sut.show({ templateId, templatesList });

      // assert
      expect(componentObj.templateId).toEqual(templateId);
      expect(componentObj.templatesList).toEqual(templatesList);
    });
  });
});
