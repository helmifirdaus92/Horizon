/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { ContentItemDialogService } from 'app/shared/dialogs/content-item-dialog/content-item-dialog.service';
import { firstValueFrom } from 'rxjs';
import { ContentItemPickerResult } from 'sdk/contracts/content-item-picker.contract';

@Injectable({ providedIn: 'root' })
export class EditingShellContentItemPickerImpl {
  constructor(private contentItemDialogService: ContentItemDialogService) {}

  async prompt(context: {
    id: string | null;
    language: string | null;
    site: string | null;
  }): Promise<ContentItemPickerResult> {
    const selectedValue = await firstValueFrom(this.contentItemDialogService.show(context)).catch(() => undefined);

    return selectedValue
      ? {
          status: 'OK',
          item: selectedValue,
        }
      : { status: 'Canceled' };
  }
}
