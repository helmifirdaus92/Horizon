/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { makeTestMessagingP2PChannelFromDef } from '@sitecore/horizon-messaging/dist/testing';
import { MessagingService } from '../../messaging/messaging-service';
import { setupTestDOM, teardownTestDOM } from '../../utils/dom.testing';
import { Chrome } from '../chrome';
import { ChromeInlineEditorFactory } from '../chrome-inline-editor-factory';
import { isFieldChrome } from '../chrome.field';
import { isPlaceholderChrome, PlaceholderChrome } from '../chrome.placeholder';
import { isRenderingChrome, RenderingChrome } from '../chrome.rendering';
import { RenderingChromeUtilsChannelDef, RenderingPropertiesEditorChannelDef } from '../chrome.rendering.inline-editor';
import { MarkupChrome } from './chrome-data-types';
import { InlineChromeParser } from './inline-chrome-parser';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
describe(InlineChromeParser.name, () => {
  let inlineChromeParser: InlineChromeParser;
  let inlineEditorFactory: jasmine.SpyObj<ChromeInlineEditorFactory>;
  let messagingService: jasmine.SpyObj<MessagingService>;
  let rootElement: Element;

  beforeEach(() => {
    inlineEditorFactory = jasmine.createSpyObj<ChromeInlineEditorFactory>({
      createRenderingChromeEditor: Promise.resolve({
        inlineEditorMessagingProtocols: ['proto1', 'proto2'],
        connectMessaging: () => undefined,
        getInlineEditorMessaging: () => makeTestMessagingP2PChannelFromDef(RenderingPropertiesEditorChannelDef, {}),
        getRenderingChromeUtilsMessaging: () => makeTestMessagingP2PChannelFromDef(RenderingChromeUtilsChannelDef, {}),
      }),
    });
    messagingService = jasmine.createSpyObj<MessagingService>('MessagingService', ['setEditingChannelRpcServices']);
    const abortController = new AbortController();

    inlineChromeParser = new InlineChromeParser(inlineEditorFactory, messagingService, abortController);

    rootElement = setupTestDOM(`
      <placeholder key="content" id="ph1">
        <rendering rid="test-rendering" id="rd1">
          <field type="rich-text" id="rte1" />
          <field type="image" id="img1"/>
        </rendering>
      </placeholder>
    `);
  });

  afterEach(() => {
    teardownTestDOM(rootElement);
  });

  describe('parseRenderingChrome', () => {
    it('should correctly parse rendering chrome and return a RenderingChrome instance', async () => {
      const openChrome: MarkupChrome = {
        chromeType: 'rendering',
        kind: 'open',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        element: rootElement.querySelector('#start_test-rendering')!,
      };
      const closeChrome: MarkupChrome = {
        chromeType: 'rendering',
        kind: 'close',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        element: rootElement.querySelector('#end_test-rendering')!,
      };
      const childChromes: Chrome[] = [];

      const result = await inlineChromeParser.parseRenderingChrome(openChrome, closeChrome, childChromes);
      expect(isRenderingChrome(result)).toBe(true);
      expect((result as RenderingChrome).renderingInstanceId).toEqual('rd1');
      expect((result as RenderingChrome).renderingDefinitionId).toEqual('test-rendering');
    });

    it('should throw when chrome data is empty', async () => {
      rootElement.querySelector('#start_test-rendering')!.textContent = '';
      const openChrome: MarkupChrome = {
        chromeType: 'rendering',
        kind: 'open',
        element: rootElement.querySelector('#start_test-rendering')!,
      };
      const closeChrome: MarkupChrome = {
        chromeType: 'rendering',
        kind: 'close',
        element: rootElement.querySelector('#end_test-rendering')!,
      };
      const childChromes: Chrome[] = [];

      await expectAsync(inlineChromeParser.parseRenderingChrome(openChrome, closeChrome, childChromes)).toBeRejected();
    });
  });

  describe('parsePlaceholderChrome', () => {
    it('should correctly parse rendering chrome and return a PlaceholderChrome instance', async () => {
      const openChrome: MarkupChrome = {
        chromeType: 'placeholder',
        kind: 'open',
        element: rootElement.querySelector('#start_ph1')!,
      };
      const closeChrome: MarkupChrome = {
        chromeType: 'placeholder',
        kind: 'close',
        element: rootElement.querySelector('#end_ph1')!,
      };
      const childChromes: Chrome[] = [];

      const result = await inlineChromeParser.parsePlaceholderChrome(openChrome, closeChrome, childChromes);
      expect(isPlaceholderChrome(result)).toBe(true);
      expect((result as PlaceholderChrome).placeholderKey).toEqual('content');
    });

    it('should throw when chrome data is empty', async () => {
      rootElement.querySelector('#start_ph1')!.textContent = '';
      const openChrome: MarkupChrome = {
        chromeType: 'placeholder',
        kind: 'open',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        element: rootElement.querySelector('#start_ph1')!,
      };
      const closeChrome: MarkupChrome = {
        chromeType: 'placeholder',
        kind: 'close',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        element: rootElement.querySelector('#end_ph1')!,
      };
      const childChromes: Chrome[] = [];

      await expectAsync(inlineChromeParser.parsePlaceholderChrome(openChrome, closeChrome, childChromes)).toBeRejected();
    });
  });

  describe('parsePlaceholderChrome', () => {
    describe('wrappless field', () => {
      it('should correctly parse field and return a FieldChrome instance', async () => {
        const openChrome: MarkupChrome = {
          chromeType: 'field',
          kind: 'open',
          element: rootElement.querySelector('#start_img1')!,
        };
        const closeChrome: MarkupChrome = {
          chromeType: 'field',
          kind: 'close',
          element: rootElement.querySelector('#end_img1')!,
        };

        const result = await inlineChromeParser.parseFieldChrome(openChrome, closeChrome);
        expect(isFieldChrome(result)).toBe(true);
        expect(result.fieldType).toEqual('image');
        expect(result.fieldId).toEqual('img1');
      });

      it('should throw when chrome data is empty', async () => {
        rootElement.querySelector('#start_img1')!.textContent = '';
        const openChrome: MarkupChrome = {
          chromeType: 'field',
          kind: 'open',
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          element: rootElement.querySelector('#start_img1')!,
        };
        const closeChrome: MarkupChrome = {
          chromeType: 'field',
          kind: 'close',
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          element: rootElement.querySelector('#end_img1')!,
        };

        await expectAsync(inlineChromeParser.parseFieldChrome(openChrome, closeChrome)).toBeRejected();
      });

      it('should throw when value element is not found', async () => {
        rootElement.removeChild(rootElement.querySelector('img')!);
        const openChrome: MarkupChrome = {
          chromeType: 'field',
          kind: 'open',
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          element: rootElement.querySelector('#start_img1')!,
        };
        const closeChrome: MarkupChrome = {
          chromeType: 'field',
          kind: 'close',
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          element: rootElement.querySelector('#end_img1')!,
        };

        await expectAsync(inlineChromeParser.parseFieldChrome(openChrome, closeChrome)).toBeRejected();
      });
    });
  });

  describe('parsePlaceholderChrome', () => {
    describe('wrapped field', () => {
      it('should correctly parse field and return a FieldChrome instance', async () => {
        const chrome: MarkupChrome = {
          chromeType: 'field',
          kind: 'inline',
          element: rootElement.querySelector('#chrome_rte1')!,
        };

        const result = await inlineChromeParser.parseFieldChrome(chrome);
        expect(isFieldChrome(result)).toBe(true);
        expect(result.fieldType).toEqual('rich text');
        expect(result.fieldId).toEqual('rte1');
      });

      it('should throw when chrome data is empty', async () => {
        rootElement.querySelector('#chrome_rte1')!.textContent = '';
        const chrome: MarkupChrome = {
          chromeType: 'field',
          kind: 'inline',
          element: rootElement.querySelector('#chrome_rte1')!,
        };

        await expectAsync(inlineChromeParser.parseFieldChrome(chrome)).toBeRejected();
      });

      it('should throw when value element is not found', async () => {
        rootElement.removeChild(rootElement.querySelector('.scWebEditInput')!);
        const chrome: MarkupChrome = {
          chromeType: 'field',
          kind: 'inline',
          element: rootElement.querySelector('#chrome_rte1')!,
        };

        await expectAsync(inlineChromeParser.parseFieldChrome(chrome)).toBeRejected();
      });
    });
  });
});
