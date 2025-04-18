/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HandshakeMessageHandler } from './handshake-interfaces';
import { HandshakeMessage } from './message-types';
import { WindowHandshakeTrasport } from './window-handshake-transport';

describe('WindowHandshakeTrasport', () => {
  let hostWindow: jasmine.SpyObj<Window>;
  let targetWindow: jasmine.SpyObj<Window>;
  let targetOrigin: string;
  let sut: WindowHandshakeTrasport;

  let dispatchEventOnHost: (ev: MessageEvent) => void;

  beforeEach(() => {
    hostWindow = jasmine.createSpyObj<Window>('HostWindow', ['postMessage', 'addEventListener']);
    targetWindow = jasmine.createSpyObj<Window>('HostWindow', ['postMessage', 'addEventListener']);
    targetOrigin = 'testTargetOrigin';

    sut = new WindowHandshakeTrasport(hostWindow, targetWindow, targetOrigin);

    dispatchEventOnHost = (ev) => {
      const [event, listener] = hostWindow.addEventListener.calls.mostRecent().args;
      if (event === 'message' && typeof listener === 'function') {
        listener(ev);
      }
    };
  });

  describe('send', () => {
    it('should send message to target window', () => {
      const msg: HandshakeMessage = {
        hostName: 'hostName',
        clientId: 'clientId',
        connectionId: 'connId',
        protocol: 'horizon_messaging_v3',
        type: 'HANDSHAKE_REQUEST',
      };

      sut.postMessage(msg);

      expect(targetWindow.postMessage).toHaveBeenCalledWith(msg, targetOrigin, undefined);
    });

    it('should send port to target window', () => {
      const port = new MessageChannel().port1;
      const msg: HandshakeMessage = {
        hostName: 'hostName',
        clientId: 'clientId',
        connectionId: 'connId',
        protocol: 'horizon_messaging_v3',
        type: 'HANDSHAKE_REQUEST',
        port,
      };

      sut.postMessage(msg);

      const [sentMsg, sentOrigin, sentPort] = targetWindow.postMessage.calls.mostRecent().args;
      expect(sentMsg).toEqual({
        hostName: msg.hostName,
        clientId: msg.clientId,
        connectionId: msg.connectionId,
        type: msg.type,
        protocol: msg.protocol,
      });
      expect(sentPort).toBe(sentPort);
    });
  });

  describe('receive', () => {
    it('should deliver message', () => {
      const handler = jasmine.createSpy<HandshakeMessageHandler>();
      sut.onMessage(handler);
      const msg: HandshakeMessage = {
        hostName: 'hostName',
        clientId: 'clientId',
        connectionId: 'connId',
        protocol: 'horizon_messaging_v3',
        type: 'HANDSHAKE_REQUEST',
      };

      dispatchEventOnHost(new MessageEvent('message', { data: msg }));

      expect(handler).toHaveBeenCalledWith(jasmine.objectContaining(msg), jasmine.anything());
    });

    it('should ignore extraneous messages', () => {
      const handler = jasmine.createSpy();
      sut.onMessage(handler);
      const msg = 'hey there! im the browser sending some random message';

      dispatchEventOnHost(new MessageEvent('message', { data: msg }));

      expect(handler).not.toHaveBeenCalled();
    });

    it('should deliver port from event', () => {
      const handler = jasmine.createSpy<HandshakeMessageHandler>();
      sut.onMessage(handler);
      const msg: HandshakeMessage = {
        hostName: 'hostName',
        clientId: 'clientId',
        connectionId: 'connId',
        protocol: 'horizon_messaging_v3',
        type: 'HANDSHAKE_REQUEST',
      };
      const port = new MessageChannel().port1;

      dispatchEventOnHost(new MessageEvent('message', { data: msg, ports: [port] }));

      const [receivedMsg] = handler.calls.mostRecent().args;
      expect(receivedMsg.port).toBe(port);
    });

    it('should deliver origin from event', () => {
      const handler = jasmine.createSpy<HandshakeMessageHandler>();
      sut.onMessage(handler);
      const msg: HandshakeMessage = {
        hostName: 'hostName',
        clientId: 'clientId',
        connectionId: 'connId',
        protocol: 'horizon_messaging_v3',
        type: 'HANDSHAKE_REQUEST',
      };
      const port = new MessageChannel().port1;

      dispatchEventOnHost(new MessageEvent('message', { data: msg, origin: 'https://test.com' }));
      const [receivedMsg] = handler.calls.mostRecent().args;
      expect(receivedMsg.origin).toBe('https://test.com');
    });

    it('should reply to event source window', () => {
      const handler = jasmine.createSpy<HandshakeMessageHandler>();
      sut.onMessage(handler);
      const msg: HandshakeMessage = {
        hostName: 'hostName',
        clientId: 'clientId',
        connectionId: 'connId',
        protocol: 'horizon_messaging_v3',
        type: 'HANDSHAKE_REQUEST',
      };
      const msgReply: HandshakeMessage = {
        hostName: 'hostName',
        clientId: 'clientIdReply',
        connectionId: 'connIdReply',
        protocol: 'horizon_messaging_v3',
        type: 'HANDSHAKE_ACCEPT',
      };
      // Browser expects `source` to be strongly of either Window or MessagePort type.
      const evSource = new MessageChannel().port1;
      // Sut will treat source as a Window and use its `postMessage`.
      const sourcePostMessageSpy = spyOn(evSource, 'postMessage');

      dispatchEventOnHost(new MessageEvent('message', { data: msg, source: evSource }));
      const [_, replyCallback] = handler.calls.mostRecent().args;
      replyCallback(msgReply);

      const [receivedMsg] = sourcePostMessageSpy.calls.mostRecent().args;
      expect(receivedMsg).toBe(msgReply);
    });
  });
});
