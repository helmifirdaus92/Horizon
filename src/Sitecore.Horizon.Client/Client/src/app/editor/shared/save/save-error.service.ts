/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { WarningDialogComponent } from 'app/shared/dialogs/warning-dialog/warning-dialog.component';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { firstValueFrom } from 'rxjs';
import { SaveResult } from './save.interfaces';

export type ErrorFollowupAction = 'OverwriteModifiedItem' | 'ReloadCanvas' | 'None';

export function resolveErrorMessageTranslationKeyByErrorCode(errorCode: string): string | undefined {
  switch (errorCode) {
    case 'BaseTemplateWasChanged':
      return 'EDITOR.SAVE.ERRORS.BASE_TEMPLATE_WAS_CHANGED';
    case 'ChangedUnversionedOrSharedFlag':
      return 'EDITOR.SAVE.ERRORS.CHANGED_UNVERSIONED_OR_SHARED_FLAG';
    case 'IncorrectCloneSource':
      return 'EDITOR.SAVE.ERRORS.INCORRECT_CLONE_SOURCE';
    case 'InternalError':
      return 'EDITOR.SAVE.ERRORS.INTERNAL_ERROR';
    case 'ItemDoesNotExist':
      return 'EDITOR.SAVE.ERRORS.PAGE_DOES_NOT_EXIST';
    case 'ItemIsFallback':
      return 'EDITOR.SAVE.ERRORS.ITEM_IS_FALLBACK';
    case 'ItemIsProtected':
      return 'EDITOR.SAVE.ERRORS.ITEM_IS_PROTECTED';
    case 'ItemLockedByAnotherUser':
      return 'EDITOR.SAVE.ERRORS.ITEM_LOCKED_BY_ANOTHER_USER';
    case 'ItemShouldBeLockedBeforeEdit':
      return 'EDITOR.SAVE.ERRORS.ITEM_SHOULD_BE_LOCKED_BEFORE_EDIT';
    case 'NoWriteAccess':
      return 'EDITOR.SAVE.ERRORS.NO_WRITE_ACCESS';
    case 'ValidationError':
      return 'EDITOR.SAVE.ERRORS.VALIDATION_ERROR';
    default:
      return undefined;
  }
}

@Injectable({
  providedIn: 'root',
})
export class SaveErrorService {
  constructor(
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly translateService: TranslateService,
    private readonly dialogService: DialogOverlayService,
  ) {}

  async handleSaveResult(
    itemId: string,
    saveResult: SaveResult,
    reloadCanvasActions: () => void,
  ): Promise<ErrorFollowupAction> {
    // Errors
    if (saveResult.errors?.some((er) => er.errorCode === 'FieldWasModified' || er.errorCode === 'ItemWasModified')) {
      const overwriteChanges = await this.promptOverwriteChanges();
      return overwriteChanges ? 'OverwriteModifiedItem' : 'ReloadCanvas';
    }

    saveResult.errors?.forEach(async (error) => {
      const resolvedErrorMessage = resolveErrorMessageTranslationKeyByErrorCode(error.errorCode);
      const message =
        error.message ||
        (resolvedErrorMessage && (await firstValueFrom(this.translateService.get(resolvedErrorMessage))));

      if (!message) {
        return;
      }

      const notification = new TimedNotification('SaveResultError-' + itemId, message, 'error');

      if (error.errorCode === 'ItemDoesNotExist') {
        const title = await firstValueFrom(this.translateService.get('EDITOR.SAVE.ERRORS.RELOAD_ACTION_TITLE'));
        notification.action = {
          title,
          run: this.reloadApplication,
        };
      }

      this.timedNotificationsService.pushNotification(notification);
    });

    // Validation errors
    saveResult.validationErrors?.forEach(({ errorMessage }) =>
      this.timedNotificationsService.push('SaveResultValidationError-' + itemId, errorMessage, 'error'),
    );

    // Warning
    saveResult.warnings.forEach(async (warning) => {
      if (warning === 'ItemWasModified') {
        const text = await firstValueFrom(this.translateService.get('EDITOR.SAVE.ERRORS.PAGE_WAS_MODIFIED_WARNING'));
        const actonTitle = await firstValueFrom(this.translateService.get('EDITOR.SAVE.ERRORS.RELOAD_ACTION_TITLE'));
        const notification = new TimedNotification('SaveResultWarning-ItemWasModified', text, 'warning');
        notification.action = { run: reloadCanvasActions, title: actonTitle };
        notification.closable = true;

        this.timedNotificationsService.pushNotification(notification);
      } else {
        this.timedNotificationsService.push('SaveResultWarning-' + itemId, warning, 'warning');
      }
    });

    return 'None';
  }

  private async promptOverwriteChanges(): Promise<boolean> {
    const { component: dialog } = WarningDialogComponent.show(this.dialogService);
    const translations = await firstValueFrom(
      this.translateService.get([
        'EDITOR.SAVE.ERRORS.RELOAD_DIALOG_HEADER',
        'EDITOR.SAVE.ERRORS.PAGE_WAS_MODIFIED',
        'COMMON.CANCEL',
        'COMMON.OVERWRITE',
      ]),
    );

    dialog.title = translations['EDITOR.SAVE.ERRORS.RELOAD_DIALOG_HEADER'];
    dialog.text = translations['EDITOR.SAVE.ERRORS.PAGE_WAS_MODIFIED'];
    dialog.declineText = translations['COMMON.CANCEL'];
    dialog.confirmText = translations['COMMON.OVERWRITE'];

    const dialogResult = await firstValueFrom(dialog.dialogResultEvent);
    return dialogResult.confirmed;
  }

  private reloadApplication() {
    window.location.reload();
  }
}
