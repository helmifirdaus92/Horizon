/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { createMouseEvent } from '../utils/dom.testing';
import { FeatureChecker } from '../utils/feature-checker';
import { DefaultLinkBehaviorWiring } from './default-link-behavior.wiring';

describe('DefaultLinkBehaviorWiring', () => {
  let sut: DefaultLinkBehaviorWiring;
  let link: Element;
  let openSpy: jasmine.Spy;

  beforeEach(() => {
    link = document.createElement('A');
    link.setAttribute('href', '#foo');
    link.setAttribute('target', '');
    document.body.appendChild(link);

    openSpy = spyOn(window, 'open');
    sut = new DefaultLinkBehaviorWiring();
  });

  afterEach(() => {
    link.remove();
  });

  it('should call preventDefault() on the event, when clicked', async () => {
    const event = createMouseEvent('click');

    sut.wire(new AbortController());
    link.dispatchEvent(event);

    expect(event.defaultPrevented).toBeTrue();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('should prevent click event default browser behaviour, when clicked on a nested element of a link', async () => {
    const event = createMouseEvent('click');

    const button = document.createElement('button');
    button.innerText = 'foo';

    link.appendChild(button);

    sut.wire(new AbortController());
    button.dispatchEvent(event);

    expect(event.defaultPrevented).toBeTrue();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('should not change prevent click event default browser behaviour, when clicked on non-link element', async () => {
    const event = createMouseEvent('click');

    const button = document.createElement('button');
    button.innerText = 'foo';
    document.body.appendChild(button);

    sut.wire(new AbortController());
    button.dispatchEvent(event);

    expect(event.defaultPrevented).toBeFalse();
  });

  it('should open link in a new window when clicked on a link', async () => {
    sut.wire(new AbortController());

    link.dispatchEvent(new MouseEvent('click', { ctrlKey: true, bubbles: true, cancelable: true }));

    expect(openSpy).toHaveBeenCalled();
  });

  it('should not open link when using rendering host directly', async () => {
    sut.wire(new AbortController());
    spyOn(FeatureChecker, 'isShallowChromesEnabled').and.returnValue(true);

    link.dispatchEvent(new MouseEvent('click', { ctrlKey: true, bubbles: true, cancelable: true }));

    expect(openSpy).not.toHaveBeenCalled();
  });

  it('should NOT trigger link open after aborting', async () => {
    const event = createMouseEvent('click');
    const controller = new AbortController();
    sut.wire(controller);

    controller.abort();
    link.dispatchEvent(event);

    expect(openSpy).not.toHaveBeenCalled();
  });
});
