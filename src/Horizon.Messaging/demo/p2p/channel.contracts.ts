/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

// tslint:disable: no-empty-interface - required to describe interface

export interface DemoChannelHostEvents {
  'host:message': string;
}

export interface DemoChannelIframeEvents {
  'iframe:message': string;
  'iframe:sync:message': string;
}

export interface DemoChannelHostProvidedRpc {
  echo(value: string): string;
}

export interface DemoChannelIFrameProvidedRpc {}
