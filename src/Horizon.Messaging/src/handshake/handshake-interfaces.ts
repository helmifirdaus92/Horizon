/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HandshakeMessage, IncomingHandshakeMessage } from './message-types';

export type HandshakeMessageHandler = (msg: IncomingHandshakeMessage, reply: (msg: HandshakeMessage) => void) => void;

export interface HandshakeTrasport {
  postMessage(message: HandshakeMessage): void;
  onMessage(handler: HandshakeMessageHandler): void;
}
