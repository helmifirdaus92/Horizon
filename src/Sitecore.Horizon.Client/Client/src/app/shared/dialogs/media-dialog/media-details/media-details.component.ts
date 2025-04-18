/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';
import { MediaValue } from 'app/editor/right-hand-side/image-field/image-field-messaging.service';
import { MediaItem } from 'app/shared/platform-media/media.interface';
import { parseMediaRawValue } from 'app/shared/platform-media/media.utils';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MediaDetailsService } from './media-details.service';

interface MediaDetailsValue {
  displayName?: string;
  url?: string;
  alt?: string;
  dimensions?: string;
  extension?: string;
  path?: string;
  size?: number;
  width?: number;
  height?: number;
  isPlatform?: boolean;
}

function buildMediaDetailsValue(
  item: (MediaValue & Partial<MediaItem>) | null | 'error',
  isPlatform?: boolean,
): MediaDetailsValue | null {
  if (!item) {
    return null;
  }

  if (item === 'error') {
    return {};
  }

  return {
    displayName: item.displayName,
    url: item.url ?? item.src,
    alt: item.alt,
    extension: item.extension,
    dimensions: item.dimensions ?? dimensionsFromWidthAndHeight(item.width, item.height),
    path: item.isDam ? item.src : item.path,
    size: item.size,
    isPlatform,
  };
}

function dimensionsFromWidthAndHeight(width?: number, height?: number): string | undefined {
  if (width === undefined || height === undefined) {
    return undefined;
  }

  return `${width} x ${height}`;
}

@Component({
  selector: 'app-media-details',
  templateUrl: './media-details.component.html',
  styleUrls: ['./media-details.component.scss'],
})
export class MediaDetailsComponent {
  @Input() sources: readonly string[] = [];
  @Input() set media(value: MediaValue | null) {
    this.setMediaDetails(value);
  }

  mediaDetails: MediaDetailsValue | null = null;

  readonly defaultDimension = 200;

  constructor(private readonly mediaDetailsService: MediaDetailsService) {}

  private async setMediaDetails(media: MediaValue | null) {
    let mediaItemProperties: MediaItem | null = null;
    let mediaId: string | null = null;

    if (!media) {
      this.mediaDetails = null;
      return;
    }

    mediaId = media.mediaId ?? parseMediaRawValue(media.rawValue).mediaId;
    if (mediaId) {
      mediaItemProperties = await this.getPlatformItemProperties(mediaId);
      if (!mediaItemProperties) {
        this.mediaDetails = buildMediaDetailsValue('error');
        return;
      }
    }

    this.mediaDetails = buildMediaDetailsValue({ ...media, ...mediaItemProperties }, !!mediaId);
  }

  private getPlatformItemProperties(id: string): Promise<MediaItem | null> {
    return firstValueFrom(this.mediaDetailsService.getMediaItem(id, this.sources).pipe(catchError(() => of(null))));
  }

  isSupportedFileType(): boolean {
    return (
      this.mediaDetails?.extension === 'pdf' ||
      this.mediaDetails?.extension === 'doc' ||
      this.mediaDetails?.extension === 'docx'
    );
  }
}
