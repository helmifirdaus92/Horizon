/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessagingPort, createVirtualP2PConnection } from '@sitecore/horizon-messaging';
import { NgCommandManager, NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { MessagingRpcServicesClient } from '@sitecore/page-composer-sdk';
import { makeFlowNameUnique } from 'app/pages/left-hand-side/personalization/personalization-api/personalization.api.utils';
import { AbTestComponentService } from 'app/pages/left-hand-side/personalization/personalization-services/ab-test-component.service';
import { PersonalizationLayoutService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.layout.service';
import { PersonalizationService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.service';
import { BXComponentFlowDefinition } from 'app/pages/left-hand-side/personalization/personalization.types';
import { Context, ContextService, EventSource } from 'app/shared/client-state/context.service';
import { PageInteractionsGuardService } from 'app/shared/client-state/page-interactions-guard.service';
import { ContentItemDialogService } from 'app/shared/dialogs/content-item-dialog/content-item-dialog.service';
import { WarningDialogComponent } from 'app/shared/dialogs/warning-dialog/warning-dialog.component';
import { EditingMessagingChannel } from 'app/shared/messaging/horizon-canvas.contract.defs';
import {
  BasicChromeInfo,
  ChromeInfo,
  ChromeRhsMessage,
  FieldValue,
  RenderingChromeInfo,
} from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { normalizeGuidCharactersOnly } from 'app/shared/utils/utils';
import { ReplaySubject, Subject, firstValueFrom } from 'rxjs';
import { filter, skip } from 'rxjs/operators';
import {
  EditingCanvasContract,
  EditingShellContext,
  EditingShellContract,
  EditingShellRpcServices,
  EditingShellSaveErrorResult,
  EditingShellSaveResult,
  EditorCommands,
  FieldState,
  RenderingInitializationContext,
  WorkspaceItemState,
  WorkspaceItemStateUpdate,
} from 'sdk';
import { EditorWorkspaceService } from '../editor-workspace/editor-workspace.service';
import { FieldsTrackerService } from '../lhs-panel/data-view/fields-tracker.service';
import { RenderingDetailsService } from '../right-hand-side/rendering-details/rendering-details.service';
import { RhsEditorMessagingReconnectable } from '../right-hand-side/rhs-editor-messaging';
import { AddPhoneNumberService } from '../right-hand-side/rich-text-editor/add-phone-number.service';
import { EditSourceCodeService } from '../right-hand-side/rich-text-editor/edit-source-code.service';
import { MediaPickerService } from '../right-hand-side/rich-text-editor/media-picker.service';
import { CanvasServices, ChromeSelection } from '../shared/canvas.services';
import { PageState } from '../shared/history/page-state';
import {
  BoundCanvasPageState,
  CanvasPageServiceApi,
  CanvasPageState,
  LoadingCanvasPageState,
  PageUpdateSource,
} from './canvas-page-state';
import { CanvasPageStateManager } from './canvas-page-state-manager';

export interface SaveError {
  context: Readonly<Context>;
  change: PageState;
  error: { type: 'technical' } | { type: 'response'; result: EditingShellSaveErrorResult };
}

export interface CanvasUrl {
  context: Context;
}

// This service is declared as a provider of EditorComponent.
// Meaning that service is alive only while EditorComponent is shown.
@Injectable()
export class CanvasPageService implements CanvasPageServiceApi, OnDestroy {
  private readonly lifetime = new Lifetime();

  private readonly _afterParse$ = new Subject<void>();
  readonly afterParse$ = this._afterParse$.asObservable();

  private readonly _canvasUrl$ = new ReplaySubject<{
    canvasUrl: CanvasUrl;
    chromeToSelect?: BasicChromeInfo;
  }>(1);
  readonly canvasUrl$ = this._canvasUrl$.asObservable();

  private readonly editingChannel: EditingMessagingChannel;

  private readonly rhsEditorMessages = new Subject<ChromeRhsMessage>();

  private readonly _onSaveError$ = new Subject<SaveError>();
  readonly onSaveError$ = this._onSaveError$.asObservable();

  /**
   * Keep a context which is synchronized with canvas instead of relying on ContextService.
   * When context service changes, canvas may take a moment to adjust and load the corresponding page.
   * So any messages from canvas in this interval will not match to the ContextService.
   *
   * For example, if editing a field and then select a new page on the lhs tree, the context immediately updates
   * to the selected itemId but the canvas will emit field changes for the previously selected page.
   */

  private readonly editingShellRpcClient: Promise<MessagingRpcServicesClient<EditingShellRpcServices>>;

  get activePageState(): CanvasPageState {
    return this.canvasPageStateManager.getActivePageState();
  }

  constructor(
    private readonly messagingService: MessagingService,
    private readonly contextService: ContextService,
    private readonly canvasServices: CanvasServices,
    private readonly editorWorkspaceService: EditorWorkspaceService,
    globalMessaging: NgGlobalMessaging,
    private readonly commandManager: NgCommandManager<EditorCommands>,
    private readonly personalizationService: PersonalizationService,
    private readonly abTestComponentService: AbTestComponentService,
    private readonly dialogService: DialogOverlayService,
    private readonly translateService: TranslateService,
    private readonly mediaPickerService: MediaPickerService,
    private readonly editSourceCodeService: EditSourceCodeService,
    private readonly addPhoneNumberService: AddPhoneNumberService,
    private readonly contentItemDialogService: ContentItemDialogService,
    private readonly personalizationLayoutService: PersonalizationLayoutService,
    private readonly renderingDetailsService: RenderingDetailsService,
    private readonly fieldsTrackerService: FieldsTrackerService,
    private readonly canvasPageStateManager: CanvasPageStateManager,
    private readonly pageInteractionsGuardService: PageInteractionsGuardService,
  ) {
    this.editingChannel = this.messagingService.getEditingCanvasChannel();
    this.editingShellRpcClient = globalMessaging.getRpc(EditingShellContract);

    this.canvasPageStateManager.initialize(this);

    this.lifetime.registerCallbacks(
      this.editingChannel.on('chrome:remove', (chrome) => this.removeChrome(chrome)),
      this.editingChannel.on('chrome:select', (chrome) => this.selectChrome(chrome)),
      this.editingChannel.on('chrome:deselect', () => this.selectChrome(undefined)),
      this.editingChannel.on('chrome:rhs:message', (msg) => this.rhsEditorMessages.next(msg)),
      this.editingChannel.on('page:load', async ({ fields, layout, layoutDeviceId, styles }) => {
        await this.onCanvasPageLoad(fields, layout, layoutDeviceId);
        this.reportIsPersonalizationModeToCanvas();
        this.canvasServices.setCanvasStyles(styles);
      }),
      this.editingChannel.on('page:unloaded', () => {
        if (this.activePageState.isConnectedToCanvas) {
          this.activePageState.notifyCanvasUnloaded();
        }
      }),
      this.editingChannel.on(
        'field:change',
        async (newValue) => await this.updatePageState({ fields: [newValue] }, 'CANVAS'),
      ),
      // In prod build page:unloaded event is not always sent
      // Use canvas messaging disconnect hook, to ensure canvas is unloaded
      this.messagingService.onCanvasDisconnect(() => {
        if (this.activePageState.isConnectedToCanvas) {
          this.activePageState.notifyCanvasUnloaded();
        }
      }),
    );

    this.watchFieldsUpdates();

    this.editingChannel.setRpcServicesImpl({
      reloadCanvas: async () => await this.reloadCanvas(),
      getItemPermissions: async () => (await this.contextService.getItem()).permissions,
      selectMedia: async () => await this.mediaPickerService.promptSelectMedia(),
      editSourceCode: async (value: string) => await this.editSourceCodeService.promptEditSourceCode(value),
      getPageFlows: async (itemId: string, language: string) =>
        (await this.abTestComponentService.getPageFlowDefinitions(itemId, language)).flows,
      getAbTestConfigStatus: async (itemId: string, language: string) =>
        await this.abTestComponentService.getAbTestConfigStatus(itemId, language),
      addPhoneNumber: async () => await this.addPhoneNumberService.promptAddPhoneNumber(),
      promptSelectPage: async () => await this.promptSelectPage(),
      setRenderingParams: async (renderingInstanceId: string, value: string) => {
        const parameters = (await this.renderingDetailsService.getRenderingDetails(renderingInstanceId)).parameters;
        parameters['extKey'] = value;

        this.renderingDetailsService.setRenderingDetails(
          renderingInstanceId,
          { parameters },
          { reloadRequired: false },
        );
      },
    });

    this.lifetime.registerCallbacks(() =>
      this.editingChannel.setRpcServicesImpl({
        reloadCanvas: () => {
          throw Error('[BUG] EditorCanvasService is not connected');
        },
        getItemPermissions: () => {
          throw Error('[BUG] EditorCanvasService is not connected');
        },
        selectMedia: () => {
          throw Error('[BUG] MediaService is not connected');
        },
        editSourceCode: () => {
          throw Error('[BUG] EditSourceCodeService is not connected');
        },
        getPageFlows: () => {
          throw Error('[BUG] flowDefinitionsService is not connected');
        },
        getAbTestConfigStatus: () => {
          throw Error('[BUG] flowDefinitionsService is not connected');
        },
        addPhoneNumber: () => {
          throw Error('[BUG] AddPhoneNumberService Not implemented');
        },
        promptSelectPage: () => {
          throw Error('[BUG] PromptSelectPageService is not connected');
        },
        setRenderingParams: () => {
          throw Error('[BUG] InsertInternalLinkService is not connected');
        },
      }),
    );

    this.registerEditingShellServices(globalMessaging);

    contextService.valueChanges$
      .pipe(
        takeWhileAlive(this.lifetime),
        // Skip changes coming from Canvas, as in that case URL is already updated.
        // Notice, we have to take the first change disregarding the source, as that could be e.g. nav in Simulator Canvas.
        filter((c, index) => index === 0 || c.options?.eventSource !== 'CANVAS_BEACON'),
      )
      .subscribe(async ({ options }) => {
        if (options?.preventCanvasReload) {
          return;
        }

        if (this.activePageState.isConnectedToCanvas) {
          await this.editingChannel.syncEmit('canvas:before-unload', { preserveCanvasSelection: false });
        }

        this.canvasPageStateManager.onPageLoadStart();
        this.canvasServices.resetCanvasServicesImpl();

        this.selectChrome(undefined, options?.eventSource);
        this._canvasUrl$.next({
          canvasUrl: this.activePageState.getCanvasUrl(),
        });
      });
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();

    this.canvasPageStateManager.clearStates();

    // Unselect active chrome if we switch to other modes without canvas.
    this.canvasServices.setSelectedChrome({ selection: undefined, eventSource: undefined });
    this.canvasServices.resetCanvasServicesImpl();
  }

  async saveItemChanges(
    change: WorkspaceItemStateUpdate,
    canvasContext: EditingShellContext,
    skipHistoryUpdate: boolean,
  ): Promise<EditingShellSaveResult> {
    if (this.lifetime.isDead) {
      throw Error('[BUG] Should not be called after service is disposed.');
    }

    let result: EditingShellSaveResult = { kind: 'successful', fields: [] };
    try {
      result = await (await this.editingShellRpcClient).save(change, canvasContext, skipHistoryUpdate);
      if (result && result.kind === 'error') {
        const changeToSave = PageState.fromWorkspaceItemState(change);
        console.error('Error appeared in save response. The change: ', changeToSave);
        this._onSaveError$.next({
          context: canvasContext,
          change: changeToSave,
          error: { type: 'response', result },
        });
      }
    } catch {
      const changeToSave = PageState.fromWorkspaceItemState(change);
      console.error('Error appeared while trying to save. The change: ', changeToSave);
      this._onSaveError$.next({
        context: canvasContext,
        change: changeToSave,
        error: { type: 'technical' },
      });
      result = { kind: 'error', errors: [], validationErrors: [], warnings: [] };
    }
    return result;
  }

  async reloadCanvas(chromeToSelect?: BasicChromeInfo, syncWithContext?: boolean) {
    if (this.lifetime.isDead) {
      throw Error('[BUG] Should not be called after service is disposed.');
    }

    if (this.activePageState.isConnectedToCanvas) {
      // Do this before sending event, so in case of concurrency we don't send the signal twice.
      // That also decreases chances of aborted RPCs due to page reload.
      // Consider revising this if there are issue with such an approach.
      this.activePageState.notifyCanvasUnloaded();

      await this.editingChannel.syncEmit('canvas:before-unload', { preserveCanvasSelection: true, chromeToSelect });
    }

    const canvasUrl = syncWithContext
      ? new LoadingCanvasPageState(this.contextService.value, this).getCanvasUrl()
      : this.activePageState.getCanvasUrl();

    this._canvasUrl$.next({
      canvasUrl,
      chromeToSelect,
    });
  }

  async updateCanvasFields(fields: readonly FieldValue[]): Promise<void> {
    if (this.lifetime.isDead) {
      throw Error('[BUG] Should not happen as service is disposed at this moment.');
    }

    await this.editingChannel.rpc.updatePageState({ fields });
  }

  async hookInsertRendering(context: RenderingInitializationContext): Promise<RenderingInitializationContext> {
    if (this.lifetime.isDead) {
      throw Error('[BUG] Should not be called after service is disposed.');
    }

    return await this.commandManager.invoke('pages:editor:rendering:insert', context);
  }

  private registerEditingShellServices(globalMessaging: NgGlobalMessaging) {
    const esEventsReceiver = globalMessaging.getEventReceiver(EditingShellContract);

    esEventsReceiver.on('workspaceItem:state:change', async (update) => await this.updatePageState(update, 'HISTORY'));
    this.lifetime.registerCallbacks(() => esEventsReceiver.disconnect());

    const canvasRpc = globalMessaging.createRpc(EditingCanvasContract, {
      reload: async (syncWithContext?: boolean) => await this.reloadCanvas(undefined, syncWithContext),
    });
    this.lifetime.registerCallbacks(() => canvasRpc.disconnect());
  }

  private watchFieldsUpdates() {
    this.fieldsTrackerService
      .watchInitialItemFieldsState()
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(async (fields) => {
        const contextItem = await this.contextService.getItem();
        const page = {
          id: contextItem.id,
          language: contextItem.language,
          version: contextItem.version,
          revision: contextItem.revision,
        };

        await this.notifyKnownWorkspaceItemState(page, undefined, fields);
      });

    this.fieldsTrackerService
      .watchFieldsValueChange()
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(async (fields) => {
        await this.updatePageState({ fields }, 'DATA-VIEW');
      });

    this.fieldsTrackerService
      .watchEditingMode()
      .pipe(skip(1), takeWhileAlive(this.lifetime))
      .subscribe(async (mode) => {
        this.canvasPageStateManager.switchMode(mode);
      });
  }

  private async updatePageState(update: WorkspaceItemStateUpdate, source: PageUpdateSource) {
    await this.activePageState.updatePage(update, source);
  }

  private async selectChrome(chrome: ChromeInfo | undefined, eventSource?: EventSource) {
    const isAborted = (await this.pageInteractionsGuardService.onBeforeChromeSelectionChange(chrome)).isAborted;
    if (isAborted) {
      return;
    }

    const nextChrome: ChromeSelection | undefined = chrome
      ? {
          chrome,
          messaging: this.createRhsEditorMessagingConnection(chrome.chromeId),
        }
      : undefined;

    if (nextChrome && chrome?.chromeType === 'field' && chrome.parentRenderingChromeInfo) {
      nextChrome.parentChrome = {
        chrome: chrome.parentRenderingChromeInfo,
        messaging: this.createRhsEditorMessagingConnection(chrome.parentRenderingChromeInfo.chromeId),
      };
    }

    this.canvasServices.setSelectedChrome({ selection: nextChrome, eventSource });
  }

  private async removeChrome(chrome: RenderingChromeInfo) {
    const rules = this.canvasServices.getCurrentLayout().getRenderingPersonalizationRules(chrome.renderingInstanceId);
    const abTestFlow = await this.filterFlowForRendering(chrome.renderingInstanceId);

    // In personalization default variant is not considered as a set rule,
    // but all variants are considered as flow variant for AB test.
    if (rules.length <= 1 && !abTestFlow?.variants?.length) {
      await this.canvasServices.getCurrentLayout().removeRendering(chrome.renderingInstanceId);
      return;
    }

    this.promptDeleteRendering(chrome, rules.length - 1, abTestFlow);
  }

  private async promptDeleteRendering(
    chrome: RenderingChromeInfo,
    rulesCount: number,
    abTestFlow?: BXComponentFlowDefinition,
  ) {
    const { component: dialog } = WarningDialogComponent.show(this.dialogService);
    const displayName = chrome.displayName;

    const abTestWarningText = await firstValueFrom(
      this.translateService.get('COMPONENT_TESTING.DELETE_EXPERIMENT_DIALOG.DELETE_WARNING', { displayName }),
    );
    const personalizationRuleWarningText = await firstValueFrom(
      this.translateService.get('EDITOR.RENDERING.DELETE_RENDERING_DESCRIPTION', { rulesCount, displayName }),
    );

    dialog.title = await firstValueFrom(this.translateService.get('EDITOR.RENDERING.DELETE_RENDERING'));
    dialog.text = abTestFlow?.variants?.length ? abTestWarningText : personalizationRuleWarningText;
    dialog.declineText = await firstValueFrom(this.translateService.get('COMMON.CANCEL'));
    dialog.confirmText = await firstValueFrom(this.translateService.get('COMMON.DELETE'));

    const result = await firstValueFrom(dialog.dialogResultEvent);
    if (result.confirmed) {
      if (abTestFlow?.variants?.length) {
        await this.removeAbTestFlowFromRendering(chrome.renderingInstanceId, abTestFlow);
        await this.canvasServices.getCurrentLayout().removeRendering(chrome.renderingInstanceId);
        // To clear RHS
        this.contextService.updateContext({
          variant: undefined,
          itemVersion: this.contextService.itemVersion,
        });

        return;
      }

      await this.canvasServices.getCurrentLayout().removeRendering(chrome.renderingInstanceId);
    }
  }

  private async removeAbTestFlowFromRendering(renderingInstanceId: string, abTestFlow: BXComponentFlowDefinition) {
    abTestFlow = makeFlowNameUnique(abTestFlow);
    abTestFlow.archived = true;

    await this.abTestComponentService.updateComponentFlowDefinition(abTestFlow);
    const refetchFlowsPromise = this.abTestComponentService.refetchFlows(
      this.contextService.itemId,
      this.contextService.language,
    );

    await refetchFlowsPromise;

    await this.personalizationLayoutService.clearPersonalizationForRendering(renderingInstanceId, false, true);
  }

  private createRhsEditorMessagingConnection(chromeId: string): RhsEditorMessagingReconnectable {
    const getMessagingPortFn = (peerId: string): MessagingPort => {
      return {
        postMessage: (msg) => this.editingChannel.emit('chrome:rhs:message', { chromeId: peerId, msg }),
        onMessage: (handler) => {
          const subscription = this.rhsEditorMessages
            .pipe(filter((msg) => msg.chromeId === peerId))
            .subscribe(({ msg }) => handler(msg));

          return () => subscription.unsubscribe();
        },
      };
    };

    const messaging = createVirtualP2PConnection(getMessagingPortFn(chromeId));
    return new RhsEditorMessagingReconnectable(messaging, getMessagingPortFn);
  }

  notifyWorkspaceUpdate(update: WorkspaceItemStateUpdate) {
    if (update.fields?.length) {
      this.fieldsTrackerService.notifyFieldValueChange([...update.fields]);
    }
  }

  notifyFieldsSaved(fields: FieldState[]) {
    this.fieldsTrackerService.notifyFieldsSaved(fields);
  }

  private async onCanvasPageLoad(
    fields: Array<FieldValue & { revision: string }>,
    layout: string,
    layoutDeviceId: string,
  ) {
    // We rely on canvas beacon to have reported current context at this point.
    const canvasContext = { ...this.contextService.value };

    layout = layout ? layout : await this.getPresentationDetails();

    this.canvasPageStateManager.onPageLoad(fields, layout, layoutDeviceId, canvasContext);

    const activePageState = this.activePageState as BoundCanvasPageState;
    this.canvasServices.setCanvasServicesImpl(activePageState);

    const page = {
      id: activePageState.context.itemId,
      language: activePageState.context.language,
      version: activePageState.context.itemVersion,
      revision: await this.getRevision(),
    };

    await this.notifyKnownWorkspaceItemState(page, activePageState.layout.getLayoutSnapshot(), fields);

    // Notify that page state is parsed.
    this._afterParse$.next(undefined);

    // We notify loading End from here, but loading start should be triggered only from editor-workspace.component
    this.editorWorkspaceService.setCanvasLoadState({
      isLoading: false,
      itemId: activePageState.context.itemId,
      language: activePageState.context.language,
    });
  }

  private async notifyKnownWorkspaceItemState(
    page: { id: string; language: string; version: number | undefined; revision: string },
    layout: string | undefined,
    fields: Array<FieldValue & { revision: string }>,
  ) {
    const state: WorkspaceItemState = {
      itemId: page.id,
      language: page.language,
      itemVersion: page.version,
      revision: page.revision,
      layout,
      fields,
    };

    (await this.editingShellRpcClient).notifyKnownWorkspaceItemState(state, {
      itemId: page.id,
      itemVersion: page.version,
      variant: this.contextService.variant,
      language: this.contextService.language,
      siteName: this.contextService.siteName,
    });
  }

  private async reportIsPersonalizationModeToCanvas() {
    const mode = await firstValueFrom(this.personalizationService.isPersonalizationMode$);
    this.messagingService.getEditingCanvasChannel().emit('canvas:set-personalization-mode', {
      isPersonalizationMode: mode,
    });
  }

  private async getPresentationDetails(): Promise<string> {
    const layout = (await this.contextService.getItem()).presentationDetails;
    return layout ? layout : `{ devices: [] }`;
  }

  private async getRevision(): Promise<string> {
    return (await this.contextService.getItem()).revision;
  }

  private async promptSelectPage() {
    const dialogResult = await firstValueFrom(
      this.contentItemDialogService.show({
        id: null,
        language: null,
        site: null,
        showLanguageSelector: false,
        showPagesOnly: true,
      }),
    );
    return { id: dialogResult.id, displayName: dialogResult.displayName };
  }

  private async filterFlowForRendering(renderingInstanceId: string): Promise<BXComponentFlowDefinition | undefined> {
    const abTestFlows = await this.abTestComponentService.getAbTestsConfiguredOnPage(
      this.contextService.itemId,
      this.contextService.language,
    );

    return abTestFlows.find(
      (flow) =>
        flow.status != 'COMPLETED' && flow.friendlyId.includes(normalizeGuidCharactersOnly(renderingInstanceId)),
    );
  }
}
