/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Writable } from '../utils';
import { HandshakeMessageHandler, HandshakeTrasport } from './handshake-interfaces';
import { HandshakeMessage, IncomingHandshakeMessage, isHandshakeMessage } from './message-types';

export class WindowHandshakeTrasport implements HandshakeTrasport {
  constructor(private hostWindow: Window, private targetWindow: Window, private targetOrigin: string) {}

  postMessage(message: HandshakeMessage): void {
    this.postMessageToWindow(message, this.targetWindow, this.targetOrigin);
  }

  onMessage(handler: HandshakeMessageHandler): void {
    this.hostWindow.addEventListener('message', (event) => {
      // Window message could be used by others so unknown messages are to be expected.
      // It's absolutely legal, so just ignore such messages.
      if (!isHandshakeMessage(event.data)) {
        return;
      }

      const msg: IncomingHandshakeMessage = {
        ...event.data,

        // Copy values which are delivered via special arguments.
        origin: event.origin,
        port: event.ports[0],
      };

      const messageReplier = (replyMsg: HandshakeMessage) => {
        if (event.source) {
          this.postMessageToWindow(replyMsg, event.source as Window, event.origin);
        }
      };

      handler(msg, messageReplier);
    });
  }

  private postMessageToWindow(msg: HandshakeMessage, window: Window, origin: string) {
    let transfer: Transferable[] | undefined;

    // Port should be delivered via special argument, so strip it from the message.
    if (msg.port) {
      transfer = [msg.port];

      // Property might be impelemented as a pure read-only, so it's not always possible to delete it.
      // Therefore, we create a copy of object and delete it from our copy.
      const msgToSend: Writable<HandshakeMessage> = { ...msg };
      delete msgToSend.port;
      msg = msgToSend;
    }

    window.postMessage(msg, origin, transfer);
  }
}
