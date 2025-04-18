/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { MessagingRpcServicesClient } from '@sitecore/page-composer-sdk';
import { VersionsUtilService } from 'app/editor/right-hand-side/versions/versions-util.service';
import { Context, ContextService } from 'app/shared/client-state/context.service';
import { ItemChangeScope, ItemChangeService } from 'app/shared/client-state/item-change-service';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { Item, LayoutKind } from 'app/shared/graphql/item.interface';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { isSameGuid } from 'app/shared/utils/utils';
import { BehaviorSubject, Observable, Subject, firstValueFrom, of, throwError } from 'rxjs';
import { catchError, filter, map, share, switchMap, take } from 'rxjs/operators';
import { EditingCanvasContract, EditingCanvasRpc, WorkspaceItemState } from 'sdk';
import { PageState } from '../history/page-state';
import { BaseSaveDalService } from './graphql/save.dal.service';
import { SaveErrorService } from './save-error.service';
import { SaveQueueObj, saveQueue } from './save-queue';
import { FieldSaveInputValue, SaveFieldDetails, SaveLayoutDetails, SaveResult } from './save.interfaces';

interface SaveResultWithContext {
  result: SaveResult;
  changeSaved: PageState;
  changeIds: number[];
}

interface SaveErrorWithContext {
  originalError: any;
  changeWithError: PageState;
  changeIds: number[];
}

function isError(saveResult: SaveResultWithContext | SaveErrorWithContext): saveResult is SaveErrorWithContext {
  return 'originalError' in saveResult && 'changeWithError' in saveResult;
}

@Injectable({ providedIn: 'root' })
export class SaveService {
  private readonly _saveState$ = new BehaviorSubject<'no-changes' | 'error' | 'saved' | 'saving'>('no-changes');
  readonly saveState$ = this._saveState$.asObservable();

  private readonly save$ = new Subject<SaveQueueObj>();
  private readonly saveResult$: Observable<SaveResultWithContext | SaveErrorWithContext>;

  private workspaceItemState: WorkspaceItemState = {
    itemId: '',
    itemVersion: 1,
    language: 'en',
    revision: '',
    fields: [],
  };

  private changeId = 0;

  private readonly editingCanvasRpc: Promise<MessagingRpcServicesClient<EditingCanvasRpc>>;

  constructor(
    private readonly itemChangesService: ItemChangeService,
    private readonly contextService: ContextService,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly translateService: TranslateService,
    private readonly versionsUtilService: VersionsUtilService,
    private readonly saveErrorService: SaveErrorService,
    private readonly itemDalService: BaseItemDalService,
    private readonly saveDalService: BaseSaveDalService,
    globalMessaging: NgGlobalMessaging,
  ) {
    this.saveResult$ = this.save$.pipe(
      // IMPORTANT: Provide a save operation that handles errors. If save() emits an error the queue "dies".
      saveQueue(({ change, context, changeIds, layoutEditingKind }) =>
        this.save(change, context, changeIds, layoutEditingKind),
      ),
      share(),
    );

    // Subscribe immediately to connect save.
    this.saveResult$.subscribe();

    this.editingCanvasRpc = globalMessaging.getRpc(EditingCanvasContract);
  }

  updateWorkspaceItemState(updateState: WorkspaceItemState) {
    const update = JSON.parse(JSON.stringify(updateState)) as WorkspaceItemState;
    const isSamePage =
      isSameGuid(update.itemId, this.workspaceItemState.itemId) &&
      update.itemVersion === this.workspaceItemState.itemVersion &&
      update.language === this.workspaceItemState.language;

    if (isSamePage) {
      const notAffectedFields = this.workspaceItemState.fields.filter((f) =>
        update.fields.every((uf) => !isSameGuid(f.fieldId, uf.fieldId) && !isSameGuid(f.itemId, uf.itemId)),
      );
      this.workspaceItemState = update;
      this.workspaceItemState.fields.push(...notAffectedFields);
    } else {
      this.workspaceItemState = update;
    }
  }

  /**
   * Add the change to the save queue and return an observable that emits the save result for the given change.
   * Include context to tie together the change with the corresponding context.
   * Because save is a queue, it could happen that context has changed by the time save happens.
   */
  savePage(change: PageState, context: Context, layoutEditingKind: LayoutKind): Observable<SaveResult> {
    this.changeId++;
    const changeId = this.changeId;

    // A changeId is included so that when multiple changes are aggregated,
    // we can identify if the aggregate includes this change.
    this.save$.next({ change, context, changeId, layoutEditingKind });

    // Watch for this specific change to be saved and return it's result.
    return this.saveResult$.pipe(
      filter(({ changeIds }) => changeIds.includes(changeId)),
      switchMap((result) => (isError(result) ? throwError(() => result.originalError) : of(result.result))),
      take(1),
    );
  }

  /**
   * Wrapper around save that handles a few things:
   * * Handles errors
   * * Updates `saveState$`
   * * Delegates actual save
   * * Includes changeToSave in the change result or Error
   * * Updates WorkspaceItemState on successful save
   * * Shows message for automatically created new item version
   */
  private save(
    change: PageState,
    saveContext: Context,
    changeIds: number[],
    layoutEditingKind: LayoutKind,
  ): Observable<SaveResultWithContext | SaveErrorWithContext> {
    const afterSave = async (result: SaveResult): Promise<SaveResult> => {
      this.notifyContentChange(change, saveContext.itemId);
      await this.updatedRevisions(result);
      this._saveState$.next('saved');
      this.handleAutomaticVersionCreated(result, saveContext);
      return result;
    };

    this._saveState$.next('saving');

    return this._save(
      change,
      saveContext.language,
      saveContext.siteName,
      saveContext.itemId,
      saveContext.itemVersion,
      layoutEditingKind,
      false,
    ).pipe(
      switchMap((result) => this.handleSaveErrors(result, change, saveContext, layoutEditingKind)),
      switchMap((result) => afterSave(result)),
      map((result) => ({ result, changeSaved: change, changeIds })),
      catchError((error) => {
        this._saveState$.next('error');
        this.showNotificationAboutSaveError();
        return of({ changeWithError: change, originalError: error, changeIds });
      }),
    );
  }

  private async handleSaveErrors(
    result: SaveResult,
    change: PageState,
    context: Context,
    layoutEditingKind: LayoutKind,
  ): Promise<SaveResult> {
    if (result.errors.length || result.validationErrors.length || result.warnings.length) {
      const errorFollowupAction = await this.saveErrorService.handleSaveResult(context.itemId, result, () =>
        this.reloadCanvas(context.itemId),
      );
      switch (errorFollowupAction) {
        case 'OverwriteModifiedItem':
          return firstValueFrom(
            this._save(
              change,
              context.language,
              context.siteName,
              context.itemId,
              context.itemVersion,
              layoutEditingKind,
              true,
            ),
          );
        case 'ReloadCanvas':
          await this.reloadCanvas(context.itemId);
      }
    }

    return Promise.resolve(result);
  }

  private async reloadCanvas(itemId: string) {
    this.notifyItemChange(itemId);
    await (await this.editingCanvasRpc).reload();
  }

  private notifyContentChange(change: PageState, contextItemId: string) {
    if (!change.layout && !change.fields.some((f) => f.itemId === contextItemId)) {
      return;
    }

    const scopes: ItemChangeScope[] = [];
    if (change.layout) {
      scopes.push('layout');
    }
    if (change.fields.length) {
      scopes.push('data-fields');
    }
    this.notifyItemChange(contextItemId, scopes);
  }

  private notifyItemChange(contextItemId: string, scopes?: ItemChangeScope[]) {
    scopes = scopes ?? ['data-fields', 'display-name', 'layout', 'name', 'versions', 'workflow'];

    this.itemChangesService.notifyChange(contextItemId, scopes);
  }

  private _save(
    state: PageState,
    language: string,
    site: string,
    itemId: string,
    itemVersion: number | undefined,
    layoutEditingKind: LayoutKind,
    skipRevision: boolean,
  ): Observable<SaveResult> {
    const layoutItems = state.layout
      ? [this.prepareSaveLayoutDetails(itemId, itemVersion, state.layout, layoutEditingKind, skipRevision)]
      : [];
    const fields = this.prepareSaveFieldsDetails(state, itemId, skipRevision);
    return this.saveDalService
      .savePage(language, site, layoutItems, fields)
      .pipe(map((result) => this.handleNullFieldsValue(result)));
  }

  private handleNullFieldsValue(saveResult: SaveResult) {
    saveResult.savedItems.forEach((savedItem) => {
      savedItem.fields.forEach((field) => {
        field.value = field.value ?? '';
      });
    });
    return saveResult;
  }

  private prepareSaveFieldsDetails(data: PageState, contextItemId: string, skipRevision: boolean): SaveFieldDetails[] {
    const itemsDetails: SaveFieldDetails[] = [];

    const fieldValues = data.fields;
    for (const fieldValue of fieldValues) {
      const item = itemsDetails.find(
        (it) =>
          isSameGuid(it.itemId, fieldValue.itemId) &&
          // For backward compatibility we only check field value item version if it exists
          // once Zenith start reporting the field value changes with item version we need to adjust it
          (!fieldValue.itemVersion || it.itemVersion === fieldValue.itemVersion),
      );

      const originalValue =
        this.workspaceItemState.fields.find(
          (f) => isSameGuid(f.fieldId, fieldValue.fieldId) && isSameGuid(f.itemId, fieldValue.itemId),
        )?.value.rawValue ?? '';
      const field: FieldSaveInputValue = {
        id: fieldValue.fieldId,
        value: fieldValue.rawValue,
        originalValue,
        reset: fieldValue.reset,
      };
      const fieldSpecificRevision = this.getFieldItemRevision(fieldValue.itemId, fieldValue.fieldId, skipRevision);

      if (!item) {
        // When editing the context item, we pass the item version to ensure changes are made to the appropriate version.
        // However, for changes to data source items, the item version is not passed, and changes are always applied to the latest version of the data source.
        const isCurrentContextItemField = isSameGuid(contextItemId, fieldValue.itemId);
        itemsDetails.push({
          itemId: fieldValue.itemId,
          itemVersion: isCurrentContextItemField ? fieldValue.itemVersion : undefined,
          revision: fieldSpecificRevision,
          fields: [field],
        });
      } else {
        // If we save a multiple fields from one item and they can't agree on revision. Send empty guide to enforce comparing by field values.
        // Null revisoion doesn't work, as it's used as indicator to ignore revision and field value checks.
        if (item.revision !== fieldSpecificRevision) {
          item.revision = '00000000-0000-0000-0000-000000000000';
        }

        item.fields.push(field);
      }
    }
    return itemsDetails;
  }

  private prepareSaveLayoutDetails(
    itemId: string,
    itemVersion: number | undefined,
    layout: string,
    kind: LayoutKind,
    skipRevision: boolean,
  ): SaveLayoutDetails {
    const revision = skipRevision ? null : this.workspaceItemState.revision;

    const saveLayoutDetails: SaveLayoutDetails = {
      itemId,
      itemVersion,
      presentationDetails: { kind, body: layout },
      originalPresentationDetails: { kind, body: this.workspaceItemState.layout ?? '' },
      revision,
    };

    return saveLayoutDetails;
  }

  private async updatedRevisions({ savedItems, warnings }: SaveResult) {
    for (const savedItem of savedItems) {
      if (isSameGuid(savedItem.id, this.workspaceItemState.itemId)) {
        this.workspaceItemState.revision = savedItem.revision;
      }

      // set latest revision and avoid silent overwrite of other fields,
      // update modified fields
      savedItem.fields.forEach((savedField) => {
        const field = this.workspaceItemState.fields.find(
          (f) => isSameGuid(f.itemId, savedItem.id) && isSameGuid(f.fieldId, savedField.id),
        );
        if (field) {
          field.revision = savedItem.revision;
          field.value.rawValue = savedField.value;
        }
      });

      // update rest of the fields belong to the same item
      // keep the old revison to rely on field comparision if item's other fields were modified
      // scenario Author A and Author B have both opened the Page.
      // Author B modifies 'fieldB', then Author A (current author) modifies 'fieldA'. To prevent the overwrite of 'fieldB' by Author A,
      // we preserve the old revision (associated with Author A's initial Page open state) to rely on field value comparisons.
      if (!warnings.includes('ItemWasModified')) {
        savedItem.fields.forEach(() => {
          const fields = this.workspaceItemState.fields.filter((f) => isSameGuid(f.itemId, savedItem.id));
          fields.forEach((field) => {
            field.revision = savedItem.revision;
          });
        });
      }

      this.workspaceItemState.layout = (await this.contextService.getItem()).presentationDetails;
    }
  }

  private async handleAutomaticVersionCreated(result: SaveResult, saveContext: Context) {
    // We expect that if user is Admin, then a new version will never be created as a save result.
    // So, all actions below are for non-admin users.
    if (result.newCreatedVersions.length > 0) {
      result.newCreatedVersions.forEach((itemVersionInfo) => {
        this.showNotificationForNewVersion(
          itemVersionInfo.itemId,
          itemVersionInfo.versionNumber,
          itemVersionInfo.displayName,
        );
      });

      const newVersionOfContextItem = result.newCreatedVersions.find((item) =>
        isSameGuid(item.itemId, saveContext.itemId),
      );
      if (newVersionOfContextItem) {
        // New version of the context item is created
        if (
          isSameGuid(this.contextService.itemId, saveContext.itemId) &&
          this.contextService.language === saveContext.language
        ) {
          this.contextService.updateContext({ itemVersion: newVersionOfContextItem.versionNumber });

          // When new language page version is opened - temporary page is rendered with version 1
          // When first save happens - actual version is created
          // But since context value is not changed, we need to call notifyChange to fetch latest item state
          this.itemChangesService.notifyChange(saveContext.itemId, ['workflow', 'versions']);
        }
      } else {
        // New version of a datasource used in one of the components is created, so we force to create a new version of the context page.
        const item = await this.getItem(saveContext);
        if (!saveContext.itemVersion || !item.workflow?.finalState) {
          return;
        }

        const isVersionCreated = await this.versionsUtilService.createVersion('', saveContext);
        if (isVersionCreated) {
          this.showNotificationForNewVersion(saveContext.itemId, saveContext.itemVersion, item.displayName);
        }
      }
    }
  }

  private getFieldItemRevision(itemId: string, fieldId: string, skipRevision: boolean): string | null {
    if (skipRevision) {
      return null;
    }

    return (
      this.workspaceItemState.fields.find(
        (field) => isSameGuid(field.itemId, itemId) && isSameGuid(field.fieldId, fieldId),
      )?.revision ?? null
    );
  }

  private showNotificationForNewVersion(itemId: string, versionNumber: number | undefined, itemDisplayName: string) {
    const text$ = this.translateService.get('VERSIONS.VERSION_CREATED_SUCCESSFUL', {
      versionNumber,
      itemDisplayName,
    });
    this.timedNotificationsService.push('NewItemVersionCrated-' + itemId, text$, 'success');
  }

  private async showNotificationAboutSaveError() {
    const errorInContext = await firstValueFrom(this.translateService.get('EDITOR.SAVE.ERRORS.PAGE_SAVE_ERROR'));
    const actonTitle = await firstValueFrom(this.translateService.get('ERRORS.RELOAD_ERROR_ACTION_TITLE'));
    const notification = new TimedNotification('errorInContext', errorInContext, 'error');
    notification.action = { run: () => window.location.reload(), title: actonTitle };
    notification.persistent = true;
    this.timedNotificationsService.pushNotification(notification);
  }

  private async getItem(context: Context): Promise<Item> {
    if (
      isSameGuid(context.itemId, this.contextService.itemId) &&
      context.itemVersion === this.contextService.itemVersion &&
      context.language === this.contextService.language
    ) {
      return this.contextService.getItem();
    } else {
      return firstValueFrom(
        this.itemDalService.getItem(context.itemId, context.language, context.siteName, context.itemVersion),
      );
    }
  }
}
