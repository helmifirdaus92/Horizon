/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogOverlayService, PopoverDirective } from '@sitecore/ng-spd-lib';
import { WarningDialogComponent } from 'app/shared/dialogs/warning-dialog/warning-dialog.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-personalization-context-menu',
  templateUrl: './personalization-context-menu.component.html',
})
export class PersonalizationContextMenuComponent {
  @Input() variantName?: string;
  @Input() canvasIsLoading = false;

  @Output() deleteVariant = new EventEmitter<null>();
  @Output() editVariant = new EventEmitter<null>();
  @Output() renameVariant = new EventEmitter<null>();

  @ViewChild('popoverInstance', { static: true }) private popoverInstance?: PopoverDirective;

  readonly popoverIsActive = (): boolean | undefined => this.popoverInstance?.isPopoverVisible();

  constructor(
    private readonly dialogService: DialogOverlayService,
    private readonly translateService: TranslateService,
  ) {}

  async promptDeleteVariant() {
    const { component: dialog } = WarningDialogComponent.show(this.dialogService);
    const variantName = this.variantName;

    dialog.title = await firstValueFrom(this.translateService.get('PERSONALIZATION.DELETE.DIALOG_HEADER'));
    dialog.text = await firstValueFrom(
      this.translateService.get('PERSONALIZATION.DELETE.DIALOG_TEXT', { variantName }),
    );
    dialog.declineText = await firstValueFrom(this.translateService.get('COMMON.CANCEL'));
    dialog.confirmText = await firstValueFrom(this.translateService.get('COMMON.DELETE'));

    const result = await firstValueFrom(dialog.dialogResultEvent);
    if (result.confirmed) {
      this.deleteVariant.emit();
    }
  }

  updateVariant(): void {
    this.editVariant.emit();
  }
}
