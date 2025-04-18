/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

// eslint-disable-next-line max-classes-per-file
import { EditingMessagingChannel } from 'app/shared/messaging/horizon-canvas.contract.defs';
import { BasicChromeInfo, FieldRawValue, FieldValue } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { Lifetime } from 'app/shared/utils/lifetime';
import { isSameGuid } from 'app/shared/utils/utils';
import {
  EditingShellContext,
  EditingShellSaveResult,
  FieldState,
  WorkspaceItemStateUpdate,
} from 'sdk/contracts/editing-shell.contract';
import { EditorWorkspaceService } from '../editor-workspace/editor-workspace.service';
import { CanvasServicesImpl } from '../shared/canvas.services';
import { PageLayout, PageLayoutHooks } from '../shared/layout/page-layout';
import { CanvasUrl } from './canvas-page.service';

export interface CanvasPageServiceApi extends PageLayoutHooks {
  updateCanvasFields(fields: readonly FieldValue[]): Promise<void>;
  notifyWorkspaceUpdate(update: WorkspaceItemStateUpdate): void;
  notifyFieldsSaved(fields: FieldState[]): void;
  reloadCanvas(chromeToSelect?: BasicChromeInfo): Promise<void>;
  saveItemChanges(
    change: WorkspaceItemStateUpdate,
    context: EditingShellContext,
    skipHistoryUpdate: boolean,
  ): Promise<EditingShellSaveResult>;
}

export type PageUpdateSource = 'CANVAS' | 'HISTORY' | 'PAGE_LAYOUT' | 'DATA-VIEW';

interface FieldValueMutable {
  fieldId: string;
  itemId: string;
  itemVersion?: number;
  value: FieldRawValue;
  reset: boolean;
}

interface CanvasPageStateSnapshot {
  fields: FieldState[];
  layout: string;
  layoutDeviceId: string;
  context: EditingShellContext;
}

export interface CanvasPageState {
  getStateSnapshot(): CanvasPageStateSnapshot;
  readonly context: EditingShellContext;
  readonly isConnectedToCanvas: boolean;

  getCanvasUrl(): CanvasUrl;

  notifyCanvasUnloaded(): void;
  updatePage(update: WorkspaceItemStateUpdate, source: PageUpdateSource): Promise<void>;
}

export interface PageUpdateOptions {
  reloadCanvas: boolean;
  skipHistory: boolean;
  chromeToSelect?: BasicChromeInfo;
}

export class LoadingCanvasPageState implements CanvasPageState {
  readonly isConnectedToCanvas = false;

  constructor(
    public readonly context: EditingShellContext,
    private readonly canvasServiceApi: CanvasPageServiceApi,
  ) {}

  getStateSnapshot(): CanvasPageStateSnapshot {
    return {
      fields: [],
      layout: '',
      layoutDeviceId: '',
      context: this.context,
    };
  }

  getCanvasUrl(): CanvasUrl {
    return { context: this.context };
  }

  notifyCanvasUnloaded(): void {
    throw new Error(`[BUG] It's not expected to happen in this state`);
  }

  async updatePage(update: WorkspaceItemStateUpdate, source: PageUpdateSource): Promise<void> {
    if (source === 'CANVAS') {
      throw new Error('[BUG] Canvas updates are not expected as Canvas is not loaded');
    }

    await this.canvasServiceApi.saveItemChanges(update, this.context, false);

    // Page is not loaded yet, so the best we can do - it's to save the value and reload the page.
    await this.canvasServiceApi.reloadCanvas();
  }
}

export class BoundCanvasPageState implements CanvasPageState, CanvasServicesImpl {
  readonly layout: PageLayout;
  private readonly fields: FieldValueMutable[] = [];
  private currentSaveOperation: Promise<EditingShellSaveResult> | undefined;

  private _isConnectedToCanvas = true;
  private layoutDeviceId: string;
  get isConnectedToCanvas(): boolean {
    return this._isConnectedToCanvas;
  }

  getStateSnapshot(): CanvasPageStateSnapshot {
    return {
      fields: this.fields.map((field) => ({
        fieldId: field.fieldId,
        itemId: field.itemId,
        itemVersion: field.itemVersion,
        value: field.value,
        reset: field.reset,
      })),
      layout: this.layout.getLayoutSnapshot(),
      layoutDeviceId: this.layoutDeviceId,
      context: this.context,
    };
  }

  private readonly editingChannel: EditingMessagingChannel;

  constructor(
    fields: readonly FieldValue[],
    layout: string,
    layoutDeviceId: string,
    public readonly context: EditingShellContext,
    private readonly canvasPageServiceApi: CanvasPageServiceApi,
    private readonly messagingService: MessagingService,
    editorWorkspaceService: EditorWorkspaceService,
  ) {
    this.editingChannel = this.messagingService.getEditingCanvasChannel();
    this.fields = fields.map((x) => ({
      fieldId: x.fieldId,
      itemId: x.itemId,
      itemVersion: x.itemVersion,
      value: x.value,
      reset: x.reset,
    }));
    this.layout = new PageLayout(
      layout,
      layoutDeviceId,
      canvasPageServiceApi,
      this.editingChannel,
      this.context,
      editorWorkspaceService,
    );

    this.layoutDeviceId = layoutDeviceId;
    // No need to unsubscribe, as this object is owning the PageLayout, so it dies together.
    this.layout.onLayoutChange(Lifetime.Eternal, async (options) => {
      await this.doUpdatePage({ layout: this.layout.getLayoutSnapshot() }, 'PAGE_LAYOUT', options);
    });
  }

  getCanvasUrl(): CanvasUrl {
    return { context: this.context };
  }

  notifyCanvasUnloaded() {
    this._isConnectedToCanvas = false;
  }

  async updatePage(update: WorkspaceItemStateUpdate, source: PageUpdateSource) {
    return this.doUpdatePage(update, source);
  }

  private async doUpdatePage(
    update: WorkspaceItemStateUpdate,
    source: PageUpdateSource,
    pageUpdateOptions: PageUpdateOptions = { reloadCanvas: true, skipHistory: false },
  ) {
    if (source === 'PAGE_LAYOUT' && (update.fields || !update.layout)) {
      throw Error('PAGE_LAYOUT update should contain layout update only');
    }

    // Wile fields are applying to Canvas or Data view, they will invoke the current method.
    // It's expected that method with just return because the value is already applied/saved.
    let changesToApply: WorkspaceItemStateUpdate | undefined = await this.applyChangesToInternalState(update, source);
    if (!changesToApply) {
      await this.currentSaveOperation;
      return;
    }

    this.currentSaveOperation = this.canvasPageServiceApi.saveItemChanges(
      changesToApply,
      this.context,
      pageUpdateOptions.skipHistory,
    );

    const fieldResetRequested = changesToApply.fields?.some((f) => f.reset);
    if (fieldResetRequested) {
      let savedChanges: WorkspaceItemStateUpdate | undefined;
      const saveResult = await this.currentSaveOperation;
      if (saveResult.kind === 'successful') {
        savedChanges = { fields: saveResult.fields, layout: savedChanges?.layout };
        await this.applyChangesToInternalState({ fields: savedChanges.fields }, source);
      }
      changesToApply = savedChanges ?? changesToApply;
    }

    this.canvasPageServiceApi.notifyWorkspaceUpdate(changesToApply);

    let requireReload = changesToApply.layout && pageUpdateOptions.reloadCanvas;
    // While fields are applying, they might require Canvas reload (because of SSR demand).
    // If that happens, the Canvas will be disconnected in the meanwhile and nothing else will happen.
    // If after save we find that we want to reload canvas, we'll reload it one more time.
    if (changesToApply.fields && source !== 'CANVAS') {
      if (this.isConnectedToCanvas) {
        await this.canvasPageServiceApi.updateCanvasFields(changesToApply.fields);
      } else {
        requireReload = true;
      }
    }

    const saveResult = await this.currentSaveOperation;
    if (saveResult.kind === 'successful') {
      this.canvasPageServiceApi.notifyFieldsSaved(saveResult.fields);
    }
    if (requireReload) {
      await this.canvasPageServiceApi.reloadCanvas(pageUpdateOptions.chromeToSelect);
    }
  }

  /**
   * Update current state by applying the changes and return actual changes.
   */
  private async applyChangesToInternalState(
    updateRef: WorkspaceItemStateUpdate,
    source: PageUpdateSource,
  ): Promise<WorkspaceItemStateUpdate | undefined> {
    if (source === 'PAGE_LAYOUT') {
      // Changes are already applied to internal state
      return { layout: updateRef.layout };
    }

    if (!updateRef.fields && !updateRef.layout) {
      return undefined;
    }

    const update = JSON.parse(JSON.stringify(updateRef)) as WorkspaceItemStateUpdate;

    const appliedChanges: { layout?: string; fields?: FieldValue[] } = {};

    // For now always consider layout to be changed if provided in update
    if (update.layout) {
      appliedChanges.layout = update.layout;
      await this.layout.setLayoutSnapshot(update.layout, true);
    }

    if (update.fields) {
      appliedChanges.fields = [];

      for (const updateField of update.fields) {
        const existingField = this.fields.find(
          (x) =>
            isSameGuid(x.fieldId, updateField.fieldId) &&
            isSameGuid(x.itemId, updateField.itemId) &&
            x.itemVersion === updateField.itemVersion,
        );

        if (!existingField) {
          this.fields.push({
            fieldId: updateField.fieldId,
            itemId: updateField.itemId,
            itemVersion: updateField.itemVersion,
            value: updateField.value,
            reset: updateField.reset,
          });
          appliedChanges.fields.push(updateField);
          continue;
        }

        if (updateField.value.rawValue !== existingField.value.rawValue || updateField.reset !== existingField.reset) {
          existingField.reset = updateField.reset;
          existingField.value = updateField.value;
          appliedChanges.fields.push(updateField);
        }
      }

      if (appliedChanges.fields.length === 0) {
        appliedChanges.fields = undefined;
      }
    }

    if (!appliedChanges.layout && !appliedChanges.fields) {
      return undefined;
    }

    return appliedChanges;
  }
}
