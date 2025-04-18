/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import {
  AssignPageDesignOutput,
  AssignPageDesignPartialsOutput,
  ConfigurePageDesignsInput,
  ConfigurePageDesignsOutput,
  DesignRoots,
  InsertOption,
  InsertOptionsUpdateInput,
  Item,
  ItemBulkOperationOutput,
  ItemOperationOutput,
  ItemOperationOutputResponse,
  ItemResponse,
  ItemTemplateBulkOperationOutput,
  ItemWithSite,
  PageBranchesRootResponse,
  PageDesignResponse,
  PageDesignRootResponse,
  PartialDesignResponse,
  PartialDesignRootResponse,
  StandardValuesItem,
  TenantPageTemplate,
  TenantPageTemplateResponse,
} from 'app/page-design/page-templates.types';

import { TranslateService } from '@ngx-translate/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { shareReplayLatest } from 'app/shared/utils/rxjs/rxjs-custom';
import { isSameGuid } from 'app/shared/utils/utils';
import { XmCloudFeatureCheckerService } from 'app/shared/xm-cloud/xm-cloud-feature-checker.service';
import { BehaviorSubject, defer, distinctUntilChanged, firstValueFrom, map, Observable, switchMap } from 'rxjs';
import { TimedNotificationScope } from 'sdk';
import { ItemMapper } from './item-mapper';
import { PageTemplatesDalService } from './page-templates.dal.service';

@Injectable({
  providedIn: 'root',
})
export class PageTemplatesService {
  private _selectedPartialDesignItems$ = new BehaviorSubject<Item[]>([]);
  private _contextPageDesign$ = new BehaviorSubject<{ id: string; version: number | undefined } | undefined>(undefined);

  constructor(
    private readonly pageTemplatesDalService: PageTemplatesDalService,
    private readonly contextService: ContextService,
    private readonly siteService: SiteService,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly translateService: TranslateService,
    private readonly xmCloudFeatureCheckerService: XmCloudFeatureCheckerService,
  ) {}

  getTenantPageTemplates(siteName: string): Observable<TenantPageTemplate[]> {
    return defer(
      async () =>
        await Promise.all([
          this.xmCloudFeatureCheckerService.isTemplateAccessFieldAvailable(),
          this.xmCloudFeatureCheckerService.isTemplateStandardValuesAvailable(),
        ]),
    ).pipe(
      switchMap(([isTemplateAccessFieldAvailable, isTemplateStandardValuesAvailable]) => {
        return this.pageTemplatesDalService
          .getTenantPageTemplates(siteName, isTemplateAccessFieldAvailable, isTemplateStandardValuesAvailable)
          .pipe(
            map((tenantTemplateList: TenantPageTemplateResponse[]) =>
              tenantTemplateList.map((tenantTemplate: TenantPageTemplateResponse) => ({
                template: tenantTemplate.template,
                pageDesign: tenantTemplate.pageDesign
                  ? ItemMapper.mapItemResponseToItem(tenantTemplate.pageDesign)
                  : tenantTemplate.pageDesign,
              })),
            ),
          );
      }),
    );
  }

  getPageDesignsRoots(siteName: string, language: string): Observable<ItemWithSite[]> {
    return this.pageTemplatesDalService.getPageDesignsRoots(siteName, language).pipe(
      map((pageDesignRoots: PageDesignRootResponse[]) =>
        pageDesignRoots.map((partialDesignRoot) => ({
          ...ItemMapper.mapItemResponseToItem(partialDesignRoot.root),
          siteName: partialDesignRoot.siteName,
        })),
      ),
    );
  }

  getPartialDesignsRoots(siteName: string, language: string): Observable<ItemWithSite[]> {
    return this.pageTemplatesDalService.getPartialDesignsRoots(siteName, language).pipe(
      map((partialDesignRoots: PartialDesignRootResponse[]) =>
        partialDesignRoots.map((partialDesignRoot) => ({
          ...ItemMapper.mapItemResponseToItem(partialDesignRoot.root as ItemResponse),
          siteName: partialDesignRoot.siteName,
        })),
      ),
    );
  }

  getPageBranchesRoots(siteName: string, language: string): Observable<ItemWithSite[]> {
    return this.pageTemplatesDalService.getPageBranchesRoots(siteName, language).pipe(
      map((pageBranchesRoots: PageBranchesRootResponse[]) =>
        pageBranchesRoots.map((pageBranchesRoot) => ({
          ...ItemMapper.mapItemResponseToItem(pageBranchesRoot.root as ItemResponse),
          siteName: pageBranchesRoot.siteName,
        })),
      ),
    );
  }

  getPartialDesigsRootWithNoChildren(siteName: string): Observable<ItemWithSite[]> {
    return this.pageTemplatesDalService.getPartialDesignsRootsWithoutChildren(siteName).pipe(
      map((partialDesignRoots: DesignRoots[]) =>
        partialDesignRoots.map((partialDesignRoot) => ({
          ...ItemMapper.mapItemResponseToItem(partialDesignRoot.root),
          siteName: partialDesignRoot.siteName,
        })),
      ),
    );
  }

  getPageDesigsRootWithNoChildren(siteName: string): Observable<ItemWithSite[]> {
    return this.pageTemplatesDalService.getPageDesignsRootsWithoutChildren(siteName).pipe(
      map((pageDesignRoots: DesignRoots[]) =>
        pageDesignRoots.map((pageDesignRoot) => ({
          ...ItemMapper.mapItemResponseToItem(pageDesignRoot.root),
          siteName: pageDesignRoot.siteName,
        })),
      ),
    );
  }

  getPageBranchesRootsWithNoChildren(siteName: string): Observable<ItemWithSite[]> {
    return this.pageTemplatesDalService.getPageBranchesRootsWithoutChildren(siteName).pipe(
      map((partialDesignRoots: DesignRoots[]) =>
        partialDesignRoots.map((partialDesignRoot) => ({
          ...ItemMapper.mapItemResponseToItem(partialDesignRoot.root),
          siteName: partialDesignRoot.siteName,
        })),
      ),
    );
  }

  getPageDesignsList(siteName: string): Observable<ItemWithSite[]> {
    return this.pageTemplatesDalService.getPageDesignFlatList(siteName).pipe(
      map((pageDesignList: PageDesignResponse[]) =>
        pageDesignList.map((pageDesign) => ({
          ...ItemMapper.mapItemResponseToItem(pageDesign.pageDesign),
          siteName: pageDesign.siteName,
        })),
      ),
    );
  }

  getPartialDesignsList(siteName: string): Observable<Item[]> {
    return this.pageTemplatesDalService
      .getPartialDesignFlatList(siteName)
      .pipe(
        map((partialDesignList: PartialDesignResponse[]) =>
          partialDesignList.map((partialDesign) => ItemMapper.mapItemResponseToItem(partialDesign.partialDesign)),
        ),
      );
  }

  getPageDesignPartials(pageDesignId: string): Observable<string[]> {
    return this.pageTemplatesDalService.getPageDesignPartials(pageDesignId);
  }

  getItemChildrenWithAncestors(
    itemId: string,
    language: string,
    includeTemplateIDs?: string[],
    includeSubChildren = false,
  ): Observable<Item> {
    return this.pageTemplatesDalService
      .getItemChildrenWithAncestors(itemId, language, includeTemplateIDs, includeSubChildren)
      .pipe(map((itemResponse: ItemResponse) => ItemMapper.mapItemResponseToItem(itemResponse)));
  }

  getTemplateUsageCount(templateId: string): Observable<number> {
    return this.pageTemplatesDalService.getTemplatesUsageCount(templateId.replace(/-/g, ''));
  }

  getItemDetails(itemId: string, language: string): Observable<Item> {
    return this.pageTemplatesDalService
      .getItemDetails(itemId, language)
      .pipe(map((itemResponse: ItemResponse) => ItemMapper.mapItemResponseToItem(itemResponse)));
  }

  getMoveToPermissions(itemId: string, language: string, destinationId: string): Observable<boolean> {
    return this.pageTemplatesDalService.getMoveToPermissions(itemId, language, destinationId);
  }

  createTemplatesStandardValuesItems(templateIds: string[]): Observable<ItemTemplateBulkOperationOutput> {
    return this.pageTemplatesDalService.createTemplatesStandardValuesItems(templateIds);
  }

  updateStandardValuesInsertOptions(standardValuesItems: StandardValuesItem[]): Observable<ItemBulkOperationOutput> {
    const insertOptionsUpdates: InsertOptionsUpdateInput[] = standardValuesItems.map((item) => {
      return {
        itemId: item.itemId,
        insertOptions: item.insertOptions?.map((option) => '{' + option.templateId + '}').join('|') || '',
      };
    });

    return this.pageTemplatesDalService.updateStandardValuesInsertOptions(insertOptionsUpdates).pipe(
      map((result) => ({
        successful: result.successful,
        errorMessage: result.errorMessage,
        items: result.items ? result.items.map((item) => ItemMapper.mapItemResponseToItem(item)) : null,
      })),
    );
  }

  createItem(name: string, parent: string, templateId: string, language: string): Observable<ItemOperationOutput> {
    return this.pageTemplatesDalService.createItem({ name, parent, templateId, language }).pipe(
      map((result: ItemOperationOutputResponse) => ({
        successful: result.successful,
        errorMessage: result.errorMessage,
        item: result.item ? ItemMapper.mapItemResponseToItem(result.item) : null,
      })),
    );
  }

  copyItem(
    copyItemName: string,
    itemId: string,
    targetParentId?: string,
    isTemplate = false,
  ): Observable<ItemOperationOutput> {
    return this.pageTemplatesDalService.copyItem({ copyItemName, itemId, targetParentId }, isTemplate).pipe(
      map((result: ItemOperationOutputResponse) => ({
        successful: result.successful,
        errorMessage: result.errorMessage,
        item: result.item ? ItemMapper.mapItemResponseToItem(result.item) : null,
      })),
    );
  }

  moveItem(itemId: string, targetParentId: string): Observable<ItemOperationOutput> {
    return this.pageTemplatesDalService.moveItem({ itemId, targetParentId }).pipe(
      map((result: ItemOperationOutputResponse) => ({
        successful: result.successful,
        errorMessage: result.errorMessage,
        item: result.item ? ItemMapper.mapItemResponseToItem(result.item) : null,
      })),
    );
  }

  renameItem(itemId: string, newName: string): Observable<ItemOperationOutput> {
    return this.pageTemplatesDalService.renameItem({ itemId, newName }).pipe(
      map((result: ItemOperationOutputResponse) => ({
        successful: result.successful,
        errorMessage: result.errorMessage,
        item: result.item ? ItemMapper.mapItemResponseToItem(result.item) : null,
      })),
    );
  }

  deleteItem(itemId: string, permanently: boolean): Observable<ItemOperationOutput> {
    return this.pageTemplatesDalService.deleteItem({ itemId, permanently }).pipe(
      map((result: ItemOperationOutputResponse) => ({
        successful: result.successful,
        errorMessage: result.errorMessage,
        item: null,
      })),
    );
  }

  configurePageDesign(configurePageDesignsInput: ConfigurePageDesignsInput): Observable<ConfigurePageDesignsOutput> {
    return this.pageTemplatesDalService.configurePageDesign(configurePageDesignsInput);
  }

  assignPageDesignPartials(
    pageDesignId: string,
    partialDesignIds: string[],
  ): Observable<AssignPageDesignPartialsOutput> {
    return this.pageTemplatesDalService.assignPageDesignPartials({
      pageDesignId,
      partialDesignIds,
    });
  }

  assignPageDesign(itemId: string, pageDesignId: string | null): Observable<AssignPageDesignOutput> {
    return this.pageTemplatesDalService.assignPageDesign({
      itemId,
      pageDesignId,
    });
  }

  updatePageInsertOptions(itemId: string, insertOptions: InsertOption[] | null): Observable<ItemOperationOutput> {
    return this.pageTemplatesDalService
      .updatePageInsertOptions({
        itemId,
        insertOptions:
          insertOptions === null ? null : insertOptions.map((option) => '{' + option.templateId + '}').join('|') || '',
      })
      .pipe(
        map((result: ItemOperationOutputResponse) => ({
          successful: result.successful,
          errorMessage: result.errorMessage,
          item: result.item ? ItemMapper.mapItemResponseToItem(result.item) : null,
        })),
      );
  }

  isPageTemplatesFeatureAvailable(): Observable<boolean> {
    return this.contextService.siteName$.pipe(
      switchMap(async () => !this.siteService.getContextSite().properties.isSxaSite),
      shareReplayLatest(),
    );
  }

  async validateName(
    newName: string,
    existingNames: string[],
    errorNotificationScope?: TimedNotificationScope,
  ): Promise<boolean> {
    const isForbidden = existingNames.includes(newName);
    const isEmpty = newName.trim().length === 0;
    const isValid = /^(?!^\s+$)[a-zA-Z0-9_ ]+$/.test(newName);

    if (!newName || isEmpty) {
      this.showErrorMessage(
        await firstValueFrom(this.translateService.get('VALIDATION.VALIDATE_NAME.EMPTY')),
        errorNotificationScope,
      );
      return false;
    } else if (isForbidden) {
      this.showErrorMessage(
        await firstValueFrom(this.translateService.get('VALIDATION.VALIDATE_NAME.ALREADY_USED')),
        errorNotificationScope,
      );
      return false;
    } else if (!isValid) {
      this.showErrorMessage(
        await firstValueFrom(this.translateService.get('VALIDATION.VALIDATE_NAME.NOT_ALLOWED_CHARACTER')),
        errorNotificationScope,
      );
      return false;
    }

    return true;
  }

  async showErrorMessage(errorMessage?: string | null, notificationScope?: TimedNotificationScope) {
    const errorInApiRequest = await firstValueFrom(
      this.translateService.get('PAGE_DESIGNS.WORKSPACE.BAD_REQUEST_ERROR_MESSAGE'),
    );

    const notification = new TimedNotification(
      'pageDesignRequestError',
      errorMessage || errorInApiRequest,
      'error',
      notificationScope,
    );
    this.timedNotificationsService.pushNotification(notification);
  }

  setSelectedPartialDesignItems(value: Item[]) {
    this._selectedPartialDesignItems$.next(value);
  }

  watchSelectedPartialDesignItems(): Observable<Item[]> {
    return this._selectedPartialDesignItems$.asObservable().pipe(distinctUntilChanged(), shareReplayLatest());
  }

  setContextPageDesign(value: { id: string; version: number | undefined } | undefined) {
    this._contextPageDesign$.next(value);
  }

  watchContextPageDesign(): Observable<{ id: string; version: number | undefined } | undefined> {
    return this._contextPageDesign$.asObservable().pipe(
      distinctUntilChanged(
        (previous, current) => isSameGuid(previous?.id, current?.id) && previous?.version === current?.version,
      ),
      shareReplayLatest(),
    );
  }
}
