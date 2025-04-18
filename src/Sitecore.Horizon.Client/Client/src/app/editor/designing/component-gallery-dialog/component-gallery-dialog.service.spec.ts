/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { ElementDimensions } from 'app/shared/utils/utils';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { ComponentGalleryDialogComponent } from './component-gallery-dialog.component';

import { ComponentGalleryDialogService } from './component-gallery-dialog.service';

describe(ComponentGalleryDialogService.name, () => {
  let sut: ComponentGalleryDialogService;
  let dialogOverlayServiceSpy: jasmine.SpyObj<DialogOverlayService>;

  const chromeDimension: ElementDimensions = {
    top: 10,
    left: 0,
    height: 20,
    width: 100,
  };

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
    sut = TestBed.inject(ComponentGalleryDialogService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('show()', () => {
    it('should call open() of given service', () => {
      // arrange
      dialogOverlayServiceSpy.open.and.returnValue({ component: {} } as any);

      // act
      sut.show({ allowedRenderingIds: [], dimension: chromeDimension });

      // assert
      expect(dialogOverlayServiceSpy.open).toHaveBeenCalled();
    });

    it('should set ComponentGalleryDialogComponent props value as returned by the service.open()', () => {
      // arrange
      const componentObj: Partial<ComponentGalleryDialogComponent> = {
        allowedRenderingIds: [''],
        chromeDimension: { top: 0, left: 0, height: 0, width: 0 },
      };

      const allowedRenderingIds = ['1', '2'];
      const dimension = chromeDimension;

      dialogOverlayServiceSpy.open.and.returnValue({ component: componentObj } as any);

      // act
      sut.show({ allowedRenderingIds, dimension });

      // assert
      expect(componentObj.allowedRenderingIds).toEqual(allowedRenderingIds);
      expect(componentObj.chromeDimension).toEqual(dimension);
    });
  });
});
