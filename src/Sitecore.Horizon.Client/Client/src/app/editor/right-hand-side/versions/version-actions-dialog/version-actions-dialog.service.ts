/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { VersionDetails } from 'app/editor/shared/versions-workflow/versions-workflow.service';
import { Observable } from 'rxjs';
import { CreateVersionComponent } from '../create-version/create-version.component';
import { DuplicateVersionComponent } from '../duplicate-version/duplicate-version.component';
import { RenameVersionComponent } from '../rename-version/rename-version.component';
import { VersionPublishingSettingsComponent } from '../version-publishing-settings/version-publishing-settings.component';

export interface VersionActionsResult {
  success: boolean;
  itemVersion?: number;
}
@Injectable({
  providedIn: 'root',
})
export class VersionActionsDialogService {
  constructor(private readonly overlayService: DialogOverlayService) {}

  showCreateVersionDialog(nodeId?: string): Observable<boolean> {
    const comp = this.overlayService.open(CreateVersionComponent, {
      size: 'AutoHeight',
    });
    comp.component.nodeId = nodeId;
    return comp.component.onCreate;
  }

  showRenameVersionDialog(currentVersion: VersionDetails): void {
    const renameCompRef = this.overlayService.open(RenameVersionComponent, {
      size: 'AutoHeight',
    });
    renameCompRef.component.currentVersion = currentVersion;
  }

  showDuplicateVersionDialog(currentVersion: VersionDetails): void {
    const duplicateCompRef = this.overlayService.open(DuplicateVersionComponent, {
      size: 'AutoHeight',
    });
    duplicateCompRef.component.versionToDuplicate = currentVersion;
  }

  showPublishingSettingDialog(
    versionToPublish: VersionDetails,
    startDate: string,
    endDate: string,
    isAvailableToPublish: boolean,
  ): void {
    const publishVersionCompRef = this.overlayService.open(VersionPublishingSettingsComponent, {
      size: { width: '448px', height: '732px' },
    });
    publishVersionCompRef.component.versionToPublish = versionToPublish;
    publishVersionCompRef.component.startDate = startDate;
    publishVersionCompRef.component.endDate = endDate;
    publishVersionCompRef.component.isAvailableToPublish = isAvailableToPublish;
  }
}
