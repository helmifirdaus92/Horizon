/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingPort } from '../public-interfaces';

export function createEntangledMessagingPorts(): [MessagingPort, MessagingPort] {
  const channel = new MessageChannel();

  return [new NativeMessagingPort(channel.port1), new NativeMessagingPort(channel.port2)];
}

export class NativeMessagingPort implements MessagingPort {
  constructor(private readonly messagePort: MessagePort) {
    messagePort.start();
  }

  onMessage(handler: (msg: unknown) => void): () => void {
    const nativeHandler = (ev: MessageEvent) => handler(ev.data);

    this.messagePort.addEventListener('message', nativeHandler);
    return () => this.messagePort.removeEventListener('message', nativeHandler);
  }

  postMessage(msg: unknown): void {
    this.messagePort.postMessage(msg);
  }
}
