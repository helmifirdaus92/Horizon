/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { ContentItemDialogComponent } from './content-item-dialog.component';
import { ContentItemDialogService } from './content-item-dialog.service';

describe(ContentItemDialogService.name, () => {
  let sut: ContentItemDialogService;

  beforeEach(() => {
    const dialogOverlayServiceSpy = jasmine.createSpyObj<DialogOverlayService>(['open']);
    sut = new ContentItemDialogService(dialogOverlayServiceSpy);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('show()', () => {
    it('should call open() of given service', () => {
      const spy = jasmine.createSpy().and.returnValue({ component: {} });
      sut = new ContentItemDialogService({ open: spy } as any);
      const item = {
        id: 'id',
        language: 'en',
        site: 'site',
      };

      sut.show(item);

      expect(spy).toHaveBeenCalled();
    });

    it('should set `initialSelect` of the component returned by the service.open()', () => {
      const item = {
        id: 'id',
        language: 'en',
        site: 'site',
      };
      const componentObj: Partial<ContentItemDialogComponent> = {
        selection: { id: null, language: null, site: null },
      };
      sut = new ContentItemDialogService({ open: () => ({ component: componentObj }) } as any);

      sut.show(item);
      expect(componentObj.selection?.id).toEqual(item.id);
      expect(componentObj.selection?.language).toEqual(item.language);
      expect(componentObj.selection?.site).toEqual(item.site);
    });
  });
});
