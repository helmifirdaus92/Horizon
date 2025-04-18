/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

// tslint:disable: no-non-null-assertion

import { createMessagingBroadcastHost } from '../../src/index';
import { BroadcastDemoChannelDef } from './contracts';

const log = (msg: string) => (document.querySelector('#output')!.innerHTML += `\r\n${msg}`);

log('HOST is loaded');

const messagingHost = createMessagingBroadcastHost();

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
createRecipient(++recipientCounter);
createRecipient(++recipientCounter);
createRecipient(++recipientCounter);

document
  .querySelector('button[name=add-recipient]')!
  .addEventListener('click', () => createRecipient(++recipientCounter));

log('HOST is set up');

function createRecipient(id: number): void {
  const messagingRecipient = messagingHost.registerRecipient();
  const recipientChannel = messagingRecipient.getChannel(BroadcastDemoChannelDef);

  const template = document.querySelector<HTMLTemplateElement>('#recipient-template')!;

  const node = document.importNode(template.content, true);
  node.querySelector('#recipient-id')!.innerHTML = id.toString();
  node.querySelector('h2')!.id = `recipient-${id}`;

  const logOutput = node.querySelector('pre')!;
  const localLog = (msg: string) => (logOutput.innerHTML += `\r\n${msg}`);

  let echoMsgCounter = 0;
  const callRpcButton = node.querySelector('button[name=call-rpc]')!;
  callRpcButton.addEventListener('click', async () => {
    const msg = `RECIPIENT #${id}. MSG_TO_ECHO #${++echoMsgCounter}`;
    localLog(`Sending echo request: '${msg}'`);
    const result = await recipientChannel.rpc.echo(msg);
    localLog(`Received echo result: '${result}'`);
  });

  recipientChannel.on('message', (msg) => {
    localLog(`Received message: '${msg}'`);
  });

  recipientChannel.on('message:slow', async (msg) => {
    localLog(`Received message: '${msg}'. Processing it...`);
    await new Promise((resolve) => setTimeout(resolve, 500 * id));
    localLog(`Message processed: '${msg}'.`);
  });

  const container = document.querySelector('.recipients')!;

  node.querySelector('button[name=kill]')!.addEventListener('click', () => {
    messagingRecipient.disconnect();
    const nodeToRemove = container.querySelector(`#recipient-${id}`)!.parentNode!;
    container.removeChild(nodeToRemove);
  });

  container.appendChild(node);
}
