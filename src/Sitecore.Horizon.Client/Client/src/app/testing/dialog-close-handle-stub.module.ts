/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NgModule } from '@angular/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';

export class DialogCloseHandleStub implements Partial<DialogCloseHandle> {
  close() {}
}

@NgModule({
  providers: [{ provide: DialogCloseHandle, useClass: DialogCloseHandleStub }],
})
export class DialogCloseHandleStubModule {}
