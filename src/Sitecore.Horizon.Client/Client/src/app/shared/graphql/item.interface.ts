/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { FOLDER_ITEM_ID, ItemResponse } from 'app/page-design/page-templates.types';
import { isSameGuid } from '../utils/utils';

export function toHorizonItem(authoringApiItem: ItemResponse): Item {
  // extend on demand.
  const templateId = authoringApiItem?.template?.templateId;
  const baseTemplateIds: string[] = authoringApiItem.template?.baseTemplates?.nodes?.map((node) => node.templateId);
  const isFolder =
    isSameGuid(templateId, FOLDER_ITEM_ID) || baseTemplateIds?.some((template) => isSameGuid(template, FOLDER_ITEM_ID));

  const item = {
    id: authoringApiItem.itemId,
    displayName: authoringApiItem.displayName,
    hasChildren: authoringApiItem.hasChildren,
    isFolder,
    parent: authoringApiItem.parent?.itemId,
    permissions: {
      canCreate: authoringApiItem.access?.canCreate,
      canDelete: authoringApiItem.access?.canDelete,
      canRename: authoringApiItem.access?.canRename,
      canWrite: authoringApiItem.access?.canWrite,
      canPublish: false,
    },
    locking: {
      isLocked: false,
      lockedByCurrentUser: false,
    },
  } as Partial<Item> as Item;
  return item;
}

export interface Item {
  name: string;
  id: string;
  version: number;
  versionName: string;
  versions: Item[];
  hasVersions: boolean;
  revision: string;
  updatedBy: string;
  updatedDate: string;
  displayName: string;
  icon: string;
  path: string;
  hasChildren: boolean;
  children?: Item[];
  language: string;
  template?: ItemTemplate;
  parent?: Item;
  fields: ItemField[];
  isFolder: boolean;
  ancestors: Item[];
  workflow: ItemWorkflow | null;
  isLatestPublishableVersion: boolean;
  creationDate: string;
  createdBy: string;
  insertOptions: ItemInsertOption[];
  permissions: ItemPermissions;
  locking: ItemLocking;
  publishing: ItemPublishing;
  presentationDetails: string;
  layoutEditingKind: LayoutKind;
  route: string;
}

export interface ItemField {
  name: string;
  id: string;
  editable: string;
  rendered: string;
  value: string;
  definition: ItemTemplate;
  canWrite: boolean;
  containsStandardValue: boolean;
  containsFallbackValue: boolean;
  containsInheritedValue: boolean;
}

export interface ItemInsertOption {
  displayName: string;
  id: string;
}

export interface ItemPermissions {
  readonly canWrite: boolean;
  readonly canDelete: boolean;
  readonly canRename: boolean;
  readonly canCreate: boolean;
  readonly canPublish: boolean;
  readonly canWriteLanguage?: boolean;
}

export interface ItemLocking {
  readonly lockedByCurrentUser: boolean;
  readonly isLocked: boolean;
}

export interface ItemPublishing {
  hasPublishableVersion: boolean;
  isPublishable: boolean;
  validFromDate: string;
  validToDate: string;
  isAvailableToPublish: boolean;
}

export interface ItemTemplate {
  name: string;
  id: string;
  displayName: string;
  path: string;
  field?: TemplateField;
  baseTemplateIds?: string[];
  isBranchTemplate?: boolean;
}

export interface TemplateField {
  id: string;
  source?: string;
}

export interface ItemWorkflow {
  id: string;
  displayName: string;
  commands: WorkflowCommand[];
  finalState: boolean;
  canEdit: boolean;
  warnings: WorkflowWarning[];
}

export interface WorkflowCommand {
  id: string;
  displayName: string;
  suppressComment?: boolean;
}

export interface WorkflowWarning {
  errorCode: WorkflowErrorCode;
}

export type WorkflowErrorCode =
  /**
   * Returned when trying to modify item while it's locked by another user.
   */
  | 'ItemLockedByAnotherUser'

  /**
   * Returned when trying to modify item while some of it's datasources locked by another user.
   */
  | 'SomeDatasourcesAreLocked'

  /**
   * Returned when user does not have write access to the item.
   */
  | 'NoAccessRightItemWrite'

  /**
   * Returned when user does not have write access to specific workflow state.
   */
  | 'NoAccessRightWorkflowWrite'

  /**
   * Returned when user does not have privilege to execute workflow commands on a specific workflow state.
   */
  | 'NoAccessRightWorkflowCommandExecute';

export type LayoutKind = 'FINAL' | 'SHARED';
