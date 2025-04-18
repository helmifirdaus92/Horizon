/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, HostListener, OnInit } from '@angular/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';
import { VersionDetails } from 'app/editor/shared/versions-workflow/versions-workflow.service';
import { VersionsUtilService } from '../versions-util.service';

export type DateOptions = 'Now' | 'Custom' | 'NoDate' | '';
@Component({
  selector: 'app-version-publishing-settings',
  templateUrl: './version-publishing-settings.component.html',
  styleUrls: ['./version-publishing-settings.component.scss'],
})
export class VersionPublishingSettingsComponent implements OnInit {
  versionToPublish?: VersionDetails;
  startDateOptions: DateOptions = '';
  endDateOptions: DateOptions = '';
  isAvailableToPublish = true;
  startDate = '';
  endDate = '';

  timeZoneDisplayName = Intl.DateTimeFormat().resolvedOptions().timeZone;
  valueEdited = false;

  constructor(
    private readonly closeHandle: DialogCloseHandle,
    private readonly versionsUtilService: VersionsUtilService,
  ) {}

  ngOnInit(): void {
    this.startDateOptions = this.startDate ? 'Custom' : '';
    this.endDateOptions = this.endDate ? 'Custom' : 'NoDate';
  }

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  close(): void {
    this.closeHandle.close();
  }

  setPublishSettings(): void {
    this.convertToUtcTime();

    this.versionsUtilService.setPublishSettings(
      this.versionToPublish,
      this.startDate,
      this.endDate,
      this.isAvailableToPublish,
    );
    this.close();
  }

  onDateSelectionChange(): void {
    this.valueEdited = true;
    if (this.startDateOptions === 'Now') {
      this.startDate = new Date().toISOString();
    }
    if (this.endDateOptions === 'NoDate') {
      this.endDate = '';
    }
  }

  private convertToUtcTime() {
    this.startDate = this.startDate ? new Date(this.startDate).toISOString() : this.startDate;
    this.endDate = this.endDate ? new Date(this.endDate).toISOString() : this.endDate;
  }
}
