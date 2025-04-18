/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingP2PConnection } from '@sitecore/horizon-messaging';
import { CKEditorInline } from '../../../../../ckeditor5/build/ckeditor';
import { MessagingService } from '../../../messaging/messaging-service';

import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import { nextTick } from '@sitecore/horizon-messaging/dist/utils';
import { spyOnEvent } from '../../../messaging/event-emitter.testing';
import { EditingChannelDef } from '../../../messaging/horizon-canvas.contract.defs';
import {
  EditingCanvasEvents,
  EditingCanvasRpcServices,
  EditingHorizonEvents,
  EditingHorizonRpcServices,
  MediaSelectionResult,
} from '../../../messaging/horizon-canvas.contract.parts';
import { ConfigurationService } from '../../../services/configuration.service';
import { setupTestDOM, teardownTestDOM } from '../../../utils/dom.testing';
import { RichTextCkEditorFieldHandler } from './rich-text-ckeditor.field-handler';

describe(RichTextCkEditorFieldHandler.name, () => {
  let sut: RichTextCkEditorFieldHandler;
  let rootElement: Element;
  let sutElement: HTMLElement;
  let rawValueHolder: HTMLInputElement;
  let ckeditorInline: CKEditorInline;

  let editingChannel: TestMessagingP2PChannel<
    EditingHorizonEvents,
    EditingCanvasEvents,
    EditingHorizonRpcServices,
    EditingCanvasRpcServices
  >;

  let getItemPermissionsSpy: jasmine.Spy;
  let selectMediaSpy: jasmine.Spy;
  let editSourceCodeSpy: jasmine.Spy;
  let getPageFlowsSpy: jasmine.Spy;
  let getAbTestConfigStatusSpy: jasmine.Spy;

  const mediaSelectionResult: MediaSelectionResult = {
    status: 'OK',
    selectedValue: {
      src: 'http://samplesite.com/',
      alt: 'test',
      embeddedHtml: '<img src="http://samplesite.com/" alt="test">',
    },
  };

  beforeEach(async () => {
    rootElement = setupTestDOM(`
      <field type="rich-text">Field content</field>
    `);
    sutElement = rootElement.querySelector('.scWebEditInput') as HTMLElement;
    rawValueHolder = rootElement.querySelector('.scFieldValue') as HTMLInputElement;
    const abortControllerMock = new AbortController();

    getItemPermissionsSpy = jasmine.createSpy();
    selectMediaSpy = jasmine.createSpy();
    selectMediaSpy.and.callFake(async () => mediaSelectionResult);
    editSourceCodeSpy = jasmine.createSpy();
    editSourceCodeSpy.and.callFake(async (_value: string) => ({ status: 'OK', value: 'New code' }));
    getPageFlowsSpy = jasmine.createSpy();
    getAbTestConfigStatusSpy = jasmine.createSpy();

    editingChannel = makeTestMessagingP2PChannelFromDef(EditingChannelDef, {
      reloadCanvas: () => {},
      getItemPermissions: (): any => {
        return getItemPermissionsSpy();
      },
      selectMedia: (): any => {
        return selectMediaSpy();
      },
      editSourceCode: (value): any => {
        return editSourceCodeSpy(value);
      },
      addPhoneNumber: (): any => {},
      getPageFlows: (_itemId, _language) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return getPageFlowsSpy();
      },
      getAbTestConfigStatus(_itemId, _language) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return getAbTestConfigStatusSpy();
      },
      promptSelectPage: (): any => {},
      setRenderingParams: (): any => {},
    });

    const hostSpy = jasmine.createSpyObj<MessagingP2PConnection>('MessagingConnection', { getChannel: undefined });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    hostSpy.getChannel.and.callFake((channelDef: any) => (({ editing: editingChannel }) as any)[channelDef.name]);
    const messagingService = new MessagingService(hostSpy);

    ConfigurationService.xmCloudTenantUrl = 'https://xmc001';
    sut = new RichTextCkEditorFieldHandler(sutElement, rawValueHolder, messagingService, abortControllerMock);
    await sut.init();
    const ckeditorElement = sutElement as HTMLElement & { ckeditorInstance: CKEditorInline };
    ckeditorInline = ckeditorElement.ckeditorInstance;
  });

  afterEach(() => {
    rootElement.parentElement?.classList.remove('ck-content');
    teardownTestDOM(rootElement);
    sut.destructor();

    ConfigurationService.xmCloudTenantUrl = '';
  });

  describe('setValue', () => {
    it('should convert relative xmc media links to absolute xmc link', () => {
      const rawValue = '<p><img src="-/media/image001"><img src="not/xmc/relative"><img src="https://not/xmc/absolute"></p>';
      const expectedRawValue =
        // eslint-disable-next-line max-len
        '<div class="ck-content"><p><img src="https://xmc001/-/media/image001"><img src="not/xmc/relative"><img src="https://not/xmc/absolute"></p></div>';

      sut.setValue({ rawValue });

      expect(sut['readEditorHtml']()).toEqual(expectedRawValue);
    });
  });

  describe('readValue', () => {
    it('should convert absolute xmc media links to relative', () => {
      const rawValue = '<p><img src="https://xmc001/image001"><img src="https://notXMC/image002"></p>';
      const expectedRawValue = '<div class="ck-content"><p><img src="image001"><img src="https://notXMC/image002"></p></div>';
      sut.setValue({ rawValue });

      expect(sut.getValue()).toEqual({ rawValue: expectedRawValue });
    });
  });

  describe('init', () => {
    it('should instantiate editor', () => {
      expect(ckeditorInline).toBeTruthy();
    });

    it('should read field initial value when no change in editor', () => {
      expect(sut.getValue()).toEqual({ rawValue: '<div class="ck-content"><p>Field content</p></div>' });
    });

    it('should set and get editor value', () => {
      const expectRawValue = { rawValue: '<div class="ck-content"><p>This is a test value.</p></div>' };
      const rawValue = { rawValue: '<p>This is a test value.</p>' };

      sut.setValue(rawValue);
      const retrievedValue = sut.getValue();

      expect(retrievedValue).toEqual(expectRawValue);
    });

    it('should get dimensions with additional width', () => {
      const dimensions = sut.getDimensions();

      expect(dimensions.width).toBeGreaterThan(0);
      expect(dimensions.height).toBeGreaterThan(0);
    });
  });

  describe('editor commands', () => {
    beforeEach(() => {
      sut.setValue({ rawValue: '' });
      ckeditorInline.execute('removeFormat');
    });

    it('should make the text bold', () => {
      const expectRawValue = { rawValue: '<div class="ck-content"><p><strong>This is a test value.</strong></p></div>' };
      const rawValue = { rawValue: '<p>This is a test value.</p>' };

      sut.setValue(rawValue);
      ckeditorInline.execute('selectAll');
      ckeditorInline.execute('bold');
      const retrievedValue = sut.getValue();

      expect(retrievedValue).toEqual(expectRawValue);
    });

    it('should apply heading', () => {
      const expectRawValue = { rawValue: '<div class="ck-content"><h2>This is a test value.</h2></div>' };
      const rawValue = { rawValue: '<p>This is a test value.</p>' };

      sut.setValue(rawValue);
      ckeditorInline.execute('selectAll');
      ckeditorInline.execute('heading', { value: 'heading2' });
      const retrievedValue = sut.getValue();

      expect(retrievedValue).toEqual(expectRawValue);
    });

    it('should apply indent block', () => {
      const expectRawValue = { rawValue: '<div class="ck-content"><p style="margin-left:80px;">This is a test value.</p></div>' };
      const rawValue = { rawValue: '<p>This is a test value.</p>' };

      sut.setValue(rawValue);

      ckeditorInline.execute('selectAll');
      ckeditorInline.execute('indentBlock');
      ckeditorInline.execute('indentBlock');
      const retrievedValue = sut.getValue();

      expect(retrievedValue).toEqual(expectRawValue);
    });

    it('should apply lists', () => {
      const expectRawValue = {
        rawValue: '<div class="ck-content"><ol style="list-style-type:lower-roman;"><li>This is a test value.</li></ol></div>',
      };
      const rawValue = { rawValue: '<p>This is a test value.</p>' };

      sut.setValue(rawValue);
      ckeditorInline.execute('selectAll');
      ckeditorInline.execute('listStyle', { type: 'lower-roman' });
      const retrievedValue = sut.getValue();

      expect(retrievedValue).toEqual(expectRawValue);
    });

    it('should able to add media', async () => {
      const expectRawValue = {
        rawValue: '<div class="ck-content"><figure class="image"><img src="http://samplesite.com/" alt="test"></figure></div>',
      };

      ckeditorInline.execute('removeFormat');
      ckeditorInline.fire('horizon-media-selection');
      await nextTick();

      const retrievedValue = sut.getValue();

      expect(retrievedValue).toEqual(expectRawValue);
    });

    it('should able to apply style on image', async () => {
      const expectRawValue = {
        rawValue:
          '<div class="ck-content"><figure class="image image-style-side"><img src="http://samplesite.com/" alt="test"></figure></div>',
      };

      ckeditorInline.fire('horizon-media-selection');
      await nextTick();
      ckeditorInline.execute('imageStyle', { value: 'side' });

      const retrievedValue = sut.getValue();

      expect(retrievedValue).toEqual(expectRawValue);
    });

    it('should add link', () => {
      const expectRawValue = { rawValue: '<div class="ck-content"><p><a href="http://example.com">link text</a></p></div>' };
      const rawValue = { rawValue: '<p>link text</p>' };

      sut.setValue(rawValue);
      ckeditorInline.execute('selectAll');
      ckeditorInline.execute('link', 'http://example.com');
      const retrievedValue = sut.getValue();

      expect(retrievedValue).toEqual(expectRawValue);
    });

    it('should add table and row to it', () => {
      const rawValue =
        // eslint-disable-next-line max-len
        '<div class="ck-content"><figure class="table"><table><tbody><tr><td>&nbsp;</td></tr><tr><td>&nbsp;</td></tr></tbody></table></figure></div>';
      const expectRawValue = { rawValue };

      ckeditorInline.execute('insertTable', { rows: 1, columns: 1 });
      ckeditorInline.execute('insertTableRowBelow');
      const retrievedValue = sut.getValue();

      expect(retrievedValue).toEqual(expectRawValue);
    });

    it('should clear formatting', () => {
      const expectRawValueWithFormat = { rawValue: '<div class="ck-content"><p><strong>This is a test value.</strong></p></div>' };
      const expectRawValueWithoutFormat = { rawValue: '<div class="ck-content"><p>This is a test value.</p></div>' };

      sut.setValue(expectRawValueWithFormat);

      ckeditorInline.execute('selectAll');
      ckeditorInline.execute('removeFormat');
      const retrievedValuewithoutFormatting = sut.getValue();
      expect(retrievedValuewithoutFormatting).toEqual(expectRawValueWithoutFormat);
    });

    it('should trigger go to parent', () => {
      const spy = spyOnEvent(sut.onAction);
      ckeditorInline.fire('horizon-go-to-parent');

      expect(spy).toHaveBeenCalled();
    });

    it('should trigger opening source code editor', async () => {
      ckeditorInline.fire('horizon-edit-source-code');
      await nextTick();

      const retrievedValue = sut.getValue().rawValue;
      expect(retrievedValue).toContain('New code');
    });

    it('should trigger resetting of the field value', async () => {
      ckeditorInline.fire('horizon-reset-field-value');
      await nextTick();

      const retrievedValue = sut.getValue().rawValue;
      expect(retrievedValue).toBe('');
    });

    it('should not add wrapper container for the output html if one of the parent elements contains ck-content class', async () => {
      const rawValue = { rawValue: '<p>This is a test value.</p>' };

      rootElement.parentElement?.classList.add('ck-content');
      await sut.init();

      sut.setValue(rawValue);

      const retrievedValue = sut.getValue();
      expect(retrievedValue).toEqual(rawValue);
    });

    // Check that CKE does not make double wrappers after it re-inits
    it('should not add an extra wrapper container for the output html if it is already present', async () => {
      const expectRawValue = { rawValue: '<div class="ck-content"><p><strong>Text one</strong></p><p><strong>Text two</strong></p></div>' };
      const rawValue = { rawValue: '<div class="ck-content"><p>Text one</p><p>Text two</p></div>' };

      /* Re-init the whole CKE - START */
      const hostSpy = jasmine.createSpyObj<MessagingP2PConnection>('MessagingConnection', { getChannel: undefined });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      hostSpy.getChannel.and.callFake((channelDef: any) => (({ editing: editingChannel }) as any)[channelDef.name]);
      const messagingService = new MessagingService(hostSpy);
      sut = new RichTextCkEditorFieldHandler(
        sutElement,
        { ...rawValueHolder, ...{ value: rawValue.rawValue } },
        messagingService,
        new AbortController(),
      );
      await sut.init();
      const ckeditorElement = sutElement as HTMLElement & { ckeditorInstance: CKEditorInline };
      ckeditorInline = ckeditorElement.ckeditorInstance;
      /* Re-init the whole CKE - END */

      sut.setValue(rawValue);

      ckeditorInline.execute('selectAll');
      ckeditorInline.execute('bold');

      const retrievedValue = sut.getValue();
      expect(retrievedValue).toEqual(expectRawValue);
    });
  });
});
