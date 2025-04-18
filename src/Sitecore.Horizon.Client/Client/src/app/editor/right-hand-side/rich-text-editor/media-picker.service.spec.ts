/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { MediaDialogService } from 'app/shared/dialogs/media-dialog/media-dialog.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { of, throwError } from 'rxjs';
import { MediaValue } from '../image-field/image-field-messaging.service';
import { MediaPickerService } from './media-picker.service';

const selectedMedia: MediaValue = {
  rawValue: 'rawvalue',
  src: 'src',
  mediaId: 'mediaid',
  alt: 'alt',
  width: 100,
  height: 100,
  embeddedHtml: 'embeddedHtml',
};

describe(MediaPickerService.name, () => {
  let mediaPickerService: MediaPickerService;
  let mediaDialogService: jasmine.SpyObj<MediaDialogService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MediaPickerService,
        {
          provide: MediaDialogService,
          useValue: jasmine.createSpyObj<MediaDialogService>('MediaDialogService', ['show']),
        },
      ],
    });

    mediaDialogService = TestBedInjectSpy(MediaDialogService);
    mediaPickerService = TestBed.inject(MediaPickerService);
  });

  it('should be created', () => {
    expect(mediaPickerService).toBeTruthy();
  });

  it('should return OK status with selected media', async () => {
    const mockSelectedValue = {
      src: 'src',
      alt: 'alt',
      embeddedHtml: 'embeddedHtml',
    };
    mediaDialogService.show.and.returnValue(of(selectedMedia));

    const result = await mediaPickerService.promptSelectMedia();
    expect(result.status).toBe('OK');
    expect(result.selectedValue).toEqual(mockSelectedValue);
  });

  it('should return Canceled status when media selection is canceled', async () => {
    mediaDialogService.show.and.returnValue(throwError('Error'));

    const result = await mediaPickerService.promptSelectMedia();
    expect(result.status).toBe('Canceled');
  });
});
