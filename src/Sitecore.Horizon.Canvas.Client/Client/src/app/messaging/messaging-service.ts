/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingP2PConnection, setupMessagingPeerToPeerClient } from '@sitecore/horizon-messaging';
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
import { BeaconState, CANVAS_CONNECTION_CLIENT_ID, EditingCanvasRpcServices } from './horizon-canvas.contract.parts';

export class MessagingService {
  private readonly beaconChannel: BeaconMessagingChannel;
  readonly editingChannel: EditingMessagingChannel;
  readonly designingChannel: DesigningMessagingChannel;
  readonly translationChannel: TranslationMessagingChannel;
  readonly featureFlagsMessagingChannel: FeatureFlagsMessagingChannel;
  readonly configurationMessagingChannel: ConfigurationMessagingChannel;
  readonly editingMetadataMessagingChannel: EditingMetadataMessagingChannel;

  private editingChannelRpcServices: EditingCanvasRpcServices = {
    updatePageState: () => {
      throw Error('[CANVAS BUG] Service implementation is not provided.');
    },
    selectChrome: () => {
      throw Error('[CANVAS BUG] Service implementation is not provided.');
    },
    deselectChrome: () => {
      throw Error('[CANVAS BUG] Service implementation is not provided.');
    },
    highlightPartialDesign: () => {
      throw Error('[CANVAS BUG] Service implementation is not provided.');
    },
    unhighlightPartialDesign: () => {
      throw Error('[CANVAS BUG] Service implementation is not provided.');
    },
    getChildRenderings: () => {
      throw Error('[CANVAS BUG] Service implementation is not provided.');
    },
    getChildPlaceholders: () => {
      throw Error('[CANVAS BUG] Service implementation is not provided.');
    },
    selectRendering: () => {
      throw Error('[CANVAS BUG] Service implementation is not provided.');
    },
    getRenderingFields: () => {
      throw Error('[CANVAS BUG] Service implementation is not provided.');
    },
    getPageFields: () => {
      throw Error('[CANVAS BUG] Service implementation is not provided.');
    },
  };

  constructor(hostConnection: MessagingP2PConnection) {
    this.editingChannel = hostConnection.getChannel(EditingChannelDef);
    this.beaconChannel = hostConnection.getChannel(BeaconChannelDef);
    this.designingChannel = hostConnection.getChannel(DesigningChannelDef);
    this.translationChannel = hostConnection.getChannel(TranslationChannelDef);
    this.featureFlagsMessagingChannel = hostConnection.getChannel(FeatureFlagsChannelDef);
    this.configurationMessagingChannel = hostConnection.getChannel(ConfigurationChannelDef);
    this.editingMetadataMessagingChannel = hostConnection.getChannel(EditingMetadataChannelDef);

    this.editingChannel.setRpcServicesImpl(this.editingChannelRpcServices);
  }

  static connectToParentWindow(hostVerificationToken: string) {
    const hostConnection = setupMessagingPeerToPeerClient({
      clientId: CANVAS_CONNECTION_CLIENT_ID,
      hostWindow: window.parent,
      hostOrigin: '*',
      hostName: 'horizon-canvas',
      extras: { HOST_VERIFICATION_TOKEN: hostVerificationToken },
    });
    return new MessagingService(hostConnection);
  }

  setEditingChannelRpcServices(update: Partial<EditingCanvasRpcServices>): void {
    this.editingChannelRpcServices = { ...this.editingChannelRpcServices, ...update };
    this.editingChannel.setRpcServicesImpl(this.editingChannelRpcServices);
  }

  postBeacon(beacon: BeaconState) {
    this.beaconChannel.emit('state', beacon);
  }
}
