/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';

import { EditSourceCodeDialogComponent } from 'app/shared/dialogs/source-code-dialog/source-code-dialog.component';
import { firstValueFrom } from 'rxjs';
import { EditRteContentResult } from './rich-text-editor.types';

@Injectable({ providedIn: 'root' })
export class EditSourceCodeService {
  constructor(private readonly dialogService: DialogOverlayService) {}

  async promptEditSourceCode(currentValue: string): Promise<EditRteContentResult> {
    const { component: dialog } = EditSourceCodeDialogComponent.show(this.dialogService);
    dialog.value = currentValue;

    const result = await firstValueFrom(dialog.dialogResultEvent.asObservable());
    return result;
  }
}
