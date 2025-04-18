/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingPort } from '../public-interfaces';
import { ConnectionState } from './connection-endpoint';

export interface ConnectableConnection {
  readonly state: ConnectionState;
  connect(port: MessagingPort, connectionId: string): void;
  disconnect(): void;
}
