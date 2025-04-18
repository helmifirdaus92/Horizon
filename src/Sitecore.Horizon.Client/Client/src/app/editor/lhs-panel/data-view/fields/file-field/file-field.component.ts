/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ImageFieldHandlerService } from 'app/editor/right-hand-side/image-field/image-field-handler.service';
import { MediaValue } from 'app/editor/right-hand-side/image-field/image-field-messaging.service';
import { MediaDialogService } from 'app/shared/dialogs/media-dialog/media-dialog.service';
import { ItemFieldDataSource } from 'app/shared/graphql/item.dal.service';
import { firstValueFrom } from 'rxjs';
import { bytesToKB, getEmptyValue, parseImageRawValue } from '../../data-view.utils';

@Component({
  selector: 'app-file-field',
  templateUrl: './file-field.component.html',
  styleUrls: ['./file-field.component.scss'],
})
export class FileFieldComponent {
  @Input({ required: true }) set dataSources(val: ItemFieldDataSource[]) {
    this.sources = val.map((source) => source.itemId) ?? [];
  }
  @Input({ required: true }) set rawValue(value: string) {
    this.init(value);
  }
  @Output() selectedItemChange = new EventEmitter<{ rawValue: string }>();

  fileData: { fileName: string; extension: string; size?: string } | null = null;
  fileFieldValue: MediaValue | null = null;
  sources: string[] = [];
  showOverlay = false;

  constructor(
    private readonly imageFieldHandlerService: ImageFieldHandlerService,
    private readonly mediaDialogService: MediaDialogService,
  ) {}

  private async init(value: string): Promise<void> {
    this.fileFieldValue = parseImageRawValue(value);

    const resolveMediaData = await firstValueFrom(this.imageFieldHandlerService.resolveImageData(this.fileFieldValue));
    this.fileData = {
      fileName: `${resolveMediaData.file?.displayName}.${resolveMediaData.file?.extension}`,
      extension: resolveMediaData.file?.extension ?? '',
      size: bytesToKB(resolveMediaData.file?.size),
    };
  }

  async selectFromMediaDialog(): Promise<void> {
    const newValue = await firstValueFrom(
      this.mediaDialogService.show({
        currentValue: this.fileFieldValue,
        sources: this.sources,
        mediaTypes: ['image', 'file'],
      }),
    );
    this.init(newValue.rawValue);

    this.selectedItemChange.emit(newValue);
  }

  getFileIcon(extension?: string): string {
    const iconMap: { [key: string]: string } = {
      pdf: 'mdi-file-pdf-box',
      docx: 'mdi-file-word-box',
      doc: 'mdi-file-document-outline',
    };

    const iconClass = iconMap[extension ?? ''] ?? 'mdi-file-document-outline';

    return `${extension ?? ''} ${iconClass}`;
  }

  remove() {
    this.selectedItemChange.emit(getEmptyValue());
  }
}
