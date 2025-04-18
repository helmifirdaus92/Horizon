/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { MediaDialogService } from 'app/shared/dialogs/media-dialog/media-dialog.service';
import { firstValueFrom } from 'rxjs';

export interface MediaSelectionValue {
  embeddedHtml?: string;
  src?: string;
  alt?: string;
}

export type MediaSelectionResult =
  | { status: 'OK'; selectedValue: MediaSelectionValue }
  | { status: 'Canceled'; selectedValue: undefined };

@Injectable({ providedIn: 'root' })
export class MediaPickerService {
  constructor(private mediaDialogService: MediaDialogService) {}
  async promptSelectMedia(): Promise<MediaSelectionResult> {
    const selectedValue = await firstValueFrom(
      this.mediaDialogService.show({
        currentValue: null,
        sources: [],
        mediaTypes: ['image', 'file'],
      }),
    ).catch(() => undefined);

    return selectedValue
      ? {
          status: 'OK',
          selectedValue: {
            embeddedHtml: selectedValue.embeddedHtml ?? '',
            src: selectedValue.src ?? '',
            alt: selectedValue.alt ?? '',
          },
        }
      : { status: 'Canceled', selectedValue: undefined };
  }
}
