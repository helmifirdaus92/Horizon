/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BreadcrumbItem, DialogOverlayService } from '@sitecore/ng-spd-lib';
import { ContextService } from 'app/shared/client-state/context.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { WarningDialogComponent } from 'app/shared/dialogs/warning-dialog/warning-dialog.component';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { shareReplayLatest } from 'app/shared/utils/rxjs/rxjs-custom';
import { isSameGuid } from 'app/shared/utils/utils';
import { combineLatest, EMPTY, firstValueFrom, map, Observable } from 'rxjs';
import { PageTemplatesService } from '../page-templates.service';
import {
  AccessPermissions,
  AncestorWithSite,
  Item,
  ItemWithSite,
  PAGE_BRANCHES_FOLDER_TEMPLATE_ID,
  PAGE_BRANCH_TEMPLATE_ID,
  SiteType,
} from '../page-templates.types';
import { MoveItemDialogService } from '../shared/move-item-dialog/move-item-dialog.service';
import { PageDesignRoutingService } from '../shared/page-design-routing.service';
import { RenameItemDialogService } from '../shared/rename-item-dialog/rename-item-dialog.service';
import { CreatePageBranchDialogService } from './create-page-branch-dialog/create-page-branch-dialog.service';
import { PageBranchesNavigationService } from './page-branches-navigations.sevrice';

export const TEMP_NEW_FOLDER_ID = 'tempNewFolderId';

@Component({
  selector: 'app-page-branches',
  templateUrl: './page-branches.component.html',
  styleUrls: ['./page-branches.component.scss'],
})
export class PageBranchesComponent implements OnInit, OnDestroy {
  constructor(
    private readonly pageBranchesNavigationService: PageBranchesNavigationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly pageTemplatesService: PageTemplatesService,
    private readonly contextService: ContextService,
    private readonly moveItemDialogService: MoveItemDialogService,
    private readonly dialogService: DialogOverlayService,
    private readonly translateService: TranslateService,
    private readonly pageDesignRouteService: PageDesignRoutingService,
    private readonly renameItemDialogService: RenameItemDialogService,
    private readonly createPageBranchDialogService: CreatePageBranchDialogService,
  ) {
    this.isNavLoading$ = this.pageBranchesNavigationService.isLoading$;
    this.siteType$ = this.pageBranchesNavigationService.siteType$;
    this.hasSharedSite$ = this.pageBranchesNavigationService.hasSharedSite$;
    this.pageBranchesAllItems$ = this.pageBranchesNavigationService.items$;
    this.ancestors$ = this.pageBranchesNavigationService.breadCrumbItems$;
  }

  private readonly lifetime = new Lifetime();
  private featureNotAvailable$: Observable<boolean> = EMPTY;

  ancestors$: Observable<AncestorWithSite[]>;
  currentRootItemId: string | undefined;
  currentRootPermissions$: Observable<AccessPermissions | undefined> = EMPTY;

  siteType$: Observable<SiteType>;
  hasSharedSite$: Observable<boolean>;

  selectedItem?: ItemWithSite;
  pageBranchItems: ItemWithSite[] = [];
  pageBranchesFolders: ItemWithSite[] = [];
  pageBranchesAllItems$: Observable<ItemWithSite[] | undefined> = EMPTY;

  isLoading = true;
  isNavLoading$: Observable<boolean>;

  cardBeingEdited?: string;
  breadcrumbItems: BreadcrumbItem[] = [];

  ngOnInit(): void {
    this.watchAncestorItems();
    this.featureNotAvailable$ = this.pageTemplatesService.isPageTemplatesFeatureAvailable();

    this.currentRootPermissions$ = this.pageBranchesNavigationService.currentRootItem$.pipe(
      map((rootItem) => rootItem?.access),
    );

    this.pageBranchesNavigationService.watchItems(this.route.queryParamMap);

    combineLatest([this.pageBranchesAllItems$, this.featureNotAvailable$])
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(([items, featureNotAvailable]) => {
        featureNotAvailable ? this.handleFeatureNotAvailable() : this.sortAndPopulateItems(items);
        this.isLoading = false;
      });

    this.pageBranchesNavigationService.currentRootItem$
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe((item) => (this.currentRootItemId = item?.itemId));

    this.watchContextChangesForSiteTabs();
  }

  ngOnDestroy() {
    this.lifetime.dispose();
    this.pageBranchesNavigationService.clearSubscriptions();
  }

  openEditRulesInContentEditor() {
    const platformUrl = ConfigurationService.xmCloudTenant?.url;
    const contentEditorTemplateLink = `${platformUrl}sitecore/shell/Applications/Content%20Editor.aspx?fo=${this.currentRootItemId}&lang=${this.contextService.language}`;
    window.open(contentEditorTemplateLink, '_blank');
  }

  handleSiteTypeSelection(siteType: SiteType) {
    this.pageBranchesNavigationService.changeSiteType(siteType);
  }

  async loadBreadcrumbData(item: BreadcrumbItem) {
    this.pageBranchesNavigationService.navigateToFolder(item.itemId);
  }

  getSourceSite(item?: ItemWithSite): string | undefined {
    const siteName = item?.siteName;
    const isFromSharedSite = siteName !== this.contextService.siteName;
    return isFromSharedSite ? siteName : undefined;
  }

  expandFolder(folderToExpand: ItemWithSite) {
    if (folderToExpand.itemId === TEMP_NEW_FOLDER_ID) {
      return;
    }

    if (folderToExpand) {
      this.pageBranchesNavigationService.navigateToFolder(folderToExpand.itemId);
    }

    this.selectItem(folderToExpand);
  }

  selectItem(item: ItemWithSite | undefined) {
    this.selectedItem = item;
  }

  onCancelContentEdit() {
    this.cardBeingEdited = undefined;
    this.deleteTempFolderItem();
  }

  async moveItem(item: ItemWithSite, itemType: 'folder' | 'pageBranch'): Promise<void> {
    if (!this.currentRootItemId) {
      throw Error('Parent Id cannot be null.');
    }

    const moveItemResult = await firstValueFrom(
      this.moveItemDialogService.show({
        parentId: this.currentRootItemId,
        itemId: item.itemId,
        itemName: item.name,
        rootId: !!this.breadcrumbItems[0].itemId ? this.breadcrumbItems[0].itemId : this.currentRootItemId,
        templateId: PAGE_BRANCHES_FOLDER_TEMPLATE_ID,
        language: this.contextService.language,
      }),
    ).catch(() => undefined);

    if (moveItemResult?.movedItem && moveItemResult.movedItem?.parentId !== this.currentRootItemId) {
      this.removeItemFromUI(item.itemId, itemType);
    }

    if (moveItemResult?.addedFolders) {
      moveItemResult.addedFolders.forEach((folder) => {
        this.pageBranchesFolders.unshift({ ...folder, siteName: this.contextService.siteName });
      });
    }
  }

  async createPageBranch(): Promise<void> {
    if (!this.currentRootItemId) {
      throw Error('Parent Id cannot be null.');
    }

    const existingBranchesNames = this.pageBranchItems.map((i) => i.name);
    const branch = await firstValueFrom(
      this.createPageBranchDialogService.show({
        existingNames: existingBranchesNames,
        language: this.contextService.language,
        parentId: this.currentRootItemId,
      }),
    ).catch(() => undefined);

    if (branch?.rootPageItem?.itemId) {
      this.router.navigate(['/editpagebranch'], {
        queryParams: {
          sc_itemid: branch.rootPageItem.itemId,
          sc_version: branch.rootPageItem.version,
          branch_name: branch.branchItem?.name,
        },
        queryParamsHandling: 'merge',
      });
      this.pageDesignRouteService.removeDesignParams$.next(false);
    }
  }

  createTempFolderItem() {
    const newFolderItem: Item = {
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
    this.pageBranchesFolders.unshift({ ...newFolderItem, siteName: this.contextService.siteName });
    this.cardBeingEdited = newFolderItem.itemId;
  }

  editPageBranch(pageBranchItem: ItemWithSite) {
    const rootPage = this.getBranchRootPage(pageBranchItem);
    if (!rootPage) {
      return;
    }
    this.router.navigate(['/editpagebranch'], {
      queryParams: {
        sc_itemid: rootPage.itemId,
        sc_version: rootPage.version,
        branch_name: pageBranchItem.name,
        siteName: pageBranchItem.siteName,
      },
      queryParamsHandling: 'merge',
    });
    this.pageDesignRouteService.removeDesignParams$.next(false);
  }

  getBranchRootPage(pageBranchItem: ItemWithSite): Item | undefined {
    return pageBranchItem.children?.[0];
  }

  async renamePageBranch(item: Item): Promise<void> {
    const renamedItem = await firstValueFrom(
      this.renameItemDialogService.show({
        itemId: item.itemId,
        itemName: item.displayName,
        existingNames: this.pageBranchItems.map((i) => i.displayName),
      }),
    ).catch(() => undefined);

    if (renamedItem) {
      const index = this.pageBranchItems.findIndex((i) => i.itemId === renamedItem.itemId);
      const branch = this.pageBranchItems[index];
      branch.name = renamedItem.name;
    }
  }

  async promptDeleteItem(itemId: string, itemType: 'folder' | 'pageBranch') {
    const { component: dialog } = WarningDialogComponent.show(this.dialogService);

    dialog.title = await firstValueFrom(this.translateService.get('COMMON.DELETE'));
    dialog.text = await firstValueFrom(
      itemType === 'folder'
        ? this.translateService.get('PAGE_DESIGNS.WORKSPACE.DELETE_FOLDER_DIALOG_TEXT')
        : this.translateService.get('PAGE_DESIGNS.WORKSPACE.DELETE_PAGE_BRANCH_DIALOG_TEXT'),
    );
    dialog.declineText = await firstValueFrom(this.translateService.get('COMMON.CANCEL'));
    dialog.confirmText = await firstValueFrom(this.translateService.get('COMMON.DELETE'));

    const result = await firstValueFrom(dialog.dialogResultEvent);
    if (result.confirmed) {
      await this.deleteItem(itemId, itemType);
    }
  }

  async onSubmitContentEdit(newValue: string, itemId: string) {
    this.cardBeingEdited = undefined;
    if (itemId === TEMP_NEW_FOLDER_ID) {
      await this.createFolder(newValue);
    } else {
      await this.renameFolder(itemId, newValue);
    }
  }

  private watchContextChangesForSiteTabs() {
    combineLatest([this.contextService.siteName$, this.contextService.language$])
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(() => {
        this.selectItem(undefined);
        this.pageDesignRouteService.removeDesignParams$.next(true);
      });
  }

  private async deleteItem(itemId: string, itemType: 'folder' | 'pageBranch') {
    this.isLoading = true;

    const result = await firstValueFrom(this.pageTemplatesService.deleteItem(itemId, false));

    this.isLoading = false;

    if (result.successful) {
      this.removeItemFromUI(itemId, itemType);
    } else {
      this.pageTemplatesService.showErrorMessage(result.errorMessage);
    }
  }

  private async removeItemFromUI(itemId: string, itemType: 'folder' | 'pageBranch') {
    if (itemType === 'folder') {
      const itemIndex = this.pageBranchesFolders.findIndex((folder) => folder.itemId === itemId);
      this.pageBranchesFolders.splice(itemIndex, 1);
    } else {
      const itemIndex = this.pageBranchItems.findIndex((item) => item.itemId === itemId);
      this.pageBranchItems.splice(itemIndex, 1);
    }
  }

  private async createFolder(name: string) {
    if (!this.currentRootItemId) {
      throw Error('Parent Id cannot be null.');
    }

    this.isLoading = true;

    const isValid = await this.pageTemplatesService.validateName(
      name,
      this.pageBranchesFolders.map((folder) => folder.displayName),
    );

    if (isValid) {
      const result = await firstValueFrom(
        this.pageTemplatesService.createItem(
          name,
          this.currentRootItemId,
          PAGE_BRANCHES_FOLDER_TEMPLATE_ID,
          this.contextService.language,
        ),
      );

      this.deleteTempFolderItem();

      this.isLoading = false;
      if (result.successful && result.item) {
        this.pageBranchesFolders.unshift({ ...result.item, siteName: this.contextService.siteName });
      } else {
        this.pageTemplatesService.showErrorMessage(result.errorMessage);
      }
    } else {
      this.deleteTempFolderItem();
      this.isLoading = false;
    }
  }

  private async renameFolder(itemId: string, newName: string) {
    this.isLoading = true;

    const isValid = await this.pageTemplatesService.validateName(
      newName,
      this.pageBranchesFolders.map((folder) => folder.displayName),
    );

    if (isValid) {
      const result = await firstValueFrom(this.pageTemplatesService.renameItem(itemId, newName));

      this.isLoading = false;

      if (result.successful && result.item) {
        const itemIndex = this.pageBranchesFolders.findIndex((folder) => folder.itemId === itemId);
        this.pageBranchesFolders[itemIndex] = { ...result.item, siteName: this.contextService.siteName };
      } else {
        this.pageTemplatesService.showErrorMessage(result.errorMessage);
      }
    } else {
      const itemIndex = this.pageBranchesFolders.findIndex((folder) => folder.itemId === itemId);
      const item = this.pageBranchesFolders.find((folder) => folder.itemId === itemId);
      if (item) {
        this.pageBranchesFolders[itemIndex] = { ...item, siteName: this.contextService.siteName };
      }
      this.isLoading = false;
    }
  }

  private deleteTempFolderItem() {
    const tempNewFolderItemIndex = this.pageBranchesFolders.findIndex((folder) => folder.itemId === TEMP_NEW_FOLDER_ID);
    if (tempNewFolderItemIndex !== -1) {
      this.pageBranchesFolders.splice(tempNewFolderItemIndex, 1);
    }
  }

  private handleFeatureNotAvailable() {
    this.pageBranchesNavigationService.clearSubscriptions();
    this.sortAndPopulateItems([]);
  }

  private sortAndPopulateItems(items: ItemWithSite[] | undefined) {
    const sortedItems = [...(items ?? [])].sort((a, b) => a.name.localeCompare(b.name));

    this.pageBranchItems = sortedItems.filter(
      (item) =>
        isSameGuid(item.template?.templateId, PAGE_BRANCH_TEMPLATE_ID) ||
        item.template?.baseTemplates?.nodes.some((template) =>
          isSameGuid(template.templateId, PAGE_BRANCH_TEMPLATE_ID),
        ),
    );

    this.pageBranchesFolders = sortedItems.filter((item) => !this.pageBranchItems.includes(item));
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
