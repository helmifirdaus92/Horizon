/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

// tslint:disable: no-non-null-assertion

import { MessagingP2PChannelDef, setupNotInitializedMessagingPeerToPeerHost } from '../../src/index';
import {
  DemoChannelHostEvents,
  DemoChannelHostProvidedRpc,
  DemoChannelIframeEvents,
  DemoChannelIFrameProvidedRpc,
} from './channel.contracts';

const DemoChannelDef: MessagingP2PChannelDef<
  DemoChannelIframeEvents,
  DemoChannelHostEvents,
  DemoChannelIFrameProvidedRpc,
  DemoChannelHostProvidedRpc
> = {
  name: 'demo',
};

const log = (msg: string) => (document.querySelector('#output')!.innerHTML += `\r\n${msg}`);

log('HOST is loaded');

const { hostController: messagingHost, init } = setupNotInitializedMessagingPeerToPeerHost({ hostName: 'demo host' });
init();

messagingHost.onClientConnected((clientId) => {
  log(`Client connected: '${clientId}'.`);
});
messagingHost.onClientDisconnected((clientId) => {
  log(`Client disconnected: '${clientId}'.`);
});

const demoChannel = messagingHost.getClientConnection('iframe').getChannel(DemoChannelDef);
demoChannel.setRpcServicesImpl({
  echo: (value: string) => {
    log(`RPC method 'echo' is called with following args: '${value}'. Replying back.`);
    return value;
  },
});

demoChannel.on('iframe:message', (msg) => {
  log(`Received message from iframe: '${msg}'`);
});

demoChannel.on('iframe:sync:message', async (msg) => {
  log(`Received message from iframe: '${msg}'. Processing it...`);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  log(`Message processed: '${msg}'.`);
});

let msgCounter = 0;
document.querySelector('#send-message')!.addEventListener('click', () => {
  const msg = `HOST MESSAGE #${++msgCounter}`;
  log(`Sent message to iframe: '${msg}'`);
  demoChannel.emit('host:message', msg);
});

log('HOST is set up');
