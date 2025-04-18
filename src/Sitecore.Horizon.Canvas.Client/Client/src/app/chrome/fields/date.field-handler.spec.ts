/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannelFromChannel } from '@sitecore/horizon-messaging/dist/testing';
import { spyOnEvent } from '../../messaging/event-emitter.testing';
import { FieldRawValue } from '../../messaging/horizon-canvas.contract.parts';
import { TranslationService } from '../../services/translation.service';
import { fixFocusEventBehavior, setupTestDOM, teardownTestDOM } from '../../utils/dom.testing';
import { RhsFieldEditorMessaging } from '../chrome.field';
import { NumericalFieldHandler as DateFieldHandler, RhsChannel, RhsChannelDef } from './numerical.field-handler';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

describe(DateFieldHandler.name, () => {
  let sut: DateFieldHandler;
  let rootElement: Element;
  let sutElement: HTMLElement;
  let rawValueHolder: HTMLInputElement;
  let messaging: TestMessagingP2PChannelFromChannel<RhsChannel>;
  let abortController: AbortController;

  beforeEach(() => {
    rootElement = setupTestDOM(`
      <field type="date" />
    `);
    sutElement = rootElement.querySelector('.scWebEditInput') as HTMLElement;
    fixFocusEventBehavior(sutElement);

    rawValueHolder = rootElement.querySelector('.scFieldValue') as HTMLInputElement;

    messaging = makeTestMessagingP2PChannelFromDef(RhsChannelDef, {});
    const rhsMessaging = jasmine.createSpyObj<RhsFieldEditorMessaging>('connection', {
      getChannel: messaging as any,
    });
    abortController = new AbortController();
    sut = new DateFieldHandler(sutElement, rawValueHolder, rhsMessaging, abortController);
    sut.init();
  });

  afterEach(() => {
    teardownTestDOM(rootElement);
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

    it(`should not be called on 'focus' after abort`, () => {
      const spy = spyOnEvent(sut.onSelect);

      abortController.abort();
      sutElement.focus();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should dispatch RHS value:change message on change', async () => {
      const newValue: FieldRawValue = { rawValue: '20240530T020000Z' };

      sut.setValue(newValue);

      const changeEvents = messaging.getEmittedEvents('value:change' as never);
      expect(changeEvents.length).toBe(1);
      expect(changeEvents[0]).toBe(newValue.rawValue);
    });

    it('should be focused when selected by API', () => {
      const spy = spyOnEvent(sut.onSelect);

      sut.select();

      expect(spy).toHaveBeenCalled();
      expect(document.activeElement).toBe(sutElement);
    });
  });

  describe('readValue', () => {
    it('should include rawValue', () => {
      sut.setValue({ rawValue: '20240530T020000Z' });

      expect(sut.getValue()).toEqual({ rawValue: '20240530T020000Z' });
    });
  });

  describe('writeValue', () => {
    it('should update rawValue', () => {
      sut.setValue({ rawValue: '20230530T020000Z' });

      expect(sut.getValue().rawValue).toBe('20230530T020000Z');
      expect(sutElement.innerText).toBe('20230530T020000Z');
    });

    it('should update rawValue to rawValueHolder', () => {
      sut.setValue({ rawValue: '20230530T020000Z' });

      expect(rawValueHolder.value).toBe('20230530T020000Z');
    });

    it('should call onChange', () => {
      const spy = spyOnEvent(sut.onChange);

      sut.setValue({ rawValue: '20230530T020000Z' });

      expect(spy).toHaveBeenCalledTimes(1);
      const [receivedValue] = spy.calls.mostRecent().args;
      expect(receivedValue).toEqual({ value: { rawValue: '20230530T020000Z' }, debounce: false });
      expect(sutElement.innerText).toBe('20230530T020000Z');
    });
  });

  describe('messaging', () => {
    it('should return current value', async () => {
      const result = await messaging.registeredRpcServicesImpl!.getValue();

      expect(result).toBe('20230530T020000Z');
    });

    it('should return null if field does not have value', async () => {
      sut.setValue({ rawValue: '' });

      const result = await messaging.registeredRpcServicesImpl!.getValue();

      expect(result).toBeNull();
      expect(sutElement.innerText).toBe(TranslationService.get('NO_TEXT_IN_FIELD'));
    });

    it('should set value', async () => {
      await messaging.registeredRpcServicesImpl!.setValue('20230530T020000Z');

      expect(sut.getValue().rawValue).toBe('20230530T020000Z');
      expect(sutElement.innerText).toBe('20230530T020000Z');
    });
  });
});
