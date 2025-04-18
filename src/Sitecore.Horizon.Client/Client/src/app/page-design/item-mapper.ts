/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { FOLDER_ITEM_ID, Item, ItemResponse } from './page-templates.types';

export class ItemMapper {
  public static mapItemResponseToItem(itemResponse: ItemResponse): Item {
    const baseTemplateIds = itemResponse.template?.baseTemplates?.nodes?.map((node) => node.templateId);
    return {
      path: itemResponse.path,
      displayName: itemResponse.displayName,
      itemId: itemResponse.itemId,
      parentId: itemResponse.parent?.itemId,
      version: itemResponse.version,
      name: itemResponse.name,
      hasChildren: itemResponse.hasChildren,
      thumbnailUrl: itemResponse.thumbnailUrl,
      hasPresentation: itemResponse.hasPresentation,
      createdDate: itemResponse?.createdAt?.value,
      updatedDate: itemResponse?.updatedAt?.value?.split(':')[0],
      isFolder: baseTemplateIds?.some((item) => item.toLowerCase() === FOLDER_ITEM_ID),
      children: itemResponse?.children?.nodes?.map(ItemMapper.mapItemResponseToItem),
      insertOptions: itemResponse?.insertOptions,
      ancestors: itemResponse?.ancestors,
      access: itemResponse?.access,
      pageDesignId: itemResponse?.pageDesignId?.value.replace(/[{}]/g, '').toLowerCase(),
      template: itemResponse.template,
      standardValueItemId: itemResponse.standardValueItemId?.value,
    };
  }
}
