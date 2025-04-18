/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { ContentItemPickerContract } from 'sdk/contracts/content-item-picker.contract';
import { EditingShellContentItemPickerImpl } from './content-item-picker.impl';

@Injectable({ providedIn: 'root' })
export class ContentItemPickerSdkMessagingService {
  constructor(
    private readonly editingShellContentItemPickerImpl: EditingShellContentItemPickerImpl,
    private readonly globalMessaging: NgGlobalMessaging,
  ) {}

  init() {
    this.globalMessaging.createRpc(ContentItemPickerContract, this.editingShellContentItemPickerImpl);
  }
}
