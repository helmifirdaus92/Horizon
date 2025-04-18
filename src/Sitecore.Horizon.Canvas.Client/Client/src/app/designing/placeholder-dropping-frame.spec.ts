/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Chrome } from '../chrome/chrome';
import { setupTestDOM, teardownTestDOM } from '../utils/dom.testing';
import { PlaceholderDroppingFrame } from './placeholder-dropping-frame';

describe('PlaceholderDroppingFrame', () => {
  let rootElement: Element;
  let sut: PlaceholderDroppingFrame;
  let placeholderChrome: Chrome;
  let abortController: AbortController;

  const frame = () => {
    return rootElement.querySelector('[class^=sc-designing-frame]');
  };

  beforeEach(() => {
    abortController = new AbortController();
    rootElement = setupTestDOM(`
      <div id="testChrome">foo</div>

    `);
    placeholderChrome = { getDimensions: () => ({ top: 0, left: 0, height: 0, width: 0 }), getIsPersonalized: () => false } as Chrome;
    sut = new PlaceholderDroppingFrame(abortController, placeholderChrome, 'can-drop');
  });

  afterEach(() => {
    teardownTestDOM(rootElement);
  });

  it('should attach element on show', () => {
    sut.show(rootElement);

    expect(frame()).toBeTruthy();
  });

  it('should detach element on hide', () => {
    sut.show(rootElement);

    sut.hide();

    expect(frame()).toBeFalsy();
  });

  it('should have non-droppable class if cannot-drop', () => {
    sut = new PlaceholderDroppingFrame(abortController, placeholderChrome, 'cannot-drop');

    sut.show(rootElement);

    expect(frame()?.className).toContain('non-droppable-');
  });

  it('should contain loading indicator if dropped', () => {
    sut = new PlaceholderDroppingFrame(abortController, placeholderChrome, 'dropped');

    sut.show(rootElement);

    expect(frame()?.querySelector('[class^=horizon-loading-indicator]')).toBeTruthy();
  });

  it('should have  `empty-placeholder-frame` class if it is empty placeholder frame', () => {
    sut = new PlaceholderDroppingFrame(abortController, placeholderChrome, 'cannot-drop', true);

    sut.show(rootElement);

    expect(frame()?.className).toContain('empty-placeholder-frame-');
  });

  it('should attach notification block if frame is not droppable', () => {
    sut = new PlaceholderDroppingFrame(abortController, placeholderChrome, 'cannot-drop', true);
    sut.show(rootElement);

    const notificationElement = rootElement.querySelector('[class^=sc-error-block]');

    expect(notificationElement).toBeTruthy();
  });
});
