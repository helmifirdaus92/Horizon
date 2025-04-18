/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export const FOLDER_ITEM_ID = 'a87a00b1-e6db-45ab-8b54-636fec3b5523';
export const PARTIAL_DESIGN_FOLDER_TEMPLATE_ID = 'b4544407e6e14050998383d48c2dd8f8';
export const PARTIAL_DESIGN_TEMPLATE_ID = '642bdd94eed54b51b27cc9543fab663f';
export const PAGE_DESIGN_FOLDER_TEMPLATE_ID = 'a15decde0e4946e69d19fc41c292a0e9';
export const PAGE_DESIGN_TEMPLATE_ID = '0407560f387b4a90adbe398b077890e9';
export const PAGE_BRANCHES_FOLDER_TEMPLATE_ID = 'fbc802e54b9e480f93da3f2a80cae5cb';
export const PAGE_BRANCH_TEMPLATE_ID = '35e75c7249854e0988c30eac6cd1e64f';

export const TEMPLATE_ROOT_ITEM_ID = '3C1715FE-6A13-4FCF-845F-DE308BA9741D';

export type SiteType = 'current' | 'shared';

export interface TemplateNodeResponse {
  nodes: Array<{
    templateId: string;
  }>;
}

export interface TemplateResponse {
  templateId: string;
  name: string;
  baseTemplates: TemplateNodeResponse;
  access?: AccessPermissions;
}

export interface InsertOption {
  templateId: string;
  name?: string;
  baseTemplates?: TemplateNodeResponse;
}

export interface ItemResponse {
  path: string;
  displayName: string;
  itemId: string;
  version: number;
  name: string;
  hasChildren: boolean;
  thumbnailUrl: string;
  hasPresentation: boolean;
  access: AccessPermissions;
  parent?: {
    itemId: string;
  };
  createdAt: {
    value: string;
  };
  updatedAt?: {
    value: string;
  };
  template: TemplateResponse;
  children?: {
    nodes: ItemResponse[];
  };
  insertOptions?: InsertOption[];
  ancestors?: Ancestor[];
  pageDesignId?: {
    value: string;
  };
  standardValueItemId?: {
    value: string;
  };
}

export interface AccessPermissions {
  canCreate: boolean;
  canRename: boolean;
  canDelete: boolean;
  canWrite: boolean;
  canDuplicate: boolean;
  canMoveTo?: boolean;
}

export interface Item {
  path: string;
  displayName: string;
  itemId: string;
  parentId?: string;
  version: number;
  name: string;
  hasChildren: boolean;
  thumbnailUrl: string;
  hasPresentation: boolean;
  isFolder: boolean;
  createdDate?: string;
  updatedDate?: string;
  children?: Item[];
  insertOptions?: InsertOption[];
  ancestors?: Ancestor[];
  access: AccessPermissions;
  pageDesignId?: string;
  template?: ItemTemplate;
  standardValueItemId?: string;
}

export interface ItemWithSiteResponse {
  item: ItemResponse;
  siteName: string;
}
export interface Ancestor {
  displayName: string;
  itemId: string;
}
export type AncestorWithSite = Ancestor & { siteName: string };

export interface FolderContext {
  siteName: string;
  language: string;
  folderIdParam?: string;
  siteType: SiteType;
}
export interface ItemsWithBreadcrumb {
  items: ItemWithSite[];
  breadcrumbs: AncestorWithSite[];
}

export type ItemWithSite = Item & { siteName: string };

export interface PageDesignRootResponse {
  root: ItemResponse;
  siteName: string;
}

export interface PartialDesignRootResponse {
  root: ItemResponse;
  siteName: string;
}

export interface PageBranchesRootResponse {
  root: ItemResponse;
  siteName: string;
}

export interface DesignRoots {
  root: ItemResponse;
  siteName: string;
}

export interface PageDesignResponse {
  pageDesign: ItemResponse;
  siteName: string;
}

export interface PartialDesignResponse {
  partialDesign: ItemResponse;
  siteName: string;
}

export interface StandardValuesItem {
  itemId: string;
  insertOptions?: InsertOption[];
  access?: AccessPermissions;
}

export interface ItemTemplate {
  templateId: string;
  name: string;
  baseTemplates?: TemplateNodeResponse;
  standardValuesItem?: StandardValuesItem;
  access?: AccessPermissions;
}

export interface TenantPageTemplateResponse {
  template: ItemTemplate;
  pageDesign: ItemResponse;
}

export interface TenantPageTemplate {
  template: ItemTemplate;
  pageDesign: Item | null;
}

export interface SearchResult {
  totalCount: number;
  results: Array<{ innerItem: ItemResponse }>;
}

export interface PageDesignsMappingInput {
  templateId: string;
  pageDesignId?: string;
}

export interface ConfigurePageDesignsInput {
  siteName: string;
  mapping: PageDesignsMappingInput[];
}

export interface ConfigurePageDesignsOutput {
  success: boolean;
  errorMessage?: any | null;
}

export interface PageDesignPartialsOutput {
  field: {
    value: string;
  };
}

export interface AssignPageDesignPartialsInput {
  pageDesignId: string;
  partialDesignIds: string[];
}

export interface AssignPageDesignPartialsOutput {
  success: boolean;
  errorMessage?: string | null;
}

export interface AssignPageDesignInput {
  itemId: string;
  pageDesignId: string | null;
}

export interface AssignPageDesignOutput {
  success: boolean;
  errorMessage?: string | null;
}

export interface CreateItemInput {
  name: string;
  parent: string;
  templateId: string;
  language: string;
}

export interface CopyItemInput {
  copyItemName: string;
  itemId: string;
  targetParentId?: string;
}

export interface MoveItemInput {
  itemId: string;
  targetParentId: string;
}

export interface RenameItemInput {
  itemId: string;
  newName: string;
}

export interface DeleteItemInput {
  itemId: string;
  permanently: boolean;
}

export interface InsertOptionsUpdateInput {
  itemId: string;
  insertOptions: string | null;
}

export interface ItemOperationOutputResponse {
  successful: boolean;
  errorMessage: string | null;
  item: null | ItemResponse;
}

export interface ItemOperationOutput {
  successful: boolean;
  errorMessage: string | null;
  item: null | Item;
}

export interface ItemBulkOperationOutputResponse {
  successful: boolean;
  errorMessage: string | null;
  items: ItemResponse[] | null;
}

export interface ItemBulkOperationOutput {
  successful: boolean;
  errorMessage: string | null;
  items: Item[] | null;
}

export interface ItemTemplateBulkOperationOutput {
  successful: boolean;
  errorMessage: string | null;
  templates: ItemTemplate[] | null;
}
