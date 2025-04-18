/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingP2PChannel, MessagingP2PChannelDefFromChannel } from '@sitecore/horizon-messaging';
import {
  BeaconCanvasEvents,
  BeaconCanvasRpcServices,
  BeaconChannelName,
  BeaconHorizonEvents,
  BeaconHorizonRpcServices,
  ConfigurationCanvasEvents,
  ConfigurationCanvasRpcServices,
  ConfigurationChannelName,
  ConfigurationHorizonEvents,
  ConfigurationHorizonRpcServices,
  DesigningCanvasEvents,
  DesigningCanvasRpcServices,
  DesigningChannelName,
  DesigningHorizonEvents,
  DesigningHorizonRpcServices,
  EditingCanvasEvents,
  EditingCanvasRpcServices,
  EditingChannelName,
  EditingHorizonEvents,
  EditingHorizonRpcServices,
  EditingMetadataCanvasEvents,
  EditingMetadataCanvasRpcServices,
  EditingMetadataChannelName,
  EditingMetadataHorizonEvents,
  EditingMetadataHorizonRpcServices,
  FeatureFlagsCanvasEvents,
  FeatureFlagsCanvasRpcServices,
  FeatureFlagsChannelName,
  FeatureFlagsHorizonEvents,
  FeatureFlagsHorizonRpcServices,
  TranslationCanvasEvents,
  TranslationCanvasRpcServices,
  TranslationChannelName,
  TranslationHorizonEvents,
  TranslationHorizonRpcServices,
} from './horizon-canvas.contract.parts';

// *************** BEACON CHANNEL ***************
export type BeaconMessagingChannel = MessagingP2PChannel<
  BeaconCanvasEvents,
  BeaconHorizonEvents,
  BeaconCanvasRpcServices,
  BeaconHorizonRpcServices
>;

export const BeaconChannelDef: MessagingP2PChannelDefFromChannel<BeaconMessagingChannel> = {
  name: BeaconChannelName,
};

// *************** EDITING CHANNEL ***************

export type EditingMessagingChannel = MessagingP2PChannel<
  EditingCanvasEvents,
  EditingHorizonEvents,
  EditingCanvasRpcServices,
  EditingHorizonRpcServices
>;

export const EditingChannelDef: MessagingP2PChannelDefFromChannel<EditingMessagingChannel> = {
  name: EditingChannelName,
};

// *************** DESIGNING CHANNEL ***************

export type DesigningMessagingChannel = MessagingP2PChannel<
  DesigningCanvasEvents,
  DesigningHorizonEvents,
  DesigningCanvasRpcServices,
  DesigningHorizonRpcServices
>;

export const DesigningChannelDef: MessagingP2PChannelDefFromChannel<DesigningMessagingChannel> = {
  name: DesigningChannelName,
};

// *************** TRANSLATIONS CHANNEL ***************

export type TranslationMessagingChannel = MessagingP2PChannel<
  TranslationHorizonEvents,
  TranslationCanvasEvents,
  TranslationHorizonRpcServices,
  TranslationCanvasRpcServices
>;

export const TranslationChannelDef: MessagingP2PChannelDefFromChannel<TranslationMessagingChannel> = {
  name: TranslationChannelName,
};

// *************** FEATURE FLAGS CHANNEL ***************

export type FeatureFlagsMessagingChannel = MessagingP2PChannel<
  FeatureFlagsHorizonEvents,
  FeatureFlagsCanvasEvents,
  FeatureFlagsHorizonRpcServices,
  FeatureFlagsCanvasRpcServices
>;

export const FeatureFlagsChannelDef: MessagingP2PChannelDefFromChannel<FeatureFlagsMessagingChannel> = {
  name: FeatureFlagsChannelName,
};

// *************** ENVIRONMENT VARIABLE CHANNEL ***************

export type ConfigurationMessagingChannel = MessagingP2PChannel<
  ConfigurationHorizonEvents,
  ConfigurationCanvasEvents,
  ConfigurationHorizonRpcServices,
  ConfigurationCanvasRpcServices
>;

export const ConfigurationChannelDef: MessagingP2PChannelDefFromChannel<ConfigurationMessagingChannel> = {
  name: ConfigurationChannelName,
};

// *************** EDITING METADATA CHANNEL ***************

export type EditingMetadataMessagingChannel = MessagingP2PChannel<
  EditingMetadataCanvasEvents,
  EditingMetadataHorizonEvents,
  EditingMetadataCanvasRpcServices,
  EditingMetadataHorizonRpcServices
>;

export const EditingMetadataChannelDef: MessagingP2PChannelDefFromChannel<EditingMetadataMessagingChannel> = {
  name: EditingMetadataChannelName,
};
