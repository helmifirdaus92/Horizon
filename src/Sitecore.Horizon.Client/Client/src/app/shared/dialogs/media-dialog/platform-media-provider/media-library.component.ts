/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MediaValue } from 'app/editor/right-hand-side/image-field/image-field-messaging.service';
import { GetFolderAncestorsErrorCode } from 'app/shared/platform-media/media.dal.service';
import {
  MediaFolder,
  MediaItem,
  MediaItemInfo,
  MediaUploadResultCode,
} from 'app/shared/platform-media/media.interface';
import {
  checkUploadFileErrorType,
  FILES_BASE_TEMPLATE_IDS,
  IMAGES_BASE_TEMPLATE_IDS,
  parseMediaRawValue,
} from 'app/shared/platform-media/media.utils';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { shareReplayLatest } from 'app/shared/utils/rxjs/rxjs-custom';
import { convertToNestedTree } from 'app/shared/utils/tree.utils';
import { isSameGuid } from 'app/shared/utils/utils';
import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  firstValueFrom,
  merge,
  NEVER,
  Observable,
  of,
  ReplaySubject,
  throwError,
} from 'rxjs';
import { catchError, distinctUntilChanged, map, skipWhile, startWith, switchMap } from 'rxjs/operators';
import { MediaType } from '../media-dialog.service';
import { MediaActionNotificationService } from './action-bar/media-action-notification.service';
import { MediaLibraryService } from './media-library.service';

function buildImageRawValue({ id }: MediaItem) {
  return `<image mediaid="${id}" />`;
}

function buildEmbeddedImageHtml(media: MediaItem) {
  let style = '';
  if (media.width) {
    style += `width:${media.width}px;`;
  }
  if (media.height) {
    style += `height:${media.height}px;`;
  }

  return `<img src="${media.embedUrl}" alt="${media.alt ?? ''}" ${style ? `style="${style}"` : ''}/>`;
}

function buildEmbeddedLinkHtml(href: string, text: string) {
  return `<a href="${href}">${text}</a>`;
}

export function buildMediaValue(media: MediaItem, mediaType: MediaType): MediaValue {
  return {
    rawValue: mediaType === 'image' ? buildImageRawValue(media) : '',
    embeddedHtml:
      mediaType === 'image' ? buildEmbeddedImageHtml(media) : buildEmbeddedLinkHtml(media.url, media.displayName),
    src: media.url,
    alt: media.alt,
    width: media.width,
    height: media.height,
    mediaId: media.id,
  };
}

@Component({
  selector: 'app-media-library',
  templateUrl: 'media-library.component.html',
  styleUrls: ['media-library.component.scss'],
  providers: [MediaLibraryService],
})
export class MediaLibraryComponent implements OnInit, OnDestroy {
  @Input() sources: readonly string[] = [];
  @Input() currentValue: MediaValue | null = null;
  @Output() mediaSelect = new EventEmitter<MediaValue | null>();
  @Input() mediaTypes: MediaType[] = ['image'];

  treeData$: Observable<readonly MediaFolder[]> = EMPTY;
  initiallySelectedFolder$: Observable<string | ''> = EMPTY;
  items$: Observable<MediaItemInfo[]> = EMPTY;
  hasMoreItems$: Observable<boolean> = EMPTY;
  search$ = new BehaviorSubject<string>('');
  isEmpty$: Observable<boolean> = EMPTY;
  reloadMediaContents$ = new BehaviorSubject<unknown>(null);
  selectedId = '';
  currentFolderId = '';
  isLoading = false;

  hasCreatePermission = false;

  private readonly selectedFolder$ = new ReplaySubject<string>(1);
  private readonly lifetime = new Lifetime();

  readonly getChildren = (folder: MediaFolder) => this.mediaLibraryService.getFolderChildren(folder);

  constructor(
    private readonly mediaLibraryService: MediaLibraryService,
    private readonly mediaNotificationService: MediaActionNotificationService,
  ) {}

  ngOnInit() {
    // Context
    this.selectedId = this.currentValue ? parseMediaRawValue(this.currentValue.rawValue).mediaId : '';

    // Media tree
    this.initiallySelectedFolder$ = this.getInitiallySelectedFolder(this.selectedId).pipe(shareReplayLatest());
    this.treeData$ = this.initiallySelectedFolder$.pipe(switchMap((folderId) => this.getInitialTreeData(folderId)));

    // Media content
    this.initializeMediaContent();

    combineLatest([this.selectedFolder$, this.initiallySelectedFolder$])
      .pipe(
        skipWhile(([source, initial]) => isSameGuid(source, initial)),
        map(([source]) => source),
        distinctUntilChanged(),
        takeWhileAlive(this.lifetime),
      )
      .subscribe(() => this.select(''));
  }

  ngOnDestroy() {
    this.lifetime.dispose();
    this.mediaNotificationService.stopShowingNotification();
  }

  folderChange(folder: MediaFolder) {
    this.currentFolderId = folder.id;
    this.hasCreatePermission = folder.permissions?.canCreate ?? false;
    this.selectedFolder$.next(folder.id);
  }

  search(value: string) {
    this.search$.next(value);
  }

  /**
   * Select or clear selection by providing `''`
   * Emit the new selection.
   */
  async select(id: string) {
    if (isSameGuid(id, this.selectedId)) {
      return;
    }
    this.selectedId = id;

    if (!id) {
      this.mediaSelect.emit(null);
      return;
    }

    const mediaItemPromise = firstValueFrom(this.mediaLibraryService.getMediaItem(id, this.sources)).catch(
      () => undefined,
    );
    const mediaItemTypePromise = firstValueFrom(this.mediaLibraryService.getMediaItemType(id)).catch(() => undefined);
    const [mediaItem, mediaItemType] = await Promise.all([mediaItemPromise, mediaItemTypePromise]);

    if (!mediaItem) {
      this.mediaSelect.emit(null);
      return;
    }

    this.mediaSelect.emit(buildMediaValue(mediaItem, mediaItemType?.isImage ? 'image' : 'file'));
  }

  async uploadMediaFile(files: FileList | null): Promise<void> {
    if (!files || !files[0]) {
      // User does not select file or click cancel
      return;
    }
    const file = files[0];
    const checkValidation = checkUploadFileErrorType(file);

    if (!checkValidation.isValid) {
      await this.mediaNotificationService.handleMediaUploadNotification(checkValidation.errorCode);
      return;
    }
    this.isLoading = true;
    try {
      const uploadItem = await this.mediaLibraryService.uploadMediaItem(file, this.currentFolderId);
      this.mediaNotificationService.handleMediaUploadNotification(
        'UploadSuccess',
        {
          fileName: uploadItem?.mediaItem.displayName,
          extension: uploadItem?.mediaItem.extension,
        },
        'success',
      );
      await this.mediaNotificationService.handleMediaUploadNotification('RefreshPage', {}, 'info', 'root', true);
    } catch (code) {
      await this.mediaNotificationService.handleMediaUploadNotification(code as MediaUploadResultCode, {
        fileName: files[0].name,
      });
    }
    this.isLoading = false;
  }

  private initializeMediaContent() {
    const currentSelectedFolder$ = merge(this.initiallySelectedFolder$, this.selectedFolder$).pipe(
      distinctUntilChanged((a, b) => isSameGuid(a, b)),
    );
    const watchSearch$ = this.search$.pipe(startWith(''), distinctUntilChanged());

    const mediaQuery$ = combineLatest([currentSelectedFolder$, watchSearch$, this.reloadMediaContents$]).pipe(
      switchMap(([folder, search]) => this.getMedia(folder, search)),
      shareReplayLatest(),
    );

    this.items$ = mediaQuery$.pipe(
      switchMap(({ items }) => this.mediaLibraryService.withSelectedItemInFront(this.selectedId, items)),
      map((items) => items.concat()),
      shareReplayLatest(),
    );

    this.isEmpty$ = this.items$.pipe(map((data) => data.length === 0));
    this.hasMoreItems$ = mediaQuery$.pipe(map((data) => data.hasMoreItems));
  }

  private getInitiallySelectedFolder(selectedId: string): Observable<string> {
    if (!selectedId) {
      return of(this.getDefaultParentFolderId());
    }

    return this.mediaLibraryService.getMediaItem(selectedId, this.sources).pipe(
      map(({ parentId }) => parentId),
      catchError(() => of(this.getDefaultParentFolderId())),
    );
  }

  private getDefaultParentFolderId(): string {
    // If there is no selected item or we cannot resolve currently selected folder, just fallback to first source.
    // If there are no sources - use empty value, which later might be handled in a special way.
    return this.sources[0] ?? '';
  }

  private getInitialTreeData(selectedFolderId: string | '') {
    const expandedTree$ = selectedFolderId
      ? this.mediaLibraryService
          .getFlatTree(selectedFolderId, this.sources)
          .pipe(map((flatTree) => convertToNestedTree(flatTree)))
      : throwError(() => 'SourceNotReachable');

    return expandedTree$.pipe(
      catchError((code: GetFolderAncestorsErrorCode) => {
        // If cannot expand selected folder or selection is missing, just pre-select first source.
        if (code === 'SourceNotReachable') {
          return this.mediaLibraryService.getMediaFolder(this.getDefaultParentFolderId()).pipe(map((v) => [v]));
        }

        return throwError(() => code);
      }),
      catchError((code) => {
        this.mediaNotificationService.handleFolderOrMediaError(code);
        return of([]);
      }),
    );
  }

  private getMedia(folder: string | null, search = '') {
    const baseTemplateIds: string[] = [];
    if (this.mediaTypes.includes('image')) {
      baseTemplateIds.push(...IMAGES_BASE_TEMPLATE_IDS);
    }
    if (this.mediaTypes.includes('file')) {
      baseTemplateIds.push(...FILES_BASE_TEMPLATE_IDS);
    }

    return this.mediaLibraryService.getMedia(folder, this.sources, search, baseTemplateIds).pipe(
      catchError((code) => {
        this.mediaNotificationService.handleFolderOrMediaError(code);
        return NEVER;
      }),
    );
  }
}
