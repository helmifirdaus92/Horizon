/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannelFromChannel } from '@sitecore/horizon-messaging/dist/testing';
import { spyOnEvent } from '../../messaging/event-emitter.testing';
import { ConfigurationService } from '../../services/configuration.service';
import { fixFocusEventBehavior, setupTestDOM, teardownTestDOM } from '../../utils/dom.testing';
import { RhsFieldEditorMessaging } from '../chrome.field';
import { ImageFieldHandler, ImageFieldValue, RhsChannel, RhsChannelDef } from './image.field-handler';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

describe(ImageFieldHandler.name, () => {
  const value: ImageFieldValue = {
    rawValue: '<image mediaid="mediaId" height="10" width="10" alt="alt_text" />',
    src: 'http://www.myimage.foo/',
    alt: 'alt_text',
    width: 10,
    height: 10,
  };

  let sut: ImageFieldHandler;
  let rootElement: Element;
  let rawValueHolder: HTMLInputElement;
  let sutElement: HTMLImageElement;
  let messaging: TestMessagingP2PChannelFromChannel<RhsChannel>;
  let abortController: AbortController;

  beforeEach(() => {
    rootElement = setupTestDOM(`
      <field type="image" id="test" src="${value.src}" alt="${value.alt}" width="${value.width}" height="${value.height}" />
    `);
    sutElement = rootElement.querySelector('img') as HTMLImageElement;
    fixFocusEventBehavior(sutElement);

    rawValueHolder = rootElement.querySelector('.scFieldValue') as HTMLInputElement;
    rawValueHolder.value = value.rawValue;

    messaging = makeTestMessagingP2PChannelFromDef(RhsChannelDef, {});
    const rhsMessaging = jasmine.createSpyObj<RhsFieldEditorMessaging>('connection', {
      getChannel: messaging as any,
    });

    abortController = new AbortController();
    sut = new ImageFieldHandler(sutElement, rawValueHolder, rhsMessaging, abortController);
    sut.init();

    ConfigurationService.xmCloudTenantUrl = 'https://xmc001';
  });

  afterEach(() => {
    teardownTestDOM(rootElement);
    ConfigurationService.xmCloudTenantUrl = '';
  });

  it('should make element focusable', () => {
    expect(sutElement.tabIndex).not.toEqual(-1);
  });

  describe('onSelect() callback', () => {
    it(`should be called on 'focus'`, () => {
      const spy = spyOnEvent(sut.onSelect);

      sutElement.focus();

      expect(spy).toHaveBeenCalled();
    });

    it(`should not trigger 'focus' event after abort`, () => {
      const spy = spyOnEvent(sut.onSelect);

      abortController.abort();
      sutElement.focus();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should focus element and fire event when selected via API', () => {
      const spy = spyOnEvent(sut.onSelect);

      sut.select();

      expect(spy).toHaveBeenCalled();
      expect(document.activeElement).toBe(sutElement);
    });
  });

  describe('onSizeChange() callback', () => {
    it(`should be called on 'load'`, () => {
      const spy = spyOnEvent(sut.onSizeChange);

      sutElement.dispatchEvent(new Event('load'));
      expect(spy).toHaveBeenCalled();
    });

    it(`should not be called on 'load' after abort`, () => {
      const spy = spyOnEvent(sut.onSizeChange);

      abortController.abort();
      sutElement.dispatchEvent(new Event('load'));

      expect(spy).not.toHaveBeenCalled();
    });
  });

  it('should dispatch RHS value:change message on change', async () => {
    const newValue: ImageFieldValue = { rawValue: `<img />`, src: 'src-src' };
    sut.setValue(newValue);

    const changeEvents = messaging.getEmittedEvents('value:change' as never);
    expect(changeEvents).toEqual([newValue]);
  });

  describe('readValue', () => {
    it('should include rawValue, src and alt', () => {
      expect(sut.getValue()).toEqual(value);
    });
  });

  describe('writeValue', () => {
    const newValue = {
      rawValue: '<image mediaid="new_id" alt="new alt" width="15" height="15" />',
      src: 'http://newimage.foo/',
      alt: 'new alt',
      width: 15,
      height: 15,
    };

    it('should update rawValue, src, alt, width and height', () => {
      sut.setValue(newValue);

      expect(sut.getValue().rawValue).toBe(newValue.rawValue);
      expect(sutElement.src).toBe(newValue.src);
      expect(sutElement.alt).toBe(newValue.alt);
      expect(sutElement.width).toBe(newValue.width);
      expect(sutElement.height).toBe(newValue.height);
    });

    it('should convert relative links to absolute xmc link', () => {
      const valueWithRelativeXmcSrs = { ...newValue, src: '-/media/image001' };

      sut.setValue(valueWithRelativeXmcSrs);

      expect(sut.getValue().rawValue).toBe(valueWithRelativeXmcSrs.rawValue);
      expect(sutElement.alt).toBe(valueWithRelativeXmcSrs.alt);
      expect(sutElement.width).toBe(valueWithRelativeXmcSrs.width);
      expect(sutElement.height).toBe(valueWithRelativeXmcSrs.height);
      expect(sutElement.src).toBe(`${ConfigurationService.xmCloudTenantUrl}/-/media/image001`);
    });

    it('should call onChange', () => {
      const spy = spyOnEvent(sut.onChange);

      sut.setValue(newValue);

      expect(spy).toHaveBeenCalledTimes(1);
      const [receivedValue] = spy.calls.mostRecent().args;
      expect(receivedValue).toEqual({ value: newValue, debounce: false, requireSSR: false });
    });

    it('should set SSR for non-image new value', () => {
      const spy = spyOnEvent(sut.onChange);
      const newFldValue: ImageFieldValue = { rawValue: `<img />`, src: undefined };

      sut.setValue(newFldValue);

      expect(spy).toHaveBeenCalledTimes(1);
      const [receivedValue] = spy.calls.mostRecent().args;
      expect(receivedValue).toEqual({ value: newFldValue, debounce: false, requireSSR: true });
    });

    describe('AND value is empty', () => {
      it('should set src and alt to default values', () => {
        const newEmptyValue = { rawValue: '' };
        sut.setValue(newEmptyValue);

        expect(sutElement.src).toContain('data:image/svg+xml,');
        expect(sutElement.alt).toBe('');
      });

      it('should remove the width and height attributes', () => {
        const newEmptyValue = { rawValue: '' };
        sut.setValue(newEmptyValue);

        expect(sutElement.hasAttribute('width')).toBeFalsy();
        expect(sutElement.hasAttribute('height')).toBeFalsy();
      });
    });
  });

  describe('messaging', () => {
    it('should return current value', async () => {
      const result = await messaging.registeredRpcServicesImpl!.getValue();

      expect(result!.rawValue).toBe(value.rawValue);
    });

    it('should return null value if nothing is selected', async () => {
      sut.setValue({ rawValue: '' });

      const result = await messaging.registeredRpcServicesImpl!.getValue();

      expect(result).toBeNull();
    });

    it('should set value', async () => {
      const newRawValue = `<img />`;

      await messaging.registeredRpcServicesImpl!.setValue({ rawValue: newRawValue });

      expect(sut.getValue().rawValue).toBe(newRawValue);
    });

    it('should update rawValueHolder', async () => {
      const newRawValue = `<img />`;

      await messaging.registeredRpcServicesImpl!.setValue({ rawValue: newRawValue });

      expect(rawValueHolder.value).toBe(newRawValue);
    });

    it('should clear value', async () => {
      await messaging.registeredRpcServicesImpl!.clearValue();

      expect(sut.getValue().rawValue).toBe('');
      expect(rawValueHolder.value).toBe('');
    });
  });

  describe('non-image tag', () => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const value: ImageFieldValue = {
      rawValue: 'test',
      src: '',
      alt: 'alt_text',
      width: 10,
      height: 10,
    };
    beforeEach(() => {
      teardownTestDOM(rootElement);
      rootElement = setupTestDOM(`
      <field type="image" id="test" src="${value.src}" alt="${value.alt}" width="${value.width}" height="${value.height}" />
    `);
      const rhsMessaging = jasmine.createSpyObj<RhsFieldEditorMessaging>('connection', {
        getChannel: messaging as any,
      });
      rawValueHolder = rootElement.querySelector('.scFieldValue') as HTMLInputElement;
      rawValueHolder.value = value.rawValue;

      sut = new ImageFieldHandler(rootElement as HTMLElement, rawValueHolder, rhsMessaging, new AbortController());
    });

    it('should not fail for non-image tag', () => {
      const currValue = sut.getValue();
      expect(currValue.rawValue).toBe(value.rawValue);
    });

    it('should cause SSR render on change to other image', () => {
      const changeSpy = spyOnEvent(sut.onChange);

      sut.setValue({ rawValue: '<img />', src: 'http://image' });

      const [change] = changeSpy.calls.mostRecent().args;
      expect(change.requireSSR).toBeTrue();
    });

    it('should cause SSR render on change to empty value', () => {
      const changeSpy = spyOnEvent(sut.onChange);

      sut.setValue({ rawValue: '' });

      const [change] = changeSpy.calls.mostRecent().args;
      expect(change.requireSSR).toBeTrue();
    });
  });
});
