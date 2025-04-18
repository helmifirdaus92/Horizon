/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { VersionDetails, VersionsWorkflowService } from 'app/editor/shared/versions-workflow/versions-workflow.service';
import { Context, ContextService } from 'app/shared/client-state/context.service';
import { ItemChangeService } from 'app/shared/client-state/item-change-service';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { isSameGuid } from 'app/shared/utils/utils';
import { firstValueFrom } from 'rxjs';
import { VersionActionsDialogService } from './version-actions-dialog/version-actions-dialog.service';

@Injectable({ providedIn: 'root' })
export class VersionsUtilService {
  private noActiveVersionTimedNotificationId: string | null = null;

  constructor(
    private readonly versionsService: VersionsWorkflowService,
    private readonly contextService: ContextService,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly translateService: TranslateService,
    private readonly itemChangeService: ItemChangeService,
    private readonly versionActionsDialogService: VersionActionsDialogService,
  ) {}

  async createVersion(name: string, context?: Context, nodeId?: string): Promise<boolean> {
    const requestContext: Context = context ?? { ...this.contextService.value };
    const result = await firstValueFrom(
      this.versionsService.createVersion(
        nodeId || requestContext.itemId,
        requestContext.language,
        requestContext.siteName,
        name,
        requestContext.itemVersion,
      ),
    )
      .catch(() => undefined)
      .finally(() => undefined);

    if (result?.success) {
      if (
        isSameGuid(requestContext.itemId, this.contextService.itemId) &&
        requestContext.language === this.contextService.language
      ) {
        // If the new version is created for the current context, then only update the context
        // else we only need to notify the changes
        // e.g. if the new version is created using plus icon for the item which is not the context item we do not want
        // to update the context.
        const isSelectedPage = isSameGuid(nodeId, this.contextService.itemId);
        const requireContextUpdate = !(nodeId && !isSelectedPage);
        if (requireContextUpdate) {
          this.contextService.updateContext({ itemVersion: result.itemVersion });
        }
        this.itemChangeService.notifyChange(this.contextService.itemId, ['versions', 'workflow']);
      }
    } else {
      const errorText = await firstValueFrom(this.translateService.get('VERSIONS.CREATE.ERROR'));
      this.timedNotificationsService.push(`CreateVersionError-${name}`, errorText, 'error');
    }

    return !!result?.success;
  }

  async duplicateVersion(duplicateName?: string, baseVersionNumber?: number): Promise<boolean> {
    const requestContext = { ...this.contextService.value };
    baseVersionNumber = baseVersionNumber ?? requestContext.itemVersion;
    const activeVersion = (await firstValueFrom(this.versionsService.watchVersionsAndWorkflow())).versions.filter(
      (item) => item.versionNumber === requestContext.itemVersion,
    )[0];

    const result = await firstValueFrom(
      this.versionsService.createVersion(
        requestContext.itemId,
        requestContext.language,
        requestContext.siteName,
        duplicateName,
        activeVersion ? baseVersionNumber : undefined,
      ),
    )
      .catch(() => undefined)
      .finally(() => undefined);

    if (result?.success) {
      if (
        isSameGuid(requestContext.itemId, this.contextService.itemId) &&
        requestContext.language === this.contextService.language
      ) {
        this.contextService.updateContext({ itemVersion: result.itemVersion });
        this.itemChangeService.notifyChange(this.contextService.itemId, ['versions', 'workflow']);
      }
    } else {
      const errorText = await firstValueFrom(this.translateService.get('VERSIONS.MENU.DUPLICATE_ERROR'));
      this.timedNotificationsService.push(`DuplicateVersionError-${baseVersionNumber}`, errorText, 'error');
    }

    return !!result?.success;
  }

  async renameVersion(versionToUpdate: VersionDetails | undefined, newName: string): Promise<void> {
    if (!versionToUpdate) {
      return;
    }

    const renameResult = await firstValueFrom(
      this.versionsService.renameVersion(
        this.contextService.itemId,
        versionToUpdate.versionNumber,
        newName,
        this.contextService.language,
        this.contextService.siteName,
      ),
    )
      .catch(() => undefined)
      .finally(() => undefined);

    if (renameResult?.success) {
      this.itemChangeService.notifyChange(this.contextService.itemId, ['versions']);
    } else {
      const errorText = await firstValueFrom(this.translateService.get('VERSIONS.RENAME.ERROR'));
      this.timedNotificationsService.push('RenameVersionError', errorText, 'error');
    }
  }

  async deleteVersion(itemVersion: number) {
    const requestContext = { ...this.contextService.value };
    const deleteResult = await firstValueFrom(
      this.versionsService.removeVersion(
        requestContext.itemId,
        requestContext.language,
        requestContext.siteName,
        itemVersion,
      ),
    )
      .catch(() => undefined)
      .finally(() => undefined);

    if (deleteResult?.success) {
      const isContextVersion =
        isSameGuid(requestContext.itemId, this.contextService.itemId) &&
        itemVersion === this.contextService.itemVersion;
      if (isContextVersion) {
        this.contextService.updateContext({ itemVersion: deleteResult.latestPublishableVersion });
      }

      this.itemChangeService.notifyChange(this.contextService.itemId, ['versions', 'workflow']);
    } else {
      const errorText = await firstValueFrom(this.translateService.get('VERSIONS.MENU.REMOVE_ERROR'));
      this.timedNotificationsService.push('RemoveVersionError', errorText, 'error');
    }
  }

  async setPublishSettings(
    versionToPublish: VersionDetails | undefined,
    startDate: string,
    endDate: string,
    isAvailableToPublish: boolean,
  ) {
    if (!versionToPublish) {
      return;
    }
    const publishResult = await firstValueFrom(
      this.versionsService.setPublishingSettings(
        this.contextService.itemId,
        versionToPublish.versionNumber,
        startDate,
        endDate,
        isAvailableToPublish,
        this.contextService.language,
        this.contextService.siteName,
      ),
    ).catch(() => undefined);

    if (publishResult?.success) {
      this.itemChangeService.notifyChange(this.contextService.itemId, ['versions', 'workflow']);
    } else {
      const errorText = this.translateService.get('VERSIONS.PUBLISHING.ERROR');
      this.timedNotificationsService.push('SetPublishingDatesError', errorText, 'error');
    }
  }

  async handleTimedNotifications(activeVersion: VersionDetails | undefined) {
    this.hideNoActiveVersionNotification();

    if (!activeVersion) {
      this.noActiveVersionTimedNotificationId =
        this.contextService.itemId + this.contextService.language + this.contextService.itemVersion;

      const text = await firstValueFrom(this.translateService.get('VERSIONS.VERSION_NOT_EXIST'));
      const actonTitle = await firstValueFrom(this.translateService.get('VERSIONS.CREATE_NEW_VERSION'));

      const notification = new TimedNotification(this.noActiveVersionTimedNotificationId, text, 'warning');
      notification.action = {
        run: () => {
          this.hideNoActiveVersionNotification();
          this.versionActionsDialogService.showCreateVersionDialog();
        },
        title: actonTitle,
      };
      notification.persistent = true;
      notification.closable = true;
      this.timedNotificationsService.pushNotification(notification);
    }
  }

  hideNoActiveVersionNotification(): void {
    if (this.noActiveVersionTimedNotificationId) {
      this.timedNotificationsService.hideNotificationById(this.noActiveVersionTimedNotificationId);
      this.noActiveVersionTimedNotificationId = null;
    }
  }
}
