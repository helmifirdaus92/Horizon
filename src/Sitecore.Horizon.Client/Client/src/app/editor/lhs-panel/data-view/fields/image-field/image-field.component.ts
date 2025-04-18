/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { PopoverDirective } from '@sitecore/ng-spd-lib';
import { MediaFileUploadService } from 'app/editor/right-hand-side/image-field/image-field-file-upload.service';
import { ImageFieldHandlerService } from 'app/editor/right-hand-side/image-field/image-field-handler.service';
import { MediaValue } from 'app/editor/right-hand-side/image-field/image-field-messaging.service';
import { MediaDialogService } from 'app/shared/dialogs/media-dialog/media-dialog.service';
import { MediaLibraryService } from 'app/shared/dialogs/media-dialog/platform-media-provider/media-library.service';
import { ItemField } from 'app/shared/graphql/item.dal.service';
import { allowedFileExtensions } from 'app/shared/platform-media/media.interface';
import { addAltToMediaRawValue } from 'app/shared/platform-media/media.utils';
import { firstValueFrom } from 'rxjs';
import { getEmptyValue, parseImageRawValue } from '../../data-view.utils';

@Component({
  selector: 'app-image-field',
  templateUrl: './image-field.component.html',
  styleUrls: ['./image-field.component.scss'],
  providers: [MediaLibraryService],
})
export class ImageFieldComponent implements AfterViewInit {
  private _field: ItemField;
  @Input({ required: true }) set field(val: ItemField) {
    this._field = val;
    this.sources = val.templateField.dataSource.map((source) => source.itemId) ?? [];
  }
  @Input({ required: true }) set rawValue(value: string) {
    this.init(value);
  }
  @Input() size: 'sm' | 'lg' = 'lg';

  thumbnailData: { src: string; alt?: string } | undefined;
  supportedFileExtensions = allowedFileExtensions;
  fileMaxSize = '2GB';
  readonly thumbnailMaxHeight = 126;
  isDragging = false;
  imageFieldValue: MediaValue | null = null;
  sources: string[] = [];
  showOverlay = false;
  imageAltText = '';
  imagePath: string = '';

  get field(): ItemField {
    return this._field;
  }

  @Output() selectedItemChange = new EventEmitter<MediaValue>();
  @Output() resetToStandardValue = new EventEmitter<void>();
  @Output() imageAltTextChange = new EventEmitter<MediaValue>();
  @ViewChild('popoverInstance') private popoverInstance?: PopoverDirective;

  constructor(
    private readonly mediaDialogService: MediaDialogService,
    private readonly imageFieldHandlerService: ImageFieldHandlerService,
    private readonly mediaFileUploadService: MediaFileUploadService,
  ) {}

  ngAfterViewInit(): void {
    document.addEventListener('scroll', this.onScroll, true);
  }

  private async init(value: string) {
    this.imageFieldValue = parseImageRawValue(value);

    const mediaId = this.imageFieldValue.mediaId;
    if (!mediaId) {
      this.imagePath = '';
      this.thumbnailData = undefined;
    }

    try {
      const imageData = await firstValueFrom(this.imageFieldHandlerService.resolveImageData(this.imageFieldValue));

      this.imagePath = imageData.path ?? '';
      this.thumbnailData = {
        src: imageData.thumbnail?.src ?? '',
        alt: this.imageFieldValue?.alt ?? '',
      };
    } catch (error) {
      console.error('Failed to resolve image data:', error);
      this.imagePath = '';
      this.thumbnailData = undefined;
    }
  }

  async selectFromMediaDialog(): Promise<void> {
    const newValue = await firstValueFrom(
      this.mediaDialogService.show({ currentValue: this.imageFieldValue, sources: this.sources }),
    );

    this.init(newValue.rawValue);

    this.selectedItemChange.emit(newValue);
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

    if (event.dataTransfer && event.dataTransfer.files) {
      const file: File = event.dataTransfer.files[0];

      const folderId = this.sources?.[0] ?? '';
      const result = await this.mediaFileUploadService.uploadFile(file, folderId);

      if (result) {
        const { imageFieldValue, thumbnailData } = result;

        this.imageFieldValue = imageFieldValue;
        this.thumbnailData = thumbnailData;
        this.selectedItemChange.emit(this.imageFieldValue);
      }
    }
  }

  updateMediaAltText(): void {
    if (this.imageFieldValue && this.imageFieldValue.alt !== this.imageAltText) {
      const valueWithAlt = addAltToMediaRawValue(this.imageFieldValue.rawValue, this.imageAltText);
      this.imageAltTextChange.emit({ ...this.imageFieldValue, src: this.thumbnailData?.src, rawValue: valueWithAlt });
    }
  }

  remove() {
    this.selectedItemChange.emit(getEmptyValue());
    this.imagePath = '';
    this.thumbnailData = undefined;
  }

  private onScroll = (): void => {
    if (this.popoverInstance && this.popoverInstance.isPopoverVisible()) {
      this.popoverInstance.hide(0);
    }
  };
}
