/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { AddPhoneNumberComponent } from 'app/shared/dialogs/add-phone-number/add-phone-number.component';
import { firstValueFrom } from 'rxjs';

export type AddPhoneNumberResult = { status: 'OK'; value: string } | { status: 'Canceled' };

@Injectable({ providedIn: 'root' })
export class AddPhoneNumberService {
  constructor(private readonly dialogService: DialogOverlayService) {}

  async promptAddPhoneNumber(): Promise<AddPhoneNumberResult> {
    const { component: dialog } = AddPhoneNumberComponent.show(this.dialogService);

    const result = await firstValueFrom(dialog.dialogResultEvent.asObservable());
    return result;
  }
}
