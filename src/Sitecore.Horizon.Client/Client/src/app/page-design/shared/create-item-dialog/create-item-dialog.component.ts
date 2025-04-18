/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, ViewChild } from '@angular/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { Item } from 'app/page-design/page-templates.types';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-item-dialog',
  templateUrl: './create-item-dialog.component.html',
  styleUrls: ['./create-item-dialog.component.scss'],
})
export class CreateItemDialogComponent implements AfterViewInit {
  @ViewChild('nameInput', { static: true, read: ElementRef }) inputEl?: ElementRef;
  private readonly apiDuplicateNameError = 'is already defined';

  designItemName = '';
  apiErrorMessage: string | null = null;
  isLoading = false;

  parentId = '';
  existingNames: string[] = [];
  language = '';
  templateId = '';
  type = '';

  readonly onCreate = new EventEmitter<Item | null>();

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
    this.onCreate.complete();
    this.closeHandle.close();
  }

  async create() {
    this.isLoading = true;
    const result = await firstValueFrom(
      this.pageTemplatesService.createItem(this.designItemName, this.parentId, this.templateId, this.language),
    );

    if (result.successful) {
      this.apiErrorMessage = null;
      this.onCreate.next(result.item);
      this.close();
      this.isLoading = false;
    } else {
      this.isLoading = false;
      if (result.errorMessage?.includes(this.apiDuplicateNameError)) {
        this.existingNames.push(this.designItemName);
      } else {
        this.apiErrorMessage = result.errorMessage;
      }
    }
  }
}
