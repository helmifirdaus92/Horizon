/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { setupMessagingBroadcastClient } from '../../src/index';
import { BroadcastDemoChannelDef } from './contracts';

// tslint:disable: no-non-null-assertion

const qsParams = new URLSearchParams(location.search);
const id = parseInt(qsParams.get('id')!, 10);

const messagingRecipient = setupMessagingBroadcastClient({
  clientId: `iframe-client-${id}`,
  hostWindow: window.parent,
  hostOrigin: '*',
  hostName: 'demo-host',
});
const recipientChannel = messagingRecipient.getChannel(BroadcastDemoChannelDef);

document.querySelector('#recipient-id')!.innerHTML = id.toString();

const logOutput = document.querySelector('pre#output')!;
const log = (msg: string) => (logOutput.innerHTML += `\r\n${msg}`);

let echoMsgCounter = 0;
const callRpcButton = document.querySelector('button[name=call-rpc]')!;
callRpcButton.addEventListener('click', async () => {
  const msg = `RECIPIENT #${id}. MSG_TO_ECHO #${++echoMsgCounter}`;
  log(`Sending echo request: '${msg}'`);
  const result = await recipientChannel.rpc.echo(msg);
  log(`Received echo result: '${result}'`);
});

recipientChannel.on('message', (msg) => {
  log(`Received message: '${msg}'`);
});

recipientChannel.on('message:slow', async (msg) => {
  log(`Received message: '${msg}'. Processing it...`);
  await new Promise((resolve) => setTimeout(resolve, 500 * id));
  log(`Message processed: '${msg}'.`);
});

const killButton = document.querySelector('button[name=kill]')!;
killButton.addEventListener('click', () => {
  log('Killing...');
  messagingRecipient.disconnect();
  (window.parent as any).killRecipient(id);
});

log(`Recipient ${id} is ready`);
