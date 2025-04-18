/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { spyOnEvent } from '../../messaging/event-emitter.testing';
import { fixFocusEventBehavior, setupTestDOM, teardownTestDOM } from '../../utils/dom.testing';
import { UnknownFieldHandler } from './unknown.field-handler';

describe(UnknownFieldHandler.name, () => {
  let sut: UnknownFieldHandler;
  let rootElement: Element;
  let sutElement: HTMLElement;
  let rawValueHolder: HTMLInputElement;
  let abortController: AbortController;
  beforeEach(() => {
    rootElement = setupTestDOM(`
      <field type="unknown" />
    `);

    sutElement = rootElement.querySelector('.scWebEditInput') as HTMLElement;
    rawValueHolder = rootElement.querySelector('.scFieldValue') as HTMLInputElement;
    rawValueHolder.value = 'raw value';

    fixFocusEventBehavior(sutElement);

    abortController = new AbortController();
    sut = new UnknownFieldHandler(sutElement, rawValueHolder, abortController);
    sut.init();
  });

  afterEach(() => {
    teardownTestDOM(rootElement);
  });

  it('should be defined', () => {
    expect(sut).toBeTruthy();
  });

  it('should make element focusable', () => {
    expect(sutElement.tabIndex).not.toEqual(-1);
  });

  it('should disable contenteditable', () => {
    expect(sutElement.getAttribute('contenteditable')).toBe('false');
  });

  it('should select when focused', () => {
    // arrange
    const spy = spyOnEvent(sut.onSelect);

    // act
    sutElement.focus();

    // assert
    expect(spy).toHaveBeenCalled();
  });

  it(`should not select when focused after abort`, () => {
    const spy = spyOnEvent(sut.onSelect);

    abortController.abort();
    sutElement.focus();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should focus when selected by API', () => {
    const spy = spyOn(sutElement, 'focus').and.callThrough();

    sut.select();

    expect(spy).toHaveBeenCalled();
    expect(document.activeElement).toBe(sutElement);
  });
});
