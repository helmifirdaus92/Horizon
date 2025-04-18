/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable, OnDestroy } from '@angular/core';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { MessagingEventsEmitterChannel } from '@sitecore/page-composer-sdk';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { CanvasServices } from 'app/editor/shared/canvas.services';
import { HistoryService } from 'app/editor/shared/history/history.service';
import { PageState } from 'app/editor/shared/history/page-state';
import { SaveResult } from 'app/editor/shared/save/save.interfaces';
import { SaveService } from 'app/editor/shared/save/save.service';
import { PersonalizationService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.service';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  EditingShellContext,
  EditingShellContract,
  EditingShellEvents,
  EditingShellSaveResult,
  FieldState,
  RenderingInfo,
  SaveOptions,
  WorkspaceItemState,
  WorkspaceItemStateUpdate,
} from 'sdk';
import { ContextService } from '../client-state/context.service';
import { DeviceService } from '../client-state/device.service';
import { ItemChangeService } from '../client-state/item-change-service';
import { ConfigurationService } from '../configuration/configuration.service';
import { LayoutKind } from '../graphql/item.interface';
import { EditingMessagingChannel } from '../messaging/horizon-canvas.contract.defs';
import { MessagingService } from '../messaging/messaging.service';
import { Lifetime, takeWhileAlive } from '../utils/lifetime';
import { normalizeGuid } from '../utils/utils';

@Injectable({ providedIn: 'root' })
export class EditingShellHostService implements OnDestroy {
  private readonly lifetime = new Lifetime();

  private readonly emitter: MessagingEventsEmitterChannel<EditingShellEvents>;

  private readonly editingChannel: EditingMessagingChannel;

  constructor(
    private readonly contextService: ContextService,
    private readonly deviceService: DeviceService,
    private readonly historyService: HistoryService,
    private readonly saveService: SaveService,
    private readonly itemChangeService: ItemChangeService,
    private readonly globalMessaging: NgGlobalMessaging,
    private readonly configurationService: ConfigurationService,
    private readonly personalizationService: PersonalizationService,
    private readonly messagingService: MessagingService,
    private readonly canvasServices: CanvasServices,
    private readonly authenticationService: AuthenticationService,
  ) {
    this.editingChannel = this.messagingService.getEditingCanvasChannel();

    this.emitter = this.globalMessaging.createEventEmitter(EditingShellContract);

    let previousPageIsPersonalized: { itemId: string; itemVersion: number; language: string } | null = null;

    // Synchronize context and history
    contextService.value$
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(({ itemId, itemVersion, language, variant: variant }) => {
        // Clear all the history for all the versions WHEN select a personalized variant
        if (this.personalizationService.getIsInPersonalizationMode()) {
          this.historyService.clear(itemId, itemVersion!, language);
        }

        // Clear all history for the previous page IF it was a personalized variant.
        // Do it in order to prevent issues if we start supporting switching to a personalized variant programmatically or from LHS tree/site-language switcher
        if (previousPageIsPersonalized) {
          this.historyService.clear(
            previousPageIsPersonalized.itemId,
            previousPageIsPersonalized.itemVersion,
            previousPageIsPersonalized.language,
          );
        }

        previousPageIsPersonalized = this.personalizationService.getIsInPersonalizationMode()
          ? { itemId, itemVersion: itemVersion!, language }
          : null;

        this.historyService.setContext(itemId, itemVersion!, variant, language);
      });
  }

  init() {
    this.contextService.value$
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe((ctx) => this.emitter.emit('context:change', ctx));
    this.deviceService.active$
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe((device) => this.emitter.emit('device:change', device));
    this.itemChangeService
      .watchForChanges()
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(({ itemId, scopes }) => this.emitter.emit('item:modify', { itemId, scopes }));
    this.personalizationService.isPersonalizationMode$
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe((personalizationMode) => this.emitter.emit('isPersonalizationMode:change', personalizationMode));

    /*
     * A messaging rpc might be triggered from outside an angular zone.
     * Running functions via run allows you to reenter Angular zone
     * from a task that was executed outside of the Angular zone.
     */
    this.globalMessaging.createRpc(EditingShellContract, {
      getAuthenticationBearerToken: async () => await this.authenticationService.getBearerToken(),
      updateContext: (ctxUpdate) => this.contextService.updateContext(this.normalizeContext(ctxUpdate)),
      getContext: () => this.contextService.value,
      getStaticConfiguration: () => ({ platformUrl: ConfigurationService.xmCloudTenant?.url || '' }),
      getLocalizationInfo: () => ({ clientLanguage: this.configurationService.clientLanguage }),
      getXmCloudTenantInfo: () => ConfigurationService.xmCloudTenant,
      save: async (updateToSave, context, skipHistory) =>
        await this.save(this.normalizeStateUpdate(updateToSave), this.normalizeContext(context), skipHistory),
      notifyKnownWorkspaceItemState: (state, context) =>
        this.notifyKnownWorkspaceItemHistoryState(this.normalizeState(state), this.normalizeContext(context)),
      getDevice: () => ({
        id: this.deviceService.active.id,
        name: this.deviceService.active.name,
        width: this.deviceService.active.width,
      }),
      notifyItemModified: ({ itemId, scopes }) => this.itemChangeService.notifyChange(normalizeGuid(itemId), scopes),
      selectChrome: (id: string, chromeType: 'placeholder' | 'rendering' | 'field') =>
        this.editingChannel.emit('chrome:select', { id, chromeType }),
      highlightChrome: (id: string, chromeType: 'placeholder' | 'rendering' | 'field') =>
        this.editingChannel.emit('chrome:highlight', { id, chromeType }),
      deleteRendering: async (renderingInstanceId, options: SaveOptions) =>
        await this.canvasServices
          .getCurrentLayout()
          .removeRendering(renderingInstanceId, options.skipHistory, options.updateCanvas),
      getChildRenderings: async (renderingInstanceId) => await this.getChildRenderingsInfos(renderingInstanceId),
    });
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
  }

  private async save(
    update: WorkspaceItemStateUpdate,
    context: EditingShellContext,
    skipHistory: boolean,
  ): Promise<EditingShellSaveResult> {
    const pageStateUpdate = PageState.fromWorkspaceItemState(update);

    const currentContext = this.contextService.value;
    if (
      context.itemId !== currentContext.itemId ||
      context.itemVersion !== currentContext.itemVersion ||
      context.language !== currentContext.language ||
      context.siteName !== currentContext.siteName ||
      context.variant !== currentContext.variant
    ) {
      throw Error('Context has been already changed. You cannot save to non-current context ATM.');
    }

    if (!skipHistory) {
      // Notice, here we use addState() API instead of addFieldUpdate() on purpose.
      // That's to support multiple fields being updated in a one go and to not fail if history for current page
      // has not been initialized beforehand.
      this.historyService.addState(pageStateUpdate);
    }
    const layoutEditingKind = await this.getLayoutEditingKind();

    return await firstValueFrom(
      this.saveService.savePage(pageStateUpdate, context, layoutEditingKind).pipe(
        map<SaveResult, EditingShellSaveResult>((response) => {
          if (response.errors.length || response.validationErrors.length) {
            return {
              kind: 'error',
              warnings: response.warnings,
              errors: response.errors,
              validationErrors: response.validationErrors,
            };
          }

          const fields: FieldState[] = [];
          response.savedItems.forEach((item) => {
            item.fields.forEach((field) => {
              fields.push({
                fieldId: field.id,
                itemId: item.id,
                itemVersion: item.version,
                reset: field.reset,
                value: { rawValue: field.value },
              });
            });
          });

          return { kind: 'successful', fields };
        }),
      ),
    );
  }

  private async notifyKnownWorkspaceItemHistoryState(
    state: WorkspaceItemState,
    providedContext: EditingShellContext,
  ): Promise<void> {
    const currentContextItem = await this.contextService.getItem();
    const currentContext = this.contextService.value;
    if (
      providedContext.itemId !== currentContextItem.id ||
      providedContext.itemVersion !== currentContextItem.version ||
      providedContext.language !== currentContext.language ||
      providedContext.siteName !== currentContext.siteName ||
      providedContext.variant !== currentContext.variant
    ) {
      throw Error('Current context does not correspond to passed context. Ensure to set context before.');
    }

    const pageState = PageState.fromWorkspaceItemState(state);
    this.historyService.addState(pageState);

    this.saveService.updateWorkspaceItemState(state);
  }

  public async undo(): Promise<void> {
    const state = this.historyService.undo();
    if (state) {
      await this.emitter.syncEmit('workspaceItem:state:change', state);
    }
  }

  public async redo(): Promise<void> {
    const state = this.historyService.redo();
    if (state) {
      await this.emitter.syncEmit('workspaceItem:state:change', state);
    }
  }

  private normalizeContext<T extends Partial<EditingShellContext>>(context: T): T {
    return {
      ...context,
      itemId: context.itemId ? normalizeGuid(context.itemId) : undefined,
    };
  }

  private normalizeState(state: WorkspaceItemState): WorkspaceItemState {
    return {
      ...state,
      fields: state.fields.map((f) => ({
        ...f,
        fieldId: normalizeGuid(f.fieldId),
        itemId: normalizeGuid(f.itemId),
      })),
    };
  }

  private normalizeStateUpdate(state: WorkspaceItemStateUpdate): WorkspaceItemStateUpdate {
    return {
      ...state,
      fields: state.fields?.map((f) => ({
        ...f,
        fieldId: normalizeGuid(f.fieldId),
        itemId: normalizeGuid(f.itemId),
      })),
    };
  }

  private async getLayoutEditingKind(): Promise<LayoutKind> {
    const layoutKind = (await this.contextService.getItem()).layoutEditingKind;
    return layoutKind ?? 'FINAL';
  }

  private async getChildRenderingsInfos(renderingInstanceId: string): Promise<RenderingInfo[]> {
    const childRenderings = (await this.editingChannel.rpc.getChildRenderings(renderingInstanceId)).map((chrome) => {
      return {
        displayName: chrome.displayName,
        renderingInstanceId: chrome.renderingInstanceId,
        renderingDefinitionId: chrome.renderingDefinitionId,
        inlineEditorProtocols: chrome.inlineEditorProtocols,
        parentPlaceholderKey: chrome.parentPlaceholderChromeInfo.placeholderKey,
      };
    });

    return childRenderings;
  }
}
