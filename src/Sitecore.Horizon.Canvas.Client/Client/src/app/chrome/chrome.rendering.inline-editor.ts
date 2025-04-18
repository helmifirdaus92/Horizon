/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable max-classes-per-file */
import {
  createEntangledP2PConnections,
  MessagingP2PChannel,
  MessagingP2PChannelDefFromChannel,
  MessagingReconnectableP2PConnection,
} from '@sitecore/horizon-messaging';
import { PropertiesEditorContract, PropertiesEditorEvents, PropertiesEditorRpc } from '../../sdk';
import { RenderingChromeUtilsContract, RenderingChromeUtilsRpc } from '../../sdk/contracts/rendering-chrome-utils.contract';

/* eslint-disable max-classes-per-file */

export type RenderingPropertiesEditorChannel = MessagingP2PChannel<{}, PropertiesEditorEvents, {}, PropertiesEditorRpc>;

export const RenderingPropertiesEditorChannelDef: MessagingP2PChannelDefFromChannel<RenderingPropertiesEditorChannel> =
  PropertiesEditorContract;

export type RenderingChromeUtilsChannel = MessagingP2PChannel<{}, {}, {}, RenderingChromeUtilsRpc>;

export const RenderingChromeUtilsChannelDef: MessagingP2PChannelDefFromChannel<RenderingChromeUtilsChannel> = RenderingChromeUtilsContract;

export interface RenderingChromeInlineEditor {
  readonly inlineEditorMessagingProtocols: readonly string[];

  connectMessaging(): void;
  getInlineEditorMessaging(): RenderingPropertiesEditorChannel;
  getRenderingChromeUtilsMessaging(): RenderingChromeUtilsChannel;
}

/**
 * Implementation of the inline editor which delegates services implementation to the external entity.
 * External entity is expected to implement messaging services requested by rendering chrome.
 */
export class ExternalRenderingChromeInlineEditor implements RenderingChromeInlineEditor {
  inlineEditorMessagingProtocols: readonly string[] = [];

  private readonly chromeMessaging: MessagingReconnectableP2PConnection;
  readonly inlineEditorMessaging: MessagingReconnectableP2PConnection;

  constructor() {
    [this.chromeMessaging, this.inlineEditorMessaging] = createEntangledP2PConnections();
  }

  connectMessaging(): void {
    this.chromeMessaging.reconnect();
    this.inlineEditorMessaging.reconnect();
  }

  getRenderingChromeUtilsMessaging(): RenderingChromeUtilsChannel {
    return this.chromeMessaging.getChannel(RenderingChromeUtilsChannelDef);
  }

  getInlineEditorMessaging(): RenderingPropertiesEditorChannel {
    return this.chromeMessaging.getChannel(RenderingPropertiesEditorChannelDef);
  }
}

/**
 * Provides a default inline editor implementation in case no implementation is specified for Chrome.
 * Implements the services required to be implemented by the rendering chrome.
 */
export class DefaultRenderingChromeInlineEditor implements RenderingChromeInlineEditor {
  readonly inlineEditorMessagingProtocols: readonly string[] = [];

  private readonly chromeMessaging: MessagingReconnectableP2PConnection;
  private readonly editorMessaging: MessagingReconnectableP2PConnection;

  constructor() {
    [this.chromeMessaging, this.editorMessaging] = createEntangledP2PConnections();
  }

  connectMessaging(): void {
    this.chromeMessaging.reconnect();
    this.editorMessaging.reconnect();
  }

  getRenderingChromeUtilsMessaging(): RenderingChromeUtilsChannel {
    return this.chromeMessaging.getChannel(RenderingChromeUtilsChannelDef);
  }

  getInlineEditorMessaging(): RenderingPropertiesEditorChannel {
    return this.chromeMessaging.getChannel(RenderingPropertiesEditorChannelDef);
  }
}
