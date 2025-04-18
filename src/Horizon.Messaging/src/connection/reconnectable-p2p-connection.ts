/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingPort, MessagingReconnectableP2PConnection } from '../public-interfaces';
import { ConnectionEndpoint } from './connection-endpoint';
import { P2PConnection } from './p2p-connection';

export class ReconnectableP2PConnection extends P2PConnection implements MessagingReconnectableP2PConnection {
  constructor(endpoint: ConnectionEndpoint, private port: MessagingPort) {
    super(endpoint);
  }

  reconnect(): void {
    this.disconnect();
    this.connect(this.port, 'anonymous connection');
  }

  changePort(newPort: MessagingPort): void {
    this.port = newPort;

    if (this.state.kind === 'connected') {
      this.reconnect();
    }
  }
}
