/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable, NgZone } from '@angular/core';
import {
  MessagingBroadcastRecipient,
  MessagingP2PChannel,
  MessagingP2PConnection,
  MessagingP2PHostController,
  setupMessagingBroadcastClient,
  setupNotInitializedMessagingPeerToPeerHost,
} from '@sitecore/horizon-messaging';
import { CanvasOriginValidationService } from '../canvas/canvas-origin-validation.service';
import {
  BeaconChannelDef,
  BeaconMessagingChannel,
  ConfigurationChannelDef,
  ConfigurationMessagingChannel,
  DesigningChannelDef,
  DesigningMessagingChannel,
  EditingChannelDef,
  EditingMessagingChannel,
  EditingMetadataChannelDef,
  EditingMetadataMessagingChannel,
  FeatureFlagsChannelDef,
  FeatureFlagsMessagingChannel,
  TranslationChannelDef,
  TranslationMessagingChannel,
} from './horizon-canvas.contract.defs';
import { CANVAS_CONNECTION_CLIENT_ID } from './horizon-canvas.contract.parts';

@Injectable({ providedIn: 'root' })
export class MessagingService {
  private readonly messagingHost: MessagingP2PHostController;
  private readonly initMessagingHost: () => void;

  constructor(
    private readonly zone: NgZone,
    canvasValidator: CanvasOriginValidationService,
  ) {
    ({ hostController: this.messagingHost, init: this.initMessagingHost } = setupNotInitializedMessagingPeerToPeerHost({
      hostName: 'horizon-canvas',
      incomingConnectionsFilter: (connectionRequest) => canvasValidator.reviewConnectionRequest(connectionRequest),
    }));
  }

  init() {
    this.initMessagingHost();
  }

  getEditingCanvasChannel(): EditingMessagingChannel {
    const channel = this.getCanvasConnection().getChannel(EditingChannelDef);
    return this.wrapChannelInZone(channel);
  }

  getBeaconCanvasChannel(): BeaconMessagingChannel {
    const channel = this.getCanvasConnection().getChannel(BeaconChannelDef);
    return this.wrapChannelInZone(channel);
  }

  getDesigningChannel(): DesigningMessagingChannel {
    return this.getCanvasConnection().getChannel(DesigningChannelDef);
  }

  getTranslationChannel(): TranslationMessagingChannel {
    return this.getCanvasConnection().getChannel(TranslationChannelDef);
  }

  getFeatureFlagsChannel(): FeatureFlagsMessagingChannel {
    return this.getCanvasConnection().getChannel(FeatureFlagsChannelDef);
  }

  getConfigurationChannel(): ConfigurationMessagingChannel {
    return this.getCanvasConnection().getChannel(ConfigurationChannelDef);
  }

  getEditinMetadataChannel(): EditingMetadataMessagingChannel {
    return this.getCanvasConnection().getChannel(EditingMetadataChannelDef);
  }

  connectEditingShell(client: 'canvas'): MessagingBroadcastRecipient {
    return setupMessagingBroadcastClient({
      clientId: `horizon-app-${client}`,
      hostWindow: window,
      hostOrigin: '*',
      hostName: 'editing-shell',
    });
  }

  onCanvasDisconnect(handler: () => void) {
    return this.messagingHost.onClientDisconnected((clientId) => {
      if (clientId === CANVAS_CONNECTION_CLIENT_ID) {
        handler();
      }
    });
  }

  private getCanvasConnection(): MessagingP2PConnection {
    if (!this.messagingHost) {
      throw Error('Service is not initialized yet.');
    }

    return this.messagingHost.getClientConnection(CANVAS_CONNECTION_CLIENT_ID);
  }

  /**
   * Invoke event callbacks in Angular zone. Otherwise, it might happen that Angular engine misses UI updates.
   */
  private wrapChannelInZone<TInboundEvents, TOutboundEventes, TRemoteRpc, TProvidedRpc>(
    channel: MessagingP2PChannel<TInboundEvents, TOutboundEventes, TRemoteRpc, TProvidedRpc>,
  ): MessagingP2PChannel<TInboundEvents, TOutboundEventes, TRemoteRpc, TProvidedRpc> {
    // Is not required for RPC, as those API creates Promises, which are automatically captured by Zone.js.
    return {
      emit: channel.emit,
      syncEmit: channel.syncEmit,
      on: (name, handler) => channel.on(name, (...args) => this.zone.runGuarded(() => handler(...args))),
      rpc: channel.rpc,
      setRpcServicesImpl: (impl) => channel.setRpcServicesImpl(impl),
    };
  }
}
