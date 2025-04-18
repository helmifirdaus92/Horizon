/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { MediaDalService } from 'app/shared/platform-media/media.dal.service';
import {
  MediaBlob,
  MediaFolder,
  MediaFolderFlat,
  MediaItem,
  MediaItemInfo,
  MediaQueryResult,
  MediaUploadResult,
} from 'app/shared/platform-media/media.interface';
import { extractFileNameAndExtension } from 'app/shared/platform-media/media.utils';
import { MaybeObservable, resolveMaybeObservables } from 'app/shared/utils/rxjs/rxjs-custom';
import { isSameGuid } from 'app/shared/utils/utils';
import { firstValueFrom, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MediaActionNotificationService } from './action-bar/media-action-notification.service';

@Injectable({
  providedIn: 'root',
})
export class MediaLibraryService {
  private get site() {
    return this.context.siteName;
  }
  private get language() {
    return this.context.language;
  }

  constructor(
    private context: ContextService,
    private mediaService: MediaDalService,
    private readonly mediaNotificationService: MediaActionNotificationService,
  ) {}

  getFolderChildren({ id, children, hasChildren }: MediaFolder) {
    if (!hasChildren) {
      return [];
    }

    if (!!children) {
      return children;
    }

    return this.mediaService.getMediaFolder(this.language, this.site, id).pipe(map((folder) => folder.children || []));
  }

  getMediaFolder(path$: MaybeObservable<string>): Observable<MediaFolder> {
    return resolveMaybeObservables(path$).pipe(
      switchMap(([path]) =>
        this.mediaService.getMediaFolder(this.language, this.site, path).pipe(
          // Override root.id to be `path` because it can be that BE returns folder with different id than requested for.
          // This can happen when client requests path = '' (default) and server returns id of media library root.
          // This would cause content to refresh since folder has apparently changed.
          map((root) => ({ ...root, id: path })),
        ),
      ),
    );
  }

  getFlatTree(
    path$: MaybeObservable<string>,
    sources$: MaybeObservable<readonly string[]>,
  ): Observable<readonly MediaFolderFlat[]> {
    return this.mediaService.getFolderAncestors(path$, this.language, this.site, sources$);
  }

  getMedia(
    root$: MaybeObservable<string | null>,
    sources$: MaybeObservable<readonly string[]>,
    query$: MaybeObservable<string> = '',
    baseTemplateIds$: MaybeObservable<string[] | undefined> = undefined,
  ): Observable<MediaQueryResult> {
    return resolveMaybeObservables(root$, sources$, query$, baseTemplateIds$).pipe(
      switchMap(([root, sources, query, baseTemplateIds]) =>
        this.mediaService.getMedia({
          language: this.language,
          site: this.site,
          sources,
          query,
          root: root || undefined,
          baseTemplateIds,
        }),
      ),
    );
  }

  getMediaItem(path: MaybeObservable<string>, sources: MaybeObservable<readonly string[]>): Observable<MediaItem> {
    return this.mediaService.getMediaItem({ path, language: this.language, site: this.site, sources });
  }

  getMediaItemType(path: MaybeObservable<string>) {
    return this.mediaService.getMediaItemType({ path, language: this.language, site: this.site });
  }

  withSelectedItemInFront(selectedId: string, items: MediaItemInfo[]): Observable<readonly MediaItemInfo[]> {
    if (!selectedId || !items.length) {
      return of(items);
    }

    const index = items.findIndex((item) => isSameGuid(item.id, selectedId));
    if (index !== -1) {
      return of([items[index], ...items.slice(0, index), ...items.slice(index + 1)]);
    }

    return this.mediaService
      .getMediaItem({
        path: selectedId,
        language: this.language,
        site: this.site,
        // Source is not provided on purpose. This way selected item is fetched even if it's outside of sources.
        // Handles a case if the initially selected item is outside of sources.
        sources: [],
      })
      .pipe(
        map((imgData) => [imgData, ...items]),
        catchError(() => of(items)),
      );
  }

  async uploadMediaItem(file: File, currentFolderId: string): Promise<MediaUploadResult | null> {
    const fileReader = await this.readFileAsDataURL(file);
    if (!fileReader.result) {
      return null;
    }

    const { fileName, extension } = extractFileNameAndExtension(file);
    const blob = fileReader.result.toString().split(',')[1];

    if (!blob) {
      await this.mediaNotificationService.handleMediaUploadNotification('InvalidFile');
      return null;
    }

    const mediaItem: MediaBlob = { fileName, extension, blob };

    const uploadResult = await firstValueFrom(
      this.mediaService.uploadMedia(mediaItem, currentFolderId, this.context.language, this.context.siteName),
    );
    return uploadResult;
  }

  private readFileAsDataURL(file: File): Promise<FileReader> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader);
      };
      reader.readAsDataURL(file);
    });
  }
}
