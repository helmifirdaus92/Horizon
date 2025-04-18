/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingReconnectableP2PConnection } from '@sitecore/horizon-messaging';
import { spyOnEvent } from '../messaging/event-emitter.testing';
import { RenderingChromeInfo } from '../messaging/horizon-canvas.contract.parts';
import { setupTestDOM, teardownTestDOM } from '../utils/dom.testing';
import { chromeInitSetParent } from './chrome';
import { FieldChrome } from './chrome.field';
import { PlaceholderChrome } from './chrome.placeholder';
import style from './chrome.placeholder.scss';
import * as renderingChrome from './chrome.rendering';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

describe('PlaceholderChrome', () => {
  const ALLOWED_RENDERING = '45c93e0d-8df2-4b7a-a46a-e979cbb2b427';
  let sut: PlaceholderChrome;
  let rootElement: HTMLElement;
  let abortController: AbortController;

  const buttonElement = () => {
    return sut.startElement.nextElementSibling?.querySelector('button');
  };

  beforeEach(async () => {
    abortController = new AbortController();
    rootElement = setupTestDOM(`<placeholder key="content" />`);

    const openElement = rootElement.querySelector('code[kind=open]') as HTMLElement;
    const closeElement = rootElement.querySelector('code[kind=close]') as HTMLElement;

    const connection = jasmine.createSpyObj<MessagingReconnectableP2PConnection>('connection', {
      getChannel: jasmine.createSpyObj('channel', ['on']),
    });

    sut = new PlaceholderChrome(
      'ph_1',
      openElement,
      closeElement,
      'content',
      ['content'],
      [ALLOWED_RENDERING],
      { id: 'id', language: 'lang', version: 42, revision: 'rev' },
      true,
      'content',
      [],
      connection,
      abortController,
    );
  });

  afterEach(() => {
    teardownTestDOM(rootElement);
  });

  it('should be created', () => {
    expect(sut).toBeDefined();
  });

  it('should render an empty placeholder', () => {
    expect(document.querySelector('.' + style['empty-placeholder'])).toBeTruthy();
  });

  describe('Add component feature', () => {
    it('should contain button element as nextSibling to empty-placeholder', () => {
      expect(buttonElement()).toBeDefined();
    });

    it('should add "hovered" class to parent element on button click', () => {
      buttonElement()?.dispatchEvent(new MouseEvent('mousedown'));

      const emptySpacerClassList = buttonElement()?.parentElement?.classList as any;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(Array.from(emptySpacerClassList)).toEqual(jasmine.arrayContaining([jasmine.stringMatching(/^hovered/)]));
    });

    it('should emit onAddCompBtnClick on button click', () => {
      const spy = jasmine.createSpy();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      sut.onAddCompBtnClick.on(() => spy());

      buttonElement()?.dispatchEvent(new MouseEvent('mousedown'));

      expect(spy).toHaveBeenCalled();
    });

    it('should disable button in personalization mode', () => {
      sut.disableEditingInPersonalizationMode(true);

      expect(buttonElement()?.disabled).toBe(true);
    });

    it('should set title attribute based on personalization mode', () => {
      sut.disableEditingInPersonalizationMode(true);

      expect(buttonElement()?.getAttribute('title')).toBe('CANVAS_TRANSLATIONS.PLACEHOLDER_NOT_EDITABLE');

      sut.disableEditingInPersonalizationMode(false);

      expect(buttonElement()?.getAttribute('title')).toBe('CANVAS_TRANSLATIONS.ADD_COMPONENT');
    });

    it('should add "disabled" class to button in personalization mode', () => {
      sut.disableEditingInPersonalizationMode(true);

      expect(buttonElement()?.classList.contains(style['disabled'])).toBe(true);
    });
  });

  describe('canDropRendering', () => {
    it('should allow drop if rendering is present', () => {
      expect(sut.canDropRendering(ALLOWED_RENDERING)).toBeTruthy();
    });

    it('should allow drop if rendering id has different style', () => {
      expect(sut.canDropRendering('45C93E0D8DF24B7AA46AE979CBB2B427')).toBeTruthy();
    });

    it('should not allow drop if placeholder is not in list of allowed', () => {
      expect(sut.canDropRendering('a39c167d-e7d0-4b2a-afb6-e5b7d61e001c')).toBeFalsy();
    });
  });

  it('should make allowed renderings array empty if is not editable', () => {
    const allowedRenderingIds = ['rendering1', 'rendering2'];
    const editable = false;

    const localSut = new PlaceholderChrome(
      sut.chromeId,
      sut.startElement,
      sut.endElement,
      sut.placeholderKey,
      sut.placeholderMetadataKeys,
      allowedRenderingIds,
      sut.itemContext,
      editable,
      sut.displayName,
      sut.childChromes,
      sut.rhsMessaging,
      abortController,
    );

    expect(localSut.allowedRenderingIds.length).toBe(0);
  });

  describe('has a rendering', () => {
    beforeEach(() => {
      teardownTestDOM(rootElement);
      rootElement = setupTestDOM(`
        <placeholder key="content">
          <rendering id="rendering123">
            <h1>Hello World!</h1>
          </rendering>
        </placeholder>
      `);

      const openElement = rootElement.querySelector('code[kind=open]') as HTMLElement;
      const closeElement = rootElement.querySelector('code[kind=close]') as HTMLElement;

      const rhsMessaging = jasmine.createSpyObj<MessagingReconnectableP2PConnection>('connection', {
        getChannel: jasmine.createSpyObj('channel', ['on']),
      });

      sut = new PlaceholderChrome(
        'ph_2',
        openElement,
        closeElement,
        'content',
        ['content'],
        [],
        { id: 'id', language: 'lang', version: 42, revision: 'rev' },
        true,
        'content',
        [],
        rhsMessaging,
        abortController,
      );
    });

    afterEach(() => {
      teardownTestDOM(rootElement);
    });

    it('should be created', () => {
      expect(sut).toBeDefined();
    });

    it('should render an empty placeholder', () => {
      expect(document.querySelector('.' + style['empty-placeholder'])).toBe(null);
    });
  });

  it(`should emit 'onSelect' event when selected by API`, () => {
    const spy = spyOnEvent(sut.onSelect);

    sut.select();

    expect(spy).toHaveBeenCalled();
  });

  describe('getChromeInfo', () => {
    it('should return parentRenderingChromeInfo', () => {
      const parentRenderingChromeInfo: RenderingChromeInfo = {
        chromeType: 'rendering',
        chromeId: 'chromeId1',
        displayName: 'displayName',
        renderingInstanceId: 'renderingInstanceId1',
        renderingDefinitionId: 'renderingDefinitionId1',
        inlineEditorProtocols: [],
        compatibleRenderings: [],
        contextItem: {
          id: 'id1',
          language: 'language1',
          version: 1,
        },
        isPersonalized: false,
        parentPlaceholderChromeInfo: {} as any,
        appliedPersonalizationActions: [],
      };
      const parentChrome = jasmine.createSpyObj<renderingChrome.RenderingChrome>({ getChromeInfo: parentRenderingChromeInfo });
      spyOn(renderingChrome, 'isRenderingChrome').and.returnValue(true);
      chromeInitSetParent(sut, parentChrome);

      const phChromeInfo = sut.getChromeInfo();

      expect(phChromeInfo.parentRenderingChromeInfo).toEqual(parentRenderingChromeInfo);
    });

    it('should set parentRenderingChromeInfo to undefined if parent chrome is not a rendering', () => {
      const parentChrome = jasmine.createSpyObj<FieldChrome>({ getChromeInfo: undefined });
      chromeInitSetParent(sut, parentChrome);

      const phChromeInfo = sut.getChromeInfo();

      expect(phChromeInfo.parentRenderingChromeInfo).toBeUndefined();
    });
  });

  describe('getIsPersonalized', () => {
    it('should always return "false"', () => {
      expect(sut.getIsPersonalized()).toBe(false);
    });
  });
});
