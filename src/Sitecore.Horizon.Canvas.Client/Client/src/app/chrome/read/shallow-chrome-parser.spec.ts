/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { makeTestMessagingP2PChannelFromDef } from '@sitecore/horizon-messaging/dist/testing';
import { EditingData } from '../../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../../messaging/messaging-service';
import { EditingDataService } from '../../services/editing-data.service';
import { teardownTestDOM } from '../../utils/dom.testing';
import { Chrome } from '../chrome';
import { ChromeInlineEditorFactory } from '../chrome-inline-editor-factory';
import { isFieldChrome } from '../chrome.field';
import { NonEditableFieldChrome } from '../chrome.non-editable-field';
import { isPlaceholderChrome, PlaceholderChrome } from '../chrome.placeholder';
import { isRenderingChrome, RenderingChrome } from '../chrome.rendering';
import { RenderingChromeUtilsChannelDef, RenderingPropertiesEditorChannelDef } from '../chrome.rendering.inline-editor';
import { UnknownPlaceholderChrome } from '../chrome.unknown-placeholder';
import { UnknownRenderingChrome } from '../chrome.unknown-rendering';
import { MarkupChrome } from './chrome-data-types';
import { ShallowChromeParser } from './shallow-chrome-parser';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
describe(ShallowChromeParser.name, () => {
  let shallowChromeParser: ShallowChromeParser;
  let inlineEditorFactory: jasmine.SpyObj<ChromeInlineEditorFactory>;
  let messagingService: jasmine.SpyObj<MessagingService>;
  let editingDataService: jasmine.SpyObj<EditingDataService>;
  const testDOMContent = `
  <div>
    <code type="text/sitecore" chrometype="placeholder" class="scpm" kind="open" id="content_860b2736-d5be-4757-b403-7f924bf6ff50"></code>
    <code type="text/sitecore" chrometype="rendering" class="scpm" kind="open" id="d1617764-8502-4a24-a658-62c3ab933a5b"></code>
    <div class="rendering-content">
      <code type="text/sitecore" chrometype="field" class="scpm" kind="open" id="start_test_field">{
        "datasource": {
            "id": "{2B93F249-63A9-4152-810E-D32380D7C684}",
            "language": "en",
            "revision": "f691501e-6bd2-4e4f-b70f-5a2a5d1ad4fb",
            "version": 1
        },
        "fieldId": "{C18E8B01-BFAB-462D-A8D1-14418B42C8E3}",
        "fieldType": "Single-Line Text",
        "rawValue": "Home",
        "title": ""
      }
      </code>
      <span contenteditable="false" style="cursor: text; min-width: 0.5em; min-height: 1em; outline: none;" class="">Home</span>
      <code type="text/sitecore" chrometype="field" class="scpm" kind="close" id="end_test_field"/>
    </div>
    <code type="text/sitecore" chrometype="rendering" class="scpm" kind="close" id="end_test_rendering"></code>
    <code type="text/sitecore" chrometype="placeholder" class="scpm" kind="close" id="end_test_placeholder"></code>
  </div>`;

  let editingData: EditingData;

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
    editingDataService = jasmine.createSpyObj<EditingDataService>('EditingDataService', ['getEditingData']);

    shallowChromeParser = new ShallowChromeParser(inlineEditorFactory, messagingService, abortController, editingDataService);
    rootElement = new DOMParser().parseFromString(testDOMContent, 'text/html').firstElementChild!;

    editingData = {
      placeholders: [
        {
          placeholderName: 'content',
          renderingUid: '860b2736-d5be-4757-b403-7f924bf6ff50',
          chromeData: {
            displayName: 'Content placeholder',
            custom: {
              placeholderKey: 'content',
              placeholderMetadataKeys: [],
              allowedRenderings: [],
              contextItem: {
                id: '{2B93F249-63A9-4152-810E-D32380D7C684}',
                language: 'en',
                revision: 'f691501e-6bd2-4e4f-b70f-5a2a5d1ad4fb',
                version: 1,
              },
              editable: 'true',
            },
          },
        },
      ],
      renderings: [
        {
          renderingUid: 'd1617764-8502-4a24-a658-62c3ab933a5b',
          chromeData: {
            displayName: 'Rendering 1',
            custom: {
              renderingInstanceId: 'd1617764-8502-4a24-a658-62c3ab933a5b',
              renderingId: '56afab7f-7250-45ef-a3ab-ab0cf6daaf06',
              contextItem: {
                id: '{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}',
                language: 'en',
                version: 1,
                revision: '56afab7f-7250-45ef-a3ab-ab0cf6daaf06',
              },
              editable: 'true',
              appliedPersonalizationActions: [],
              compatibleRenderings: [],
            },
          },
        },
      ],
      fields: [
        {
          fieldId: '{C18E8B01-BFAB-462D-A8D1-14418B42C8E3}',
          itemId: '{2B93F249-63A9-4152-810E-D32380D7C684}',
          language: 'en',
          rawValue: 'testValue001',
          containsStandardValue: false,
          version: 1,
        },
      ],
    };
    editingDataService.getEditingData.and.returnValue(Promise.resolve(editingData));
  });

  afterEach(() => {
    teardownTestDOM(rootElement);
  });

  describe('parseRenderingChrome', () => {
    it('should match chrome with editing data and return a RenderingChrome instance', async () => {
      const openChrome: MarkupChrome = {
        chromeType: 'rendering',
        kind: 'open',
        element: rootElement.querySelector('#d1617764-8502-4a24-a658-62c3ab933a5b')!,
      };
      const closeChrome: MarkupChrome = {
        chromeType: 'rendering',
        kind: 'close',
        element: rootElement.querySelector('#end_test_rendering')!,
      };
      const childChromes: Chrome[] = [];

      const result = await shallowChromeParser.parseRenderingChrome(openChrome, closeChrome, childChromes);
      expect(isRenderingChrome(result)).toBe(true);
      expect((result as RenderingChrome).renderingInstanceId).toEqual('d1617764-8502-4a24-a658-62c3ab933a5b');
      expect((result as RenderingChrome).renderingDefinitionId).toEqual('56afab7f-7250-45ef-a3ab-ab0cf6daaf06');
    });

    it('should return unknown rendering chrome when cannot match chrome with editing data', async () => {
      rootElement.querySelector('#d1617764-8502-4a24-a658-62c3ab933a5b')!.id = 'unknown_id';
      const openChrome: MarkupChrome = {
        chromeType: 'rendering',
        kind: 'open',
        element: rootElement.querySelector('#unknown_id')!,
      };
      const closeChrome: MarkupChrome = {
        chromeType: 'rendering',
        kind: 'close',
        element: rootElement.querySelector('#end_test-rendering')!,
      };
      const childChromes: Chrome[] = [];

      const result = await shallowChromeParser.parseRenderingChrome(openChrome, closeChrome, childChromes);
      expect(result instanceof UnknownRenderingChrome).toBe(true);
    });
  });

  describe('parsePlaceholderChrome', () => {
    it('should correctly parse rendering chrome and return a PlaceholderChrome instance', async () => {
      const openChrome: MarkupChrome = {
        chromeType: 'placeholder',
        kind: 'open',
        element: rootElement.querySelector('#content_860b2736-d5be-4757-b403-7f924bf6ff50')!,
      };
      const closeChrome: MarkupChrome = {
        chromeType: 'placeholder',
        kind: 'close',
        element: rootElement.querySelector('#end_test_placeholder')!,
      };
      const childChromes: Chrome[] = [];

      const result = await shallowChromeParser.parsePlaceholderChrome(openChrome, closeChrome, childChromes);
      expect(isPlaceholderChrome(result)).toBe(true);
      expect((result as PlaceholderChrome).placeholderKey).toEqual('content');
    });

    it('should return unknown placeholder chrome when cannot match chrome with editing data', async () => {
      rootElement.querySelector('#content_860b2736-d5be-4757-b403-7f924bf6ff50')!.id = 'unknown_ph_id';
      const openChrome: MarkupChrome = {
        chromeType: 'placeholder',
        kind: 'open',
        element: rootElement.querySelector('#unknown_ph_id')!,
      };
      const closeChrome: MarkupChrome = {
        chromeType: 'placeholder',
        kind: 'close',
        element: rootElement.querySelector('#end_test_placeholder')!,
      };
      const childChromes: Chrome[] = [];
      const result = await shallowChromeParser.parsePlaceholderChrome(openChrome, closeChrome, childChromes);
      expect(result instanceof UnknownPlaceholderChrome).toBe(true);
    });
  });

  describe('parseFieldChrome', () => {
    it('should correctly parse field and return a FieldChrome instance', async () => {
      const openChrome: MarkupChrome = {
        chromeType: 'field',
        kind: 'open',
        element: rootElement.querySelector('#start_test_field')!,
      };
      const closeChrome: MarkupChrome = {
        chromeType: 'field',
        kind: 'close',
        element: rootElement.querySelector('#end_test_field')!,
      };

      const result = await shallowChromeParser.parseFieldChrome(openChrome, closeChrome);
      expect(isFieldChrome(result)).toBe(true);
      expect(result.fieldType).toEqual('single-line text');
      expect(result.fieldId).toEqual('c18e8b01-bfab-462d-a8d1-14418b42c8e3');
    });

    it('should throw when chrome data is empty', async () => {
      rootElement.querySelector('#start_test_field')!.textContent = '';
      const openChrome: MarkupChrome = {
        chromeType: 'field',
        kind: 'open',
        element: rootElement.querySelector('#start_test_field')!,
      };
      const closeChrome: MarkupChrome = {
        chromeType: 'field',
        kind: 'close',
        element: rootElement.querySelector('#end_test_field')!,
      };

      await expectAsync(shallowChromeParser.parseFieldChrome(openChrome, closeChrome)).toBeRejected();
    });

    it('should generate wrapper for the field when it does not have any', async () => {
      rootElement.querySelector('span')!.remove();
      rootElement
        .querySelector('.rendering-content')!
        .insertBefore(document.createTextNode('Wrapless content'), rootElement.querySelector('#end_test_field'));
      const openChrome: MarkupChrome = {
        chromeType: 'field',
        kind: 'open',
        element: rootElement.querySelector('#start_test_field')!,
      };
      const closeChrome: MarkupChrome = {
        chromeType: 'field',
        kind: 'close',
        element: rootElement.querySelector('#end_test_field')!,
      };
      const result = await shallowChromeParser.parseFieldChrome(openChrome, closeChrome);
      expect(result.element.tagName).toEqual('SPAN');
      expect(result.element.textContent?.trim()).toEqual('Wrapless content');
    });

    describe('should return non-editable field chrome if it is not present in the collection of editable fields', () => {
      it('when is not matched by field id', async () => {
        const openChrome: MarkupChrome = {
          chromeType: 'field',
          kind: 'open',
          element: rootElement.querySelector('#start_test_field')!,
        };
        const closeChrome: MarkupChrome = {
          chromeType: 'field',
          kind: 'close',
          element: rootElement.querySelector('#end_test_field')!,
        };

        editingData.fields[0].fieldId = '{1D4B4B6E-199F-4756-98FA-D096CFF14048}';

        const result = await shallowChromeParser.parseFieldChrome(openChrome, closeChrome);
        expect(result instanceof NonEditableFieldChrome).toBe(true);
      });

      it('when is not matched by item id', async () => {
        const openChrome: MarkupChrome = {
          chromeType: 'field',
          kind: 'open',
          element: rootElement.querySelector('#start_test_field')!,
        };
        const closeChrome: MarkupChrome = {
          chromeType: 'field',
          kind: 'close',
          element: rootElement.querySelector('#end_test_field')!,
        };

        editingData.fields[0].itemId = '{A60963EF-A4A1-4DE5-929B-AEB39D798B0E}';

        const result = await shallowChromeParser.parseFieldChrome(openChrome, closeChrome);
        expect(result instanceof NonEditableFieldChrome).toBe(true);
      });

      it('when is not matched by item language', async () => {
        const openChrome: MarkupChrome = {
          chromeType: 'field',
          kind: 'open',
          element: rootElement.querySelector('#start_test_field')!,
        };
        const closeChrome: MarkupChrome = {
          chromeType: 'field',
          kind: 'close',
          element: rootElement.querySelector('#end_test_field')!,
        };

        editingData.fields[0].language = 'da';

        const result = await shallowChromeParser.parseFieldChrome(openChrome, closeChrome);
        expect(result instanceof NonEditableFieldChrome).toBe(true);
      });

      it('when is not matched by item version', async () => {
        const openChrome: MarkupChrome = {
          chromeType: 'field',
          kind: 'open',
          element: rootElement.querySelector('#start_test_field')!,
        };
        const closeChrome: MarkupChrome = {
          chromeType: 'field',
          kind: 'close',
          element: rootElement.querySelector('#end_test_field')!,
        };

        editingData.fields[0].version = 2;

        const result = await shallowChromeParser.parseFieldChrome(openChrome, closeChrome);
        expect(result instanceof NonEditableFieldChrome).toBe(true);
      });
    });
  });
});
