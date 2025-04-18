/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { RenderingInlineEditorFactory } from '../../sdk';
import { createMessagingAdapter } from '../messaging/global-messaging-utils';
import { Logger } from '../utils/logger';
import { ChromeDom } from './chrome-dom';
import {
  DefaultRenderingChromeInlineEditor,
  ExternalRenderingChromeInlineEditor,
  RenderingChromeInlineEditor,
} from './chrome.rendering.inline-editor';

export class ChromeInlineEditorFactory {
  constructor(
    private readonly chromeDom: ChromeDom,
    private readonly logger: Logger,
  ) {}

  async createRenderingChromeEditor(
    startElement: Element,
    endElement: Element,
    inlineEditor: string | undefined,
  ): Promise<RenderingChromeInlineEditor> {
    if (!inlineEditor) {
      return new DefaultRenderingChromeInlineEditor();
    }

    try {
      const FUNC_SCHEMA = 'func:';
      if (inlineEditor.startsWith(FUNC_SCHEMA)) {
        const globalFuncName = inlineEditor.substr(FUNC_SCHEMA.length);
        const inlineEditorFuncFactory = this.chromeDom.getGlobalFunction<RenderingInlineEditorFactory>(globalFuncName);
        if (!inlineEditorFuncFactory) {
          throw Error(`Global function "${globalFuncName}" is not defined`);
        }

        const externalInlineEditor = new ExternalRenderingChromeInlineEditor();

        const messaging = createMessagingAdapter(externalInlineEditor.inlineEditorMessaging);
        const { editorProtocols } = await inlineEditorFuncFactory({ startElement, endElement, messaging });

        externalInlineEditor.inlineEditorMessagingProtocols = editorProtocols;
        return externalInlineEditor;
      }

      throw Error('Unknown schema');
    } catch (err) {
      // Tolerate broken configuration, as this is third-party extensibility.
      // Just fall back to the default value
      this.logger.warn(
        `[Chrome parsing][Rendering Inline Editor] Cannot initialize inline editor: "${err as string}". Value: "${inlineEditor}"`,
      );

      return new DefaultRenderingChromeInlineEditor();
    }
  }
}
