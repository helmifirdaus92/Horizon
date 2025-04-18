/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';
import { VersionDetails } from 'app/editor/shared/versions-workflow/versions-workflow.service';
import { VersionsUtilService } from '../versions-util.service';

@Component({
  selector: 'app-duplicate-version',
  templateUrl: './duplicate-version.component.html',
  styleUrls: ['./duplicate-version.component.scss'],
})
export class DuplicateVersionComponent implements AfterViewInit, OnInit {
  versionToDuplicate?: VersionDetails;
  duplicateName?: string;

  @ViewChild('inputEl', { static: true, read: ElementRef }) inputEl?: ElementRef;

  constructor(
    private readonly closeHandle: DialogCloseHandle,
    private readonly versionsUtilService: VersionsUtilService,
  ) {}

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  ngOnInit(): void {
    if (this.versionToDuplicate) {
      const { name, versionNumber } = this.versionToDuplicate;
      const defaultInputValue = name ? name : `Version ${versionNumber}`;

      this.duplicateName = `Copy of ${defaultInputValue}`;
    }
  }

  ngAfterViewInit() {
    this.inputEl?.nativeElement.focus();
  }

  close() {
    this.closeHandle.close();
  }

  duplicate(): void {
    this.versionsUtilService.duplicateVersion(this.duplicateName, this.versionToDuplicate?.versionNumber);
    this.close();
  }
}
