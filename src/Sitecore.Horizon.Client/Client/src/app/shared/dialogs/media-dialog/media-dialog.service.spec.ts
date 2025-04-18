/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { MediaValue } from 'app/editor/right-hand-side/image-field/image-field-messaging.service';
import { MediaDialogComponent } from './media-dialog.component';
import { MediaDialogService } from './media-dialog.service';

describe('MediaDialogService', () => {
  let sut: MediaDialogService;

  beforeEach(() => {
    const dialogOverlayServiceSpy = jasmine.createSpyObj<DialogOverlayService>(['open']);
    sut = new MediaDialogService(dialogOverlayServiceSpy);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('show()', () => {
    it('should call open() of given service', () => {
      const spy = jasmine.createSpy().and.returnValue({ component: {} });
      sut = new MediaDialogService({ open: spy } as any);
      const mediaId = 'foo';
      const image: MediaValue = {
        mediaId,
        rawValue: `<image mediaId='${mediaId}'/>`,
        src: '',
      };

      sut.show({ currentValue: image, sources: ['source1', 'source2'] });

      expect(spy).toHaveBeenCalled();
    });

    it('should set `initialSelect` of the component returned by the service.open()', () => {
      const mediaId = 'foo';
      const image: MediaValue = {
        mediaId,
        rawValue: `<image mediaId='${mediaId}'/>`,
        src: '',
      };
      const componentObj: Partial<MediaDialogComponent> = {
        selection: null,
      };
      sut = new MediaDialogService({ open: () => ({ component: componentObj }) } as any);

      sut.show({
        currentValue: image,
        sources: ['s1', 's2'],
      });
      expect(componentObj.selection).toEqual(image);
    });
  });
});
