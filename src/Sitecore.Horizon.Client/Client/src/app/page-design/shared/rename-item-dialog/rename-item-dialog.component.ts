/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, ViewChild } from '@angular/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { Item } from 'app/page-design/page-templates.types';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-rename-item-dialog',
  templateUrl: './rename-item-dialog.component.html',
  styleUrls: ['./rename-item-dialog.component.scss'],
})
export class RenameItemDialogComponent implements AfterViewInit {
  @ViewChild('nameInput', { static: true, read: ElementRef }) inputEl?: ElementRef;

  private readonly apiDuplicateNameError = 'is already defined';

  itemName = '';
  apiErrorMessage: string | null = null;
  isLoading = false;

  existingNames: string[] = [];
  itemId = '';
  valueEdited = false;

  readonly onRename = new EventEmitter<Item | null>();

  constructor(
    private readonly closeHandle: DialogCloseHandle,
    private readonly pageTemplatesService: PageTemplatesService,
  ) {}

  ngAfterViewInit() {
    this.inputEl?.nativeElement.focus();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      event.preventDefault();
      this.close();
    }
    this.apiErrorMessage = null;
  }

  close() {
    this.onRename.complete();
    this.closeHandle.close();
  }

  async rename() {
    this.isLoading = true;
    const result = await firstValueFrom(this.pageTemplatesService.renameItem(this.itemId, this.itemName));

    if (result.successful) {
      this.apiErrorMessage = null;
      this.onRename.next(result.item);
      this.close();
      this.isLoading = false;
    } else {
      this.isLoading = false;
      if (result.errorMessage?.includes(this.apiDuplicateNameError)) {
        this.existingNames.push(this.itemName);
      } else {
        this.apiErrorMessage = result.errorMessage;
      }
    }
  }
}
