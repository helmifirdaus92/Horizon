/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BreadcrumbItem, DialogOverlayService } from '@sitecore/ng-spd-lib';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { WarningDialogComponent } from 'app/shared/dialogs/warning-dialog/warning-dialog.component';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { shareReplayLatest } from 'app/shared/utils/rxjs/rxjs-custom';
import { XmCloudFeatureCheckerService } from 'app/shared/xm-cloud/xm-cloud-feature-checker.service';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  EMPTY,
  filter,
  firstValueFrom,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';
import { PageTemplatesService } from '../page-templates.service';
import {
  AccessPermissions,
  AncestorWithSite,
  Item,
  ItemWithSite,
  SiteType,
  TenantPageTemplate,
} from '../page-templates.types';
import { CreateItemDialogService } from '../shared/create-item-dialog/create-item-dialog.service';
import { MoveItemDialogService } from '../shared/move-item-dialog/move-item-dialog.service';
import { PageDesignRoutingService } from '../shared/page-design-routing.service';
import { RenameItemDialogService } from '../shared/rename-item-dialog/rename-item-dialog.service';
import { CreatePageDesignDialogService } from './create-page-design-dialog/create-page-design-dialog.service';
import { PageDesignsNavigationService } from './page-designs-navigation.service';

export const TEMP_NEW_FOLDER_ID = 'tempNewFolderId';

@Component({
  selector: 'app-page-designs',
  templateUrl: './page-designs.component.html',
  providers: [PageDesignsNavigationService],
  styleUrls: ['./page-designs.component.scss'],
})
export class PageDesignsComponent implements OnInit, OnDestroy {
  ancestors$: Observable<AncestorWithSite[]>;
  pageDesignAllItems$: Observable<ItemWithSite[] | undefined>;
  hasSharedSite$: Observable<boolean>;
  featureNotAvailable$: Observable<boolean> = EMPTY;
  siteType$: Observable<SiteType>;

  pageDesignItems: ItemWithSite[] = [];
  pageDesignFolders: ItemWithSite[] = [];
  currentRootItemId: string | undefined;
  currentRootPermissions$: Observable<AccessPermissions | undefined> = EMPTY;
  pageTemplates: TenantPageTemplate[] = [];

  isNavLoading$: Observable<boolean>;
  isWaitingResult = false;
  selectedItem?: ItemWithSite;
  selectedItemUsage = 0;

  cardBeingEdited?: string;
  breadcrumbItems: BreadcrumbItem[] = [];
  folderId: string | null = null;

  searchedDesign$ = new BehaviorSubject<Item | undefined>(undefined);

  isPageDesignEditingSupported = false;

  private readonly lifetime = new Lifetime();

  constructor(
    private readonly pageDesignsNavigationService: PageDesignsNavigationService,
    private readonly createPageDesignDialogService: CreatePageDesignDialogService,
    private readonly createItemDialogService: CreateItemDialogService,
    private readonly renameItemDialogService: RenameItemDialogService,
    private readonly moveItemDialogService: MoveItemDialogService,
    private readonly contextService: ContextService,
    private readonly pageTemplatesService: PageTemplatesService,
    private readonly translateService: TranslateService,
    private readonly dialogService: DialogOverlayService,
    private readonly xmCloudFeatureCheckerService: XmCloudFeatureCheckerService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly pageDesignRouteService: PageDesignRoutingService,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {
    this.pageDesignAllItems$ = this.pageDesignsNavigationService.items$;
    this.isNavLoading$ = this.pageDesignsNavigationService.isLoading$;
    this.hasSharedSite$ = this.pageDesignsNavigationService.hasSharedSite$;
    this.siteType$ = this.pageDesignsNavigationService.siteType$;
    this.ancestors$ = this.pageDesignsNavigationService.breadCrumbItems$;
  }

  async ngOnInit() {
    this.featureNotAvailable$ = this.pageTemplatesService.isPageTemplatesFeatureAvailable();

    this.currentRootPermissions$ = this.pageDesignsNavigationService.currentRootItem$.pipe(
      map((rootItem) => rootItem?.access),
    );

    this.pageDesignsNavigationService.watchItems(this.route.queryParamMap);

    combineLatest([this.pageDesignAllItems$, this.featureNotAvailable$])
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(([items, featureNotAvailable]) => {
        featureNotAvailable ? this.handleFeatureNotAvailable() : this.sortAndPopulateItems(items);
      });

    this.pageDesignsNavigationService.currentRootItem$
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe((item) => (this.currentRootItemId = item?.itemId));

    combineLatest([this.contextService.siteName$, this.featureNotAvailable$])
      .pipe(
        takeWhileAlive(this.lifetime),
        switchMap(([siteName, featureNotAvailable]) => {
          if (featureNotAvailable) {
            return of([]);
          } else {
            return this.pageTemplatesService.getTenantPageTemplates(siteName).pipe(
              catchError(() => {
                this.pageTemplatesService.showErrorMessage();
                return of([]);
              }),
            );
          }
        }),
        shareReplay(1),
      )
      .subscribe((pageTemplates) => (this.pageTemplates = pageTemplates));

    this.isPageDesignEditingSupported = await this.xmCloudFeatureCheckerService.isPageDesignEditingFeatureAvailable();

    this.watchAncestorItems();
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
        if (design) {
          const matchingDesign = this.pageDesignItems.find((item) => item.itemId === design.itemId);
          if (matchingDesign) {
            this.selectedItem = matchingDesign;
          }
        }
      });
  }

  ngOnDestroy() {
    this.lifetime.dispose();
    this.pageDesignsNavigationService.clearSubscriptions();
  }

  handleSiteTypeSelection(siteType: SiteType) {
    this.pageDesignsNavigationService.changeSiteType(siteType);
  }

  async createPageDesign(): Promise<void> {
    if (!this.currentRootItemId) {
      throw Error('Parent Id cannot be null.');
    }

    const pageDesignTemplateId = await firstValueFrom(this.pageDesignsNavigationService.siteItemTemplateId$);
    if (!pageDesignTemplateId) {
      throw Error('Template Id cannot be null.');
    }

    const showAdvanceCreateDialog =
      this.featureFlagsService.isFeatureEnabled('pages_show-templates-design-updates') &&
      (await this.xmCloudFeatureCheckerService.isTemplateStandardValuesAvailable());

    const createdPageDesign = showAdvanceCreateDialog
      ? await firstValueFrom(
          this.createPageDesignDialogService.show({
            parentId: this.currentRootItemId,
            templateId: pageDesignTemplateId,
            existingDesignNames: this.pageDesignItems.map((item) => item.displayName),
            language: this.contextService.language,
          }),
        ).catch(() => undefined)
      : await firstValueFrom(
          this.createItemDialogService.show({
            parentId: this.currentRootItemId,
            templateId: pageDesignTemplateId,
            existingNames: this.pageDesignItems.map((item) => item.displayName),
            language: this.contextService.language,
            type: 'page-design',
          }),
        ).catch(() => undefined);
    if (createdPageDesign) {
      this.router.navigate(['/editpagedesign'], {
        queryParams: {
          sc_itemid: createdPageDesign.itemId,
          sc_version: createdPageDesign.version,
        },
        queryParamsHandling: 'merge',
      });
      this.pageDesignRouteService.removeDesignParams$.next(false);
    }
  }

  async moveItem(item: ItemWithSite, itemType: 'folder' | 'pageDesign'): Promise<void> {
    if (!this.currentRootItemId) {
      throw Error('Parent Id cannot be null.');
    }

    const moveItemResult = await firstValueFrom(
      this.moveItemDialogService.show({
        parentId: this.currentRootItemId,
        itemId: item.itemId,
        itemName: item.name,
        rootId: !!this.breadcrumbItems[0].itemId ? this.breadcrumbItems[0].itemId : this.currentRootItemId,
        templateId: (await firstValueFrom(this.pageDesignsNavigationService.siteFolderTemplateId$)) ?? '',
        language: this.contextService.language,
      }),
    ).catch(() => undefined);

    if (moveItemResult?.movedItem && moveItemResult.movedItem?.parentId !== this.currentRootItemId) {
      this.removeItemFromUI(item.itemId, itemType);
    }

    if (moveItemResult?.addedFolders) {
      moveItemResult.addedFolders.forEach((folder) => {
        this.pageDesignFolders.unshift({ ...folder, siteName: this.contextService.siteName });
      });
    }
  }

  async renamePageDesign(pageDesign: Item): Promise<void> {
    const renamedPageDesign = await firstValueFrom(
      this.renameItemDialogService.show({
        itemId: pageDesign.itemId,
        itemName: pageDesign.displayName,
        existingNames: this.pageDesignItems.map((item) => item.displayName),
      }),
    ).catch(() => undefined);

    if (renamedPageDesign) {
      const itemIndex = this.pageDesignItems.findIndex(
        (pageDesignItem) => pageDesignItem.itemId === renamedPageDesign.itemId,
      );
      this.pageDesignItems[itemIndex] = { ...renamedPageDesign, siteName: this.contextService.siteName };
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
    this.pageDesignFolders.unshift({ ...newfolderItem, siteName: this.contextService.siteName });
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
      this.pageDesignsNavigationService.navigateToFolder(folderToExpand.itemId);
    }

    this.selectItem(folderToExpand);
  }

  editPageDesign(selectedItem: Item) {
    this.router.navigate(['/editpagedesign'], {
      queryParams: {
        sc_itemid: selectedItem.itemId,
        sc_version: selectedItem.version,
      },
      queryParamsHandling: 'merge',
    });
    this.pageDesignRouteService.removeDesignParams$.next(false);
  }

  async loadBreadcrumbData(item: BreadcrumbItem) {
    this.pageDesignsNavigationService.navigateToFolder(item.itemId);
  }

  selectItem(item: ItemWithSite | undefined) {
    this.selectedItem = item;
  }

  async promptDeleteItem(itemId: string, itemType: 'folder' | 'pageDesign') {
    const { component: dialog } = WarningDialogComponent.show(this.dialogService);

    dialog.title = await firstValueFrom(this.translateService.get('COMMON.DELETE'));
    dialog.text = await firstValueFrom(
      itemType === 'folder'
        ? this.translateService.get('PAGE_DESIGNS.WORKSPACE.DELETE_FOLDER_DIALOG_TEXT')
        : this.translateService.get('PAGE_DESIGNS.WORKSPACE.DELETE_PAGE_DESIGN_DIALOG_TEXT'),
    );
    dialog.declineText = await firstValueFrom(this.translateService.get('COMMON.CANCEL'));
    dialog.confirmText = await firstValueFrom(this.translateService.get('COMMON.DELETE'));

    const result = await firstValueFrom(dialog.dialogResultEvent);
    if (result.confirmed) {
      await this.deleteItem(itemId, itemType);
    }
  }

  pageDesignUsedByTemplatesCount(itemId?: string) {
    return itemId ? this.pageTemplates.filter((template) => template.pageDesign?.itemId === itemId).length : 0;
  }

  getSourceSite(pageDesign?: ItemWithSite | null): string | undefined {
    const siteName = pageDesign?.siteName;
    const isFromSharedSite = siteName !== this.contextService.siteName;
    return isFromSharedSite ? siteName : undefined;
  }

  private handleFeatureNotAvailable() {
    this.pageDesignsNavigationService.clearSubscriptions();
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

    const folderTemplateId = await firstValueFrom(this.pageDesignsNavigationService.siteFolderTemplateId$);
    if (!folderTemplateId) {
      throw Error('Template Id cannot be null.');
    }

    this.isWaitingResult = true;

    const isValid = await this.pageTemplatesService.validateName(
      name,
      this.pageDesignFolders.map((folder) => folder.displayName),
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
        this.pageDesignFolders.unshift({ ...result.item, siteName: this.contextService.siteName });
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
      this.pageDesignFolders.map((folder) => folder.displayName),
    );

    if (isValid) {
      const result = await firstValueFrom(this.pageTemplatesService.renameItem(itemId, newName));

      this.isWaitingResult = false;

      if (result.successful && result.item) {
        const itemIndex = this.pageDesignFolders.findIndex((folder) => folder.itemId === itemId);
        this.pageDesignFolders[itemIndex] = {
          ...result.item,
          siteName: this.contextService.siteName,
        };
      } else {
        this.pageTemplatesService.showErrorMessage(result.errorMessage);
      }
    } else {
      const itemIndex = this.pageDesignFolders.findIndex((folder) => folder.itemId === itemId);
      const item = this.pageDesignFolders.find((folder) => folder.itemId === itemId);
      if (item) {
        this.pageDesignFolders[itemIndex] = { ...item, siteName: this.contextService.siteName };
      }
      this.isWaitingResult = false;
    }
  }

  private async deleteItem(itemId: string, itemType: 'folder' | 'pageDesign') {
    this.isWaitingResult = true;

    const result = await firstValueFrom(this.pageTemplatesService.deleteItem(itemId, false));

    this.isWaitingResult = false;

    if (result.successful) {
      this.removeItemFromUI(itemId, itemType);
    } else {
      this.pageTemplatesService.showErrorMessage(result.errorMessage);
    }
  }

  private async removeItemFromUI(itemId: string, itemType: 'folder' | 'pageDesign') {
    if (itemType === 'folder') {
      const itemIndex = this.pageDesignFolders.findIndex((folder) => folder.itemId === itemId);
      this.pageDesignFolders.splice(itemIndex, 1);
    } else {
      const itemIndex = this.pageDesignItems.findIndex((item) => item.itemId === itemId);
      this.pageDesignItems.splice(itemIndex, 1);
    }
  }

  private sortAndPopulateItems(items: ItemWithSite[] | undefined) {
    const sortedItems = [...(items ?? [])].sort((a, b) => a.name.localeCompare(b.name));

    [this.pageDesignItems, this.pageDesignFolders] = [
      sortedItems.filter((item) => item.hasPresentation),
      sortedItems.filter((item) => item.isFolder),
    ];
  }

  private deleteTempFolderItem() {
    const tempNewFolderItemIndex = this.pageDesignFolders.findIndex((folder) => folder.itemId === TEMP_NEW_FOLDER_ID);
    if (tempNewFolderItemIndex !== -1) {
      this.pageDesignFolders.splice(tempNewFolderItemIndex, 1);
    }
  }

  private async watchAncestorItems() {
    this.ancestors$
      .pipe(
        map((ancestorItems: AncestorWithSite[]) =>
          ancestorItems.map((pageDesignItem: AncestorWithSite) => ({
            itemId: pageDesignItem.itemId,
            itemName: pageDesignItem.displayName,
          })),
        ),
        shareReplayLatest(),
      )
      .subscribe((breadcrumbItems) => {
        this.breadcrumbItems = breadcrumbItems;
      });
  }
}
