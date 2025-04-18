/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { VersionDetails, VersionsWorkflowService } from 'app/editor/shared/versions-workflow/versions-workflow.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { WarningDialogComponent } from 'app/shared/dialogs/warning-dialog/warning-dialog.component';
import { shareReplayLatest } from 'app/shared/utils/rxjs/rxjs-custom';
import { EMPTY, Observable, firstValueFrom, map } from 'rxjs';
import { panelAnimations } from '../rhs-slide-in-panel.animations';
import { VersionActionsDialogService } from './version-actions-dialog/version-actions-dialog.service';
import { VersionsUtilService } from './versions-util.service';

const MIN_DATE_TIME = '0001-01-01T00:00:00Z';
const MAX_DATE_TIME = '9999-12-31T23:59:59.9999999Z';

@Component({
  selector: 'app-versions',
  templateUrl: './versions.component.html',
  styleUrls: ['./versions.component.scss'],
  animations: panelAnimations,
})
export class VersionsComponent implements OnInit {
  versions$: Observable<VersionDetails[]> = EMPTY;
  activeVersion$: Observable<VersionDetails | undefined> = EMPTY;

  userHasWritePermission = false;
  userHasDeletePermission = false;
  userHasPublishPermission = false;

  versionToUpdate?: VersionDetails;

  // Backend returns DateTime min and max value when date value is not set yet
  readonly minDateTime = MIN_DATE_TIME;
  readonly maxDateTime = MAX_DATE_TIME;
  loading$: Observable<boolean> = EMPTY;

  constructor(
    private readonly versionsService: VersionsWorkflowService,
    private readonly context: ContextService,
    private readonly translateService: TranslateService,
    private readonly dialogService: DialogOverlayService,
    private readonly versionsUtilService: VersionsUtilService,
    private readonly versionActionsDialogService: VersionActionsDialogService,
  ) {}

  ngOnInit() {
    this.versions$ = this.versionsService.watchVersionsAndWorkflow().pipe(
      map((versionsInfo) => {
        this.userHasWritePermission = versionsInfo.permissions.canWrite;
        this.userHasDeletePermission = versionsInfo.permissions.canDelete;
        this.userHasPublishPermission = versionsInfo.permissions.canPublish;
        return versionsInfo.versions;
      }),
      shareReplayLatest(),
    );

    // Assign activeVersion$ as a result of versions$ to align asynchronous context changes and fetching version list
    this.activeVersion$ = this.versionsService.watchActiveVersion();
    this.loading$ = this.versionsService.watchVersionsLoading();
  }

  selectVersion(itemVersion: number) {
    // Update contex only if selected version is not active version
    if (this.context.itemVersion === itemVersion) {
      return;
    }
    this.context.updateContext({ itemVersion });
  }

  createVersion(): void {
    this.versionActionsDialogService.showCreateVersionDialog();
  }

  duplicateVersion(versionToDuplicate: VersionDetails) {
    this.versionActionsDialogService.showDuplicateVersionDialog(versionToDuplicate);
  }

  async setPublishingSettings(versionToPublish: VersionDetails) {
    const startDate =
      versionToPublish && versionToPublish.validFrom !== this.minDateTime ? versionToPublish.validFrom : '';
    const endDate = versionToPublish && versionToPublish.validTo !== this.maxDateTime ? versionToPublish.validTo : '';

    // Convert start and end dates to ISO strings
    const validFrom = startDate ? new Date(startDate).toISOString() : '';
    const validTo = endDate ? new Date(endDate).toISOString() : '';

    this.versionActionsDialogService.showPublishingSettingDialog(
      versionToPublish,
      validFrom,
      validTo,
      versionToPublish.isAvailableToPublish,
    );
  }

  renameVersion(versionToRename: VersionDetails) {
    this.versionActionsDialogService.showRenameVersionDialog(versionToRename);
  }

  async promptDeleteVersion(version: VersionDetails) {
    const { component: dialog } = WarningDialogComponent.show(this.dialogService);

    const versionIdentifier = version.name ? `${version.versionNumber} - ${version.name}` : `${version.versionNumber}`;
    dialog.title = await firstValueFrom(this.translateService.get('VERSIONS.DELETE.DIALOG_HEADER'));
    dialog.text = await firstValueFrom(this.translateService.get('VERSIONS.DELETE.DIALOG_TEXT', { versionIdentifier }));
    dialog.declineText = await firstValueFrom(this.translateService.get('COMMON.CANCEL'));
    dialog.confirmText = await firstValueFrom(this.translateService.get('COMMON.DELETE'));

    const dialogResult = await firstValueFrom(dialog.dialogResultEvent);
    if (dialogResult.confirmed) {
      this.versionsUtilService.deleteVersion(version.versionNumber);
    }
  }
}
