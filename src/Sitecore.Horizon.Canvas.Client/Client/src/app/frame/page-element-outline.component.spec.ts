/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Chrome } from '../chrome/chrome';
import * as renderingChrome from '../chrome/chrome.rendering';
import { createKeyboardEvent, triggerClick } from '../utils/dom.testing';
import { PageElementOutlineComponent } from './page-element-outline.component';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

describe(PageElementOutlineComponent.name, () => {
  let attachRoot: HTMLDivElement;

  let sut: PageElementOutlineComponent;
  let sutIconElement: NodeListOf<Element>;
  let abortController: AbortController;

  const buttons = (isDisabled: boolean = false) =>
    Array.from({ length: 5 }, () => {
      const button = document.createElement('button');
      button.className = 'has-action';
      button.setAttribute('disabled', isDisabled.toString());
      return button;
    });

  beforeEach(() => {
    attachRoot = document.createElement('div');
    document.body.appendChild(attachRoot);
    abortController = new AbortController();

    sut = new PageElementOutlineComponent(abortController, { getIsPersonalized: () => false } as Chrome);
    sut.attach(attachRoot);
    sutIconElement = attachRoot.querySelectorAll(`[class*='icon-button']`)!;
  });

  afterEach(() => {
    sut.detach();
    attachRoot.remove();
  });

  describe('move rendering', () => {
    it('should set draggable attribute and add drag icon when chrome is rendering', () => {
      spyOn(renderingChrome, 'isRenderingChrome').and.returnValue(true);
      sut = new PageElementOutlineComponent(abortController, { getIsPersonalized: () => true } as Chrome);
      sut.attach(attachRoot);

      const dragIcon = attachRoot.querySelector(`[class*='drag-vertical']`)!;
      const draggableAttribute = sut.containerElement.attributes.getNamedItem('draggable');

      expect(dragIcon).toBeTruthy();
      expect(draggableAttribute).toBeTruthy();
      expect(draggableAttribute?.value).toBe('true');
    });

    it('should not set draggable attribute and append drag icon when chrome is not rendering', () => {
      spyOn(renderingChrome, 'isRenderingChrome').and.returnValue(false);
      sut = new PageElementOutlineComponent(abortController, { getIsPersonalized: () => true } as Chrome);
      sut.attach(attachRoot);

      const dragIcon = attachRoot.querySelector(`[class*='drag-vertical']`)!;
      const draggableAttribute = sut.containerElement.attributes.getNamedItem('draggable');

      expect(dragIcon).toBeFalsy();
      expect(draggableAttribute).toBeFalsy();
    });

    it('should not set drag styles and not add drag icon when chrome is rendering but style type is highlight', () => {
      spyOn(renderingChrome, 'isRenderingChrome').and.returnValue(true);
      sut = new PageElementOutlineComponent(abortController, { getIsPersonalized: () => true } as Chrome, 'highlight');
      sut.attach(attachRoot);

      const dragIcon = attachRoot.querySelector(`[class*='drag-vertical']`)!;
      const draggableAttribute = sut.containerElement.attributes.getNamedItem('draggable');

      expect(dragIcon).toBeFalsy();
      expect(draggableAttribute).toBeFalsy();
    });
  });

  describe('icon', () => {
    it('should have no icon by default', () => {
      expect(sutIconElement[0].innerHTML).toBeFalsy();
    });

    it('should render correct icons', () => {
      sut.icon = { name: 'arrow-up-left' };

      expect(sutIconElement[0].innerHTML).toContain('arrow-up-left');
    });

    it('should set title attributes to the icon-button', () => {
      expect(sutIconElement[0].getAttribute('title')).toBe('SELECT_PARENT');
      expect(sutIconElement[1].getAttribute('title')).toBe('MOVE_UP');
      expect(sutIconElement[2].getAttribute('title')).toBe('MOVE_DOWN');
      expect(sutIconElement[3].getAttribute('title')).toBe('OPEN_IN_EXPLORER');
      expect(sutIconElement[4].getAttribute('title')).toBe('PERSONALIZE_COMPONENT');
      expect(sutIconElement[5].getAttribute('title')).toBe('GENERATIVE_AI');
      expect(sutIconElement[6].getAttribute('title')).toBe('DELETE');
    });

    it('should add "personalized" class when is personalized', () => {
      sut = new PageElementOutlineComponent(abortController, { getIsPersonalized: () => true } as Chrome);
      sut.attach(attachRoot);

      expect(attachRoot.querySelector('[class*=personalized]')).toBeTruthy();
    });

    it('should assign click handler', () => {
      const clickHandler = jasmine.createSpy();

      sut.icon = { name: 'arrow-down', onClick: clickHandler };
      triggerClick(sutIconElement[0]);

      expect(clickHandler).toHaveBeenCalled();
    });

    it('should unassign previous click handler when reset', () => {
      const prevClickHandler = jasmine.createSpy();

      sut.icon = { name: 'arrow-down', onClick: prevClickHandler };
      sut.icon = null;
      triggerClick(sutIconElement[0]);

      expect(prevClickHandler).not.toHaveBeenCalled();
    });

    it('should unassign previous click handler when re-assign icon', () => {
      const prevClickHandler = jasmine.createSpy();
      const newClickHandler = jasmine.createSpy();

      sut.icon = { name: 'arrow-down', onClick: prevClickHandler };
      sut.icon = { name: 'arrow-up', onClick: newClickHandler };
      triggerClick(sutIconElement[0]);

      expect(prevClickHandler).not.toHaveBeenCalled();
      expect(newClickHandler).toHaveBeenCalled();
    });

    it('should disable buttons if user do not have action permissions', async () => {
      const rootContainer = sut.containerElement;
      spyOn(rootContainer, 'querySelectorAll').and.returnValue(buttons(true) as unknown as NodeListOf<Element>);

      const actionButtons = rootContainer.querySelectorAll('button');

      actionButtons.forEach((button) => {
        expect(button.getAttribute('disabled')).toBe('true');
      });
    });
  });

  describe('Should not raise events after abort', () => {
    it('should not receive click event', () => {
      const clickHandler = jasmine.createSpy();

      sut.icon = { name: 'arrow-down', onClick: clickHandler };

      abortController.abort();
      triggerClick(sutIconElement[1]);

      expect(clickHandler).not.toHaveBeenCalled();
    });
  });

  describe('keyboard-Event', () => {
    it('should assign keyboard event to buttons', async () => {
      const keyboardEvHandler = jasmine.createSpy();

      sut.icon = { name: 'arrow-down', keyboardEv: keyboardEvHandler };

      const keyboardEnterEvent = createKeyboardEvent('keydown', 'Enter');
      sutIconElement[0].dispatchEvent(keyboardEnterEvent);

      expect(keyboardEvHandler).toHaveBeenCalled();
    });

    it('should not raise keyboard event after abort', () => {
      const keyboardEvHandler = jasmine.createSpy();

      sut.icon = { name: 'arrow-down', keyboardEv: keyboardEvHandler };

      abortController.abort();
      const keyboardEnterEvent = createKeyboardEvent('keydown', 'Enter');
      sutIconElement[0].dispatchEvent(keyboardEnterEvent);

      expect(keyboardEvHandler).not.toHaveBeenCalled();
    });

    it('should focus the next icon-button when ArrowRight key is pressed', () => {
      spyOn(renderingChrome, 'isRenderingChrome').and.returnValue(true);
      sut = new PageElementOutlineComponent(abortController, { getIsPersonalized: () => false } as Chrome, 'select');

      const rootContainer = sut.containerElement;

      spyOn(rootContainer, 'querySelectorAll').and.returnValue(buttons() as unknown as NodeListOf<Element>);
      const keyboardEvent = createKeyboardEvent('keydown', 'ArrowRight');

      spyOn(rootContainer.querySelectorAll('button')[0], 'blur');
      spyOn(rootContainer.querySelectorAll('button')[1], 'focus');

      rootContainer.dispatchEvent(keyboardEvent);

      expect(rootContainer.querySelectorAll('button')[0].blur).toHaveBeenCalled();
      expect(rootContainer.querySelectorAll('button')[1].focus).toHaveBeenCalled();
    });

    it('should focus the previous icon-button when ArrowLeft key is pressed', () => {
      spyOn(renderingChrome, 'isRenderingChrome').and.returnValue(true);
      sut = new PageElementOutlineComponent(abortController, { getIsPersonalized: () => false } as Chrome, 'select');

      const rootContainer = sut.containerElement;

      spyOn(rootContainer, 'querySelectorAll').and.returnValue(buttons() as unknown as NodeListOf<Element>);
      const keyboardEvent = createKeyboardEvent('keydown', 'ArrowLeft');

      spyOn(rootContainer.querySelectorAll('button')[0], 'blur');
      spyOn(rootContainer.querySelectorAll('button')[4], 'focus');

      rootContainer.dispatchEvent(keyboardEvent);

      expect(rootContainer.querySelectorAll('button')[0].blur).toHaveBeenCalled();
      expect(rootContainer.querySelectorAll('button')[4].focus).toHaveBeenCalled();
    });
  });
});
