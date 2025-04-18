/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Chrome } from '../chrome/chrome';
import { WindowDom } from '../chrome/chrome-dom';
import { ChromeInlineEditorFactory } from '../chrome/chrome-inline-editor-factory';
import { ChromeReader } from '../chrome/chrome-reader';
import { isRenderingChrome } from '../chrome/chrome.rendering';
import { InlineChromeParser } from '../chrome/read/inline-chrome-parser';
import { spyOnEvent } from '../messaging/event-emitter.testing';
import { ItemPermissions } from '../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../messaging/messaging-service';
import { setupTestDOM, teardownTestDOM } from '../utils/dom.testing';
import { ThrowingLogger } from '../utils/logger';
import { SelectFrame } from './select-frame';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

describe('SelectFrame', () => {
  let sut: SelectFrame;
  let rootElement: HTMLElement;
  let windowDom: WindowDom;
  let chromes: readonly Chrome[];
  let abortController: AbortController;

  beforeEach(async () => {
    rootElement = setupTestDOM(`
      <placeholder>
        <rendering/>
      </placeholder>
    `);

    abortController = new AbortController();
    windowDom = new WindowDom();
    const messagingService = jasmine.createSpyObj<MessagingService>('MessagingService', ['setEditingChannelRpcServices']);

    const chromeParser = new InlineChromeParser(
      new ChromeInlineEditorFactory(windowDom, ThrowingLogger),
      messagingService,
      abortController,
    );
    chromes = await new ChromeReader(chromeParser).readChromes(rootElement);
    sut = new SelectFrame(chromes.find(isRenderingChrome)!, new AbortController(), 'select', false);
  });

  afterEach(() => {
    teardownTestDOM(rootElement);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('remove rendering', () => {
    it('should trigger remove function on backspace keypress', () => {
      // Arrange
      const spy = spyOnEvent(sut.onDelete);

      // Act
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));

      // Assert
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should trigger remove function on delete keypress', () => {
      // Arrange
      const spy = spyOnEvent(sut.onDelete);

      // Act
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));

      // Assert
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should not trigger remove function if user does not have write permissions', () => {
      // Arrange
      const permission: ItemPermissions = { canWrite: false, canCreate: true, canDelete: false, canPublish: true, canRename: true };
      sut = new SelectFrame(chromes.find(isRenderingChrome)!, new AbortController(), 'select', false, permission);

      const spy = spyOnEvent(sut.onDelete);

      // Act
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));

      // Assert
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
