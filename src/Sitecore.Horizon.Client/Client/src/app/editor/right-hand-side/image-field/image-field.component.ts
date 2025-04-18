/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NgModel } from '@angular/forms';
import { parseImageRawValue } from 'app/editor/lhs-panel/data-view/data-view.utils';
import { ContextService } from 'app/shared/client-state/context.service';
import { MediaDialogService } from 'app/shared/dialogs/media-dialog/media-dialog.service';
import { MediaLibraryService } from 'app/shared/dialogs/media-dialog/platform-media-provider/media-library.service';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { FieldChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { allowedFileExtensions, MediaItem } from 'app/shared/platform-media/media.interface';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { shareReplayLatest } from 'app/shared/utils/rxjs/rxjs-custom';
import { BehaviorSubject, combineLatest, EMPTY, firstValueFrom, Observable, of, race } from 'rxjs';
import { delay, filter, first, map, switchMap, take, tap } from 'rxjs/operators';
import { RhsEditorMessaging } from '../rhs-editor-messaging';
import { MediaFileUploadService } from './image-field-file-upload.service';
import { ImageFieldHandlerService } from './image-field-handler.service';
import { ImageFieldMessagingService, isSameValue, MediaValue } from './image-field-messaging.service';

function buildRawValue({ id }: MediaItem) {
  return `<image mediaid="${id}" />`;
}

export function buildImageValue(media: MediaItem): MediaValue {
  return {
    rawValue: buildRawValue(media),
    mediaId: media.id,
    src: media.url,
    alt: media.alt,
    width: media.width,
    height: media.height,
  };
}

@Component({
  selector: 'app-image-field',
  styleUrls: ['./image-field.component.scss'],
  templateUrl: './image-field.component.html',
  providers: [ImageFieldMessagingService, MediaLibraryService],
  host: {
    '[class.hide]': '!showField',
  },
})
export class ImageFieldComponent implements OnInit, OnDestroy {
  @Input() chrome?: FieldChromeInfo;
  @Input() rhsMessaging?: RhsEditorMessaging;

  @Output() validateImageAltText = new EventEmitter<NgModel>();

  private thumbnailDataSubject = new BehaviorSubject<{ src: string; alt: string } | null>(null);
  thumbnailData$ = this.thumbnailDataSubject.asObservable();
  path$: Observable<string> = EMPTY;
  imagePath: string = '';
  imageAltText: string = '';
  supportedFileExtensions = allowedFileExtensions;
  fileMaxSize = '2GB';

  invalidPath = false;
  showField = false;
  showOverlay = false;
  isDragging = false;
  hasValue = false;
  readonly thumbnailMaxHeight = 126;

  get currentValue$(): Observable<MediaValue | null> {
    return this.messagingService.currentValue$;
  }

  private sources$: Observable<string[]> = EMPTY;
  private readonly lifetime = new Lifetime();

  constructor(
    private readonly mediaDialogService: MediaDialogService,
    private readonly context: ContextService,
    private readonly itemService: BaseItemDalService,
    private readonly messagingService: ImageFieldMessagingService,
    private readonly imageFieldHandlerService: ImageFieldHandlerService,
    private readonly mediaFileUploadService: MediaFileUploadService,
  ) {}

  ngOnInit() {
    if (!this.rhsMessaging || !this.chrome) {
      throw Error('Messaging or chrome is not assigned, please check markup.');
    }

    this.messagingService.init(this.rhsMessaging);

    const imgData = this.currentValue$.pipe(
      switchMap((value) => this.imageFieldHandlerService.resolveImageData(value)),
      shareReplayLatest(),
    );

    this.thumbnailData$ = imgData.pipe(map(({ thumbnail }) => thumbnail ?? null));

    this.thumbnailData$.subscribe((data) => {
      this.hasValue = !!data?.src;
    });

    this.path$ = imgData.pipe(
      map(({ path }) => path),
      tap(() => (this.invalidPath = false)),
      shareReplayLatest(),
    );

    this.sources$ = this.itemService
      .getFieldDataSources(
        this.chrome.contextItem.id,
        this.chrome.fieldId,
        this.context.language,
        this.context.siteName,
      )
      .pipe(shareReplayLatest());

    this.showFieldWhenReady(imgData);

    this.currentValue$.pipe(takeWhileAlive(this.lifetime)).subscribe((value) => {
      const rawValue = value?.rawValue ?? null;
      const { alt, src } = parseImageRawValue(rawValue ?? '');

      this.imageAltText = alt ?? '';
      this.imagePath = src ?? '';
    });
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
    this.messagingService.destroy();
  }

  onPathChange(path: string): void {
    // Presume the new path is valid.
    this.invalidPath = false;

    if (path === '') {
      this.clear();
      return;
    }

    const selectedImage$ = this.imageFieldHandlerService.getMediaItem(path, this.sources$, false).pipe(
      tap({
        error: () => (this.invalidPath = true),
      }),
      map((media) => buildImageValue(media)),
    );

    this.changeMedia(selectedImage$);
  }

  clear() {
    this.messagingService.clear();
    this.imagePath = '';
  }

  selectFromMediaDialog(): void {
    // If getting sources fails (for example user doesnt have access) we will not open the dialog.
    // Instead changeMedia should handle the error and show the correct message.
    const newValue$ = combineLatest([this.currentValue$, this.sources$]).pipe(
      first(),
      switchMap(([currentValue, sources]) =>
        this.mediaDialogService
          .show({
            currentValue,
            sources,
          })
          .pipe(filter((newValue) => !isSameValue(currentValue, newValue))),
      ),
    );

    this.changeMedia(newValue$);
  }

  blurElement(el: EventTarget | null) {
    el?.dispatchEvent(new Event('blur'));
  }

  private showFieldWhenReady(dataReady: Observable<any>) {
    /*
      To prevent flickering we wait until the image data is initialized.
      But if that takes more than 300ms then show an empty image field as a placeholder while resolving the data.
    */
    race(dataReady.pipe(take(1)), of(true).pipe(delay(300)))
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(() => (this.showField = true));
  }

  private changeMedia(newValue$: Observable<MediaValue>) {
    // Do not bind this subscription to component lifetime as we should
    // complete save in progress if this component is disposed.
    newValue$.subscribe({
      next: (newValue) => {
        this.messagingService.set(newValue);
        this.imagePath = newValue.src ?? '';
      },
      error: (code) => this.imageFieldHandlerService.handleChangeImageError(code),
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      const folderId = (await firstValueFrom(this.sources$))[0] ?? '';

      const result = await this.mediaFileUploadService.uploadFile(file, folderId);
      if (result) {
        const { imageFieldValue, thumbnailData } = result;

        this.imagePath = imageFieldValue.src ?? '';
        this.thumbnailDataSubject.next({ src: thumbnailData.src, alt: thumbnailData.alt ?? '' });
        this.changeMedia(of(imageFieldValue));
      }
    }
  }
}
