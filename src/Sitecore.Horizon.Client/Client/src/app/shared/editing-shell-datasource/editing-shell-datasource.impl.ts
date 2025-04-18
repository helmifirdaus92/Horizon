/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DatasourceDialogService } from 'app/shared/dialogs/datasource-dialog/datasource-dialog.service';
import { firstValueFrom } from 'rxjs';
import { DatasourcePickerContext, DatasourcePickerOptions, DatasourcePickerResult } from 'sdk';

@Injectable({ providedIn: 'root' })
export class EditingShellDatasourceImpl {
  constructor(private datasourceDialogService: DatasourceDialogService) {}

  async prompt(context: DatasourcePickerContext, options?: DatasourcePickerOptions): Promise<DatasourcePickerResult> {
    const selectedValue = await firstValueFrom(
      this.datasourceDialogService.show(
        {
          renderingId: context.renderingId,
          select: context.datasource,
          renderingDetails: context.renderingDetails,
          mode: 'MessagingRpcCall',
        },
        options,
      ),
    ).catch(() => undefined);

    return selectedValue?.itemId
      ? {
          status: 'OK',
          datasource: selectedValue.itemId,
        }
      : { status: 'Canceled' };
  }
}
