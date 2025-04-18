/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ReverseMessagingP2PChannel } from '../utils/messaging';
import {
  DefaultRenderingChromeInlineEditor,
  ExternalRenderingChromeInlineEditor,
  RenderingPropertiesEditorChannel,
  RenderingPropertiesEditorChannelDef,
} from './chrome.rendering.inline-editor';

function nextTick() {
  return new Promise((resolve) => setTimeout(resolve));
}

describe('ExternalRenderingChromeInlineEditor', () => {
  let sut: ExternalRenderingChromeInlineEditor;

  beforeEach(() => {
    sut = new ExternalRenderingChromeInlineEditor();
  });

  it('messaging should be interconnected', async () => {
    const channel = sut.inlineEditorMessaging.getChannel(RenderingPropertiesEditorChannelDef) as ReverseMessagingP2PChannel<
      RenderingPropertiesEditorChannel
    >;
    const eventHandler = jasmine.createSpy();
    channel.on('onPropertiesEditorMessage' as never, eventHandler);

    sut.connectMessaging();
    sut.getInlineEditorMessaging().emit('onPropertiesEditorMessage', 'data-42');

    await nextTick();
    expect(eventHandler).toHaveBeenCalledWith('data-42');
  });

  it('should allow to modify protocols', () => {
    sut.inlineEditorMessagingProtocols = ['p1'];

    expect(sut.inlineEditorMessagingProtocols).toEqual(['p1']);
  });
});

describe('DefaultRenderingChromeInlineEditor', () => {
  let sut: DefaultRenderingChromeInlineEditor;

  beforeEach(() => {
    sut = new DefaultRenderingChromeInlineEditor();
  });

  it('should have empty list of protocols', () => {
    expect(sut.inlineEditorMessagingProtocols).toEqual([]);
  });
});
