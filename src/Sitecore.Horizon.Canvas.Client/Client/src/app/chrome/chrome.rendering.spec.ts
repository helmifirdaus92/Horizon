/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingReconnectableP2PConnection } from '@sitecore/horizon-messaging';
import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannelFromChannel } from '@sitecore/horizon-messaging/dist/testing';
import { spyOnEvent } from '../messaging/event-emitter.testing';
import { setupTestDOM, teardownTestDOM } from '../utils/dom.testing';
import { Writable } from '../utils/lang';
import { RemoteRpcServices } from '../utils/messaging';
import { Chrome, chromeInitSetParent } from './chrome';
import { PlaceholderChrome } from './chrome.placeholder';
import { RenderingChrome, RhsChannel, RhsChannelDef } from './chrome.rendering';
import {
  RenderingChromeInlineEditor,
  RenderingChromeUtilsChannel,
  RenderingChromeUtilsChannelDef,
  RenderingPropertiesEditorChannel,
  RenderingPropertiesEditorChannelDef,
} from './chrome.rendering.inline-editor';

import * as placeholderChrome from './chrome.placeholder';
import * as renderingChrome from './chrome.rendering';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
describe('RenderingChrome', () => {
  let sut: RenderingChrome;
  let parentPlaceholder: PlaceholderChrome;
  let rootElement: HTMLElement;
  let messaging: TestMessagingP2PChannelFromChannel<RhsChannel>;
  let inlineEditor: jasmine.SpyObj<RenderingChromeInlineEditor>;
  let inlineEditorMessaging: TestMessagingP2PChannelFromChannel<RenderingPropertiesEditorChannel>;
  let renderingChromeUtilsMessaging: TestMessagingP2PChannelFromChannel<RenderingChromeUtilsChannel>;
  let abortController: AbortController;

  beforeEach(async () => {
    rootElement = setupTestDOM(`
      <placeholder key='ph'>
        <rendering id='ph/rnd' />
      </placeholder>
    `);
    abortController = new AbortController();
    messaging = makeTestMessagingP2PChannelFromDef(
      RhsChannelDef,
      jasmine.createSpyObj<RemoteRpcServices<RhsChannel>>({
        postPropertiesEditorMessage: undefined,
      }),
    );
    const rhsMessaging = jasmine.createSpyObj<MessagingReconnectableP2PConnection>('connection', {
      getChannel: messaging as any,
    });

    inlineEditorMessaging = makeTestMessagingP2PChannelFromDef(RenderingPropertiesEditorChannelDef, {});
    renderingChromeUtilsMessaging = makeTestMessagingP2PChannelFromDef(RenderingChromeUtilsChannelDef, {});
    inlineEditor = jasmine.createSpyObj<RenderingChromeInlineEditor>(
      {
        connectMessaging: undefined,
        getInlineEditorMessaging: inlineEditorMessaging,
        getRenderingChromeUtilsMessaging: renderingChromeUtilsMessaging,
      },
      {
        inlineEditorMessagingProtocols: ['test-proto1', 'test-proto2'],
      },
    );
    sut = new RenderingChrome(
      'rnd_1',
      rootElement.querySelector('code[kind=open][chromeType=rendering]')!,
      rootElement.querySelector('code[kind=close][chromeType=rendering]')!,
      'rendering-instance-id',
      'rendering-id',
      { id: 'id', language: 'lang', version: 42, revision: 'rev' },
      [],
      ['rendering1', 'rendering2'],
      true,
      inlineEditor,
      'test-rendering',
      [],
      rhsMessaging,
    );

    parentPlaceholder = new PlaceholderChrome(
      'ph_1',
      rootElement.querySelector('code[kind=open][chromeType=placeholder]') as HTMLElement,
      rootElement.querySelector('code[kind=close][chromeType=placeholder]') as HTMLElement,
      'ph-key',
      ['ph-key'],
      [],
      { id: 'id', language: 'lang', version: 42, revision: 'rev' },
      true,
      'ph-key',
      [sut],
      null!,
      abortController,
    );
    chromeInitSetParent(sut, parentPlaceholder);
  });

  afterEach(() => {
    teardownTestDOM(rootElement);
  });

  it('should be created', () => {
    expect(sut).toBeDefined();
  });

  describe('getChromeInfo', () => {
    it('should return correct info', () => {
      const result = sut.getChromeInfo();

      expect(result.chromeId).toBe('rnd_1');
      expect(result.renderingDefinitionId).toBe('rendering-id');
    });
  });

  it(`should emit 'onSelect' event when selected by API`, () => {
    const spy = spyOnEvent(sut.onSelect);

    sut.select();

    expect(spy).toHaveBeenCalled();
  });

  describe('Sort move', () => {
    it(`should emit 'sort:move' WHEN sortMoveUp executed`, () => {
      sut.sortMoveUp();

      expect(messaging.getEmittedEvents('sort:move' as never)).toEqual(['up' as any]);
    });

    it(`should emit 'sort:move' WHEN sortMoveUp executed`, () => {
      sut.sortMoveDown();

      expect(messaging.getEmittedEvents('sort:move' as never)).toEqual(['down' as any]);
    });
  });

  describe('[messaging] canRemove', () => {
    it('should return false if parent is editable', () => {
      (parentPlaceholder as Writable<PlaceholderChrome, 'editable'>).editable = true;

      const result = messaging.registeredRpcServicesImpl!.canRemove();

      expect(result).toBeTruthy();
    });

    it('should return false if parent is not editable', () => {
      (parentPlaceholder as Writable<PlaceholderChrome, 'editable'>).editable = false;

      const result = messaging.registeredRpcServicesImpl!.canRemove();

      expect(result).toBeFalsy();
    });
  });

  describe('inline editor', () => {
    it('should initialize inline editor messaging', () => {
      expect(inlineEditor.connectMessaging).toHaveBeenCalled();
    });

    it('should return protocols in chrome info', () => {
      const result = sut.getChromeInfo();

      expect(result.inlineEditorProtocols).toEqual(['test-proto1', 'test-proto2']);
    });

    it('should proxy inline editor message to RHS properties editor', () => {
      inlineEditorMessaging.registeredRpcServicesImpl!.postPropertiesEditorMessage('data-42');

      expect(messaging.remoteRpcImpl.postPropertiesEditorMessage).toHaveBeenCalledWith('data-42');
    });

    it('should proxy RHS properties editor message to inline editor', () => {
      messaging.registeredRpcServicesImpl!.postInlineEditorMessage('data-42');

      expect(inlineEditorMessaging.getEmittedEvents('onPropertiesEditorMessage' as never)).toEqual(['data-42' as any]);
    });
  });

  describe('resize chrome', () => {
    it('should detect elements resize when size change', async () => {
      // arrange
      teardownTestDOM(rootElement);
      rootElement = setupTestDOM(`
        <placeholder key='ph'>
          <rendering id='ph/rnd'>
            <div id='innerContent'>Content</div>
          </rendering>
        </placeholder>
      `);

      const element = rootElement.querySelector('div')! as HTMLElement;

      sut = new RenderingChrome(
        sut.chromeId,
        rootElement.querySelector('code[kind=open][chromeType=rendering]')!,
        rootElement.querySelector('code[kind=close][chromeType=rendering]')!,
        sut.renderingInstanceId,
        sut.renderingDefinitionId,
        sut.itemContext,
        sut.appliedPersonalizationActions,
        sut.compatibleRenderings,
        sut.editable,
        sut.inlineEditor,
        sut.displayName,
        sut.childChromes,
        sut.rhsMessaging,
      );

      const eventTriggered = new Promise<void>((resolve) => sut.onSizeChange.on(resolve));

      // act
      element.style.height = '200px';

      // assert
      await expectAsync(eventTriggered).toBeResolved();
    });
  });

  describe('getIsPersonalized', () => {
    it('should return "true" when rendering has any applied personalization action', () => {
      sut.appliedPersonalizationActions.push('SetDataSourceAction');

      expect(sut.getIsPersonalized()).toBe(true);
    });

    it('should return "false" when rendering does not have any applied personalization action', () => {
      sut.appliedPersonalizationActions.length = 0;

      expect(sut.getIsPersonalized()).toBe(false);
    });
  });

  describe('getChildRenderings and getChildPlaceholders', () => {
    it('getChildRenderings and getChildPlaceholders', () => {
      // arrange
      spyOn(renderingChrome, 'isRenderingChrome').and.returnValue(true);
      spyOn(placeholderChrome, 'isPlaceholderChrome').and.returnValue(true);

      const childRenderingChrome1 = {
        getChromeInfo: () => {
          return {
            renderingInstanceId: 'ChildRenderingInstanceId1',
          };
        },
      } as RenderingChrome;
      const childRenderingChrome2 = {
        getChromeInfo: () => {
          return {
            renderingInstanceId: 'ChildRenderingInstanceId2',
          };
        },
      } as RenderingChrome;

      const childPlaceholder1 = {
        getChromeInfo: () => {},
        childChromes: [childRenderingChrome1] as readonly Chrome[],
      } as PlaceholderChrome;
      const childPlaceholder2 = {
        getChromeInfo: () => {},
        childChromes: [childRenderingChrome2] as readonly Chrome[],
      } as PlaceholderChrome;

      sut = new RenderingChrome(
        sut.chromeId,
        rootElement.querySelector('code[kind=open][chromeType=rendering]')!,
        rootElement.querySelector('code[kind=close][chromeType=rendering]')!,
        sut.renderingInstanceId,
        sut.renderingDefinitionId,
        sut.itemContext,
        sut.appliedPersonalizationActions,
        sut.compatibleRenderings,
        sut.editable,
        sut.inlineEditor,
        sut.displayName,
        [childPlaceholder1, childPlaceholder2],
        sut.rhsMessaging,
      );

      // act
      const childRenderings = sut.getChildRenderings();
      const childPlaceholders = sut.getChildPlaceholders();

      // assert
      expect(childRenderings.length).toBe(2);
      expect(childRenderings[0].renderingInstanceId).toBe('ChildRenderingInstanceId1');
      expect(childRenderings[1].renderingInstanceId).toBe('ChildRenderingInstanceId2');

      expect(childPlaceholders.length).toBe(2);
    });
  });
});
