/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { setupNonInitializedMessagingBroadcastHost } from '../../src/index';
import { BroadcastDemoChannelDef } from './contracts';

// tslint:disable: no-non-null-assertion

const log = (msg: string) => (document.querySelector('#output')!.innerHTML += `\r\n${msg}`);

log('HOST is loaded');

const { host: messagingHost, init } = setupNonInitializedMessagingBroadcastHost({ hostName: 'demo-host' });
init();

messagingHost.onClientConnected((clientId) => {
  log(`Client connected: ${clientId}`);
});

messagingHost.onClientDisconnected((clientId) => {
  log(`Client disconnected: ${clientId}`);
});

const demoSenderChannel = messagingHost.getSenderChannel(BroadcastDemoChannelDef);
demoSenderChannel.setRpcServicesImpl({
  echo: (value: string) => {
    log(`RPC method 'echo' is called with following args: '${value}'. Replying back.`);
    return value;
  },
});

let msgCounter = 0;
document.querySelector('button[name=send-message]')!.addEventListener('click', () => {
  const msg = `MESSAGE #${++msgCounter}`;
  log(`Sent message to recipients: '${msg}'`);
  demoSenderChannel.emit('message', msg);
});

document.querySelector('button[name=send-sync-message]')!.addEventListener('click', async () => {
  const msg = `MESSAGE #${++msgCounter}`;
  log(`Sent sync message to recipients: "${msg}". Waiting for handlers to proceed...`);
  await demoSenderChannel.syncEmit('message:slow', msg);
  log(`Message has been handled by recipients: '${msg}'.`);
});

let recipientCounter = 0;
document
  .querySelector('button[name=add-recipient]')!
  .addEventListener('click', () => createRecipient(++recipientCounter));

log('HOST is set up');

function createRecipient(id: number) {
  const container = document.querySelector('.recipients')!;

  const node = document.createElement('iframe');
  node.id = `frame-${id}`;
  node.src = `./iframe.html?id=${id}`;

  container.appendChild(node);
}

function killRecipient(id: number) {
  document.querySelector(`#frame-${id}`)!.remove();
}

(window as any).killRecipient = killRecipient;
