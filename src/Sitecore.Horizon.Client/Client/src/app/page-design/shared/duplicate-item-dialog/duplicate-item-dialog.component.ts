/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { AccessPermissions, ConfigurePageDesignsInput } from 'app/page-design/page-templates.types';
import { ContextService } from 'app/shared/client-state/context.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-duplicate-item-dialog',
  templateUrl: './duplicate-item-dialog.component.html',
  styleUrls: ['./duplicate-item-dialog.component.scss'],
})
export class DuplicateItemDialogComponent implements OnInit, AfterViewInit {
  @ViewChild('nameInput', { static: true, read: ElementRef }) inputEl?: ElementRef;
  private readonly apiDuplicateNameError = 'is already defined';

  itemName = '';
  apiErrorMessage: string | null = null;
  isLoading = false;

  parentId = '';
  existingNames: string[] = [];
  itemId = '';
  pageDesignId?: string;

  readonly onDuplicate = new EventEmitter<{ itemId: string; displayName: string; access: AccessPermissions } | null>();

  constructor(
    private readonly closeHandle: DialogCloseHandle,
    private readonly pageTemplatesService: PageTemplatesService,
    private readonly contextService: ContextService,
    private readonly translateService: TranslateService,
  ) {}

  async ngOnInit() {
    this.itemName = await this.handleName(this.itemName);
  }

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
    this.onDuplicate.complete();
    this.closeHandle.close();
  }

  async duplicate() {
    this.isLoading = true;
    const result = await firstValueFrom(this.pageTemplatesService.copyItem(this.itemName, this.itemId, this.parentId));

    if (result.successful) {
      this.apiErrorMessage = null;
      if (result.item && this.pageDesignId) {
        this.assignPageDesign(result.item.itemId);
      }
      this.onDuplicate.next(result.item);
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

  private async assignPageDesign(itemId: string) {
    const configurePageDesign: ConfigurePageDesignsInput = {
      siteName: this.contextService.siteName,
      mapping: [
        {
          templateId: itemId,
          pageDesignId: this.pageDesignId,
        },
      ],
    };
    const result = await firstValueFrom(this.pageTemplatesService.configurePageDesign(configurePageDesign));

    if (!result.success) {
      this.apiErrorMessage = result.errorMessage;
    }
  }

  private async handleName(itemName: string) {
    const copyText = await firstValueFrom(this.translateService.get('EDITOR.COPY_OF'));

    return `${copyText} ${itemName}`;
  }
}
