/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannelFromChannel } from '@sitecore/horizon-messaging/dist/testing';
import { spyOnEvent } from '../../../messaging/event-emitter.testing';
import { fixFocusEventBehavior, setupTestDOM, teardownTestDOM } from '../../../utils/dom.testing';
import { RhsFieldEditorMessaging } from '../../chrome.field';
import {
  AnchorGeneralLink,
  ExternalGeneralLink,
  InternalGeneralLink,
  JavascriptGeneralLink,
  MailGeneralLink,
  MediaGeneralLink,
} from './general-link-value.type';
import { GeneralLinkFieldHandler, RhsChannel, RhsChannelDef } from './general-link.field-handler';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

describe(GeneralLinkFieldHandler.name, () => {
  let sut: GeneralLinkFieldHandler;
  let rootElement: HTMLElement;
  let sutElement: HTMLElement;
  let rawValueHolder: HTMLInputElement;
  let messaging: TestMessagingP2PChannelFromChannel<RhsChannel>;
  let abortController: AbortController;

  beforeEach(() => {
    rootElement = setupTestDOM(`
      <field type="general link" />
    `);
    sutElement = rootElement.querySelector('a')!;
    fixFocusEventBehavior(sutElement);

    rawValueHolder = rootElement.querySelector('.scFieldValue') as HTMLInputElement;
    rawValueHolder.value = `<link linktype="external" url="http://example.com" />`;

    messaging = makeTestMessagingP2PChannelFromDef(RhsChannelDef, {});
    const rhsMessaging = jasmine.createSpyObj<RhsFieldEditorMessaging>('messaging', {
      getChannel: messaging as any,
    });
    abortController = new AbortController();
    sut = new GeneralLinkFieldHandler(sutElement, rawValueHolder, rhsMessaging, abortController);
    sut.init();
  });

  afterEach(() => {
    teardownTestDOM(rootElement);
  });

  it('should make element focusable', () => {
    expect(sutElement.tabIndex).not.toEqual(-1);
  });

  it('should correctly parse initial value', () => {
    const value = sut.getValue();

    expect(value.model).toEqual(jasmine.objectContaining({ linktype: 'external', url: 'http://example.com' }));
  });

  it('should emit selection event on focus', () => {
    const spySubscriber = spyOnEvent(sut.onSelect);

    sutElement.focus();

    expect(spySubscriber).toHaveBeenCalled();
  });

  it('should not emit selection event on focus after abort', () => {
    const spySubscriber = spyOnEvent(sut.onSelect);
    abortController.abort();

    sutElement.focus();

    expect(spySubscriber).not.toHaveBeenCalled();
  });

  it('should focus element and emit event when selected by API', () => {
    const spy = spyOnEvent(sut.onSelect);

    sut.select();

    expect(spy).toHaveBeenCalled();
    expect(document.activeElement).toBe(sutElement);
  });

  it('should emit onChange event on change', () => {
    const spySubscriber = spyOnEvent(sut.onChange);
    const newValue = { rawValue: 'NEW RAW VALUE', model: { linktype: 'mailto', url: 'example@mail.com' } };

    sut.setValue(newValue);

    expect(spySubscriber).toHaveBeenCalledWith(jasmine.objectContaining({ value: newValue, debounce: false }));
  });

  it('should emit onSizeChange event on change', () => {
    const spySubscriber = spyOnEvent(sut.onSizeChange);
    const newValue = { rawValue: 'NEW RAW VALUE', model: { linktype: 'mailto', url: 'example@mail.com' } };

    sut.setValue(newValue);

    expect(spySubscriber).toHaveBeenCalled();
  });

  describe('messaging', () => {
    it('should return current value', () => {
      const value = messaging.registeredRpcServicesImpl!.getValue();

      expect(value).toEqual(jasmine.objectContaining({ linktype: 'external', url: 'http://example.com' }));
    });

    it('should set new value', () => {
      messaging.registeredRpcServicesImpl!.setValue({ linktype: 'mailto', url: 'example@mail.com' });

      expect(sut.getValue().model).toEqual(jasmine.objectContaining({ linktype: 'mailto', url: 'example@mail.com' }));
    });

    it('should emit event on change', () => {
      const newValue = { rawValue: '', model: { linktype: 'mailto', url: 'example@mail.com' } };

      sut.setValue(newValue);

      const events = messaging.getEmittedEvents('value:change' as never);
      expect(events.length).toBe(1);
      expect(events[0]).toEqual(jasmine.objectContaining({ linktype: 'mailto', url: 'example@mail.com' }));
    });
  });

  describe('rendering', () => {
    describe('external link', () => {
      it('should render link', () => {
        const link: ExternalGeneralLink = {
          linktype: 'external',
          url: 'http://example.com/',
          text: 'TEST TEXT',
          target: '_blank',
          title: 'TEST TITLE',
          class: 'TEST_CLASS_NAME',
        };
        const value = { rawValue: `SOME RAW VALUE`, model: link };

        sut.setValue(value);

        const linkElem = sutElement as HTMLAnchorElement;
        expect(linkElem.href).toBe(link.url);
        expect(linkElem.textContent).toBe(link.text!);
        expect(linkElem.target).toBe(link.target!);
        expect(linkElem.title).toBe(link.title!);
        expect(linkElem.className).toBe(link.class!);
        expect(rawValueHolder.value).toBe(value.rawValue);
      });

      it('should render link if text not specified', () => {
        const link: ExternalGeneralLink = {
          linktype: 'external',
          url: 'http://example.com/',
        };
        const value = { rawValue: `SOME RAW VALUE`, model: link };

        sut.setValue(value);

        const linkElem = sutElement as HTMLAnchorElement;
        expect(linkElem.textContent).toBe(link.url);
      });
    });

    describe('internal link', () => {
      it('should render link', () => {
        const link: InternalGeneralLink = {
          linktype: 'internal',
          item: { id: 'TEST_ITEM_ID', url: 'http://test_item/', displayName: 'TEST ITEM NAME' },
          text: 'TEST TEXT',
          target: '_blank',
          title: 'TEST TITLE',
          class: 'TEST_CLASS_NAME',
        };
        const value = { rawValue: `SOME RAW VALUE`, model: link };

        sut.setValue(value);

        const linkElem = sutElement as HTMLAnchorElement;
        expect(linkElem.href).toBe(link.item.url);
        expect(linkElem.textContent).toBe(link.text!);
        expect(linkElem.target).toBe(link.target!);
        expect(linkElem.title).toBe(link.title!);
        expect(linkElem.className).toBe(link.class!);
        expect(rawValueHolder.value).toBe(value.rawValue);
      });

      it('should render item name if text not specified', () => {
        const link: InternalGeneralLink = {
          linktype: 'internal',
          item: { id: 'TEST_ITEM_ID', url: 'http://test_item/', displayName: 'TEST ITEM NAME' },
        };
        const value = { rawValue: `SOME RAW VALUE`, model: link };

        sut.setValue(value);

        const linkElem = sutElement as HTMLAnchorElement;
        expect(linkElem.textContent).toBe(link.item.displayName);
      });

      new Array<[string | undefined, string | undefined, string, string]>(
        //
        ['key1=value1', undefined, '', '?key1=value1'],
        ['?key1=value1', undefined, '', '?key1=value1'],
        ['&key1=value1', undefined, '', '?key1=value1'],
        ['key2=value2', undefined, '?key1=value1', '?key1=value1&key2=value2'],
        ['?key2=value2', undefined, '?key1=value1', '?key1=value1&key2=value2'],
        ['&key2=value2', undefined, '?key1=value1', '?key1=value1&key2=value2'],
        [undefined, 'anc', '', '#anc'],
        [undefined, '#anc', '', '#anc'],
        ['key1=value1', 'anc', '', '?key1=value1#anc'],
        ['key2=value2', 'anc', '?key1=value1', '?key1=value1&key2=value2#anc'],
      ).forEach(([query, anchor, existing, expectedResult]) =>
        it(`[query='${query ?? '<no>'}' anchor='${anchor ?? '<no>'}' existing='${existing}'] should correctly build URL`, () => {
          const link: InternalGeneralLink = {
            linktype: 'internal',
            item: { id: 'TEST_ITEM_ID', url: `http://test_item/${existing}`, displayName: 'TEST ITEM NAME' },
            querystring: query,
            anchor,
          };
          const value = { rawValue: `SOME RAW VALUE`, model: link };

          sut.setValue(value);

          const linkElem = sutElement as HTMLAnchorElement;
          expect(linkElem.href).toBe(`http://test_item/${expectedResult}`);
          expect(rawValueHolder.value).toBe(value.rawValue);
        }),
      );
    });

    describe('media link', () => {
      it('should render link', () => {
        const link: MediaGeneralLink = {
          linktype: 'media',
          item: { id: 'TEST_ITEM_ID', url: 'http://test_item/', displayName: 'TEST ITEM NAME' },
          text: 'TEST TEXT',
          target: '_blank',
          title: 'TEST TITLE',
          class: 'TEST_CLASS_NAME',
        };
        const value = { rawValue: `SOME RAW VALUE`, model: link };

        sut.setValue(value);

        const linkElem = sutElement as HTMLAnchorElement;
        expect(linkElem.href).toBe(link.item.url);
        expect(linkElem.textContent).toBe(link.text!);
        expect(linkElem.target).toBe(link.target!);
        expect(linkElem.title).toBe(link.title!);
        expect(linkElem.className).toBe(link.class!);
        expect(rawValueHolder.value).toBe(value.rawValue);
      });

      it('should render display name if text not specified', () => {
        const link: MediaGeneralLink = {
          linktype: 'media',
          item: { id: 'TEST_ITEM_ID', url: 'http://test_item/', displayName: 'TEST ITEM NAME' },
        };
        const value = { rawValue: `SOME RAW VALUE`, model: link };

        sut.setValue(value);

        const linkElem = sutElement as HTMLAnchorElement;
        expect(linkElem.textContent).toBe(link.item.displayName);
        expect(rawValueHolder.value).toBe(value.rawValue);
      });
    });

    describe('anchor link', () => {
      ['test_anchor', '#test_anchor'].forEach((anchor) =>
        it(`[anchor='${anchor}'] should render link`, () => {
          const link: AnchorGeneralLink = {
            linktype: 'anchor',
            anchor,
            text: 'TEST TEXT',
            title: 'TEST TITLE',
            class: 'TEST_CLASS_NAME',
          };
          const value = { rawValue: `SOME RAW VALUE`, model: link };

          sut.setValue(value);

          const linkElem = sutElement as HTMLAnchorElement;
          expect(linkElem.href).toMatch(/#test_anchor$/);
          expect(linkElem.textContent).toBe(link.text!);
          expect(linkElem.title).toBe(link.title!);
          expect(linkElem.className).toBe(link.class!);
          expect(rawValueHolder.value).toBe(value.rawValue);
        }),
      );

      it('should render anchor if text not specified', () => {
        const link: AnchorGeneralLink = {
          linktype: 'anchor',
          anchor: 'test_anchor',
        };
        const value = { rawValue: `SOME RAW VALUE`, model: link };

        sut.setValue(value);

        const linkElem = sutElement as HTMLAnchorElement;
        expect(linkElem.textContent).toBe('#test_anchor');
        expect(rawValueHolder.value).toBe(value.rawValue);
      });
    });

    describe('mailto link', () => {
      ['example@mail.com', 'mailto:example@mail.com'].forEach((mail) =>
        it(`[mail='${mail}'] should render link`, () => {
          const link: MailGeneralLink = {
            linktype: 'mailto',
            url: mail,
            text: 'TEST TEXT',
            title: 'TEST TITLE',
            class: 'TEST_CLASS_NAME',
          };
          const value = { rawValue: `SOME RAW VALUE`, model: link };

          sut.setValue(value);

          const linkElem = sutElement as HTMLAnchorElement;
          expect(linkElem.href).toBe(`mailto:example@mail.com`);
          expect(linkElem.textContent).toBe(link.text!);
          expect(linkElem.title).toBe(link.title!);
          expect(linkElem.className).toBe(link.class!);
          expect(rawValueHolder.value).toBe(value.rawValue);
        }),
      );

      it('should render mail if text not specified', () => {
        const link: MailGeneralLink = {
          linktype: 'mailto',
          url: 'example@mail.com',
        };
        const value = { rawValue: `SOME RAW VALUE`, model: link };

        sut.setValue(value);

        const linkElem = sutElement as HTMLAnchorElement;
        expect(linkElem.textContent).toBe('mailto:example@mail.com');
        expect(rawValueHolder.value).toBe(value.rawValue);
      });
    });

    describe('javascript link', () => {
      it('should render link', () => {
        const link: JavascriptGeneralLink = {
          linktype: 'javascript',
          url: 'alert("hello")',
          text: 'TEST TEXT',
          title: 'TEST TITLE',
          class: 'TEST_CLASS_NAME',
        };
        const value = { rawValue: `SOME RAW VALUE`, model: link };

        sut.setValue(value);

        const linkElem = sutElement as HTMLAnchorElement;
        expect(linkElem.href).toMatch(/#$/);
        expect(linkElem.textContent).toBe(link.text!);
        expect(linkElem.title).toBe(link.title!);
        expect(linkElem.className).toBe(link.class!);
        expect(linkElem.onclick).toBeNull();
        expect(rawValueHolder.value).toBe(value.rawValue);
      });

      it('should render js if text not specified', () => {
        const link: JavascriptGeneralLink = {
          linktype: 'javascript',
          url: 'alert("hello")',
        };
        const value = { rawValue: `SOME RAW VALUE`, model: link };

        sut.setValue(value);

        const linkElem = sutElement as HTMLAnchorElement;
        expect(linkElem.textContent).toBe('javascript:alert("hello")');
        expect(rawValueHolder.value).toBe(value.rawValue);
      });

      ['window.general_link_js_test_1732=1', 'javascript:window.general_link_js_test_1732=1'].forEach((js) =>
        it(`[js='${js}'] should run js code on CTRL click`, () => {
          const windowWrapper = window as unknown as { general_link_js_test_1732: number | undefined };
          windowWrapper.general_link_js_test_1732 = 0;
          const link: JavascriptGeneralLink = {
            linktype: 'javascript',
            url: js,
          };
          const value = { rawValue: `SOME RAW VALUE`, model: link };
          sut.setValue(value);

          sutElement.dispatchEvent(new MouseEvent('click', { ctrlKey: true, bubbles: true, cancelable: true }));

          expect(windowWrapper.general_link_js_test_1732).toBe(1);
        }),
      );
    });

    describe('empty value', () => {
      it('should server side render link with empty value', () => {
        const spySubscriber = spyOnEvent(sut.onChange);
        const emptyValue = { rawValue: '', model: null };

        sut.setValue(emptyValue);

        expect(spySubscriber).toHaveBeenCalledWith(jasmine.objectContaining({ value: emptyValue, debounce: false, requireSSR: true }));
      });

      it('should render placeholder when both link and text value are set as empty', () => {
        const link: ExternalGeneralLink = {
          linktype: 'external',
          url: '',
          className: 'TEST_CLASS_NAME',
        };
        const value = { rawValue: `SOME RAW VALUE`, model: link };

        sut.setValue(value);

        const currentElems = Array.from(rootElement.querySelectorAll('a, span'));
        expect(currentElems.length).toBe(1);
        const currentElem = currentElems[0] as HTMLAnchorElement;
        expect(currentElem.tagName).toBe('A');
        expect(currentElem.textContent).toBe('NO_TEXT_IN_FIELD');
        expect(rawValueHolder.value).toBe(value.rawValue);
      });

      it('should render link placeholder when both link and item value are set as empty', () => {
        const link: InternalGeneralLink = {
          linktype: 'internal',
          class: 'TEST_CLASS_NAME',
          item: {
            id: '',
            displayName: '',
            url: '',
          },
        };
        const value = { rawValue: `SOME RAW VALUE`, model: link };

        sut.setValue(value);

        const currentElems = Array.from(rootElement.querySelectorAll('a, span'));
        expect(currentElems.length).toBe(1);
        const currentElem = currentElems[0] as HTMLAnchorElement;
        expect(currentElem.tagName).toBe('A');
        expect(currentElem.textContent).toBe('NO_TEXT_IN_FIELD');
        expect(rawValueHolder.value).toBe(value.rawValue);
      });

      it('should render link again after rendering empty value', () => {
        const emptyValue = { rawValue: '', model: null };
        sut.setValue(emptyValue);
        const link: ExternalGeneralLink = {
          linktype: 'external',
          url: 'http://example.com/',
        };
        const value = { rawValue: `SOME RAW VALUE`, model: link };

        sut.setValue(value);

        const currentElems = Array.from(rootElement.querySelectorAll('a, span'));
        expect(currentElems.length).toBe(1);
        const currentElem = currentElems[0] as HTMLAnchorElement;
        expect(currentElem.tagName).toBe('A');
        expect(currentElem.href).toBe(link.url);
        expect(currentElem.textContent).toBe(link.url);
        expect(currentElem.style.cursor).toBe('pointer');
        expect(rawValueHolder.value).toBe(value.rawValue);
      });
    });
  });
});
