/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { MessagingRpcServicesClient } from '@sitecore/page-composer-sdk';
import { firstValueFrom } from 'rxjs';
import { MediaPickerResult, MediaPickerRpc, MediaPickerSelection, MediaPickerValue } from 'sdk';
import { MediaDialogService } from '../dialogs/media-dialog/media-dialog.service';

@Injectable({ providedIn: 'root' })
export class EditingShellMediaImpl implements MessagingRpcServicesClient<MediaPickerRpc> {
  constructor(private mediaDialogService: MediaDialogService) {}

  async prompt(context: {
    currentValue?: MediaPickerValue | undefined;
    sources: string[];
  }): Promise<MediaPickerResult> {
    const selectedValue = await firstValueFrom(
      this.mediaDialogService.show({
        currentValue: context.currentValue as MediaPickerSelection,
        sources: context.sources,
      }),
    ).catch(() => undefined);

    return selectedValue
      ? {
          status: 'OK',
          selectedValue: {
            ...selectedValue,
            src: selectedValue.src ?? '',
            embeddedHtml: selectedValue.embeddedHtml ?? '',
          },
        }
      : { status: 'Canceled' };
  }
}
