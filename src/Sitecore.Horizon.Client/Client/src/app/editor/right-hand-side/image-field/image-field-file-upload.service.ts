/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { MediaActionNotificationService } from 'app/shared/dialogs/media-dialog/platform-media-provider/action-bar/media-action-notification.service';
import { buildMediaValue } from 'app/shared/dialogs/media-dialog/platform-media-provider/media-library.component';
import { MediaLibraryService } from 'app/shared/dialogs/media-dialog/platform-media-provider/media-library.service';
import { MediaUploadResultCode } from 'app/shared/platform-media/media.interface';
import { checkUploadFileErrorType } from 'app/shared/platform-media/media.utils';
import { MediaValue } from './image-field-messaging.service';

@Injectable({
  providedIn: 'root',
})
export class MediaFileUploadService {
  constructor(
    private readonly mediaLibraryService: MediaLibraryService,
    private readonly mediaNotificationService: MediaActionNotificationService,
  ) {}

  async uploadFile(
    file: File,
    folderId: string,
  ): Promise<{ imageFieldValue: MediaValue; thumbnailData: { src: string; alt?: string } } | null> {
    const checkIsFileValid = checkUploadFileErrorType(file);

    if (!checkIsFileValid.isValid) {
      this.mediaNotificationService.handleMediaUploadNotification(checkIsFileValid.errorCode, {}, 'error', 'root');
      return null;
    }

    try {
      const uploadResult = await this.mediaLibraryService.uploadMediaItem(file, folderId ?? '');
      if (uploadResult?.mediaItem) {
        const { displayName, extension } = uploadResult.mediaItem;
        this.mediaNotificationService.handleMediaUploadNotification(
          'UploadSuccess',
          { fileName: displayName, extension },
          'success',
          'root',
        );

        const resolveThumbnail = {
          src: uploadResult.mediaItem.url,
          alt: uploadResult.mediaItem.alt ?? '',
        };

        const imageFieldValue = buildMediaValue(uploadResult.mediaItem, 'image');
        return { imageFieldValue, thumbnailData: resolveThumbnail };
      }
    } catch (code) {
      await this.mediaNotificationService.handleMediaUploadNotification(
        code as MediaUploadResultCode,
        { fileName: file.name },
        'error',
        'root',
      );
    }

    return null;
  }
}
