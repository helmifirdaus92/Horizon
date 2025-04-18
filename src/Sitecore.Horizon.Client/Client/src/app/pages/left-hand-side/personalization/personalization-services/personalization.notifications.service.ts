/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { runInNextMacrotask } from 'app/shared/utils/utils';
import { firstValueFrom } from 'rxjs';
import { CanvasServices } from '../../../../editor/shared/canvas.services';

@Injectable()
export class PersonalizationNotificationsService {
  private lifetime = new Lifetime();

  private activeNotificationId:
    | 'offerSelectParentRendering'
    | 'offerPersonalizeRendering'
    | 'contentIsSameAsDefault'
    | 'apiRequestInvalid'
    | 'variantAlreadyExists'
    | 'variantNameExceedLimit'
    | 'emptyVariantName'
    | 'archivedFlowDefinition'
    | null = null;

  constructor(
    private readonly messagingService: MessagingService,
    private readonly canvasServices: CanvasServices,
    private readonly translate: TranslateService,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly context: ContextService,
  ) {}

  initShowingNotifications() {
    this.lifetime = new Lifetime();
    this.canvasServices.chromeSelect$.pipe(takeWhileAlive(this.lifetime)).subscribe((selectEvent) => {
      // When canvas reloads after new page variant created 'this.canvasServices.chromeSelect$' emits undefined
      // in order not to hide 'contentIsSameAsDefault' notification we do check below
      if (!selectEvent.selection && this.activeNotificationId === 'contentIsSameAsDefault') {
        return;
      }

      // In order not to hide 'apiRequestInvalid' after canvas reloads and persist notification
      // regardless to chromeSelection action we do check below.
      if (this.activeNotificationId === 'apiRequestInvalid') {
        return;
      }

      if (this.activeNotificationId === 'emptyVariantName') {
        return;
      }

      this.hideNotification();

      if (!this.context.variant) {
        return;
      }

      const chrome = selectEvent.selection?.chrome;
      if (chrome?.chromeType === 'field' && !chrome?.isPersonalized) {
        const parentRenderingChromeId = chrome.parentRenderingChromeInfo?.chromeId;
        if (parentRenderingChromeId) {
          this.offerSelectParentRendering(parentRenderingChromeId);
        }
      }
    });
  }

  stopShowingNotifications() {
    this.lifetime.dispose();
    runInNextMacrotask(() => this.hideNotification())();
  }

  async showContentIsDefaultNotification() {
    const text = await firstValueFrom(this.translate.get('PERSONALIZATION.CONTENT_IS_SAME_AS_DEFAULT'));
    this.activeNotificationId = 'contentIsSameAsDefault';
    const notification = new TimedNotification(this.activeNotificationId, text, 'info');
    notification.persistent = true;

    this.timedNotificationsService.pushNotification(notification);
  }

  async showVariantAlreadyExistsNotification() {
    const text = await firstValueFrom(this.translate.get('PERSONALIZATION.API_ERRORS.ERROR_VARIANT_NAME_EXISTS'));
    this.activeNotificationId = 'variantAlreadyExists';
    const notification = new TimedNotification(this.activeNotificationId, text, 'error');
    notification.persistent = false;

    this.timedNotificationsService.pushNotification(notification);
  }

  async showVariantNameExceedLimitNotification() {
    const text = await firstValueFrom(this.translate.get('PERSONALIZATION.ERROR_LENGTH_LIMIT'));
    this.activeNotificationId = 'variantNameExceedLimit';
    const notification = new TimedNotification(this.activeNotificationId, text, 'error');
    notification.persistent = false;

    this.timedNotificationsService.pushNotification(notification);
  }

  async showVariantIsEmptyNotification() {
    const text = await firstValueFrom(this.translate.get('PERSONALIZATION.EMPTY_VARIANT_NAME'));
    this.activeNotificationId = 'emptyVariantName';
    const notification = new TimedNotification(this.activeNotificationId, text, 'error');
    notification.persistent = false;

    this.timedNotificationsService.pushNotification(notification);
  }

  private async offerSelectParentRendering(parentRenderingChromeId: string) {
    const text = await firstValueFrom(this.translate.get('PERSONALIZATION.SUGGEST_EDIT_PARENT_RENDERING'));
    this.activeNotificationId = 'offerSelectParentRendering';
    const actionTitle = await firstValueFrom(this.translate.get('PERSONALIZATION.SELECT_COMPONENT'));
    const notification = new TimedNotification(this.activeNotificationId, text, 'info');
    notification.closable = true;
    notification.action = {
      title: actionTitle,
      run: () => {
        this.messagingService.getEditingCanvasChannel().rpc.selectChrome(parentRenderingChromeId);
      },
    };

    this.timedNotificationsService.pushNotification(notification);
  }

  async showApiBadRequestError() {
    const errorInApiRequest = await firstValueFrom(
      this.translate.get('PERSONALIZATION.API_ERRORS.BAD_REQUEST_ERROR_MESSAGE'),
    );
    this.activeNotificationId = 'apiRequestInvalid';
    const notification = new TimedNotification(this.activeNotificationId, errorInApiRequest, 'error');
    notification.persistent = true;

    this.timedNotificationsService.pushNotification(notification);
  }

  async showArchivedFlowDefinitionError() {
    const archivedFlowDefinitionRequest = await firstValueFrom(
      this.translate.get('PERSONALIZATION.API_ERRORS.ARCHIVED_FLOW_DEFINITION_ERROR_MESSAGE'),
    );
    this.activeNotificationId = 'archivedFlowDefinition';
    const notification = new TimedNotification(this.activeNotificationId, archivedFlowDefinitionRequest, 'error');
    notification.persistent = true;

    this.timedNotificationsService.pushNotification(notification);
  }

  private hideNotification() {
    if (this.activeNotificationId) {
      this.timedNotificationsService.hideNotificationById(this.activeNotificationId);
      this.activeNotificationId = null;
    }
  }
}
