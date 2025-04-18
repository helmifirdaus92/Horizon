/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input, OnInit } from '@angular/core';
import {
  PersonalizationLayoutService,
  PersonlizedRenderingInfo,
} from 'app/pages/left-hand-side/personalization/personalization-services/personalization.layout.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { RenderingChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { EMPTY, Observable } from 'rxjs';
import { RenderingInitializationContext, RenderingInitializationDetails } from 'sdk';
import { EditorRhsService } from '../../editor-rhs.service';
import { RhsEditorMessaging } from '../../rhs-editor-messaging';
import { panelAnimations } from '../../rhs-slide-in-panel.animations';

@Component({
  selector: 'app-rendering-details-personalized',
  templateUrl: './rendering-details-personalized.component.html',
  styleUrls: ['./rendering-details-personalized.component.scss'],
  animations: panelAnimations,
})
export class RenderingDetailsPersonalizedComponent implements OnInit {
  @Input() chrome!: RenderingChromeInfo;
  @Input() rhsMessaging!: RhsEditorMessaging;
  @Input() displayName: string | null = null;
  @Input() isRenderingHidden = false;

  isPersonalizationMode = false;
  showSlidePanel = false;
  showComponentList = false;
  canWrite$: Observable<boolean> = EMPTY;

  constructor(
    private readonly rhsService: EditorRhsService,
    private readonly personalizationLayoutService: PersonalizationLayoutService,
    private readonly contextService: ContextService,
  ) {}

  async ngOnInit() {
    this.canWrite$ = this.rhsService.watchCanWrite();
  }

  async replaceRendering(renderingId: string) {
    if (!this.contextService.variant) {
      return;
    }
    const renderingDetailsDraft: RenderingInitializationDetails = {
      renderingId,
      instanceId: this.chrome.renderingInstanceId,
      placeholderKey: this.chrome.parentPlaceholderChromeInfo.placeholderKey,
      parameters: {},
      dataSource: null,
    };
    const context = {
      renderingDetails: renderingDetailsDraft,
      cancelRenderingInsert: false,
    };

    const insertRenderingDetails: RenderingInitializationContext =
      await this.personalizationLayoutService.invokeInsertRenderingAction(context);

    const renderingRulesUpdate: PersonlizedRenderingInfo = {
      renderingId,
      dataSource: null,
      renderingParameters: insertRenderingDetails?.renderingDetails.parameters,
    };

    await this.personalizationLayoutService.addRenderingDetailsPersonalizationRule(
      this.chrome.renderingInstanceId,
      this.contextService.variant,
      renderingRulesUpdate,
    );
  }

  async toggleHideRendering(): Promise<void> {
    if (this.isRenderingHidden) {
      await this.personalizationLayoutService.removeHideRenderingPersonalizationRule(
        this.chrome.renderingInstanceId,
        this.contextService.variant,
      );
    } else {
      await this.personalizationLayoutService.addHideRenderingPersonalizationRule(
        this.chrome.renderingInstanceId,
        this.contextService.variant,
      );
    }
  }

  async resetPersonalization(): Promise<void> {
    await this.personalizationLayoutService.removePersonalizationRuleFromRendering(
      this.chrome.renderingInstanceId,
      this.contextService.variant,
    );
  }

  isActionRequired() {
    return this.chrome.appliedPersonalizationActions.length === 0 && this.contextService.variant;
  }
}
