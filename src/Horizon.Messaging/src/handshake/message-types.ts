/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export interface HandshakeMessage {
  readonly protocol: 'horizon_messaging_v3';
  readonly type: 'HANDSHAKE_REQUEST' | 'HANDSHAKE_ACCEPT' | 'HANDSHAKE_REJECT' | 'DISCONNECT';
  readonly hostName: string;
  readonly clientId: string;
  readonly connectionId: string;
  readonly port?: MessagePort;
  readonly extras?: Record<string, string>;
}

export interface IncomingHandshakeMessage extends HandshakeMessage {
  origin: string;
}

export function isHandshakeMessage(msg: any): msg is HandshakeMessage {
  return (
    !!msg &&
    typeof msg === 'object' &&
    'protocol' in msg &&
    msg.protocol === 'horizon_messaging_v3' &&
    'type' in msg &&
    'hostName' in msg &&
    'clientId' in msg &&
    'connectionId' in msg
  );
}
