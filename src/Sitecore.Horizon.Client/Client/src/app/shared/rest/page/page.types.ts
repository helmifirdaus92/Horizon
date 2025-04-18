/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MoveNodePosition } from 'app/pages/content-tree-container/content-tree-container.service';
import { WorkflowErrorCode } from 'app/shared/graphql/item.interface';

export interface DeletePageRequest {
  permanently: boolean;
}

export interface ErrorResponse {
  type: string;
  title: string;
  detail?: string;
  status: number;
  traceId: string;
}

export interface SuccessResponse {
  success: boolean;
}

export interface CreatePageRequest {
  parentId: string;
  pageName: string;
  templateId: string;
  language: string;
}

export interface DuplicatePageRequest {
  newName: string;
  site: string;
  language: string;
}

export interface UpdatePageRequest {
  versionNumber?: number;
  language?: string;
  fields: PageField[];
}

export interface PageField {
  name: string;
  value: string;
}

export interface MovePageRequest {
  site: string;
  targetId: string;
  position: MoveNodePosition;
}

export interface RenamePageRequest {
  newName: string;
}

export interface PublishPageRequest {
  languages: string[];
  publishSubitems: boolean;
  publishRelatedItems: boolean;
  PublishMode: PublishingMode;
}

export interface PublishPageStatus {
  isDone: boolean;
  isFailed: boolean;
  processed: number;
  state: PublishingJobState;
}

export interface PageOperationResponse {
  pageId: string;
  name: string;
  path: string;
  displayName: string;
}

export interface Publishing {
  isPublishable: boolean;
  hasPublishableVersion: boolean;
  isAvailableToPublish: boolean;
  validFromDate: string;
  validToDate: string;
}

export interface Permissions {
  canAdmin: boolean;
  canWrite: boolean;
  canCreate: boolean;
  canDelete: boolean;
  canRename: boolean;
  canRead: boolean;
  canPublish: boolean;
}

export interface Locking {
  canUnlock: boolean;
  isLocked: boolean;
  lockedBy: string;
  lockedByCurrentUser: boolean;
}

export interface WorkflowWarning {
  id: string;
  errorCode: WorkflowErrorCode;
  message: string;
}

export interface WorkflowCommand {
  id: string;
  displayName: string;
  icon: string;
}

export interface PageWorkflow {
  id: string;
  displayName: string;
  finalState: boolean;
  canEdit: boolean;
  warnings: WorkflowWarning[];
  icon: string;
  commands: WorkflowCommand[];
}

export interface PageTemplate {
  id: string;
  name: string;
  displayName: string;
  path: string;
  baseTemplateIds?: string[];
}

export interface Page {
  url: string;
  icon: string;
  versionName: string;
  revision: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  template: PageTemplate;
  workflow?: PageWorkflow;
  publishing: Publishing;
  path: string;
  route: string;
  finalLayout: string;
  sharedLayout: string;
  layoutEditingKind: LayoutKind;
  id: string;
  name: string;
  displayName: string;
  language: string;
  version: number;
  templateId: string;
  parentId: string;
  hasPresentation: boolean;
  hasChildren: boolean;
  permissions: Permissions;
  locking: Locking;
  versions?: Page[];
  children?: Page[];
  hasVersions: boolean;
  insertOptions: PageInsertOption[];
}

export type LayoutKind = 'FINAL' | 'SHARED';
export type PublishingMode = 'FULL' | 'SMART';
export type PublishingJobState =
  | 'INITIALIZING'
  | 'QUEUED'
  | 'RUNNING'
  | 'ABORTREQUESTED'
  | 'ABORTED'
  | 'FINISHED'
  | 'UNKNOWN';

export interface PageHierarchy {
  page: Page;
  children: Page[];
  ancestors: Page[];
  siblings: Page[];
}

export interface PageInsertOption {
  displayName: string;
  id: string;
}

export interface SavePageRequest {
  language: string;
  site: string;
  version?: number;
  revision?: string;
  fields?: SaveFieldInput[];
  layout?: Layout;
  originalLayout?: Layout;
}

export interface SaveFieldInput {
  id: string;
  value: string;
  originalValue?: string;
  containsStandardValue: boolean;
}

export interface SaveFieldResponse {
  id: string;
  value: string;
  originalValue?: string;
  containsStandardValue: boolean;
}

export interface Layout {
  kind: LayoutKind;
  body: string;
}

export interface SavePageResponse {
  language: string;
  site: string;
  pageVersion: number;
  revision: string;
  fields: SaveFieldResponse[];
  layout?: Layout;
  originalLayout?: Layout;
  errors: ErrorModel[];
  savedPage: SavedPage;
  validationErrors: ValidationError[];
  warnings: string[];
  newCreatedVersion: NewCreatedVersion;
}

export interface ErrorModel {
  errorCode: string;
  message: string;
  pageId: string;
}

export interface SavedPage {
  fields: SaveFieldInput[];
  id: string;
  language: string;
  revision: string;
  version: number;
}
export interface ValidationError {
  aborted: string;
  errorLevel: string;
  errorMessage: string;
  fieldId: string;
}

export interface NewCreatedVersion {
  pageId: string;
  displayName: string;
  versionNumber: number;
}

export interface PageValidationRecord {
  validatorResult: string;
  validatorTitle: string;
  validatorDescription: string;
  validatorText: string;
  errors: string[];
}

export interface FieldValidationResult {
  fieldName: string;
  fieldItemId: string;
  records: PageValidationRecord[];
}

export interface PageWorkflowValidationResult {
  pageId: string;
  pageName: string;
  pageRulesResult: PageValidationRecord[];
  fieldRulesResult: FieldValidationResult[];
}

export interface ValidationResult {
  pageValidationResult: PageWorkflowValidationResult;
  defaultDatasourceItemsResult: PageWorkflowValidationResult[];
  personalizedDatasourceItemsResult: PageWorkflowValidationResult[];
}

export interface CommandResult {
  completed: boolean;
  error: string;
}

export interface ExecuteWorkflowCommandResult {
  completed: boolean;
  error: string;
  datasourcesCommandResult: CommandResult[];
  pageWorkflowValidationResult: ValidationResult;
}

export interface ExecuteWorkflowCommandRequest {
  pageVersion?: number;
  site: string;
  language: string;
  commandId: string;
  comments?: string;
}

export interface DeletePageVersionRequest {
  language: string;
  versionNumber: number;
}

export interface AddPageVersionRequest {
  language: string;
  baseVersion?: number;
  versionName?: string;
}

export interface SetPublishingSettingRequest {
  versionNumber?: number;
  validFromDate: string;
  validToDate?: string;
  isAvailableToPublish: boolean;
  language: string;
  site: string;
}
