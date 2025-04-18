/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GetFieldSourcesError } from 'app/editor/right-hand-side/editor-rhs.service';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { GetMediaErrorCode, GetMediaFolderErrorCode } from 'app/shared/platform-media/media.dal.service';
import { MediaBlob, MediaUploadResultCode } from 'app/shared/platform-media/media.interface';
import { runInNextMacrotask } from 'app/shared/utils/utils';
import { firstValueFrom } from 'rxjs';
import { TimedNotificationScope, TimedNotificationSeverity } from 'sdk';

@Injectable({ providedIn: 'root' })
export class MediaActionNotificationService {
  activeNotificationIds: Array<MediaUploadResultCode | null> = [];

  constructor(
    private readonly translateService: TranslateService,
    private readonly timedNotificationService: TimedNotificationsService,
  ) {}

  stopShowingNotification(): void {
    runInNextMacrotask(() => this.hideNotification())();
  }

  async handleMediaUploadNotification(
    code: MediaUploadResultCode,
    file?: Partial<MediaBlob>,
    status: TimedNotificationSeverity = 'error',
    scope: TimedNotificationScope = 'dialog',
    persistent: boolean = false,
  ): Promise<void> {
    let messageKey;
    switch (code) {
      case 'UploadSuccess':
        this.activeNotificationIds.push(code);
        messageKey = 'MEDIA.UPLOAD.SUCCESS';
        break;
      case 'GenericError':
        this.activeNotificationIds.push(code);
        messageKey = 'MEDIA.UPLOAD.FAILED';
        break;
      case 'FileSizeTooBig':
        this.activeNotificationIds.push(code);
        messageKey = 'MEDIA.UPLOAD.MAX_FILE_SIZE';
        break;
      case 'InvalidExtension':
        this.activeNotificationIds.push(code);
        messageKey = 'MEDIA.UPLOAD.UNSUPPORTED_FILE_TYPE';
        break;
      case 'FileNameAlreadyExist':
        this.activeNotificationIds.push(code);
        messageKey = 'MEDIA.UPLOAD.FILE_NAME_EXIST';
        break;
      case 'InsufficientPrivileges':
        this.activeNotificationIds.push(code);
        messageKey = 'MEDIA.UPLOAD.INSUFFICIENT_PRIVILEGES';
        break;
      case 'DestinationFolderNotFound':
        this.activeNotificationIds.push(code);
        messageKey = 'MEDIA.UPLOAD.DESTINATION_FOLDER_NOT_FOUND';
        break;
      case 'InvalidFile':
        this.activeNotificationIds.push(code);
        messageKey = 'MEDIA.UPLOAD.INVALID_FILE';
        break;
      case 'SvgScriptsNotAllowed':
        this.activeNotificationIds.push(code);
        messageKey = 'MEDIA.UPLOAD.SVG_SCRIPTS_NOT_ALLOWED';
        persistent = true;
        break;
      case 'RefreshPage':
        this.activeNotificationIds.push(code);
        messageKey = 'MEDIA.UPLOAD.REOPEN_DIALOG_INFO';
        break;
      default:
        messageKey = 'MEDIA.UPLOAD.FAILED';
    }
    const text = await firstValueFrom(
      this.translateService.get(messageKey, { fileName: file?.fileName, extension: file?.extension }),
    );
    this.activeNotificationIds.forEach((activeNotificationId) => {
      if (activeNotificationId && activeNotificationId === code) {
        const innerHTML = `<strong>"${file?.fileName}"</strong> ${text}`;

        const notification = new TimedNotification(activeNotificationId, '', status);
        code === 'SvgScriptsNotAllowed' ? (notification.innerHtml = innerHTML) : (notification.text = text);
        notification.persistent = persistent;
        notification.notificationScope = scope;
        this.timedNotificationService.pushNotification(notification);
      }
    });
  }

  handleFolderOrMediaError(code: GetMediaFolderErrorCode | GetMediaErrorCode | GetFieldSourcesError): void {
    let messageKey;
    switch (code) {
      case 'SourceNotFound':
      case 'InvalidTemplateSource':
        messageKey = 'MEDIA.ERRORS.SOURCE_NOT_FOUND';
        break;
      case 'NotFound':
      case 'RootNotFound':
        messageKey = 'MEDIA.ERRORS.NOT_FOUND';
        break;
      default:
        messageKey = 'MEDIA.ERRORS.GENERIC';
    }

    this.timedNotificationService.push('MediaLibrary-' + messageKey, this.translateService.get(messageKey), 'error');
  }

  hideNotification(): void {
    if (this.activeNotificationIds.length > 0) {
      for (const id of this.activeNotificationIds) {
        this.timedNotificationService.hideNotificationById(id as string);
      }
      this.activeNotificationIds = [];
    }
  }
}
