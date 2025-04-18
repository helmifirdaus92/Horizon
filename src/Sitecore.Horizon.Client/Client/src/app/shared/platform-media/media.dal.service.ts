/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { extractGqlErrorCode } from 'app/shared/utils/graphql.utils';
import { MaybeObservable, resolveMaybeObservables } from 'app/shared/utils/rxjs/rxjs-custom';
import { Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ConfigurationService } from '../configuration/configuration.service';
import {
  MediaBlob,
  MediaFolder,
  MediaFolderFlat,
  MediaItem,
  MediaQueryResult,
  MediaUploadResult,
} from './media.interface';

export type GetMediaItemErrorCode = 'UnknownError' | 'NotFound' | 'SourceNotFound' | 'NotAMedia';
export type GetMediaFolderErrorCode = 'UnknownError' | 'NotFound' | 'NotAFolder';
export type GetMediaErrorCode = 'UnknownError' | 'SourceNotFound' | 'RootNotFound';
export type GetFolderAncestorsErrorCode =
  | 'UnknownError'
  | 'InvalidId'
  | 'NotFound'
  | 'NotAFolder'
  | 'SourceNotFound'
  | 'SourceNotReachable';

@Injectable({ providedIn: 'root' })
export class MediaDalService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  static queries = require('graphql-tag/loader!./media.graphql');

  constructor(
    private readonly apollo: Apollo,
    private readonly configurationService: ConfigurationService,
  ) {}

  getMediaItemType(
    options: {
      path: MaybeObservable<string>;
      language: MaybeObservable<string>;
      site: MaybeObservable<string>;
    },
    useCache = true,
  ): Observable<{ id: string; isImage: boolean; isFile: boolean }> {
    return resolveMaybeObservables(options.path, options.language, options.site).pipe(
      switchMap(([path, language, site]) =>
        this.apollo
          .query<{
            item: {
              id: string;
              template: {
                isImage: boolean;
                isFile: boolean;
              };
            };
          }>({
            query: MediaDalService.queries['GetMediaItemType'],
            fetchPolicy: useCache ? 'cache-first' : 'network-only',
            variables: {
              path,
              language,
              site,
            },
          })
          .pipe(catchError(extractGqlErrorCode)),
      ),
      map(({ data: { item } }) => ({
        id: item.id,
        isImage: item.template.isImage,
        isFile: item.template.isFile,
      })),
    );
  }

  getMediaItem(
    options: {
      path: MaybeObservable<string>;
      language: MaybeObservable<string>;
      site: MaybeObservable<string>;
      sources: MaybeObservable<readonly string[]>;
    },
    useCache = true,
  ): Observable<MediaItem> {
    return resolveMaybeObservables(options.path, options.language, options.site, options.sources).pipe(
      switchMap(([path, language, site, sources]) =>
        this.apollo
          .query<{
            mediaItem: {
              id: string;
              alt: string | null;
              dimensions: string | null;
              displayName: string;
              extension: string;
              height: number | null;
              parentId: string;
              path: string;
              size: number | null;
              url: string;
              width: number | null;
              embedUrl: string;
            };
          }>({
            query: MediaDalService.queries['GetMediaItem'],
            fetchPolicy: useCache ? 'cache-first' : 'network-only',
            variables: {
              path,
              language,
              site,
              sources,
            },
          })
          .pipe(catchError(extractGqlErrorCode)),
      ),
      map(({ data: { mediaItem } }) => ({
        id: mediaItem.id,
        alt: mediaItem.alt ?? undefined,
        dimensions: mediaItem.dimensions ?? undefined,
        displayName: mediaItem.displayName,
        extension: mediaItem.extension,
        height: mediaItem.height ?? undefined,
        parentId: mediaItem.parentId,
        path: mediaItem.path,
        size: mediaItem.size ?? undefined,
        url: mediaItem.url,
        width: mediaItem.width ?? undefined,
        embedUrl: mediaItem.embedUrl,
      })),
    );
  }

  getMedia(options: {
    language: string;
    site: string;
    sources: readonly string[];
    query?: string;
    root?: string;
    baseTemplateIds?: readonly string[];
  }): Observable<MediaQueryResult> {
    const baseTemplatesSupported = this.configurationService.isMediaQuerySupportsBaseTemplates();
    if (!baseTemplatesSupported) {
      delete options.baseTemplateIds;
    }

    return this.apollo
      .query<{ mediaQuery: MediaQueryResult }>({
        query: baseTemplatesSupported
          ? MediaDalService.queries['QueryMedia']
          : MediaDalService.queries['QueryMediaImagesOnly'],
        variables: options,
        fetchPolicy: 'network-only',
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data.mediaQuery),
      );
  }

  uploadMedia(media: MediaBlob, folderId: string, language: string, site: string): Observable<MediaUploadResult> {
    return this.apollo
      .mutate<{ uploadMedia: MediaUploadResult }>({
        mutation: MediaDalService.queries['UploadMedia'],
        variables: {
          input: {
            fileName: media.fileName,
            extension: media.extension,
            blob: media.blob,
            destinationFolderId: folderId,
            mediaId: '',
            language,
            site,
          },
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => data!.uploadMedia),
      );
  }

  getMediaFolder(
    language$: MaybeObservable<string>,
    site$: MaybeObservable<string>,
    path$?: MaybeObservable<string>,
  ): Observable<MediaFolder> {
    return resolveMaybeObservables(language$, site$, path$ || undefined).pipe(
      switchMap(([language, site, path]) =>
        this.apollo
          .query<{ mediaFolderItem: MediaFolder }>({
            query: MediaDalService.queries['GetMediaFolder'],
            fetchPolicy: 'network-only',
            variables: { path, language, site },
          })
          .pipe(catchError(extractGqlErrorCode)),
      ),
      map(({ data }) => data.mediaFolderItem),
    );
  }

  /**
   * Flat sub-tree between the given source and path, both included.
   * It includes sibilings in all levels.
   * Source defaults to media library root.
   */
  getFolderAncestors(
    path$: MaybeObservable<string>,
    language$: MaybeObservable<string>,
    site$: MaybeObservable<string>,
    sources$: MaybeObservable<readonly string[]>,
  ): Observable<MediaFolderFlat[]> {
    return resolveMaybeObservables(path$, language$, site$, sources$).pipe(
      switchMap(([path, language, site, sources]) =>
        this.apollo
          .query<{ mediaFolderAncestors: MediaFolderFlat[] }>({
            query: MediaDalService.queries['GetMediaFolderAncestors'],
            // Do not cache to always saw fresh tree in Media Library dialog.
            // It should not affect performance because only single request is fired and it only happens on Media Library dialog open
            fetchPolicy: 'no-cache',
            variables: { path, language, site, sources },
          })
          .pipe(catchError(extractGqlErrorCode)),
      ),
      map(({ data }) => data.mediaFolderAncestors),
    );
  }
}
