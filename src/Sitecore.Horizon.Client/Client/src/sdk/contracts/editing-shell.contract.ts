/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingContract } from '@sitecore/page-composer-sdk';

export interface EditingShellDevice {
  id: string;
  name: string;
  width: number;
}

export interface TenantInfo {
  id: string;
  name: string;
  displayName: string;
  organizationId: string;
  url: string;
  projectId: string;
  projectName?: string;
}

export interface StaticConfiguration {
  readonly platformUrl: string;
}

export interface LocalizationInfo {
  readonly clientLanguage: string;
}

export interface RenderingInfo {
  readonly renderingInstanceId: string;
  readonly renderingDefinitionId: string;
  readonly inlineEditorProtocols: ReadonlyArray<string>;
  readonly displayName: string;
  readonly parentPlaceholderKey: string;
}

export interface SaveOptions {
  readonly skipHistory: boolean;
  readonly updateCanvas: boolean;
}

export interface EditingShellContext {
  readonly itemId: string;
  readonly itemVersion?: number;
  readonly language: string;
  readonly siteName: string;
  readonly variant?: string;
}

export interface FieldState {
  readonly fieldId: string;
  readonly itemId: string;
  readonly itemVersion?: number;
  reset: boolean;
  value: { rawValue: string };
}

export interface WorkspaceItemState {
  readonly itemId: string;
  readonly itemVersion?: number;
  readonly language: string;
  revision: string;
  fields: Array<FieldState & { revision: string }>;
  layout?: string;
}

export interface WorkspaceItemStateUpdate {
  readonly fields?: ReadonlyArray<FieldState>;
  readonly layout?: string;
}

export interface SaveValidationError {
  readonly aborted: string;
  readonly errorLevel: string;
  readonly errorMessage: string;
  readonly fieldId: string;
}

export type SaveItemErrorCode =
  | 'ItemDoesNotExist'
  | 'NoWriteAccess'
  | 'ItemIsProtected'
  | 'ItemIsFallback'
  | 'ItemWasModified'
  | 'FieldWasModified'
  | 'ItemLockedByAnotherUser'
  | 'ItemShouldBeLockedBeforeEdit'
  | 'ValidationError'
  | 'IncorrectCloneSource'
  | 'BaseTemplateWasChanged'
  | 'ChangedUnversionedOrSharedFlag'
  | 'InternalError';

export interface SaveError {
  readonly errorCode: SaveItemErrorCode;
  readonly message: string;
  readonly itemId: string;
}

export interface EditingShellSaveSuccessfulResult {
  readonly kind: 'successful';
  readonly fields: FieldState[];
}

export interface EditingShellSaveErrorResult {
  readonly kind: 'error';
  readonly errors: ReadonlyArray<SaveError>;
  readonly validationErrors: ReadonlyArray<SaveValidationError>;
  readonly warnings: ReadonlyArray<string>;
}

export type EditingShellSaveResult = EditingShellSaveSuccessfulResult | EditingShellSaveErrorResult;

export type ItemModificationScope =
  | 'data-fields'
  | 'layout'
  | 'name'
  | 'display-name'
  | 'workflow'
  | 'versions'
  | 'layoutEditingKind';
export interface ItemModificationNotification {
  readonly itemId: string;
  readonly scopes: readonly ItemModificationScope[];
}

//
// ====================== CONTRACTS ======================
//

export interface EditingShellEvents {
  'context:change': EditingShellContext;
  'workspaceItem:state:change': WorkspaceItemStateUpdate;
  'device:change': EditingShellDevice;
  'item:modify': ItemModificationNotification;
  'isPersonalizationMode:change': boolean;
}

export interface EditingShellRpcServices {
  getContext(): EditingShellContext;
  updateContext(update: Partial<EditingShellContext>): void;

  getAuthenticationBearerToken(): string;

  getStaticConfiguration(): StaticConfiguration;
  getLocalizationInfo(): LocalizationInfo;
  getXmCloudTenantInfo(): TenantInfo | null;

  save(update: WorkspaceItemStateUpdate, context: EditingShellContext, skipHistory: boolean): EditingShellSaveResult;
  notifyKnownWorkspaceItemState(state: WorkspaceItemState, context: EditingShellContext): void;
  getDevice(): EditingShellDevice;
  notifyItemModified(modification: ItemModificationNotification): void;

  selectChrome(id: string, chromeType: 'placeholder' | 'rendering' | 'field'): void;
  highlightChrome(id: string, chromeType: 'placeholder' | 'rendering' | 'field'): void;

  deleteRendering(instanceId: string, options: SaveOptions): void;
  getChildRenderings(renderingInstanceId: string): RenderingInfo[];
}

export const EditingShellContractName = 'EditingShell';

export const EditingShellContract: MessagingContract<EditingShellEvents, EditingShellRpcServices> = {
  name: EditingShellContractName,
};
