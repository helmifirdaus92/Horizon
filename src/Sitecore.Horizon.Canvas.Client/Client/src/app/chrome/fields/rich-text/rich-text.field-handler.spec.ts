/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannelFromChannel } from '@sitecore/horizon-messaging/dist/testing';
import Quill from 'quill';
import { spyOnEvent } from '../../../messaging/event-emitter.testing';
import { ConfigurationService } from '../../../services/configuration.service';
import { setupTestDOM, teardownTestDOM } from '../../../utils/dom.testing';
import { RhsFieldEditorMessaging } from '../../chrome.field';
import { readEditorHTML } from './rich-text-read-html';
import { RhsChannel, RhsChannelDef, RichTextFieldHandler } from './rich-text.field-handler';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

describe(RichTextFieldHandler.name, () => {
  let sut: RichTextFieldHandler;
  let rootElement: Element;
  let sutElement: HTMLElement;
  let rawValueHolder: HTMLInputElement;
  let quillEditor: Quill;
  let messaging: TestMessagingP2PChannelFromChannel<RhsChannel>;
  let abortController: AbortController;

  beforeEach(() => {
    rootElement = setupTestDOM(`
      <field type="rich-text">Field content</field>
    `);
    sutElement = rootElement.querySelector('.scWebEditInput') as HTMLElement;
    rawValueHolder = rootElement.querySelector('.scFieldValue') as HTMLInputElement;

    messaging = makeTestMessagingP2PChannelFromDef(RhsChannelDef, {});
    const rhsMessaging = jasmine.createSpyObj<RhsFieldEditorMessaging>('messaging', {
      getChannel: messaging as any,
    });

    abortController = new AbortController();
    sut = new RichTextFieldHandler(sutElement, rawValueHolder, rhsMessaging, abortController);
    sut.init();
    quillEditor = Quill.find(sutElement);

    ConfigurationService.xmCloudTenantUrl = 'https://xmc001';
  });

  afterEach(() => {
    teardownTestDOM(rootElement);
    ConfigurationService.xmCloudTenantUrl = '';
  });

  it('should instantiate using QuillJS editor', () => {
    expect(quillEditor).toBeTruthy();
  });

  it('should remove contenteditable attribute from original element', () => {
    expect(sutElement.getAttribute('contenteditable')).toBe(null);
  });

  it('should set outline style of .ql-editor to `none`', () => {
    expect(quillEditor.root.style.outline).toBe('none');
  });

  describe('onSelect() callback', () => {
    it('should be called when field gets focus (from user keyboard tab navigation or click)', () => {
      const spy = spyOnEvent(sut.onSelect);

      quillEditor.root.dispatchEvent(new Event('focus'));

      expect(spy).toHaveBeenCalled();
    });

    it('should not be called when field is deselected', () => {
      quillEditor.root.dispatchEvent(new Event('focus'));

      const spy = spyOnEvent(sut.onSelect);

      quillEditor.root.dispatchEvent(new Event('blur'));
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('onChange() callback', () => {
    it('should be called when there is a text change', () => {
      const spy = spyOnEvent(sut.onChange);

      quillEditor.setText('foo');
      expect(spy).toHaveBeenCalled();
    });

    it('should be called when formatting of text changes', () => {
      const spy = spyOnEvent(sut.onChange);

      quillEditor.formatText(0, 2, 'bold', true);
      expect(spy).toHaveBeenCalled();
    });

    it('should be called when field is deselected', () => {
      const spy = spyOnEvent(sut.onChange);

      quillEditor.focus();
      quillEditor.blur();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onBeforeSave', () => {
    it('should convert absolute xmc media links to relative', () => {
      const rawValue = '<p><img src="https://xmc001/image001"><img src="https://notXMC/image002"></p>';
      const expectedRawValue = '<p><img src="image001"><img src="https://notXMC/image002"></p>';
      quillEditor.clipboard.dangerouslyPasteHTML(rawValue);

      expect(sut.onBeforeSave(rawValue)).toEqual(expectedRawValue);
    });
  });

  describe('setValue', () => {
    it('should convert relative xmc media links to absolute xmc link', () => {
      const rawValue = '<p><img src="-/media/image001"><img src="not/xmc/relative"><img src="https://not/xmc/absolute"></p>';
      const expectedRawValue =
        '<p><img src="https://xmc001/-/media/image001"><img src="not/xmc/relative"><img src="https://not/xmc/absolute"></p>';

      sut.setValue({ rawValue });

      expect(readEditorHTML(quillEditor)).toEqual(expectedRawValue);
    });
  });

  describe('readValue', () => {
    it('should convert absolute xmc media links to relative', () => {
      const rawValue = '<p><img src="https://xmc001/image001"><img src="https://notXMC/image002"></p>';
      const expectedRawValue = '<p><img src="image001"><img src="https://notXMC/image002"></p>';
      quillEditor.clipboard.dangerouslyPasteHTML(rawValue);

      expect(sut.getValue()).toEqual({ rawValue: expectedRawValue });
    });

    it('should read editor value', () => {
      quillEditor.setText('foo');

      expect(sut.getValue()).toEqual({ rawValue: '<p>foo</p>' });
    });

    it('should read editor value with formatting', () => {
      quillEditor.setText('foo');
      quillEditor.formatText(0, 2, 'bold', true);

      expect(sut.getValue()).toEqual({ rawValue: '<p><strong>fo</strong>o</p>' });
    });

    it('should read editor value with link', () => {
      const link = {
        url: 'http://lorem',
      };
      quillEditor.formatText(0, 2, 'link', link);

      expect(sut.getValue().rawValue).toContain(link.url);
    });

    it('should read field initial value when no change in editor', () => {
      expect(sut.getValue()).toEqual({ rawValue: '<p>Field content</p>' });
    });

    it('should read correct editor value when set through set value', () => {
      sut.setValue({ rawValue: 'foo' });

      expect(sut.getValue()).toEqual({ rawValue: '<p>foo</p>' });
    });

    it('should read empty when set empty through set value', () => {
      sut.setValue({ rawValue: '' });

      expect(sut.getValue()).toEqual({ rawValue: '' });
    });

    it('should set value to rawValueHolder', () => {
      sut.setValue({ rawValue: 'foo' });

      expect(rawValueHolder.value).toEqual('<p>foo</p>');
    });
  });

  describe('placeholder/watermark text', () => {
    it('should remove content, when it matches watermark', () => {
      // Kill already created test tree.
      teardownTestDOM(rootElement);

      rootElement = setupTestDOM(`
        <field type="rich-text" />
      `);
      sutElement = rootElement.querySelector('.scWebEditInput') as HTMLElement;
      rawValueHolder = rootElement.querySelector('.scFieldValue') as HTMLInputElement;
      rawValueHolder.value = '';

      const rhsMessaging = jasmine.createSpyObj<RhsFieldEditorMessaging>('messaging', {
        getChannel: messaging as any,
      });
      sut = new RichTextFieldHandler(sutElement, rawValueHolder, rhsMessaging, new AbortController());
      quillEditor = Quill.find(sutElement);

      expect(quillEditor.root.textContent).toBe('');
    });

    it('should display empty text field when user enters field and changes the text', () => {
      quillEditor.focus();
      quillEditor.setText('');
      expect(quillEditor.getText().trim()).toBe('');
    });

    it('should display empty text when user re-enters field that displays no-text placeholder/watermark text', () => {
      quillEditor.focus(); // user enters field
      quillEditor.setText(''); // changes text
      quillEditor.blur(); // leaves field
      quillEditor.focus(); // re-enters field
      expect(quillEditor.getText().trim()).toBe('');
    });

    it('readValue() should return empty string on if no value change in editor', () => {
      // arrange
      // Kill already created test tree.
      teardownTestDOM(rootElement);

      rootElement = setupTestDOM(`
        <field type="rich-text" />
      `);
      sutElement = rootElement.querySelector('.scWebEditInput') as HTMLElement;
      rawValueHolder = rootElement.querySelector('.scFieldValue') as HTMLInputElement;
      rawValueHolder.value = '';

      const rhsMessaging = jasmine.createSpyObj<RhsFieldEditorMessaging>('messaging', {
        getChannel: messaging as any,
      });

      // act
      sut = new RichTextFieldHandler(sutElement, rawValueHolder, rhsMessaging, new AbortController());

      // assert
      expect(sut.getValue()).toEqual({ rawValue: '' });
    });
  });

  describe('messaging', () => {
    describe('getSelection', () => {
      it('should return current selection and formatting info', async () => {
        spyOn(quillEditor, 'getSelection').and.returnValue({ index: 42, length: 24 });
        spyOn(quillEditor, 'getFormat').and.returnValue({ bold: true });

        const result = await Promise.resolve(messaging.registeredRpcServicesImpl!.getSelection());

        expect(result.hasSelection).toBeTrue();
        expect(result.format).toEqual({ bold: true });
      });
    });

    describe('setFormatting()', () => {
      it('should set format for each format provided', () => {
        const spy = spyOn(quillEditor, 'format');

        messaging.registeredRpcServicesImpl!.setFormatting({
          bold: true,
          italic: true,
          align: 'left',
        });

        expect(spy).toHaveBeenCalledTimes(3);
      });

      it('should set format for non undefined format provided', () => {
        const spy = spyOn(quillEditor, 'format');

        messaging.registeredRpcServicesImpl!.setFormatting({
          bold: true,
          italic: undefined,
          align: 'left',
        });

        expect(spy).toHaveBeenCalledTimes(2);
      });
    });

    describe('clearFormatting()', () => {
      it('should clear formatting at current cursor position', () => {
        spyOn(quillEditor, 'getSelection').and.returnValue({ index: 42, length: 24 });
        const spy = spyOn(quillEditor, 'removeFormat');

        messaging.registeredRpcServicesImpl!.clearFormatting();

        expect(spy).toHaveBeenCalledWith(42, 24, 'api');
      });
    });

    describe('insertHtmlAtCaretPos()', () => {
      it('should insert markup at current cursor position', () => {
        spyOn(quillEditor, 'getSelection').and.returnValue({ index: 42, length: 0 });
        const spy = spyOn(quillEditor.clipboard, 'dangerouslyPasteHTML');
        const html = '<tag />';

        messaging.registeredRpcServicesImpl!.insertHtmlAtCaretPos(html);

        expect(spy).toHaveBeenCalledWith(42, html, 'api');
      });

      it('should convert xmc media links to absolute', () => {
        spyOn(quillEditor, 'getSelection').and.returnValue({ index: 42, length: 0 });
        const spy = spyOn(quillEditor.clipboard, 'dangerouslyPasteHTML');

        const rawValue = '<p><img src="-/media/image001"><img src="not/xmc/relative"><img src="https://not/xmc/absolute"></p>';
        const expectedRawValue =
          '<p><img src="https://xmc001/-/media/image001"><img src="not/xmc/relative"><img src="https://not/xmc/absolute"></p>';

        messaging.registeredRpcServicesImpl!.insertHtmlAtCaretPos(rawValue);

        expect(spy).toHaveBeenCalledWith(42, expectedRawValue, 'api');
      });
    });

    describe('getValue()', () => {
      it('should return rawValue', async () => {
        const rawValue = '<p>foo</p>';
        quillEditor.clipboard.dangerouslyPasteHTML(rawValue);

        const result = await messaging.registeredRpcServicesImpl!.getValue();

        expect(result).toBe(rawValue);
      });
    });

    describe('getValue()', () => {
      it('should return rawValue', async () => {
        const rawValue = '<p>foo</p>';

        await messaging.registeredRpcServicesImpl!.setValue(rawValue);

        expect(sut.getValue().rawValue).toBe(rawValue);
      });
    });
  });

  it('should prefix css class with `rte`, when `align` is set', () => {
    quillEditor.format('align', 'left');

    expect(sutElement.querySelector('.rte-align-left')).toBeTruthy();
  });

  it('should prefix css class with `rte`, when `indent` is set', () => {
    quillEditor.format('indent', 2);

    expect(sutElement.querySelector('.rte-indent-2')).toBeTruthy();
  });

  describe('link', () => {
    it('should add a link, when `link` is set', () => {
      const link = {
        url: 'http://lorem',
      };

      quillEditor.formatText(0, 2, 'link', link);

      const el = sutElement.querySelector('a[href="http://lorem"]') as HTMLAnchorElement;

      expect(el).toBeTruthy();
      expect(el.title).toBeFalsy();
      expect(el.target).toBeFalsy();
    });

    it('should set `title` attribute, when `title` is set', () => {
      const link = {
        url: 'http://lorem',
        title: 'ipsum',
      };

      quillEditor.formatText(0, 2, 'link', link);

      const el = sutElement.querySelector('a[href="http://lorem"]') as HTMLAnchorElement;

      expect(el.title).toBe('ipsum');
    });

    it('should set `target` attribute, when `target` is set', () => {
      const link = {
        url: 'http://lorem',
        target: 'ipsum',
      };

      quillEditor.formatText(0, 2, 'link', link);

      const el = sutElement.querySelector('a[href="http://lorem"]') as HTMLAnchorElement;

      expect(el.target).toBe('ipsum');
    });

    describe('WHEN cursor is whithin an existed link', () => {
      describe('AND user edits the link', () => {
        it('should apply changes to the whole link', () => {
          quillEditor.formatText(
            0,
            13,
            'link',
            {
              url: 'http://lorem',
            },
            'user',
          );
          quillEditor.setSelection(5, 0, 'user');
          messaging.registeredRpcServicesImpl!.setFormatting({
            link: {
              url: 'http://foo',
              target: 'bar',
              title: 'baz',
            },
          });
          const el = sutElement.querySelector('a') as HTMLElement;

          expect(el.outerHTML).toBe('<a href="http://foo" rel="noopener noreferrer" title="baz" target="bar">Field content</a>');
        });
      });
    });

    describe('WHEN selection is whithin an existed link', () => {
      describe('AND user edits the link', () => {
        it('should apply changes to the whole link', () => {
          quillEditor.formatText(
            0,
            13,
            'link',
            {
              url: 'http://lorem',
            },
            'user',
          );
          quillEditor.setSelection(5, 5, 'user');
          messaging.registeredRpcServicesImpl!.setFormatting({
            link: {
              url: 'http://foo',
              target: 'bar',
              title: 'baz',
            },
          });
          const el = sutElement.querySelector('a') as HTMLElement;

          expect(el.outerHTML).toBe('<a href="http://foo" rel="noopener noreferrer" title="baz" target="bar">Field content</a>');
        });
      });
    });
  });

  describe('Should not raise events after abort', () => {
    it('should not emit onChange', () => {
      const spy = spyOnEvent(sut.onChange);

      abortController.abort();
      quillEditor.root.focus();
      quillEditor.root.blur();

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
