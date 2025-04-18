/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingReconnectableP2PConnection } from '@sitecore/horizon-messaging';
import { makeTestMessagingP2PChannelFromDef } from '@sitecore/horizon-messaging/dist/testing';
import { EventEmitter } from '../messaging/event-emitter';
import { spyOnEvent } from '../messaging/event-emitter.testing';
import { FieldRawValue } from '../messaging/horizon-canvas.contract.parts';
import { setupTestDOM, teardownTestDOM } from '../utils/dom.testing';
import { Writable } from '../utils/lang';
import { RemoteRpcServices } from '../utils/messaging';
import { chromeInitSetParent } from './chrome';
import { FieldChrome, FieldHandler } from './chrome.field';
import { RenderingChrome, RhsChannel, RhsChannelDef } from './chrome.rendering';
import {
  RenderingChromeInlineEditor,
  RenderingChromeUtilsChannelDef,
  RenderingPropertiesEditorChannelDef,
} from './chrome.rendering.inline-editor';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

const INITIAL_VALUE = 'InitialValue';

describe('FieldChrome', () => {
  let fieldHandlerSpy: jasmine.SpyObj<FieldHandler>;
  let fldOnChange: EventEmitter<{ value: FieldRawValue; debounce: boolean; requireSSR?: boolean }>;
  let sut: FieldChrome;
  let rootElement: HTMLElement;

  const emitFldOnChange = (rawValue: string, debounce: boolean, requireSSR?: boolean) => {
    fldOnChange.emit({ value: { rawValue }, debounce, requireSSR });
  };

  function getRenderingChrome(): RenderingChrome {
    const renderingRootElement = setupTestDOM(`
      <placeholder key='ph'>
        <rendering id='ph/rnd' />
      </placeholder>
    `);
    const messaging = makeTestMessagingP2PChannelFromDef(
      RhsChannelDef,
      jasmine.createSpyObj<RemoteRpcServices<RhsChannel>>({
        postPropertiesEditorMessage: undefined,
      }),
    );
    const rhsMessaging = jasmine.createSpyObj<MessagingReconnectableP2PConnection>('connection', {
      getChannel: messaging as any,
    });
    const inlineEditorMessaging = makeTestMessagingP2PChannelFromDef(RenderingPropertiesEditorChannelDef, {});
    const renderingChromeUtilsMessaging = makeTestMessagingP2PChannelFromDef(RenderingChromeUtilsChannelDef, {});
    const inlineEditor = jasmine.createSpyObj<RenderingChromeInlineEditor>(
      {
        connectMessaging: undefined,
        getInlineEditorMessaging: inlineEditorMessaging,
        getRenderingChromeUtilsMessaging: renderingChromeUtilsMessaging,
      },
      {
        inlineEditorMessagingProtocols: ['test-proto1', 'test-proto2'],
      },
    );
    return new RenderingChrome(
      'rnd_1',
      renderingRootElement.querySelector('code[kind=open][chromeType=rendering]')!,
      renderingRootElement.querySelector('code[kind=close][chromeType=rendering]')!,
      'rendering-instance-id',
      'rendering-id',
      { id: 'id', language: 'lang', version: 42, revision: 'rev' },
      [],
      [],
      true,
      inlineEditor,
      'test-rendering',
      [],
      rhsMessaging,
    );
  }

  beforeEach(() => {
    rootElement = setupTestDOM(`
      <field type="single-line text" />
    `);

    const element = rootElement.querySelector('span.scWebEditInput') as HTMLElement;

    const rhsMessaging = jasmine.createSpyObj<MessagingReconnectableP2PConnection>('connection', {
      getChannel: jasmine.createSpyObj('channel', ['on']),
    });

    fieldHandlerSpy = jasmine.createSpyObj<FieldHandler>('FieldHandler', {
      getValue: { rawValue: INITIAL_VALUE },
      select: undefined,
    });
    fldOnChange = (fieldHandlerSpy as Writable<FieldHandler, 'onChange'>).onChange = new EventEmitter();
    (fieldHandlerSpy as Writable<FieldHandler, 'onSelect'>).onSelect = new EventEmitter();
    (fieldHandlerSpy as Writable<FieldHandler, 'onSizeChange'>).onSizeChange = new EventEmitter();

    sut = new FieldChrome(
      'fld_1',
      element,
      'field-id',
      'field-type',
      false,
      {
        id: 'item-id',
        language: 'item-langauge',
        revision: 'item-rev',
        version: -1,
      },
      fieldHandlerSpy,
      'display-name',
      rhsMessaging,
    );
  });

  afterEach(() => {
    teardownTestDOM(rootElement);
  });

  describe('value change', () => {
    it('should emit change event', () => {
      const handler = spyOnEvent(sut.onChange);

      emitFldOnChange('42', false);

      expect(handler).toHaveBeenCalledTimes(1);
      const [result] = handler.calls.mostRecent().args;
      expect(result.value.fieldId).toBe('field-id');
      expect(result.value.itemId).toBe('item-id');
      expect(result.value.value.rawValue).toBe('42');
    });

    it('should call optional onBeforeSave if it is defined', () => {
      (sut['fieldHandler'] as any).onBeforeSave = () => 'testOnBeforeSave';
      const handler = spyOnEvent(sut.onChange);

      emitFldOnChange('originalValue', false);

      expect(handler).toHaveBeenCalledTimes(1);
      const [result] = handler.calls.mostRecent().args;
      expect(result.value.value.rawValue).toBe('testOnBeforeSave');
    });

    it('should not emit change event if value is same as initial', () => {
      const changeSpy = spyOnEvent(sut.onChange);

      emitFldOnChange(INITIAL_VALUE, false);

      expect(changeSpy).not.toHaveBeenCalled();
    });

    it('should not emit change event if not changed since last report', () => {
      const changeSpy = spyOnEvent(sut.onChange);
      const newValue = 'BetterValue';

      emitFldOnChange(newValue, false);
      emitFldOnChange(newValue, false);

      expect(changeSpy).toHaveBeenCalledTimes(1);
    });

    it('should not emit change if same raw value, but other fields differ', () => {
      const changeSpy = spyOnEvent(sut.onChange);
      const newValue1 = { rawValue: 'OtherValue', otherFld: 11 };
      const newValue2 = { rawValue: 'OtherValue', otherFld: 22 };

      fldOnChange.emit({ value: newValue1, debounce: false });
      fldOnChange.emit({ value: newValue2, debounce: false });

      expect(changeSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit requireSSR flag', () => {
      const changeSpy = spyOnEvent(sut.onChange);

      fldOnChange.emit({ value: { rawValue: 'someValue' }, debounce: false, requireSSR: true });

      expect(changeSpy).toHaveBeenCalledWith(jasmine.objectContaining({ requireSSR: true }));
    });

    it('should debounce value if specified', () => {
      const handler = spyOnEvent(sut.onChange);

      // act
      jasmine.clock().withMock(() => {
        emitFldOnChange('42', true);
        expect(handler).not.toHaveBeenCalled();

        jasmine.clock().tick(2000);
      });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should drop old value on debounce', () => {
      const handler = spyOnEvent(sut.onChange);

      // act
      jasmine.clock().withMock(() => {
        emitFldOnChange('24', true);
        jasmine.clock().tick(500);
        emitFldOnChange('42', true);

        jasmine.clock().tick(1000);
      });

      expect(handler).toHaveBeenCalledTimes(1);
      const [result] = handler.calls.mostRecent().args;
      expect(result.value.value.rawValue).toBe('42');
    });

    it('should drop old value on debounce and when new value is immediate', () => {
      const handler = spyOnEvent(sut.onChange);

      // act
      jasmine.clock().withMock(() => {
        emitFldOnChange('24', true);
        jasmine.clock().tick(500);
        emitFldOnChange('42', false);

        jasmine.clock().tick(1000);
      });

      expect(handler).toHaveBeenCalledTimes(1);
      const [result] = handler.calls.mostRecent().args;
      expect(result.value.value.rawValue).toBe('42');
    });

    it('should flush pending changes', () => {
      const handler = spyOnEvent(sut.onChange);

      jasmine.clock().withMock(() => {
        emitFldOnChange('42', false);
        jasmine.clock().tick(1);

        sut.flushChanges();
      });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should do nothing on flush if there are no pending changes', () => {
      const handler = spyOnEvent(sut.onChange);

      sut.flushChanges();

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('getIsPersonalized', () => {
    it('should return "true" when parent rendering has "SetDataSourceAction" personalization action', () => {
      const parentRendering = getRenderingChrome();
      parentRendering.appliedPersonalizationActions.push('SetDataSourceAction');
      chromeInitSetParent(sut, parentRendering);

      expect(sut.getIsPersonalized()).toBe(true);
    });
    it('should return "false" when parent rendering does not have "SetDataSourceAction" personalization action', () => {
      const parentRendering = getRenderingChrome();
      parentRendering.appliedPersonalizationActions.length = 0;
      parentRendering.appliedPersonalizationActions.push('HideRenderingAction');

      chromeInitSetParent(sut, parentRendering);
      expect(sut.getIsPersonalized()).toBe(false);
    });

    it('should find closest parent rendering and read applied personalization actions from it', () => {
      const parentRendering = getRenderingChrome();
      parentRendering.appliedPersonalizationActions.push('SetDataSourceAction');
      const parentField = new FieldChrome(
        'fld_1',
        {} as HTMLLIElement,
        'field-id',
        'field-type',
        false,
        {
          id: 'item-id',
          language: 'item-langauge',
          revision: 'item-rev',
          version: -1,
        },
        fieldHandlerSpy,
        'display-name',
        {} as MessagingReconnectableP2PConnection,
      );

      chromeInitSetParent(sut, parentField);
      chromeInitSetParent(parentField, parentRendering);

      expect(sut.getIsPersonalized()).toBe(true);
    });
  });

  it('should select field handler when selected by API', () => {
    sut.select();

    expect(fieldHandlerSpy.select).toHaveBeenCalled();
  });
});
