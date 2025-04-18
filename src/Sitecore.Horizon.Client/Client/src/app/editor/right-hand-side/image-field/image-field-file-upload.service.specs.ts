/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { MediaActionNotificationService } from 'app/shared/dialogs/media-dialog/platform-media-provider/action-bar/media-action-notification.service';
import { MediaLibraryService } from 'app/shared/dialogs/media-dialog/platform-media-provider/media-library.service';
import { MediaItem, MediaUploadResultCode } from 'app/shared/platform-media/media.interface';

import * as mediaBuilder from 'app/shared/dialogs/media-dialog/platform-media-provider/media-library.component';
import * as mediaUtils from 'app/shared/platform-media/media.utils';
import { MediaFileUploadService } from './image-field-file-upload.service';
import { MediaValue } from './image-field-messaging.service';

describe('MediaFileUploadService', () => {
  let service: MediaFileUploadService;
  let mediaLibraryService: jasmine.SpyObj<MediaLibraryService>;
  let mediaNotificationService: jasmine.SpyObj<MediaActionNotificationService>;

  const mockFile = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
  const folderId = 'folder123';
  const mockMediaItem: MediaItem = {
    id: '123',
    url: 'http://example.com/image.jpg',
    embedUrl: '',
    width: 0,
    height: 0,
    alt: 'An image',
    displayName: 'image.jpg',
    parentId: '',
    path: '/some/path',
  };

  const mockMediaValue: MediaValue = {
    rawValue: '<image mediaid="123" />',
    src: mockMediaItem.url,
    alt: mockMediaItem.alt,
    mediaId: mockMediaItem.id,
  };

  beforeEach(() => {
    mediaLibraryService = jasmine.createSpyObj('MediaLibraryService', ['uploadMediaItem']);
    mediaNotificationService = jasmine.createSpyObj('MediaActionNotificationService', [
      'handleMediaUploadNotification',
    ]);

    TestBed.configureTestingModule({
      providers: [
        MediaFileUploadService,
        { provide: MediaLibraryService, useValue: mediaLibraryService },
        { provide: MediaActionNotificationService, useValue: mediaNotificationService },
      ],
    });

    service = TestBed.inject(MediaFileUploadService);
  });

  it('should upload valid file and return data', async () => {
    spyOn(mediaUtils, 'checkUploadFileErrorType').and.returnValue({
      isValid: true,
      errorCode: null,
    });
    spyOn(mediaBuilder, 'buildMediaValue').and.returnValue(mockMediaValue);

    mediaLibraryService.uploadMediaItem.and.resolveTo({
      mediaItem: mockMediaItem,
      success: false,
    });

    const result = await service.uploadFile(mockFile, folderId);

    expect(mediaLibraryService.uploadMediaItem).toHaveBeenCalledWith(mockFile, folderId);
    expect(mediaNotificationService.handleMediaUploadNotification).toHaveBeenCalledWith(
      'UploadSuccess',
      { fileName: mockMediaItem.displayName, extension: mockMediaItem.extension },
      'success',
      'root',
    );
    expect(result).toEqual({
      imageFieldValue: mockMediaValue,
      thumbnailData: {
        src: mockMediaItem.url,
        alt: mockMediaItem.alt,
      },
    });
  });

  it('should return null and notify if file is invalid', async () => {
    spyOn(mediaUtils, 'checkUploadFileErrorType').and.returnValue({ isValid: false, errorCode: 'InvalidFile' });

    const result = await service.uploadFile(mockFile, folderId);

    expect(mediaNotificationService.handleMediaUploadNotification).toHaveBeenCalledWith(
      'InvalidFormat',
      {},
      'error',
      'root',
    );
    expect(result).toBeNull();
  });

  it('should return null and notify on upload error', async () => {
    spyOn(mediaUtils, 'checkUploadFileErrorType').and.returnValue({
      isValid: true,
      errorCode: null,
    });

    mediaLibraryService.uploadMediaItem.and.rejectWith('UploadFailed');

    const result = await service.uploadFile(mockFile, folderId);

    expect(mediaNotificationService.handleMediaUploadNotification).toHaveBeenCalledWith(
      'UploadFailed' as MediaUploadResultCode,
      { fileName: mockFile.name },
      'error',
      'root',
    );
    expect(result).toBeNull();
  });

  it('should fallback alt to empty string if undefined', async () => {
    spyOn(mediaUtils, 'checkUploadFileErrorType').and.returnValue({
      isValid: true,
      errorCode: null,
    });

    const itemWithoutAlt = { ...mockMediaItem, alt: undefined };
    mediaLibraryService.uploadMediaItem.and.resolveTo({
      mediaItem: itemWithoutAlt,
      success: false,
    });

    spyOn(mediaBuilder, 'buildMediaValue').and.returnValue(mockMediaValue);

    const result = await service.uploadFile(mockFile, folderId);

    expect(result?.thumbnailData.alt).toBe('');
  });
});
