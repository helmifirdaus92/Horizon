/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { MediaPickerContract } from 'sdk';
import { EditingShellMediaImpl } from './editing-shell-media.impl';

@Injectable({ providedIn: 'root' })
export class MediaPickerSdkMessagingService {
  constructor(
    private readonly editingShellMediaImpl: EditingShellMediaImpl,
    private readonly globalMessaging: NgGlobalMessaging,
  ) {}

  init() {
    this.globalMessaging.createRpc(MediaPickerContract, this.editingShellMediaImpl);
  }
}
