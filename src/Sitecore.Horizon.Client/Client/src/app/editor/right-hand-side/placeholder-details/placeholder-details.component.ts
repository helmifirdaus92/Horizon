/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PlaceholderChromeInfo, RenderingChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { Lifetime } from 'app/shared/utils/lifetime';
import { CanvasChannel, CanvasChannelDef } from '../rendering-details/rendering-details.component';
import { RenderingDetailsService } from '../rendering-details/rendering-details.service';
import { RenderingPropertiesSdkMessagingService } from '../rendering-details/rendering-properties.sdk-messaging.service';
import { RhsEditorMessaging } from '../rhs-editor-messaging';
import { PlaceholderPropertiesSdkMessagingService } from './placeholder-properties.sdk-messaging.service';

@Component({
  selector: 'app-placeholder-details',
  template: `
    <ng-spd-accordion>
      <ng-spd-accordion-header>{{ 'RHS.CONTENT_LABEL' | translate }}</ng-spd-accordion-header>
      <ng-spd-accordion-content>
        <h4>{{ 'EDITOR.PLACEHOLDER_DETAILS' | translate }}</h4>
        <hr class="hr mt-sm" />
        <div class="ph-details">
          <span class="header">{{ 'EDITOR.PLACEHOLDER_KEY' | translate }}</span>
          <p
            [attr.title]="!!chrome.placeholderKey && chrome.placeholderKey.length > 25 ? chrome.placeholderKey : null"
            >{{ chrome.placeholderKey }}</p
          >
        </div>

        <app-sitecore-region name="Horizon.PropertiesPanel.SelectedPlaceholderProperties"> </app-sitecore-region>
      </ng-spd-accordion-content>
    </ng-spd-accordion>
    <app-sitecore-region
      *appRecreateOnPropertyChange="chrome?.chromeId"
      name="EditingShell.PropertiesPanel.SelectionDetails"
    ></app-sitecore-region>
  `,
  styleUrls: ['./placeholder-details.component.scss'],
})
export class PlaceholderDetailsComponent implements OnInit, OnDestroy {
  @Input() chrome!: PlaceholderChromeInfo;
  @Input() rhsMessaging!: RhsEditorMessaging;

  private canvasChannelMessaging!: CanvasChannel;

  private readonly lifetime = new Lifetime();

  constructor(
    private readonly renderingPropertiesSdkMessaging: RenderingPropertiesSdkMessagingService,
    private readonly placeholderPropertiesSdkMessaging: PlaceholderPropertiesSdkMessagingService,
    private readonly renderingDetailsService: RenderingDetailsService,
  ) {}

  ngOnInit(): void {
    if (!this.chrome || !this.rhsMessaging) {
      throw Error('Either chrome or messaging is null. Check markup.');
    }

    this.rhsMessaging.onReconnect(async () => {
      this.placeholderPropertiesSdkMessaging.emitReconnectEvent();
      this.renderingPropertiesSdkMessaging.emitReconnectEvent();
    }, this.lifetime);

    this.setupPlaceholderMessaging(this.chrome);

    if (this.chrome.parentRenderingChromeInfo) {
      this.setupMessagingWithParentRendering(this.chrome.parentRenderingChromeInfo);
    }
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();

    // When placeholder is not selected (this component is not active) messaging should reply with a default response,
    // so that to not keep closure on this component we reset implementation.
    this.renderingPropertiesSdkMessaging.resetRpcImpl();
    this.placeholderPropertiesSdkMessaging.resetRpcImpl();
  }

  private setupPlaceholderMessaging(placeholderChromeInfo: PlaceholderChromeInfo) {
    this.placeholderPropertiesSdkMessaging.setRpcImpl({
      getPlaceholderDetails: () => {
        return {
          placeholderKey: placeholderChromeInfo.placeholderKey,
          placeholderName: placeholderChromeInfo.name,
          placeholderDisplayName: placeholderChromeInfo.displayName,
        };
      },
    });
  }

  private setupMessagingWithParentRendering(parentRenderingChromeInfo: RenderingChromeInfo) {
    this.rhsMessaging.changeRemotePeer(parentRenderingChromeInfo.chromeId);
    this.canvasChannelMessaging = this.rhsMessaging.getChannel(CanvasChannelDef);

    this.renderingPropertiesSdkMessaging.setRpcImpl({
      getInlineEditorProtocols: () => parentRenderingChromeInfo.inlineEditorProtocols,
      postInlineEditorMessage: (msg: unknown) => this.canvasChannelMessaging.rpc.postInlineEditorMessage(msg),
      getRenderingDetails: async () =>
        this.renderingDetailsService.getRenderingDetails(parentRenderingChromeInfo.renderingInstanceId),
      setRenderingDetails: async (details, options) =>
        await this.renderingDetailsService.setRenderingDetails(
          parentRenderingChromeInfo.renderingInstanceId,
          details,
          options,
        ),
      getIsInPersonalizationMode: () => false,
    });

    this.canvasChannelMessaging.setRpcServicesImpl({
      postPropertiesEditorMessage: (msg) => this.renderingPropertiesSdkMessaging.emitOnInlineEditorMessageEvent(msg),
    });
  }
}
