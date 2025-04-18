/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';
import { VersionDetails } from 'app/editor/shared/versions-workflow/versions-workflow.service';
import { VersionsUtilService } from '../versions-util.service';

@Component({
  selector: 'app-rename-version',
  templateUrl: './rename-version.component.html',
  styleUrls: ['./rename-version.component.scss'],
})
export class RenameVersionComponent implements AfterViewInit, OnInit {
  currentVersion?: VersionDetails;
  newName = '';

  @ViewChild('inputEl', { static: true, read: ElementRef }) inputEl?: ElementRef;

  valueEdited = false;

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

  ngOnInit() {
    if (this.currentVersion) {
      this.newName = this.currentVersion.name;
    }
  }

  ngAfterViewInit() {
    this.inputEl?.nativeElement.focus();
  }

  close() {
    this.closeHandle.close();
  }

  rename(): void {
    this.versionsUtilService.renameVersion(this.currentVersion, this.newName);
    this.close();
  }
}
