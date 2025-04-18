/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  BaseContentTreeDalService,
  CreateItemErrorCode,
  DuplicateItemResult,
} from 'app/pages/content-tree/content-tree.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { TreeNode } from 'app/shared/item-tree/item-tree.component';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { isVirtualPageTemplate } from 'app/shared/utils/tree.utils';
import { mapErrorMessageToCode, normalizeGuid } from 'app/shared/utils/utils';
import { Observable, firstValueFrom } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';
import { LocalDataSourcePrefix, PageDatasource } from '../datasource-dialog/datasource-dialog.service';
import {
  CreateRawItemResult,
  DatasourceDalService,
  RawItem,
  RawItemAncestor,
  RenderingDefinition,
  ResolvedDataSource,
  ResolvedDatasourceAndSiblings,
} from './datasource.dal.service';

export const temporaryItemIdPrefix = 'DraftId-';

@Injectable({ providedIn: 'root' })
export class DatasourcePickerService {
  constructor(
    private readonly translateService: TranslateService,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly context: ContextService,
    private readonly datasourceService: DatasourceDalService,
    private readonly baseContentTreeDalService: BaseContentTreeDalService,
  ) {}

  createRawItem(parentId: string, itemName: string, templateId: string): Observable<CreateRawItemResult> {
    return this.datasourceService.createRawItem(
      this.context.language,
      this.context.siteName,
      parentId,
      itemName,
      templateId,
    );
  }

  duplicateItem(sourceItemId: string, newItemName: string): Observable<DuplicateItemResult> {
    return this.baseContentTreeDalService.duplicateItem(
      sourceItemId,
      newItemName,
      this.context.language,
      this.context.siteName,
    );
  }

  async duplicateDataSource(sourceDs: string): Promise<PageDatasource> {
    const dsWithSiblings = await firstValueFrom(
      this.datasourceService.resolveDataSourceAndSiblings(
        sourceDs,
        this.context.itemId,
        this.context.language,
        this.context.siteName,
      ),
    );

    const suffix = '_var';
    const hasSuffixWithFollowingDigits = new RegExp(`^(.+)${suffix}\\d+$`);
    const baseName = dsWithSiblings.name.match(hasSuffixWithFollowingDigits)?.[1] ?? dsWithSiblings.name;

    let incrementIndex = 1;
    let newName = '';
    let isNameUnique = false;
    while (!isNameUnique) {
      incrementIndex += 1;
      newName = `${baseName}${suffix}${incrementIndex}`;
      isNameUnique = !dsWithSiblings.siblings.some((s) => s.name === newName);
    }

    const result = await firstValueFrom(this.duplicateItem(dsWithSiblings.id, newName));

    return this.enrichWithLocalDatasourceInfo(sourceDs, dsWithSiblings, result);
  }

  getRenderingDefinition(renderingId: string): Observable<RenderingDefinition> {
    return this.datasourceService.getRenderingDefinition(
      renderingId,
      this.context.itemId,
      this.context.language,
      this.context.siteName,
    );
  }

  resolveDatasource(datasource: string): Observable<ResolvedDataSource> {
    return this.datasourceService.resolveDatasource(
      datasource,
      this.context.itemId,
      this.context.language,
      this.context.siteName,
    );
  }

  fetchFlatTree(path: string, templateIds: string[], roots?: string[]): Observable<RawItemAncestor[]> {
    return this.datasourceService.getAncestorsWithSiblings(
      path,
      this.context.language,
      this.context.siteName,
      templateIds,
      roots,
    );
  }

  mapTreeFromRawItemToTreeNode(item: RawItem, ignoreTemplate = false): TreeNode {
    const { id, path, displayName, isFolder, hasChildren, children, template } = item;

    return {
      id: normalizeGuid(id),
      path,
      displayName,
      isFolder,
      hasChildren,
      isSelectable: ignoreTemplate || template.isCompatible || isVirtualPageTemplate(template.id),
      isCompatible: ignoreTemplate || template.isCompatible || isVirtualPageTemplate(template.id),
      children: children
        ? children.map((child) => this.mapTreeFromRawItemToTreeNode(child, ignoreTemplate))
        : undefined,
      enableEdit: id.indexOf(temporaryItemIdPrefix) !== -1,
      template: { id: template.id, baseTemplateIds: item.template.baseTemplateIds },
    };
  }

  fetchChildren(path: string, compatibleTemplates$: Observable<string[]>): Observable<TreeNode[]> {
    return this.datasourceService
      .getChildren(path, this.context.language, this.context.siteName, compatibleTemplates$)
      .pipe(
        withLatestFrom(compatibleTemplates$),
        map(([rawData, templateIds]) =>
          rawData.map((item) => this.mapTreeFromRawItemToTreeNode(item, templateIds.length === 0)),
        ),
      );
  }

  fetchRawItemChildren(path: string): Observable<TreeNode[]> {
    return this.datasourceService
      .getChildren(path, this.context.language, this.context.siteName, [])
      .pipe(map((rawItems) => rawItems.map((item) => this.mapTreeFromRawItemToTreeNode(item))));
  }

  async generateDraftRawItem(templateId: string): Promise<RawItem> {
    return {
      id: temporaryItemIdPrefix + new Date().getTime().toString(),
      path: '/draft/path',
      displayName: await firstValueFrom(this.translateService.get('EDITOR.ITEMS_BROWSER.NEW_CONTENT_ITEM')),
      hasChildren: false,
      isFolder: false,
      template: {
        id: templateId,
        baseTemplateIds: [],
        isCompatible: true,
      },
    };
  }

  async showNotificationForCreationFailed(errorCode: CreateItemErrorCode, displayName: string): Promise<void> {
    let errorMessage;
    const normalizedErrorCode = mapErrorMessageToCode(errorCode);
    switch (normalizedErrorCode) {
      case 'DuplicateItemName':
        errorMessage = 'EDITOR.ITEM_ALREADY_DEFINED_ON_THIS_LEVEL';
        break;
      case 'InvalidItemName':
        errorMessage = 'EDITOR.CREATE_ITEM_NOT_VALID_NAME';
        break;
      default:
        errorMessage = 'EDITOR.CREATE_ITEM_FAILED';
    }

    const text = await firstValueFrom(this.translateService.get(errorMessage, { name: displayName }));
    this.timedNotificationsService.push('CreateItemFailed-' + displayName, text, 'error', 'dialog');
  }

  async handleDuplicateName(itemName: string) {
    const copyText = await firstValueFrom(this.translateService.get('EDITOR.COPY_OF'));

    return `${copyText} ${itemName}`;
  }

  private enrichWithLocalDatasourceInfo(
    sourceDs: string,
    dsWithSiblings: ResolvedDatasourceAndSiblings,
    duplicateItemResult: DuplicateItemResult,
  ): PageDatasource {
    const { id, path } = duplicateItemResult;
    if (!sourceDs.startsWith(LocalDataSourcePrefix)) {
      return {
        itemId: id,
        layoutRecord: id,
      };
    } else {
      const sourceDsRelativePath = sourceDs.substring(LocalDataSourcePrefix.length);
      const pagePath = dsWithSiblings.path.substring(0, dsWithSiblings.path.indexOf(sourceDsRelativePath));
      const newDsRelativePath = path.substring(pagePath.length);
      const localDataSource = LocalDataSourcePrefix + newDsRelativePath;
      return {
        itemId: id,
        layoutRecord: localDataSource,
      };
    }
  }
}
