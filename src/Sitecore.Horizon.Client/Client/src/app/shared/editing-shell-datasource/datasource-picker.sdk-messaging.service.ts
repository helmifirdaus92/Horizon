/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { DatasourcePickerContract } from 'sdk';
import { EditingShellDatasourceImpl } from './editing-shell-datasource.impl';

@Injectable({ providedIn: 'root' })
export class DatasourcePickerSdkMessagingService {
  constructor(
    private readonly editingShellDatasourceImpl: EditingShellDatasourceImpl,
    private readonly globalMessaging: NgGlobalMessaging,
  ) {}

  init() {
    this.globalMessaging.createRpc(DatasourcePickerContract, this.editingShellDatasourceImpl);
  }
}
