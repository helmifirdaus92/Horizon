/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BreadcrumbItem, DialogOverlayService } from '@sitecore/ng-spd-lib';
import { ContextService } from 'app/shared/client-state/context.service';
import { WarningDialogComponent } from 'app/shared/dialogs/warning-dialog/warning-dialog.component';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { shareReplayLatest } from 'app/shared/utils/rxjs/rxjs-custom';
import { BehaviorSubject, EMPTY, Observable, combineLatest, filter, firstValueFrom, map, switchMap } from 'rxjs';
import { PageTemplatesService } from '../page-templates.service';
import { AccessPermissions, AncestorWithSite, Item, ItemWithSite, SiteType } from '../page-templates.types';
import { CreateItemDialogService } from '../shared/create-item-dialog/create-item-dialog.service';
import { MoveItemDialogService } from '../shared/move-item-dialog/move-item-dialog.service';
import { PageDesignRoutingService } from '../shared/page-design-routing.service';
import { RenameItemDialogService } from '../shared/rename-item-dialog/rename-item-dialog.service';
import { PartialDesignsNavigationService } from './partial-designs-navigation.service';

export const TEMP_NEW_FOLDER_ID = 'tempNewFolderId';

@Component({
  selector: 'app-partial-designs',
  templateUrl: './partial-designs.component.html',
  providers: [PartialDesignsNavigationService],
  styleUrls: ['./partial-designs.component.scss'],
})
export class PartialDesignsComponent implements OnInit, OnDestroy {
  constructor(
    private readonly partialDesignsNavigationService: PartialDesignsNavigationService,
    private readonly createItemDialogService: CreateItemDialogService,
    private readonly renameItemDialogService: RenameItemDialogService,
    private readonly moveItemDialogService: MoveItemDialogService,
    private readonly contextService: ContextService,
    private readonly pageTemplatesService: PageTemplatesService,
    private readonly translateService: TranslateService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly dialogService: DialogOverlayService,
    private readonly pageDesignRouteService: PageDesignRoutingService,
  ) {
    this.isNavLoading$ = this.partialDesignsNavigationService.isLoading$;
    this.hasSharedSite$ = this.partialDesignsNavigationService.hasSharedSite$;
    this.siteType$ = this.partialDesignsNavigationService.siteType$;
    this.partialDesignAllItems$ = this.partialDesignsNavigationService.items$;
    this.ancestors$ = this.partialDesignsNavigationService.breadCrumbItems$;
  }

  ancestors$: Observable<AncestorWithSite[]>;
  partialDesignAllItems$: Observable<ItemWithSite[] | undefined> = EMPTY;
  hasSharedSite$: Observable<boolean>;
  featureNotAvailable$: Observable<boolean> = EMPTY;

  partialDesignItems: ItemWithSite[] = [];
  partialDesignFolders: ItemWithSite[] = [];
  currentRootItemId: string | undefined;
  currentRootPermissions$: Observable<AccessPermissions | undefined> = EMPTY;

  isNavLoading$: Observable<boolean>;
  isWaitingResult = false;
  selectedItem?: ItemWithSite;

  cardBeingEdited?: string;
  breadcrumbItems: BreadcrumbItem[] = [];
  searchedDesign$ = new BehaviorSubject<Item | undefined>(undefined);

  siteType$: Observable<SiteType>;

  private readonly lifetime = new Lifetime();

  async ngOnInit() {
    this.watchAncestorItems();

    this.featureNotAvailable$ = this.pageTemplatesService.isPageTemplatesFeatureAvailable();

    this.currentRootPermissions$ = this.partialDesignsNavigationService.currentRootItem$.pipe(
      map((rootItem) => rootItem?.access),
    );

    this.partialDesignsNavigationService.watchItems(this.route.queryParamMap);

    combineLatest([this.partialDesignAllItems$, this.featureNotAvailable$])
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(([items, featureNotAvailable]) => {
        featureNotAvailable ? this.handleFeatureNotAvailable() : this.sortAndPopulateItems(items);
      });

    this.partialDesignsNavigationService.currentRootItem$
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe((item) => (this.currentRootItemId = item?.itemId));

    this.watchContextChangesForSiteTabs();

    // Search functionality
    this.searchedDesign$
      .pipe(
        takeWhileAlive(this.lifetime),
        switchMap((design) =>
          this.isNavLoading$.pipe(
            filter((isLoading) => !isLoading),
            map(() => design),
          ),
        ),
      )
      .subscribe((design) => {
        const matchingDesign = this.partialDesignItems.find((item) => item.itemId === design?.itemId);
        if (matchingDesign) {
          this.selectedItem = matchingDesign;
        }
      });
  }

  ngOnDestroy() {
    this.lifetime.dispose();
    this.partialDesignsNavigationService.clearSubscriptions();
  }

  handleSiteTypeSelection(siteType: SiteType) {
    this.partialDesignsNavigationService.changeSiteType(siteType);
  }

  async createPartialDesign(): Promise<void> {
    if (!this.currentRootItemId) {
      throw Error('Parent Id cannot be null.');
    }

    const partialDesignTemplateId = await firstValueFrom(this.partialDesignsNavigationService.siteItemTemplateId$);
    if (!partialDesignTemplateId) {
      throw Error('Template Id cannot be null.');
    }
    const createdPartialDesign = await firstValueFrom(
      this.createItemDialogService.show({
        parentId: this.currentRootItemId,
        templateId: partialDesignTemplateId as string,
        existingNames: this.partialDesignItems.map((item) => item.displayName),
        language: this.contextService.language,
        type: 'partial-design',
      }),
    ).catch(() => undefined);

    if (createdPartialDesign) {
      this.router.navigate(['/editpartialdesign'], {
        queryParams: {
          sc_itemid: createdPartialDesign.itemId,
          sc_version: createdPartialDesign.version,
        },
        queryParamsHandling: 'merge',
      });
      this.pageDesignRouteService.removeDesignParams$.next(false);
    }
  }

  async moveItem(item: ItemWithSite, itemType: 'folder' | 'partialDesign'): Promise<void> {
    if (!this.currentRootItemId) {
      throw Error('Parent Id cannot be null.');
    }

    const moveItemResult = await firstValueFrom(
      this.moveItemDialogService.show({
        parentId: this.currentRootItemId,
        itemId: item.itemId,
        itemName: item.name,
        rootId: !!this.breadcrumbItems[0].itemId ? this.breadcrumbItems[0].itemId : this.currentRootItemId,
        templateId: (await firstValueFrom(this.partialDesignsNavigationService.siteFolderTemplateId$)) ?? '',
        language: this.contextService.language,
      }),
    ).catch(() => undefined);

    if (moveItemResult?.movedItem && moveItemResult.movedItem?.parentId !== this.currentRootItemId) {
      this.removeItemFromUI(item.itemId, itemType);
    }

    if (moveItemResult?.addedFolders) {
      moveItemResult.addedFolders.forEach((folder) => {
        this.partialDesignFolders.unshift({ ...folder, siteName: this.contextService.siteName });
      });
    }
  }

  async renamePartialDesign(partialDesign: Item): Promise<void> {
    const renamedPartialDesign = await firstValueFrom(
      this.renameItemDialogService.show({
        itemId: partialDesign.itemId,
        itemName: partialDesign.displayName,
        existingNames: this.partialDesignItems.map((item) => item.displayName),
      }),
    ).catch(() => undefined);

    if (renamedPartialDesign) {
      const itemIndex = this.partialDesignItems.findIndex((item) => item.itemId === renamedPartialDesign.itemId);
      this.partialDesignItems[itemIndex] = { ...renamedPartialDesign, siteName: this.contextService.siteName };
    }
  }

  createTempFolderItem() {
    const newfolderItem: Item = {
      displayName: '',
      hasChildren: false,
      hasPresentation: false,
      isFolder: true,
      itemId: TEMP_NEW_FOLDER_ID,
      name: 'New folder',
      path: '',
      thumbnailUrl: '',
      insertOptions: [],
      access: {
        canCreate: false,
        canDelete: false,
        canDuplicate: false,
        canRename: false,
        canWrite: false,
      },
      parentId: '',
      version: 1,
    };
    this.partialDesignFolders.unshift({ ...newfolderItem, siteName: this.contextService.siteName });
    this.cardBeingEdited = newfolderItem.itemId;
  }

  async onSubmitContentEdit(newValue: string, itemId: string) {
    this.cardBeingEdited = undefined;
    if (itemId === TEMP_NEW_FOLDER_ID) {
      await this.createFolder(newValue);
    } else {
      await this.renameFolder(itemId, newValue);
    }
  }

  onCancelContentEdit() {
    this.cardBeingEdited = undefined;
    this.deleteTempFolderItem();
  }

  expandFolder(folderToExpand: ItemWithSite) {
    if (folderToExpand.itemId === TEMP_NEW_FOLDER_ID) {
      return;
    }

    if (folderToExpand) {
      this.partialDesignsNavigationService.navigateToFolder(folderToExpand.itemId);
    }

    this.selectItem(folderToExpand);
  }

  editPartialDesign(selectedItem: ItemWithSite) {
    this.router.navigate(['/editpartialdesign'], {
      queryParams: {
        sc_itemid: selectedItem.itemId,
        sc_version: selectedItem.version,
        siteName: selectedItem.siteName,
      },
      queryParamsHandling: 'merge',
    });
    this.pageDesignRouteService.removeDesignParams$.next(false);
  }

  async loadBreadcrumbData(item: BreadcrumbItem) {
    this.partialDesignsNavigationService.navigateToFolder(item.itemId);
  }

  selectItem(item: ItemWithSite | undefined) {
    this.selectedItem = item;
  }

  async promptDeleteItem(itemId: string, itemType: 'folder' | 'partialDesign') {
    const { component: dialog } = WarningDialogComponent.show(this.dialogService);

    dialog.title = await firstValueFrom(this.translateService.get('COMMON.DELETE'));
    dialog.text = await firstValueFrom(
      itemType === 'folder'
        ? this.translateService.get('PAGE_DESIGNS.WORKSPACE.DELETE_FOLDER_DIALOG_TEXT')
        : this.translateService.get('PAGE_DESIGNS.WORKSPACE.DELETE_PARTIAL_DESIGN_DIALOG_TEXT'),
    );
    dialog.declineText = await firstValueFrom(this.translateService.get('COMMON.CANCEL'));
    dialog.confirmText = await firstValueFrom(this.translateService.get('COMMON.DELETE'));

    const result = await firstValueFrom(dialog.dialogResultEvent);
    if (result.confirmed) {
      await this.deleteItem(itemId, itemType);
    }
  }

  getSourceSite(partialDesign?: ItemWithSite): string | undefined {
    const siteName = partialDesign?.siteName;
    const isFromSharedSite = siteName !== this.contextService.siteName;
    return isFromSharedSite ? siteName : undefined;
  }

  private handleFeatureNotAvailable() {
    this.partialDesignsNavigationService.clearSubscriptions();
    this.sortAndPopulateItems([]);
  }

  private watchContextChangesForSiteTabs() {
    combineLatest([this.contextService.siteName$, this.contextService.language$])
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(() => {
        this.selectItem(undefined);
        this.pageDesignRouteService.removeDesignParams$.next(true);
      });
  }

  private async createFolder(name: string) {
    if (!this.currentRootItemId) {
      throw Error('Parent Id cannot be null.');
    }

    const folderTemplateId = await firstValueFrom(this.partialDesignsNavigationService.siteFolderTemplateId$);
    if (!folderTemplateId) {
      throw Error('Template Id cannot be null.');
    }

    this.isWaitingResult = true;

    const isValid = await this.pageTemplatesService.validateName(
      name,
      this.partialDesignFolders.map((folder) => folder.displayName),
    );

    if (isValid) {
      const result = await firstValueFrom(
        this.pageTemplatesService.createItem(
          name,
          this.currentRootItemId,
          folderTemplateId,
          this.contextService.language,
        ),
      );

      this.deleteTempFolderItem();

      this.isWaitingResult = false;

      if (result.successful && result.item) {
        this.partialDesignFolders.unshift({ ...result.item, siteName: this.contextService.siteName });
      } else {
        this.pageTemplatesService.showErrorMessage(result.errorMessage);
      }
    } else {
      this.deleteTempFolderItem();

      this.isWaitingResult = false;
    }
  }

  private async renameFolder(itemId: string, newName: string) {
    this.isWaitingResult = true;

    const isValid = await this.pageTemplatesService.validateName(
      newName,
      this.partialDesignFolders.map((folder) => folder.displayName),
    );

    if (isValid) {
      const result = await firstValueFrom(this.pageTemplatesService.renameItem(itemId, newName));

      this.isWaitingResult = false;

      if (result.successful && result.item) {
        const itemIndex = this.partialDesignFolders.findIndex((folder) => folder.itemId === itemId);
        this.partialDesignFolders[itemIndex] = { ...result.item, siteName: this.contextService.siteName };
      } else {
        this.pageTemplatesService.showErrorMessage(result.errorMessage);
      }
    } else {
      const itemIndex = this.partialDesignFolders.findIndex((folder) => folder.itemId === itemId);
      const item = this.partialDesignFolders.find((folder) => folder.itemId === itemId);
      if (item) {
        this.partialDesignFolders[itemIndex] = { ...item, siteName: this.contextService.siteName };
      }
      this.isWaitingResult = false;
    }
  }

  private async deleteItem(itemId: string, itemType: 'folder' | 'partialDesign') {
    this.isWaitingResult = true;

    const result = await firstValueFrom(this.pageTemplatesService.deleteItem(itemId, false));

    this.isWaitingResult = false;

    if (result.successful) {
      this.removeItemFromUI(itemId, itemType);
    } else {
      this.pageTemplatesService.showErrorMessage(result.errorMessage);
    }
  }

  private async removeItemFromUI(itemId: string, itemType: 'folder' | 'partialDesign') {
    if (itemType === 'folder') {
      const itemIndex = this.partialDesignFolders.findIndex((folder) => folder.itemId === itemId);
      this.partialDesignFolders.splice(itemIndex, 1);
    } else {
      const itemIndex = this.partialDesignItems.findIndex((item) => item.itemId === itemId);
      this.partialDesignItems.splice(itemIndex, 1);
    }
  }

  private sortAndPopulateItems(items: ItemWithSite[] | undefined) {
    const sortedItems = [...(items ?? [])].sort((a, b) => a.name.localeCompare(b.name));

    [this.partialDesignItems, this.partialDesignFolders] = [
      sortedItems.filter((item) => !item.isFolder),
      sortedItems.filter((item) => item.isFolder),
    ];
  }

  private deleteTempFolderItem() {
    const tempNewFolderItemIndex = this.partialDesignFolders.findIndex(
      (folder) => folder.itemId === TEMP_NEW_FOLDER_ID,
    );
    if (tempNewFolderItemIndex !== -1) {
      this.partialDesignFolders.splice(tempNewFolderItemIndex, 1);
    }
  }

  private async watchAncestorItems() {
    this.ancestors$
      .pipe(
        map((ancestorItems: AncestorWithSite[]) =>
          ancestorItems.map((partialDesignItem: AncestorWithSite) => ({
            itemId: partialDesignItem.itemId,
            itemName: partialDesignItem.displayName,
          })),
        ),
        shareReplayLatest(),
      )
      .subscribe((breadcrumbItems) => {
        this.breadcrumbItems = breadcrumbItems;
      });
  }
}
