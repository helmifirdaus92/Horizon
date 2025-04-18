/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MessagingP2PChannel, MessagingP2PChannelDefFromChannel } from '@sitecore/horizon-messaging';
import { isFormWrapperRendering } from 'app/editor/designing/forms-components-gallery/form-wrapper-filter';
import { PageDataViewComponent } from 'app/editor/lhs-panel/data-view/page-data-view/page-data-view.component';
import { LhsPanelComponent } from 'app/editor/lhs-panel/lhs-panel.component';
import { CanvasServices } from 'app/editor/shared/canvas.services';
import { PersonalizationService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { StaticConfigurationService } from 'app/shared/configuration/static-configuration.service';
import { RenderingChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { Lifetime } from 'app/shared/utils/lifetime';
import { getExplorerAppUrl } from 'app/shared/utils/utils';
import { AbTestInfo } from '../editor-rhs.component';
import { isFeaasRendering } from '../feaas-rhs-region/feaas-extension-filter';
import { isLayoutContainerRendering } from '../layout-container-details/layout-container-filter';
import { OptimizeContentPanelService } from '../optimize-content/optimize-content-panel/optimize-content-panel.service';
import { RhsEditorMessaging } from '../rhs-editor-messaging';
import { panelAnimations } from '../rhs-slide-in-panel.animations';
import { CreateExperimentDialogService } from '../test-component/create-experiment-dialog/create-experiment-dialog.service';
import { RenderingDetailsService, TabMode } from './rendering-details.service';
import { RenderingFieldsService } from './rendering-fields.service';
import { RenderingPropertiesSdkMessagingService } from './rendering-properties.sdk-messaging.service';

export interface FieldChromeData {
  fieldValues: Array<{ fieldType: string; fieldId: string; fieldName: string; textValue: string }>;
}

export interface RenderingContextData {
  itemId: string;
  language: string;
  renderingInstanceId: string;
  renderingDisplayName: string;
  renderingDefinitionId: string;
}

export type CanvasChannel = MessagingP2PChannel<
  // Inbound events
  {
    'sort:move': 'up' | 'down';
    editContentItem: 'edit';
    openItemInExplorer: 'open';
    promptCreateAbTestComponent: 'start';
    openOptimizeContent: void;
  },
  // Outbound events
  {},
  // Remote RPC services
  {
    postInlineEditorMessage(msg: unknown): void;
  },
  // Provided RPC services
  {
    postPropertiesEditorMessage(msg: unknown): void;
  }
>;

export const CanvasChannelDef: MessagingP2PChannelDefFromChannel<CanvasChannel> = {
  name: 'general',
};
@Component({
  selector: 'app-rendering-details',
  templateUrl: './rendering-details.component.html',
  styleUrls: ['./rendering-details.component.scss'],
  animations: panelAnimations,
})
export class RenderingDetailsComponent implements OnInit, OnDestroy {
  private canvasChannelMessaging!: CanvasChannel;
  private readonly lifetime = new Lifetime();

  private _chrome!: RenderingChromeInfo;
  @Input() set chrome(value: RenderingChromeInfo) {
    if (!value) {
      return;
    }
    this.isHideRenderingActionApplied = value.appliedPersonalizationActions.includes('HideRenderingAction');
    this.isFeaas = isFeaasRendering(value);
    this.isForm = isFormWrapperRendering(value);
    this.isLayoutContainer = isLayoutContainerRendering(value);

    this._chrome = value;
  }
  get chrome(): RenderingChromeInfo {
    return this._chrome;
  }
  @Input() abTest?: AbTestInfo;
  @Input() rhsMessaging!: RhsEditorMessaging;
  @Input() displayName: string | null = null;

  mode: TabMode = 'design';
  isHideRenderingActionApplied = false;
  isFeaas = false;
  isForm = false;
  isLayoutContainer = false;

  hasTextFields = false;

  isPersonalizationMode = (): boolean => this.personalizationService.getIsInPersonalizationMode();

  constructor(
    private readonly personalizationService: PersonalizationService,
    private readonly rhsPageComposerMessaging: RenderingPropertiesSdkMessagingService,
    private readonly canvasServices: CanvasServices,
    private readonly contextService: ContextService,
    private readonly renderingDetailsService: RenderingDetailsService,
    private readonly staticConfigurationService: StaticConfigurationService,
    private readonly createExperimentDialogService: CreateExperimentDialogService,
    private readonly renderingFieldsService: RenderingFieldsService,
    private readonly optimizeContentPanelService: OptimizeContentPanelService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.mode = this.renderingDetailsService.mode || 'design';
    if (!this.chrome || !this.rhsMessaging) {
      throw Error('Either chrome or messaging is null. Check markup.');
    }

    this.canvasChannelMessaging = this.rhsMessaging.getChannel(CanvasChannelDef);

    // Bind region messaging
    this.rhsPageComposerMessaging.setRpcImpl({
      getInlineEditorProtocols: () => this.chrome.inlineEditorProtocols,
      postInlineEditorMessage: (msg: unknown) => this.canvasChannelMessaging.rpc.postInlineEditorMessage(msg),
      getRenderingDetails: async () =>
        this.renderingDetailsService.getRenderingDetails(this.chrome.renderingInstanceId),
      setRenderingDetails: async (details, options) =>
        await this.renderingDetailsService.setRenderingDetails(this.chrome.renderingInstanceId, details, options),
      getIsInPersonalizationMode: () => false,
    });

    this.canvasChannelMessaging.setRpcServicesImpl({
      postPropertiesEditorMessage: (msg) => this.rhsPageComposerMessaging.emitOnInlineEditorMessageEvent(msg),
    });

    this.canvasChannelMessaging.on('sort:move', this.move.bind(this));
    this.canvasChannelMessaging.on('openItemInExplorer', this.openItemInExplorer.bind(this));
    this.canvasChannelMessaging.on('promptCreateAbTestComponent', this.promptCreateAbTestComponent.bind(this));
    this.canvasChannelMessaging.on('openOptimizeContent', () => this.openOptimizeContent());

    this.hasTextFields = (await this.renderingFieldsService.fetchTextRenderingFields(this.chrome)).length > 0;
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
    this.renderingDetailsService.mode = this.mode;

    // When rendering is not selected (this component is not active) messaging should reply with a default response,
    // so that to not keep closure on this component we reset implementation.
    this.rhsPageComposerMessaging.resetRpcImpl();
  }

  openPageContent() {
    LhsPanelComponent.show(PageDataViewComponent);
    LhsPanelComponent.HasExpand = true;
  }

  private async promptCreateAbTestComponent(): Promise<void> {
    await this.createExperimentDialogService.promptCreateAbTestComponent(this.chrome);
  }

  private async openOptimizeContent() {
    this.optimizeContentPanelService.openPanel();
  }

  private move(direction: 'up' | 'down'): void {
    this.canvasServices
      .getCurrentLayout()
      .moveRenderingWithinSamePlaceholder(this.chrome.renderingInstanceId, direction);
  }

  private openItemInExplorer(): void {
    const baseUrl = this.staticConfigurationService.explorerAppBaseUrl;

    let explorerUrl = '';

    if (this.canvasServices.getCurrentLayout().getRendering(this.chrome.renderingInstanceId).dataSource) {
      explorerUrl = getExplorerAppUrl(
        baseUrl,
        this.contextService.siteName,
        this.chrome.contextItem.language,
        this.chrome.contextItem.id,
        this.chrome.contextItem.version,
      );
    } else {
      explorerUrl = getExplorerAppUrl(
        baseUrl,
        this.contextService.siteName,
        this.contextService.language,
        this.contextService.itemId,
        this.chrome.contextItem.version,
      );
    }

    window.open(explorerUrl);
  }

  isContentOptimizationAllowed(): boolean {
    return this.chrome.appliedPersonalizationActions?.includes('SetDataSourceAction') || !this.contextService.variant;
  }
}
