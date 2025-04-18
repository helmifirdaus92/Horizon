/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { makeTestMessagingP2PChannelFromDef } from '@sitecore/horizon-messaging/dist/testing';
import { MessagingService } from '../messaging/messaging-service';
import { ConfigurationService } from '../services/configuration.service';
import { setupTestDOM, teardownTestDOM } from '../utils/dom.testing';
import { Chrome } from './chrome';
import { ChromeInlineEditorFactory } from './chrome-inline-editor-factory';
import { ChromeReader } from './chrome-reader';
import { FieldChrome, isFieldChrome } from './chrome.field';
import { PlaceholderChrome, isPlaceholderChrome } from './chrome.placeholder';
import { RenderingChrome, isRenderingChrome } from './chrome.rendering';
import { RenderingChromeUtilsChannelDef, RenderingPropertiesEditorChannelDef } from './chrome.rendering.inline-editor';
import { InlineChromeParser } from './read/inline-chrome-parser';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

describe(ChromeReader.name, () => {
  let sut: ChromeReader<InlineChromeParser>;
  let rootElement: Element;
  let inlineEditorFactory: jasmine.SpyObj<ChromeInlineEditorFactory>;

  beforeEach(() => {
    ConfigurationService.xmCloudTenantUrl = 'https://xmc001';

    rootElement = setupTestDOM(`
      <placeholder key="content">
        <rendering id="rendering">
          <field type="rich-text" />
          <field type="image" />
          <field type="single-line text" />
          <field type="general link" />
          <field type="number" />
          <field type="integer" />
        </rendering>
      </placeholder>
    `);

    inlineEditorFactory = jasmine.createSpyObj<ChromeInlineEditorFactory>({
      createRenderingChromeEditor: Promise.resolve({
        inlineEditorMessagingProtocols: ['proto1', 'proto2'],
        connectMessaging: () => undefined,
        getInlineEditorMessaging: () => makeTestMessagingP2PChannelFromDef(RenderingPropertiesEditorChannelDef, {}),
        getRenderingChromeUtilsMessaging: () => makeTestMessagingP2PChannelFromDef(RenderingChromeUtilsChannelDef, {}),
      }),
    });
    const messagingService = jasmine.createSpyObj<MessagingService>('MessagingService', ['setEditingChannelRpcServices']);
    const chromeParser = new InlineChromeParser(inlineEditorFactory, messagingService, new AbortController());
    sut = new ChromeReader(chromeParser);
  });

  afterEach(() => {
    ConfigurationService.xmCloudTenantUrl = '';
    teardownTestDOM(rootElement);
  });

  it('should create a chrome for each definition found', async () => {
    const result = await sut.readChromes(rootElement);

    expect(result.length).toBe(8);
  });

  it('should respect hierarchy', async () => {
    const chromes = await sut.readChromes(rootElement);

    // Placeholder
    const placeholder = chromes.find(isPlaceholderChrome)!;
    expect(placeholder).toBeTruthy();
    expect(placeholder.parentChrome).toBeFalsy();
    // Rendering
    expect(placeholder.childChromes.length).toBe(1);
    const [rendering] = placeholder.childChromes;
    expect(isRenderingChrome(rendering)).toBeTruthy();
    expect(rendering.parentChrome).toBe(placeholder);
    // Fields
    expect(rendering.childChromes.length).toBe(6);
    const [richField, imgField, singleLineField, generalLinkField, numberField, integerField] = rendering.childChromes as [
      FieldChrome,
      FieldChrome,
      FieldChrome,
      FieldChrome,
      FieldChrome,
      FieldChrome,
    ];
    expect(richField.fieldType).toBe('rich text');
    expect(richField.parentChrome).toBe(rendering);
    expect(imgField.fieldType).toBe('image');
    expect(imgField.parentChrome).toBe(rendering);
    expect(singleLineField.fieldType).toBe('single-line text');
    expect(singleLineField.parentChrome).toBe(rendering);
    expect(generalLinkField.fieldType).toBe('general link');
    expect(generalLinkField.parentChrome).toBe(rendering);
    expect(numberField.fieldType).toBe('number');
    expect(numberField.parentChrome).toBe(rendering);
    expect(integerField.fieldType).toBe('integer');
    expect(integerField.parentChrome).toBe(rendering);
  });

  it('should ignore edit frame', async () => {
    teardownTestDOM(rootElement);
    rootElement = setupTestDOM(`
      <rendering id="root">
        <editframe>
          <rendering id="inner" />
        </editframe>
      </rendering>
    `);

    const result = await sut.readChromes(rootElement);

    expect(result.length).toBe(2);
    const [innerRendering, rootRendering] = result;
    expect(isRenderingChrome(rootRendering)).toBe(true);
    expect(isRenderingChrome(innerRendering)).toBe(true);
    expect(innerRendering.parentChrome).toBe(rootRendering);
  });

  it('should pass renderingInlineEditor to inlineFactory and use result', async () => {
    teardownTestDOM(rootElement);
    rootElement = setupTestDOM(`<rendering id="root" inlineEditor="test-inline-editor-3"></rendering>`);

    const result = await sut.readChromes(rootElement);

    expect(inlineEditorFactory.createRenderingChromeEditor).toHaveBeenCalledWith(
      jasmine.anything(),
      jasmine.anything(),
      'test-inline-editor-3',
    );
    expect(result.length).toBe(1);
    const [renderingChrome] = result as [RenderingChrome];
    expect(renderingChrome.inlineEditor.inlineEditorMessagingProtocols).toEqual(['proto1', 'proto2']);
  });

  it('should create stable chrome IDs', async () => {
    // arrange
    function findMatchingChrome<TChrome extends Chrome>(chrome: TChrome, chromes: readonly Chrome[]): TChrome | undefined {
      return chromes.find((c) => c.chromeId === chrome.chromeId) as TChrome | undefined;
    }

    // act
    teardownTestDOM(rootElement);
    rootElement = setupTestDOM(`
      <placeholder key="ph1">PH1</placeholder>
      <rendering id="rnd_1" rid="rendering_A">RND_1</rendering>
      <rendering id="rnd_2" rid="rendering_B">RND_2</rendering>
      <placeholder key="ph2">PH2</placeholder>
    `);
    const result1 = await sut.readChromes(rootElement);

    teardownTestDOM(rootElement);
    rootElement = setupTestDOM(`
      <placeholder key="ph2">PH2</placeholder>
      <rendering id="rnd_2" rid="rendering_B">RND_2</rendering>
      <rendering id="rnd_1" rid="rendering_A">RND_1</rendering>
    `);
    const result2 = await sut.readChromes(rootElement);

    // assert
    const [ph1, rnd1, rnd2, ph2] = result1 as [PlaceholderChrome, RenderingChrome, RenderingChrome, PlaceholderChrome];

    expect(findMatchingChrome(ph1, result2)).toBeUndefined();
    expect(findMatchingChrome(ph2, result2)?.startElement.nextSibling?.nextSibling?.textContent?.trim()).toBe('PH2');
    expect(findMatchingChrome(rnd1, result2)?.renderingInstanceId).toBe(rnd1.renderingInstanceId);
    expect(findMatchingChrome(rnd2, result2)?.renderingInstanceId).toBe(rnd2.renderingInstanceId);
  });

  it('should read custom chrome data from the markup', async () => {
    teardownTestDOM(rootElement);
    rootElement = setupTestDOM(
      // eslint-disable-next-line max-len
      `<rendering id="id1" rid="rid1" appliedPersonalizationActions='["SetDataSourceAction", "HideRenderingAction", "SetRenderingAction"]' editable="true">RND_1</rendering>`,
    );

    const rendering = (await sut.readChromes(rootElement))[0] as RenderingChrome;
    expect(rendering.appliedPersonalizationActions).toEqual(['SetDataSourceAction', 'HideRenderingAction', 'SetRenderingAction']);
    expect(rendering.renderingInstanceId).toBe('id1');
    expect(rendering.renderingDefinitionId).toBe('rid1');
    expect(rendering.editable).toBe(true);
    expect(rendering.itemContext.id).toEqual('{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}');
    expect(rendering.itemContext.language).toEqual('en');
    expect(rendering.itemContext.version).toEqual(1);
    expect(rendering.itemContext.revision).toEqual('56afab7f-7250-45ef-a3ab-ab0cf6daaf06');
  });

  describe('read display name', () => {
    it('should set display name to FEaaS component name', async () => {
      teardownTestDOM(rootElement);
      rootElement = setupTestDOM(
        // eslint-disable-next-line max-len
        `<rendering id="id1" rid="rid1" FEaasComponentName="FEaaS component1 name" displayName="component ABC name" editable="true">RND_1</rendering>`,
      );

      const rendering = (await sut.readChromes(rootElement))[0] as RenderingChrome;
      expect(rendering.renderingInstanceId).toBe('id1');
      expect(rendering.displayName).toBe('FEaaS component1 name');
    });

    it('should read displayName', async () => {
      teardownTestDOM(rootElement);
      rootElement = setupTestDOM(`<rendering id="id1" rid="rid1" displayName="component ABC name" editable="true">RND_1</rendering>`);

      const rendering = (await sut.readChromes(rootElement))[0] as RenderingChrome;
      expect(rendering.renderingInstanceId).toBe('id1');
      expect(rendering.displayName).toBe('component ABC name');
    });
  });

  it('should correctly parse nested fields', async () => {
    // arrange
    teardownTestDOM(rootElement);
    rootElement = setupTestDOM(`
      <rendering id="rnd_1" rid="Rendering A">
        <field type="general link" linktype="external" id="link" url="https://example.com">
          <field type="single-line text" id="txt">Field text</field>
        </field>
      </rendering>
    `);

    // act
    const result = await sut.readChromes(rootElement);

    // assert
    expect(result.length).toBe(2);
    const rendering = result.find(isRenderingChrome)!;
    expect(rendering).toBeDefined();

    const field = result.find(isFieldChrome)!;
    expect(field).toBeDefined();

    expect(rendering.childChromes).toEqual([field]);
    expect(field.fieldId).toBe('txt');
  });
});
