/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

// tslint:disable: no-non-null-assertion

import { MessagingP2PChannelDef, setupMessagingPeerToPeerClient } from '../../src/index';
import {
  DemoChannelHostEvents,
  DemoChannelHostProvidedRpc,
  DemoChannelIframeEvents,
  DemoChannelIFrameProvidedRpc,
} from './channel.contracts';

const DemoChannelDef: MessagingP2PChannelDef<
  DemoChannelHostEvents,
  DemoChannelIframeEvents,
  DemoChannelHostProvidedRpc,
  DemoChannelIFrameProvidedRpc
> = {
  name: 'demo',
};

const log = (msg: string) => (document.querySelector('#output')!.innerHTML += `\r\n${msg}`);

log('IFRAME is loaded');

const connection = setupMessagingPeerToPeerClient({
  clientId: 'iframe',
  hostWindow: window.top,
  hostOrigin: '*',
  hostName: 'demo host',
});
const demoChannel = connection.getChannel(DemoChannelDef);

demoChannel.on('host:message', (msg) => {
  log(`Received message from host: '${msg}'`);
});

let msgCounter = 0;
document.querySelector('#send-message')!.addEventListener('click', () => {
  const msg = `IFRAME MESSAGE #${++msgCounter}`;
  log(`Sent message to host: "${msg}"`);
  demoChannel.emit('iframe:message', msg);
});

document.querySelector('#send-sync-message')!.addEventListener('click', async () => {
  const msg = `IFRAME MESSAGE #${++msgCounter}`;
  log(`Sent sync message to host: "${msg}". Waiting for handlers to proceed...`);
  await demoChannel.syncEmit('iframe:sync:message', msg);
  log(`Message has been handled by host: '${msg}'.`);
});

let echoMsgCounter = 0;
const callRpcButton = document.querySelector('#call-rpc')!;
callRpcButton.addEventListener('click', async () => {
  const msg = `MSG_TO_ECHO #${++echoMsgCounter}`;
  log(`Sending echo request: '${msg}'`);
  const result = await demoChannel.rpc.echo(msg);
  log(`Received echo result: '${result}'`);
});
