/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { GetMediaItemErrorCode, MediaDalService } from 'app/shared/platform-media/media.dal.service';
import { MediaItem } from 'app/shared/platform-media/media.interface';
import { MaybeObservable } from 'app/shared/utils/rxjs/rxjs-custom';
import { catchError, firstValueFrom, map, Observable, of } from 'rxjs';
import { GetFieldSourcesError } from '../editor-rhs.service';
import { MediaValue } from './image-field-messaging.service';

interface MediaPresentationValue {
  path: string;
  thumbnail?: {
    src: string;
    alt: string;
  };
  file?: {
    displayName: string;
    extension?: string;
    size?: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ImageFieldHandlerService {
  constructor(
    private readonly mediaService: MediaDalService,
    private readonly context: ContextService,
    private readonly translateService: TranslateService,
    private readonly timedNotificationsService: TimedNotificationsService,
  ) {}

  resolveImageData(value: MediaValue | null): Observable<MediaPresentationValue> {
    if (!value) {
      return of({
        path: '',
      });
    }

    const mediaId = value.mediaId;
    if (mediaId) {
      // Don't specify sources, as we want to be able to fetch existing image selection
      // even if it's outside of sources or sources are broken.
      return this.getMediaItem(mediaId, [], true).pipe(
        map(({ path, url, alt, extension, size, displayName }) => ({
          path,
          thumbnail: this.resolveImageThumbnail(url, alt),
          file: { displayName, extension, size },
        })),
        catchError(() =>
          of({
            path: mediaId,
            thumbnail: this.resolveImageThumbnail(value.src, value.alt),
            file: undefined,
          }),
        ),
      );
    }

    return of({
      path: value.src ?? '',
      thumbnail: this.resolveImageThumbnail(value.src, value.alt),
    });
  }

  getMediaItem(path: string, sources: MaybeObservable<string[]>, useCache: boolean): Observable<MediaItem> {
    return this.mediaService.getMediaItem(
      {
        path,
        language: this.context.language,
        site: this.context.siteName,
        sources,
      },
      useCache,
    );
  }

  resolveImageThumbnail(src?: string, alt?: string): { src: string; alt: string } | undefined {
    return src ? { src, alt: alt ?? '' } : undefined;
  }

  async handleChangeImageError(code: GetMediaItemErrorCode | GetFieldSourcesError) {
    let errorMessage;
    switch (code) {
      case 'NotFound':
        errorMessage = 'EDITOR.IMAGE.NOT_FOUND';
        break;
      case 'NotAMedia':
        errorMessage = 'EDITOR.IMAGE.NOT_A_MEDIA';
        break;
      case 'InvalidTemplateSource':
        errorMessage = 'EDITOR.IMAGE.INVALID_SOURCES';
        break;
      default:
        errorMessage = 'ERRORS.OPERATION_GENERIC';
    }

    const errorText = await firstValueFrom(this.translateService.get(errorMessage));
    this.timedNotificationsService.push('ChangeImageError-' + code, errorText, 'error');
  }
}
