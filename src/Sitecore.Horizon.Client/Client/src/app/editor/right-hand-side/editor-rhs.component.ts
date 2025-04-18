/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, OnInit } from '@angular/core';
import { EnvironmentFeatureFlagsService } from 'app/feature-flags/environment-feature-flag.service';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { getComponentVariantId } from 'app/pages/left-hand-side/personalization/personalization-api/personalization.api.utils';
import { AbTestComponentService } from 'app/pages/left-hand-side/personalization/personalization-services/ab-test-component.service';

import { PersonalizationService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.service';
import { VariantPublishedStatusService } from 'app/pages/left-hand-side/personalization/personalization-services/variant-published-status.service';
import { BXComponentFlowDefinition } from 'app/pages/left-hand-side/personalization/personalization.types';
import { ContextService } from 'app/shared/client-state/context.service';
import { StaticConfigurationService } from 'app/shared/configuration/static-configuration.service';
import { ChromeInfo, RenderingChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { normalizeGuidCharactersOnly } from 'app/shared/utils/utils';
import { environment } from 'environments/environment';
import { EMPTY, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { EditorWorkspaceService } from '../editor-workspace/editor-workspace.service';
import { CanvasServices, ChromeSelectEvent, ChromeSelection } from '../shared/canvas.services';
import { EditorRhsService } from './editor-rhs.service';
import { isTextFieldType } from './optimize-content/services/utils';
import { RhsContextSdkMessagingService } from './rhs-context.sdk-messaging.service';
import { RhsPositionService } from './rhs-position.service';

export const RHS_DRAG_HANDLE_ELEMENT_ID = 'rhsDragHandleEl';

export interface AbTestInfo {
  rendering: RenderingChromeInfo;
  flowDefinition: BXComponentFlowDefinition;
}
export interface ChromeSelectWithTestInfo extends ChromeSelectEvent {
  abTest?: AbTestInfo;
}

@Component({
  selector: 'app-editor-rhs',
  templateUrl: './editor-rhs.component.html',
  styleUrls: ['./editor-rhs.component.scss'],
  providers: [RhsContextSdkMessagingService],
})
export class EditorRhsComponent implements OnInit {
  selectEvent$: Observable<ChromeSelectWithTestInfo> = EMPTY;
  headerText$: Observable<string> = EMPTY;
  isCkEditorEnabled?: boolean;
  canWrite$: Observable<boolean> = EMPTY;

  isDocked$ = this.rhsPositionService.isDocked$;
  rhsDragHandleEl = RHS_DRAG_HANDLE_ELEMENT_ID;

  isRHSDockFeatureEnabled?: boolean = this.featureFlagsService.isFeatureEnabled('pages_rhs-dock-undock');

  readonly isCanvasLoading$ = this.editorWorkspaceService.watchCanvasLoadState().pipe(map((value) => value.isLoading));

  readonly isPersonalizationMode = (): boolean => this.personalizationService.getIsInPersonalizationMode();
  isContentOptimizationFeatureEnabled = () =>
    this.featureFlagsService.isFeatureEnabled('pages_content-optimization-rhs');

  constructor(
    private readonly contextService: ContextService,
    private readonly rhsService: EditorRhsService,
    private readonly contextSdkMessagingService: RhsContextSdkMessagingService,
    private readonly personalizationService: PersonalizationService,
    private readonly canvasServices: CanvasServices,
    private readonly editorWorkspaceService: EditorWorkspaceService,
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly environmentFeatureFlagsService: EnvironmentFeatureFlagsService,
    private readonly abTestComponentService: AbTestComponentService,
    private readonly variantPublishedStatusService: VariantPublishedStatusService,
    private readonly staticConfigurationService: StaticConfigurationService,
    private readonly rhsPositionService: RhsPositionService,
  ) {}

  async ngOnInit() {
    this.selectEvent$ = this.canvasServices.chromeSelect$.pipe(
      switchMap((chrome) => this.enrichWithAbTestInfo(chrome)),
    );

    const selectionContext$ = this.rhsService.watchSelectionContext();
    this.contextSdkMessagingService.observeContextChanges(selectionContext$);
    this.headerText$ = selectionContext$.pipe(map(({ displayName }) => displayName));

    const isCkEditorFeatureEnabled = this.featureFlagsService.isFeatureEnabled('pages_use-ckeditor');
    const isCkEditorEnableOnTenant =
      await this.environmentFeatureFlagsService.isFeatureEnabled('xmTenant_use-ckeditor');

    this.isCkEditorEnabled =
      isCkEditorFeatureEnabled &&
      (this.staticConfigurationService.isStagingEnvironment || environment.isLocalXM || isCkEditorEnableOnTenant);

    this.canWrite$ = this.rhsService.watchCanWrite();
  }

  dockToggle() {
    this.rhsPositionService.toggleDock();
  }

  showAbTestContext(chromeSelectEvent?: ChromeSelectWithTestInfo): boolean {
    const abTest = chromeSelectEvent?.abTest;
    return (
      chromeSelectEvent?.eventSource === 'AB_TEST_COMPONENT_HANDLER' ||
      this.isFlowActiveOrPending(abTest?.flowDefinition)
    );
  }

  isFieldWithNoRhsControls(chrome?: ChromeInfo) {
    return (
      chrome?.chromeType === 'field' &&
      (chrome?.fieldType === 'single-line text' ||
        chrome?.fieldType === 'multi-line text' ||
        (chrome?.fieldType === 'rich text' && this.isCkEditorEnabled))
    );
  }

  isTextField(chrome?: ChromeInfo) {
    return chrome?.chromeType === 'field' && isTextFieldType(chrome.fieldType);
  }

  isAbTestVariantEditingAllowed(abTest: AbTestInfo) {
    const hasPersonalizationActions = abTest?.rendering.appliedPersonalizationActions.length > 0;
    const controlVariantSelected =
      !this.contextService.variant ||
      // second condition is to support multiple A/B tests on the page
      !abTest?.flowDefinition?.variants?.some((v) => getComponentVariantId(v) === this.contextService.variant);

    return controlVariantSelected || hasPersonalizationActions;
  }

  getRhsNonFieldChrome(chromeSelection?: ChromeSelection): ChromeSelection | undefined {
    if (this.featureFlagsService.isFeatureEnabled('pages_context-panel-field-editing')) {
      return chromeSelection;
    } else {
      return chromeSelection?.chrome.chromeType === 'field' ? chromeSelection?.parentChrome : chromeSelection;
    }
  }

  private async enrichWithAbTestInfo(selectEvent: ChromeSelectEvent): Promise<ChromeSelectWithTestInfo> {
    if (!selectEvent.selection || selectEvent.selection.chrome.chromeType === 'placeholder') {
      return selectEvent;
    }

    const renderingChrome =
      selectEvent.selection.chrome.chromeType === 'rendering'
        ? selectEvent.selection.chrome
        : selectEvent.selection.chrome.parentRenderingChromeInfo;
    if (!renderingChrome) {
      return selectEvent;
    }

    const flowDefinition = await this.getMatchingFlowForRendering(renderingChrome.renderingInstanceId);
    if (!flowDefinition) {
      return selectEvent;
    }

    return {
      ...selectEvent,
      abTest: { rendering: renderingChrome, flowDefinition },
    };
  }

  private async getMatchingFlowForRendering(renderingInstanceId: string) {
    const abTestFlows = await this.abTestComponentService.getAbTestsConfiguredOnPage(
      this.contextService.itemId,
      this.contextService.language,
    );

    const normalizedRenderingInstanceId = normalizeGuidCharactersOnly(renderingInstanceId);

    // First, try to find a flow with active status
    const activeFlow = abTestFlows.find((flow) => {
      const isMatchingFlow = flow.friendlyId.includes(normalizedRenderingInstanceId);
      return isMatchingFlow && flow.status !== 'COMPLETED';
    });

    if (activeFlow) {
      return activeFlow;
    }

    return abTestFlows.find((flow) => {
      const isMatchingFlow = flow.friendlyId.includes(normalizedRenderingInstanceId);
      return isMatchingFlow && this.isFlowActiveOrPending(flow);
    });
  }

  private isFlowActiveOrPending(flow?: BXComponentFlowDefinition): boolean {
    if (!flow) {
      return false;
    }
    const isActiveFlow = flow.status !== 'COMPLETED';
    return isActiveFlow || !this.variantPublishedStatusService.isPagePublished(flow);
  }
}
