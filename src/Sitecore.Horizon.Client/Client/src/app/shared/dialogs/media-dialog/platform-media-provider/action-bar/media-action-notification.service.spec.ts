/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GetFieldSourcesError } from 'app/editor/right-hand-side/editor-rhs.service';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { GetMediaErrorCode, GetMediaFolderErrorCode } from 'app/shared/platform-media/media.dal.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { firstValueFrom, of } from 'rxjs';

import { MediaActionNotificationService } from './media-action-notification.service';

describe(MediaActionNotificationService.name, () => {
  let sut: MediaActionNotificationService;
  let timedNotificationsServiceSpy: jasmine.SpyObj<TimedNotificationsService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;
  let translation$: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule],
      providers: [
        MediaActionNotificationService,
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>('TimedNotificationsService', [
            'pushNotification',
            'hideNotificationById',
            'push',
          ]),
        },
        {
          provide: TranslateService,
          useValue: jasmine.createSpyObj<TranslateService>('TranslateService', ['get']),
        },
      ],
    });
  });
  beforeEach(() => {
    sut = TestBed.inject(MediaActionNotificationService);
    timedNotificationsServiceSpy = TestBedInjectSpy(TimedNotificationsService);
    translateServiceSpy = TestBedInjectSpy(TranslateService);
    translation$ = of('message');
    translateServiceSpy.get.and.returnValue(translation$);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('handleFolderOrMediaError', () => {
    const codes: Array<[GetMediaFolderErrorCode | GetMediaErrorCode | GetFieldSourcesError, string]> = [
      ['NotFound', 'MEDIA.ERRORS.NOT_FOUND'],
      ['SourceNotFound', 'MEDIA.ERRORS.SOURCE_NOT_FOUND'],
      ['InvalidTemplateSource', 'MEDIA.ERRORS.SOURCE_NOT_FOUND'],
    ];
    codes.forEach(([code, expectedTranslationKey]) => {
      it(`[code: '${code}', expectedTranslationKey: '${expectedTranslationKey}'] should get the translation and push an error notification`, () => {
        // act
        sut.handleFolderOrMediaError(code);

        // assert
        expect(translateServiceSpy.get).toHaveBeenCalledWith(expectedTranslationKey);
        expect(timedNotificationsServiceSpy.push).toHaveBeenCalledWith(
          'MediaLibrary-' + expectedTranslationKey,
          translation$,
          'error',
        );
      });
    });

    describe(`AND code is unknown`, () => {
      const code = 'UnknownError';

      it('should get the GENERIC error translation and push an error notification', () => {
        // act
        sut.handleFolderOrMediaError(code);

        // assert
        const expectedTranslationKey = 'MEDIA.ERRORS.GENERIC';
        expect(translateServiceSpy.get).toHaveBeenCalledWith(expectedTranslationKey);
        expect(timedNotificationsServiceSpy.push).toHaveBeenCalledWith(
          'MediaLibrary-' + expectedTranslationKey,
          translation$,
          'error',
        );
      });
    });
  });

  describe('handleMediaUploadNotification', () => {
    it('should push success notification if [code=UploadSuccess]', async () => {
      const code = 'UploadSuccess';
      const message = 'MEDIA.UPLOAD.SUCCESS';

      await sut.handleMediaUploadNotification(code, { fileName: 'testName', extension: 'jpg' }, 'success');

      const text = await firstValueFrom(translation$);
      const timedNotification = new TimedNotification(code, text as string, 'success', 'dialog');

      const notification = timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args[0];

      expect(translateServiceSpy.get).toHaveBeenCalledWith(message, {
        fileName: 'testName',
        extension: 'jpg',
      });
      expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledWith(notification);
      expect(notification).toEqual(timedNotification);
    });

    it('should push fail notification if [code=GenericError]', async () => {
      const code = 'GenericError';
      const message = 'MEDIA.UPLOAD.FAILED';

      await sut.handleMediaUploadNotification(code);

      const text = await firstValueFrom(translation$);
      const timedNotification = new TimedNotification(code, text as string, 'error', 'dialog');

      const notification = timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args[0];

      expect(translateServiceSpy.get).toHaveBeenCalledWith(message, {
        fileName: undefined,
        extension: undefined,
      });
      expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledWith(notification);
      expect(notification).toEqual(timedNotification);
    });

    it('should push max file size notification if [code=FileSizeTooBig]', async () => {
      const code = 'FileSizeTooBig';
      const message = 'MEDIA.UPLOAD.MAX_FILE_SIZE';

      await sut.handleMediaUploadNotification(code);

      const text = await firstValueFrom(translation$);
      const timedNotification = new TimedNotification(code, text as string, 'error', 'dialog');

      const notification = timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args[0];

      expect(translateServiceSpy.get).toHaveBeenCalledWith(message, {
        fileName: undefined,
        extension: undefined,
      });
      expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledWith(notification);
      expect(notification).toEqual(timedNotification);
    });

    it('should push file not supported notification if [code=InvalidExtension]', async () => {
      const code = 'InvalidExtension';
      const message = 'MEDIA.UPLOAD.UNSUPPORTED_FILE_TYPE';

      await sut.handleMediaUploadNotification(code);

      const text = await firstValueFrom(translation$);
      const timedNotification = new TimedNotification(code, text as string, 'error', 'dialog');

      const notification = timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args[0];

      expect(translateServiceSpy.get).toHaveBeenCalledWith(message, {
        fileName: undefined,
        extension: undefined,
      });
      expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledWith(notification);
      expect(notification).toEqual(timedNotification);
    });

    it('should push file already exist notification if [code=FileNameAlreadyExist]', async () => {
      const code = 'FileNameAlreadyExist';
      const message = 'MEDIA.UPLOAD.FILE_NAME_EXIST';

      await sut.handleMediaUploadNotification(code);

      const text = await firstValueFrom(translation$);
      const timedNotification = new TimedNotification(code, text as string, 'error', 'dialog');

      const notification = timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args[0];

      expect(translateServiceSpy.get).toHaveBeenCalledWith(message, {
        fileName: undefined,
        extension: undefined,
      });
      expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledWith(notification);
      expect(notification).toEqual(timedNotification);
    });

    it('should show insufficient privileges notification on InsufficientPrivileges error', async () => {
      const code = 'InsufficientPrivileges';
      const message = 'MEDIA.UPLOAD.INSUFFICIENT_PRIVILEGES';

      await sut.handleMediaUploadNotification(code);

      const text = await firstValueFrom(translation$);
      const timedNotification = new TimedNotification(code, text as string, 'error', 'dialog');

      const notification = timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args[0];

      expect(translateServiceSpy.get).toHaveBeenCalledWith(message, {
        fileName: undefined,
        extension: undefined,
      });
      expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledWith(notification);
      expect(notification).toEqual(timedNotification);
    });

    it('should show destination folder not found notification on DestinationFolderNotFound error', async () => {
      const code = 'DestinationFolderNotFound';
      const message = 'MEDIA.UPLOAD.DESTINATION_FOLDER_NOT_FOUND';

      await sut.handleMediaUploadNotification(code);

      const text = await firstValueFrom(translation$);
      const timedNotification = new TimedNotification(code, text as string, 'error', 'dialog');

      const notification = timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args[0];

      expect(translateServiceSpy.get).toHaveBeenCalledWith(message, {
        fileName: undefined,
        extension: undefined,
      });
      expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledWith(notification);
      expect(notification).toEqual(timedNotification);
    });

    it('should show invalid file notification on InvalidFile error', async () => {
      const code = 'InvalidFile';
      const message = 'MEDIA.UPLOAD.INVALID_FILE';

      await sut.handleMediaUploadNotification(code);

      const text = await firstValueFrom(translation$);
      const timedNotification = new TimedNotification(code, text as string, 'error', 'dialog');

      const notification = timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args[0];

      expect(translateServiceSpy.get).toHaveBeenCalledWith(message, {
        fileName: undefined,
        extension: undefined,
      });
      expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledWith(notification);
      expect(notification).toEqual(timedNotification);
    });

    it('should show SVG scripts not allowed notification on SvgScriptsNotAllowed error', async () => {
      const code = 'SvgScriptsNotAllowed';
      const message = 'MEDIA.UPLOAD.SVG_SCRIPTS_NOT_ALLOWED';

      await sut.handleMediaUploadNotification(code, { fileName: 'test.svg' });

      const text = await firstValueFrom(translation$);
      const timedNotification = new TimedNotification(code, '', 'error', 'dialog');
      timedNotification.persistent = true;
      timedNotification.innerHtml = `<strong>"test.svg"</strong> ${text}`;

      const notification = timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args[0];

      expect(translateServiceSpy.get).toHaveBeenCalledWith(message, {
        fileName: 'test.svg',
        extension: undefined,
      });
      expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledWith(notification);
      expect(notification).toEqual(timedNotification);
    });

    it('should push refresh page notification if [code=RefreshPage]', async () => {
      const code = 'RefreshPage';
      const message = 'MEDIA.UPLOAD.REOPEN_DIALOG_INFO';

      await sut.handleMediaUploadNotification(code, {}, 'info', 'dialog', true);

      const text = await firstValueFrom(translation$);
      const timedNotification = new TimedNotification(code, text as string, 'info', 'dialog');
      timedNotification.persistent = true;

      const notification = timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args[0];

      expect(translateServiceSpy.get).toHaveBeenCalledWith(message, {
        fileName: undefined,
        extension: undefined,
      });
      expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledWith(notification);
      expect(notification).toEqual(timedNotification);
    });
  });

  describe('hideNotification', () => {
    it('should hide all active timed notifications', fakeAsync(() => {
      sut.activeNotificationIds = ['GenericError', 'UploadSuccess'];
      sut.stopShowingNotification();
      tick();

      expect(timedNotificationsServiceSpy.hideNotificationById).toHaveBeenCalledTimes(2);
      flush();
    }));

    it('should not call hideNotification if no active notifications', () => {
      sut.activeNotificationIds = [];
      sut.stopShowingNotification();

      expect(timedNotificationsServiceSpy.hideNotificationById).not.toHaveBeenCalled();
    });
  });
});
