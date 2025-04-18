/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, ViewChild } from '@angular/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';
import { VersionsUtilService } from '../versions-util.service';

@Component({
  selector: 'app-create-version',
  templateUrl: './create-version.component.html',
  styleUrls: ['./create-version.component.scss'],
})
export class CreateVersionComponent implements AfterViewInit {
  name = '';
  nodeId?: string;

  @ViewChild('inputEl', { static: true, read: ElementRef }) inputEl?: ElementRef;
  readonly onCreate = new EventEmitter<boolean>();

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

  ngAfterViewInit() {
    this.inputEl?.nativeElement.focus();
  }

  close() {
    this.closeHandle.close();
  }

  async create(): Promise<void> {
    const createversionResult = await this.versionsUtilService.createVersion(this.name, undefined, this.nodeId);
    this.onCreate.emit(createversionResult);
    this.close();
  }
}
