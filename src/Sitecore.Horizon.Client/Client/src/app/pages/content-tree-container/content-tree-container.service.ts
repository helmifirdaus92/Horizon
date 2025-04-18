/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ContentTreeNode } from 'app/pages/content-tree/content-tree-node';
import {
  BaseContentTreeDalService,
  CreateItemErrorCode,
  RenameItemErrorCode,
} from 'app/pages/content-tree/content-tree.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { mapErrorMessageToCode } from 'app/shared/utils/utils';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';

export type MoveNodePosition = 'BEFORE' | 'AFTER' | 'INTO';

@Injectable({ providedIn: 'root' })
export class ContentTreeContainerService {
  private notificationId = 0;

  constructor(
    private readonly translateService: TranslateService,
    private readonly contentTreeDalService: BaseContentTreeDalService,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly siteService: SiteService,
    private readonly configurationService: ConfigurationService,
  ) {}

  moveItem(
    siteName: string,
    node: ContentTreeNode,
    dropNode: ContentTreeNode,
    position: MoveNodePosition,
  ): Observable<{ success: boolean }> {
    return this.contentTreeDalService.moveItem(node.id, dropNode.id, siteName, position).pipe(
      // This operation returns some failures as valid results (with `success = false`). We need to treat those as errors.
      switchMap((value) => (value.success ? of(value) : throwError(() => value))),
    );
  }

  async showNotificationForCreationFailed(errorCode: CreateItemErrorCode, node: ContentTreeNode): Promise<void> {
    let errorMessage;
    const normalizedErrorCode = mapErrorMessageToCode(errorCode);
    switch (normalizedErrorCode) {
      case 'DuplicateItemName':
        errorMessage = 'EDITOR.ITEM_ALREADY_DEFINED_ON_THIS_LEVEL';
        break;
      case 'InvalidItemName':
        errorMessage = 'EDITOR.CREATE_ITEM_NOT_VALID_NAME';
        break;
      default:
        errorMessage = node.isFolder ? 'EDITOR.CREATE_FOLDER_FAILED' : 'EDITOR.CREATE_PAGE_FAILED';
    }

    const text = await firstValueFrom(this.translateService.get(errorMessage, { name: node.text }));
    this.timedNotificationsService.push('CreatePageFailed-' + node.id, text, 'error');
  }

  async showNotificationCreationEmptyName(node: ContentTreeNode): Promise<void> {
    const text = await firstValueFrom(
      this.translateService.get(node.isFolder ? 'EDITOR.CREATE_FOLDER_EMPTY_NAME' : 'EDITOR.CREATE_PAGE_EMPTY_NAME'),
    );

    this.timedNotificationsService.push('CreatePageFailed-empty', text, 'error');
  }

  async showNotificationForRenameError(errorCode: RenameItemErrorCode): Promise<void> {
    let errorMessage;
    switch (errorCode) {
      case 'ItemNotFound':
        errorMessage = 'ERRORS.ITEM_NOT_FOUND';
        break;
      case 'ItemIsLocked':
        errorMessage = 'EDITOR.CHANGE_DISPLAY_NAME.ERRORS.ITEM_IS_LOCKED';
        break;
      case 'ItemIsReadOnly':
      case 'InsufficientLanguagePrivileges':
        errorMessage = 'EDITOR.CHANGE_DISPLAY_NAME.ERRORS.INSUFFICIENT_PRIVILEGES';
        break;
      case 'ItemIsFallback':
        errorMessage = 'EDITOR.CHANGE_DISPLAY_NAME.ERRORS.ITEM_IS_FALLBACK';
        break;
      default:
        errorMessage = 'ERRORS.OPERATION_GENERIC';
    }

    const errorText = await firstValueFrom(this.translateService.get(errorMessage));
    this.timedNotificationsService.push('RenameError-' + errorCode, errorText, 'error');
  }

  async showNodeMoveSuccessNotification(
    nodeId: string,
    movedItemName: string,
    targetItemName: string,
    position: MoveNodePosition,
    actionRunFunc: () => void,
  ): Promise<void> {
    let textTransKey: string;

    switch (position) {
      case 'INTO':
        textTransKey = 'EDITOR.CONTENT_TREE.MOVE_ITEM_INTO_SUCCESS';
        break;
      case 'BEFORE':
        textTransKey = 'EDITOR.CONTENT_TREE.MOVE_ITEM_BEFORE_SUCCESS';
        break;
      case 'AFTER':
        textTransKey = 'EDITOR.CONTENT_TREE.MOVE_ITEM_AFTER_SUCCESS';
        break;
    }

    const actionTitleTransKey = 'NAV.UNDO';

    const translations = await firstValueFrom(
      this.translateService.get([textTransKey, actionTitleTransKey], {
        movedItemName,
        targetItemName,
      }),
    );

    const notificationText = translations[textTransKey];
    const actionButtonTitle = translations[actionTitleTransKey];

    this.notificationId++;

    const notification = new TimedNotification(
      `MoveItemSuccess-${nodeId}-${this.notificationId}`,
      notificationText,
      'success',
    );

    notification.action = {
      title: actionButtonTitle,
      run: actionRunFunc,
    };

    notification.persistent = false;

    this.timedNotificationsService.pushNotification(notification);
  }

  async showNodeMoveErrorNotification(nodeId: string, nodeText: string): Promise<void> {
    const errorText = await firstValueFrom(
      this.translateService.get('EDITOR.CONTENT_TREE.MOVE_ITEM_ERROR', { name: nodeText }),
    );

    this.timedNotificationsService.push(`MoveItemError-${nodeId}`, errorText, 'error');
  }

  async showEmptyTreeErrorNotification(action: () => void): Promise<void> {
    const text = await firstValueFrom(this.translateService.get('ERRORS.EMPTY_SITE_TREE'));
    const actonTitle = await firstValueFrom(this.translateService.get('ERRORS.EMPTY_SITE_TREE_ACTION'));

    const notification = new TimedNotification('emptySiteTreeError', text, 'warning');
    notification.action = { run: () => action(), title: actonTitle };
    notification.persistent = true;
    notification.closable = true;

    this.timedNotificationsService.pushNotification(notification);
  }

  getStartItemId(siteName: string, language: string): Observable<string> {
    return this.siteService.getStartItem(siteName, language).pipe(
      first(),
      map(({ id }) => id),
    );
  }

  getContentRootItemId(): Observable<string> {
    return this.configurationService.configuration$.pipe(
      first(),
      map(({ contentRootItemId }) => contentRootItemId),
    );
  }
}
