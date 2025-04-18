/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { FieldValue } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import {
  EditingShellContext,
  EditingShellSaveResult,
  FieldState,
  RenderingInitializationContext,
  WorkspaceItemStateUpdate,
} from 'sdk';
import { v4 as uuid } from 'uuid';
import { EditorWorkspaceService } from '../editor-workspace/editor-workspace.service';
import { EditingMode } from '../lhs-panel/data-view/fields-tracker.service';
import { HistoryService } from '../shared/history/history.service';
import { PageState } from '../shared/history/page-state';
import {
  BoundCanvasPageState,
  CanvasPageServiceApi,
  CanvasPageState,
  LoadingCanvasPageState,
} from './canvas-page-state';

/**
 * Shallow implementation of CanvasPageService for DRAFT mode.
 */
export class ShallowCanvasPageServiceApi implements CanvasPageServiceApi {
  constructor(
    private readonly api: CanvasPageServiceApi,
    private readonly historyService: HistoryService,
  ) {}

  updateCanvasFields(fields: FieldState[]): Promise<void> {
    return this.api.updateCanvasFields(fields);
  }

  hookInsertRendering(): Promise<RenderingInitializationContext> {
    return Promise.resolve({} as RenderingInitializationContext);
  }

  saveItemChanges(change: WorkspaceItemStateUpdate): Promise<EditingShellSaveResult> {
    this.historyService.addState(PageState.fromWorkspaceItemState(change));

    return Promise.resolve({} as EditingShellSaveResult);
  }

  reloadCanvas(): Promise<void> {
    return Promise.resolve();
  }

  notifyWorkspaceUpdate(): void {}

  notifyFieldsSaved(): void {}
}

/**
 * Manages different states of the Canvas Page.
 */
@Injectable({
  providedIn: 'root',
})
export class CanvasPageStateManager {
  protected canvasStates = new Map<EditingMode, CanvasPageState | BoundCanvasPageState>();
  private activeMode: EditingMode = 'persist';
  private draftStateId: string | null = null;

  private canvasServiceApi?: CanvasPageServiceApi;

  constructor(
    private readonly contextService: ContextService,
    private readonly messagingService: MessagingService,
    private readonly editorWorkspaceService: EditorWorkspaceService,
    private readonly historyService: HistoryService,
  ) {}

  getCurrentMode(): EditingMode {
    return this.activeMode;
  }

  getActivePageState(): CanvasPageState {
    return this.canvasStates.get(this.activeMode)!;
  }

  initialize(canvasPageServiceApi: CanvasPageServiceApi) {
    this.canvasStates.set('loading', new LoadingCanvasPageState(this.contextService.value, canvasPageServiceApi));
    this.activeMode = 'loading';
    this.canvasServiceApi = canvasPageServiceApi;
  }

  switchMode(mode: EditingMode): void {
    this.setHistoryServiceContext(mode);

    // Initialize draft state if it doesn't exist
    if (mode === 'draft' && !this.canvasStates.has(mode)) {
      const persistState = this.canvasStates.get('persist');
      if (!persistState) {
        console.warn('Cannot switch to draft mode: Persistent state not found.');
        return;
      }

      const persistStateSnapshot = persistState.getStateSnapshot();

      const draftState = this.createState(
        persistStateSnapshot.fields,
        persistStateSnapshot.layout,
        persistStateSnapshot.layoutDeviceId,
        this.contextService.value,
        new ShallowCanvasPageServiceApi(this.canvasServiceApi!, this.historyService),
      );

      this.canvasStates.set('draft', draftState);
    }

    this.activeMode = mode;
    const activePageFields = this.getActivePageState().getStateSnapshot().fields;
    this.updateCanvasFields(activePageFields);
  }

  onPageLoad(fields: FieldValue[], layout: string, layoutDeviceId: string, context: EditingShellContext) {
    const canvasPageState = this.createState(fields, layout, layoutDeviceId, context, this.canvasServiceApi!);
    this.canvasStates.set('persist', canvasPageState);
    this.activeMode = 'persist';
  }

  onPageLoadStart() {
    // we need to set the loading state otherwise it will not have latest context values
    this.canvasStates.set('loading', new LoadingCanvasPageState(this.contextService.value, this.canvasServiceApi!));
    this.activeMode = 'loading';
  }

  async KeepDraftChanges(): Promise<void> {
    const draftState = this.canvasStates.get('draft');

    if (!draftState) {
      console.warn('No draft state found. No changes to commit.');
      return;
    }

    const draftFields = draftState.getStateSnapshot().fields;
    this.activeMode = 'persist';
    this.setHistoryServiceContext(this.activeMode);

    await this.getActivePageState().updatePage({ fields: draftFields }, 'DATA-VIEW');

    console.info('Changes committed successfully.');

    this.deleteDraftState();
  }

  discardDraftChanges(updateCanvas: boolean): void {
    const persistentState = this.canvasStates.get('persist');
    if (!persistentState) {
      console.warn('No persist state found. No changes to discard.');
      return;
    }

    const persistentStateFields = persistentState.getStateSnapshot().fields;

    this.activeMode = 'persist';
    if (updateCanvas) {
      this.updateCanvasFields(persistentStateFields);
    }

    this.deleteDraftState();
  }

  hasPendingChanges(): boolean {
    const draftState = this.canvasStates.get('draft');
    const persistentState = this.canvasStates.get('persist');

    if (!draftState || !persistentState) {
      return false;
    }

    const draftFields = JSON.stringify(draftState.getStateSnapshot().fields);
    const persistentFields = JSON.stringify(persistentState.getStateSnapshot().fields);

    return draftFields !== persistentFields;
  }

  clearStates(): void {
    this.canvasStates.clear();
    this.activeMode = 'persist';
    this.canvasServiceApi = undefined;
  }

  private createState(
    fields: FieldState[],
    layout: string,
    layoutDeviceId: string,
    context: EditingShellContext,
    api: CanvasPageServiceApi,
  ): BoundCanvasPageState {
    return new BoundCanvasPageState(
      JSON.parse(JSON.stringify(fields)),
      layout,
      layoutDeviceId,
      JSON.parse(JSON.stringify(context)),
      api,
      this.messagingService,
      this.editorWorkspaceService,
    );
  }

  private updateCanvasFields(fields: FieldValue[]): void {
    this.canvasServiceApi?.updateCanvasFields(fields);
  }

  private setHistoryServiceContext(mode: EditingMode): void {
    if (mode === 'draft') {
      if (this.draftStateId === null) {
        this.draftStateId = uuid();
      }
    }

    const id = mode === 'draft' ? this.draftStateId! : this.contextService.itemId!;
    this.historyService.setContext(
      id,
      this.contextService.itemVersion!,
      this.contextService.variant,
      this.contextService.language,
    );
  }

  private deleteDraftState() {
    this.canvasStates.delete('draft');
    this.draftStateId = null;
    this.setHistoryServiceContext('persist');
  }
}
