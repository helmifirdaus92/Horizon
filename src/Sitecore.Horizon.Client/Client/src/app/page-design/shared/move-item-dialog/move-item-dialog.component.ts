/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, HostListener, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { Item } from 'app/page-design/page-templates.types';
import { TEMP_NEW_FOLDER_ID } from 'app/page-design/partial-designs/partial-designs.component';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { BehaviorSubject, catchError, filter, finalize, firstValueFrom, of, switchMap } from 'rxjs';
import { adminPermissions } from '../page-templates-test-data';
import { MoveItemDialogResponse } from './move-item-dialog.service';

@Component({
  selector: 'app-move-item-dialog',
  templateUrl: './move-item-dialog.component.html',
  styleUrls: ['./move-item-dialog.component.scss'],
})
export class MoveItemDialogComponent implements OnInit, OnDestroy {
  apiErrorMessage: string | null = null;
  isLoading = false;

  parentId = '';
  itemId = '';
  itemName = '';
  rootId = '';
  templateId = '';
  language = '';

  childFolders: Item[] = [];
  addedFolders: Item[] = [];

  selectedFolder: Item | undefined;
  closestAncestorId: string | undefined;

  isWaitingResult = false;
  cardBeingEdited?: string;
  tempFolderId = TEMP_NEW_FOLDER_ID;
  canMoveToSelectedFolder = false;

  readonly onMove = new EventEmitter<MoveItemDialogResponse>();

  private selectedFolderId$: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);

  private readonly lifetime = new Lifetime();

  constructor(
    private readonly closeHandle: DialogCloseHandle,
    private readonly pageTemplatesService: PageTemplatesService,
    protected readonly translateService: TranslateService,
    protected readonly timedNotificationsService: TimedNotificationsService,
  ) {}

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      event.preventDefault();
      this.close();
    }
    this.apiErrorMessage = null;
  }

  ngOnInit(): void {
    this.selectedFolderId$.next(this.parentId);

    this.selectedFolderId$
      .pipe(
        filter((folderId): folderId is NonNullable<string> => !!folderId),
        switchMap((folderId) => {
          this.isLoading = true;
          return this.pageTemplatesService.getItemChildrenWithAncestors(folderId, this.language);
        }),
        catchError(() => {
          this.showRequestFailErrorMessage();
          return of();
        }),
        finalize(() => {
          this.isLoading = false;
        }),
        takeWhileAlive(this.lifetime),
      )
      .subscribe((item) => {
        this.selectedFolder = item;
        this.sortAndPopulateItems(item.children);
        if (item.ancestors) {
          this.closestAncestorId = item.ancestors[item.ancestors.length - 1].itemId;
        }
        this.checkMoveToPermissions(item.itemId);
        this.isLoading = false;
      });
  }

  ngOnDestroy() {
    this.lifetime.dispose();
  }

  close() {
    this.onMove.next({ movedItem: null, addedFolders: this.addedFolders });
    this.onMove.complete();
    this.closeHandle.close();
  }

  createTempFolderItem() {
    const newfolderItem: Item = {
      displayName: '',
      hasChildren: false,
      hasPresentation: false,
      isFolder: true,
      itemId: this.tempFolderId,
      name: 'New folder',
      path: '',
      thumbnailUrl: '',
      insertOptions: [],
      access: adminPermissions,
      version: 1,
    };
    this.childFolders.unshift({ ...newfolderItem });
    this.cardBeingEdited = newfolderItem.itemId;
  }

  onCancelContentEdit() {
    this.cardBeingEdited = undefined;
    this.deleteTempFolderItem();
  }

  async onSubmitContentEdit(newValue: string) {
    this.cardBeingEdited = undefined;
    await this.createFolder(newValue);
  }

  async navigateToFolder(folderId: string) {
    if (folderId !== this.tempFolderId) {
      this.selectedFolderId$.next(folderId);
    }
  }

  async move() {
    if (this.selectedFolder) {
      this.isLoading = true;

      const result = await firstValueFrom(this.pageTemplatesService.moveItem(this.itemId, this.selectedFolder.itemId));

      if (result.successful) {
        this.apiErrorMessage = null;
        this.onMove.next({ movedItem: result.item, addedFolders: this.addedFolders });
        this.close();
        this.isLoading = false;
      } else {
        this.isLoading = false;
        this.apiErrorMessage = result.errorMessage;
      }
    }
  }

  private async createFolder(name: string) {
    if (!this.selectedFolder?.itemId) {
      throw Error('Parent Id cannot be null.');
    }

    const folderTemplateId = this.templateId;
    if (!folderTemplateId) {
      throw Error('Template Id cannot be null.');
    }

    this.isWaitingResult = true;

    const isValid = await this.pageTemplatesService.validateName(
      name,
      this.childFolders.map((folder) => folder.displayName),
      'dialog',
    );

    const currentSelectedFolderId = this.selectedFolder.itemId;

    if (isValid) {
      const result = await firstValueFrom(
        this.pageTemplatesService.createItem(name, currentSelectedFolderId, folderTemplateId, this.language),
      );

      this.deleteTempFolderItem();

      this.isWaitingResult = false;

      if (result.successful && result.item) {
        if (this.selectedFolder.itemId === currentSelectedFolderId) {
          this.childFolders.unshift({ ...result.item });
        }
        if (this.parentId === currentSelectedFolderId) {
          this.addedFolders.unshift({ ...result.item });
        }
      } else {
        this.pageTemplatesService.showErrorMessage(result.errorMessage, 'dialog');
      }
    } else {
      this.deleteTempFolderItem();

      this.isWaitingResult = false;
    }
  }

  private async checkMoveToPermissions(destinationId: string) {
    const userHasPermissions = await firstValueFrom(
      this.pageTemplatesService.getMoveToPermissions(this.itemId, this.language, destinationId),
    );

    const nameAlreadyExists = this.childFolders.some(
      (folder) => folder.name.toLowerCase() === this.itemName.toLowerCase(),
    );

    this.canMoveToSelectedFolder = !(!userHasPermissions || nameAlreadyExists);
  }

  private async showRequestFailErrorMessage() {
    const errorInApiRequest = await firstValueFrom(
      this.translateService.get('PAGE_DESIGNS.WORKSPACE.BAD_REQUEST_ERROR_MESSAGE'),
    );

    const notification = new TimedNotification('pageTemplateRequestError', errorInApiRequest, 'error');
    this.timedNotificationsService.pushNotification(notification);
  }

  private deleteTempFolderItem() {
    const tempNewFolderItemIndex = this.childFolders.findIndex((folder) => folder.itemId === TEMP_NEW_FOLDER_ID);
    if (tempNewFolderItemIndex !== -1) {
      this.childFolders.splice(tempNewFolderItemIndex, 1);
    }
  }

  private sortAndPopulateItems(items: Item[] | undefined) {
    const sortedItems = [...(items ?? [])].sort((a, b) => a.name.localeCompare(b.name));

    this.childFolders = sortedItems.filter((item) => item.isFolder && item.itemId !== this.itemId);
  }
}
