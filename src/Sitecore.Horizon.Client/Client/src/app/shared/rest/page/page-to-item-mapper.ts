/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { SaveItemErrorCode } from 'app/editor/shared/save/save-item-error-code';
import { SaveResult } from 'app/editor/shared/save/save.interfaces';
import {
  ExecuteWorkflowCommandOutput,
  ItemValidationRecord,
  ItemValidationResult,
  ValidatorResult,
} from 'app/editor/shared/versions-workflow/workflow.dal.service';
import { Item, ItemLocking, ItemPermissions, ItemTemplate, ItemWorkflow } from 'app/shared/graphql/item.interface';
import {
  ExecuteWorkflowCommandResult,
  FieldValidationResult,
  Locking,
  Page,
  PageHierarchy,
  PageTemplate,
  PageValidationRecord,
  PageWorkflow,
  PageWorkflowValidationResult,
  Permissions,
  Publishing,
  SavePageResponse,
  WorkflowWarning,
} from './page.types';

export class PageToItemMapper {
  public static mapPageHierarchyToItem(page: PageHierarchy): Item {
    const { page: pageInfo, children, ancestors } = page;
    const item: Item = PageToItemMapper.mapPageResponseToItem(pageInfo);
    item.children = children.map((child) => PageToItemMapper.mapPageResponseToItem(child));
    item.ancestors = ancestors.map((ancestor) => PageToItemMapper.mapPageResponseToItem(ancestor));
    return item;
  }

  public static mapPageChildrenToItem(pageId: string, children: Page[]): Item {
    const item: Item = {
      id: pageId,
      children: children.map((child) => PageToItemMapper.mapPageResponseToItem(child)),
    } as Partial<Item> as Item;
    return item;
  }

  public static mapPageResponseToItem(page: Page): Item {
    return {
      name: page.name,
      id: page.id,
      version: page.version,
      versionName: page.versionName,
      hasVersions: page.hasVersions,
      revision: page.revision,
      versions: [],
      displayName: page.displayName,
      icon: page.icon,
      path: page.path,
      hasChildren: page.hasChildren,
      children: page.children?.map((child) => PageToItemMapper.mapPageResponseToItem(child)),
      ancestors: [],
      language: page.language,
      parent: undefined, // TODO: Implement logic to map parent
      workflow: PageToItemMapper.mapWorkflow(page.workflow),
      template: PageToItemMapper.mapTemplate(page.template),
      fields: [],
      isFolder: !page.hasPresentation,
      isLatestPublishableVersion: page.publishing?.isPublishable || false,
      creationDate: page.createdAt,
      updatedDate: page.updatedAt,
      createdBy: page.createdBy,
      updatedBy: page.updatedBy,
      insertOptions: page.insertOptions,
      permissions: PageToItemMapper.mapPermissions(page.permissions),
      locking: PageToItemMapper.mapLocking(page.locking),
      publishing: PageToItemMapper.mapPublishing(page.publishing),
      presentationDetails: page.finalLayout,
      layoutEditingKind: page.layoutEditingKind,
      route: page.route,
    };
  }

  public static mapPageStateResponseToItem(page: Page): Item {
    return {
      id: page.id,
      displayName: page.displayName,
      revision: page.revision,
      version: page.version,
      versionName: page.versionName,
      presentationDetails: page.finalLayout,
      layoutEditingKind: page.layoutEditingKind,
    } as Partial<Item> as Item;
  }

  public static mapWorkflow(workflow: PageWorkflow | undefined): ItemWorkflow | null {
    if (!workflow) {
      return null;
    }

    return {
      id: workflow.id,
      displayName: workflow.displayName,
      commands: workflow.commands,
      finalState: workflow.finalState,
      canEdit: workflow.canEdit,
      warnings: PageToItemMapper.mapWarnings(workflow.warnings),
    };
  }

  private static mapWarnings(warnings: WorkflowWarning[] | undefined): WorkflowWarning[] {
    return (
      warnings?.map((warning) => ({
        id: warning.id,
        errorCode: warning.errorCode,
        message: warning.message,
      })) || []
    );
  }

  private static mapTemplate(template: PageTemplate): ItemTemplate | undefined {
    return template
      ? {
          name: template.name,
          id: template.id,
          displayName: template.displayName,
          baseTemplateIds: template.baseTemplateIds,
          path: template.path,
        }
      : undefined;
  }

  private static mapPermissions(permissions: Permissions): ItemPermissions {
    return {
      canWrite: permissions.canWrite,
      canDelete: permissions.canDelete,
      canRename: permissions.canRename,
      canCreate: permissions.canCreate,
      canPublish: permissions.canPublish || false,
    };
  }

  private static mapLocking(locking: Locking): ItemLocking {
    if (locking) {
      return {
        lockedByCurrentUser: locking.lockedByCurrentUser,
        isLocked: locking.isLocked,
      };
    }
    return { lockedByCurrentUser: false, isLocked: false };
  }

  private static mapPublishing(publishing: Publishing) {
    return {
      hasPublishableVersion: publishing?.hasPublishableVersion,
      isPublishable: publishing?.isPublishable,
      validFromDate: publishing?.validFromDate,
      validToDate: publishing?.validToDate,
      isAvailableToPublish: publishing?.isAvailableToPublish,
    };
  }

  public static mapSavePageResponseToSaveResult(response: SavePageResponse): SaveResult {
    return {
      errors: response.errors.map(({ errorCode, message, pageId }) => ({
        errorCode: errorCode as SaveItemErrorCode,
        message,
        itemId: pageId,
      })),
      savedItems: [
        {
          fields: response.fields.map(({ id, originalValue = '', value, containsStandardValue }) => ({
            id,
            originalValue,
            value,
            reset: containsStandardValue,
          })),
          id: response.savedPage.id,
          language: response.language,
          revision: response.revision,
          version: response.pageVersion,
        },
      ],
      validationErrors: response.validationErrors,
      warnings: response.warnings,
      newCreatedVersions: [
        {
          itemId: response.newCreatedVersion.pageId,
          displayName: response.newCreatedVersion.displayName,
          versionNumber: response.newCreatedVersion.versionNumber,
        },
      ],
    };
  }

  public static mapExecuteWorkflowResult(
    executeWorkflowCommandResult: ExecuteWorkflowCommandResult | undefined,
  ): ExecuteWorkflowCommandOutput | undefined {
    if (!executeWorkflowCommandResult) {
      return undefined;
    }

    const { pageWorkflowValidationResult } = executeWorkflowCommandResult;

    const mapPersonalizedDatasourceItemsResult =
      pageWorkflowValidationResult.personalizedDatasourceItemsResult.length > 0
        ? PageToItemMapper.mapPageValidationResult(pageWorkflowValidationResult.personalizedDatasourceItemsResult[0])
        : undefined;

    const defaultDatasourceItemsResult =
      executeWorkflowCommandResult.pageWorkflowValidationResult.defaultDatasourceItemsResult
        ?.map(PageToItemMapper.mapPageValidationResult)
        .filter((result): result is ItemValidationResult => result !== undefined);

    const executeWorkflowCommandOutput: ExecuteWorkflowCommandOutput = {
      completed: executeWorkflowCommandResult.completed,
      error: executeWorkflowCommandResult.error,
      datasourcesCommandResult: executeWorkflowCommandResult.datasourcesCommandResult?.map((commandResult) => ({
        completed: commandResult.completed,
        error: commandResult.error,
      })),

      pageWorkflowValidationResult: {
        pageItemResult: PageToItemMapper.mapPageValidationResult(pageWorkflowValidationResult.pageValidationResult),
        defaultDatasourceItemsResult: defaultDatasourceItemsResult ?? [],
        personalizedDatasourceItemsResult: mapPersonalizedDatasourceItemsResult
          ? [mapPersonalizedDatasourceItemsResult]
          : undefined,
      },
    };

    return executeWorkflowCommandOutput;
  }

  private static mapValidationRecords(records: PageValidationRecord[] | null | undefined): ItemValidationRecord[] {
    return (
      records?.map((record) => ({
        validatorResult: record.validatorResult as ValidatorResult,
        validatorTitle: record.validatorTitle,
        validatorDescription: record.validatorDescription,
        validatorText: record.validatorText,
        errors: record.errors,
      })) ?? []
    );
  }

  private static mapPageValidationResult(result: PageWorkflowValidationResult) {
    return (
      result && {
        itemId: result.pageId,
        itemName: result.pageName,
        itemRulesResult: PageToItemMapper.mapValidationRecords(result.pageRulesResult),
        fieldRulesResult: result.fieldRulesResult?.map(PageToItemMapper.mapFieldValidationResult),
      }
    );
  }

  private static mapFieldValidationResult(result: FieldValidationResult) {
    return {
      fieldName: result.fieldName,
      fieldItemId: result.fieldItemId,
      records: PageToItemMapper.mapValidationRecords(result.records),
    };
  }
}
