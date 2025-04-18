/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CanvasPageStateManager } from 'app/editor/canvas-page/canvas-page-state-manager';
import { Context, ContextChangeOptions, ContextService } from 'app/shared/client-state/context.service';
import { PageInteractionsGuardService } from 'app/shared/client-state/page-interactions-guard.service';
import { EditingMessagingChannel } from 'app/shared/messaging/horizon-canvas.contract.defs';
import { ChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { runInNextMacrotask } from 'app/shared/utils/utils';
import { firstValueFrom } from 'rxjs';
import { panelAnimations } from '../../rhs-slide-in-panel.animations';
import { OptimizationDecisionType } from '../optimization-confirmation-dialog/optimization-confirmation-dialog.component';
import { OptimizationConfirmationDialogService } from '../optimization-confirmation-dialog/optimization-confirmation-dialog.service';
import { OptimizeContentPromptComponent } from '../optimize-content-prompt/optimize-content-prompt.component';
import { isFieldChromeInfo, isRenderingChromeInfo, isTextFieldType } from '../services/utils';
import { OptimizeContentPanelService } from './optimize-content-panel.service';

@Component({
  selector: 'app-optimize-content-panel',
  templateUrl: './optimize-content-panel.component.html',
  styleUrls: ['./optimize-content-panel.component.scss'],
  animations: panelAnimations,
})
export class OptimizeContentPanelComponent implements OnInit, OnDestroy {
  private renderingInstanceId?: string;
  private renderingChromeId?: string;

  @Input() chrome: ChromeInfo | undefined;
  @ViewChild(OptimizeContentPromptComponent) promptComponent!: OptimizeContentPromptComponent;

  get parentDisplayName(): string | null {
    if (this.chrome?.chromeType === 'field') {
      return this.chrome.parentRenderingChromeInfo?.displayName || null;
    }
    return null;
  }

  isOpen = false;

  private readonly lifetime = new Lifetime();
  private readonly editingChannel: EditingMessagingChannel;

  constructor(
    private readonly optimizeContentPanelService: OptimizeContentPanelService,
    private readonly optimizationConfirmationDialogService: OptimizationConfirmationDialogService,
    private readonly canvasStateManager: CanvasPageStateManager,
    private readonly contextService: ContextService,
    private readonly pageInteractionsGuardService: PageInteractionsGuardService,
    private readonly messagingService: MessagingService,
  ) {
    this.editingChannel = this.messagingService.getEditingCanvasChannel();
  }

  ngOnInit(): void {
    this.optimizeContentPanelService.panelState$.pipe(takeWhileAlive(this.lifetime)).subscribe((state) => {
      this.isOpen = state;
      if (this.isOpen) {
        if (!this.renderingInstanceId) {
          if (isFieldChromeInfo(this.chrome)) {
            this.renderingInstanceId = this.chrome?.parentRenderingChromeInfo?.renderingInstanceId;
            this.renderingChromeId = this.chrome?.parentRenderingChromeInfo?.chromeId;
          } else if (isRenderingChromeInfo(this.chrome)) {
            this.renderingInstanceId = this.chrome?.renderingInstanceId;
            this.renderingChromeId = this.chrome?.chromeId;
          }
        }

        this.pageInteractionsGuardService.injectGuard(
          (update, options) => this.onBeforeContextChange(update, options),
          (chrome) => this.onBeforeChromeSelectionChange(chrome),
        );
      } else {
        this.renderingInstanceId = undefined;
        this.renderingChromeId = undefined;
        this.pageInteractionsGuardService.releaseGuard();
      }
    });
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
  }

  getChromeDisplayName(): string {
    if (this.chrome?.chromeType === 'field' && isTextFieldType(this.chrome.fieldType)) {
      return this.chrome.displayName;
    }

    if (this.chrome?.chromeType === 'field' && !isTextFieldType(this.chrome.fieldType)) {
      return this.chrome?.parentRenderingChromeInfo?.displayName ?? '';
    }

    if (this.chrome?.chromeType === 'rendering') {
      return this.chrome.displayName;
    }

    return '';
  }

  async onClosePanel() {
    const action = await this.promptUserToClosePanel();
    if (action === 'cancel') {
      return;
    }

    this.optimizeContentPanelService.closePanel();
  }

  private async promptUserToClosePanel(): Promise<OptimizationDecisionType | null> {
    if (!this.canvasStateManager.hasPendingChanges()) {
      return null;
    }

    const action = await firstValueFrom(
      this.optimizationConfirmationDialogService.show().pipe(takeWhileAlive(this.lifetime)),
    );

    if (action === 'keep') {
      await this.canvasStateManager.KeepDraftChanges();
    } else if (action === 'discard') {
      this.canvasStateManager.discardDraftChanges(true);
    }

    if (action === 'keep' || action === 'discard') {
      this.optimizeContentPanelService.closePanel();
    }

    return action;
  }

  private async onBeforeContextChange(
    update: Partial<Context>,
    options: ContextChangeOptions,
  ): Promise<{ update: Partial<Context>; options: ContextChangeOptions }> {
    const action = await this.promptUserToClosePanel();
    if (action === 'cancel') {
      // context change will set persistent history instance
      // need to set proper history instance corresponding to currently selected mode
      runInNextMacrotask(() => this.promptComponent.setMode(this.promptComponent.editingMode))();

      const previousContext = { ...this.contextService.value };
      return { update: previousContext, options: { preventCanvasReload: true, forceEmitSameValue: true } };
    }
    return { update, options };
  }

  private async onBeforeChromeSelectionChange(chrome: ChromeInfo | undefined) {
    if (!this.renderingChromeId) {
      return { isAborted: false };
    }

    const selectionWithinRendering = chrome && chrome.chromeId.startsWith(this.renderingChromeId);
    if (selectionWithinRendering) {
      return { isAborted: false };
    }

    const action = await this.promptUserToClosePanel();
    if (action === 'cancel') {
      runInNextMacrotask(() => this.selectCurrentChrome())();
      return { isAborted: true };
    }

    if (action === null) {
      this.optimizeContentPanelService.closePanel();
    }

    return { isAborted: false };
  }

  private selectCurrentChrome() {
    if (!this.renderingInstanceId) {
      console.warn('Cannot select current chrome, renderingInstanceId is not set');
      return;
    }
    this.editingChannel.emit('chrome:select', {
      id: this.renderingInstanceId,
      chromeType: 'rendering',
      shouldScrollIntoView: true,
    });
  }
}
