/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import Popper from 'popper.js';
import { setupTestDOM, teardownTestDOM } from './dom.testing';
import { createChip } from './popper';

describe('Popper', () => {
  let popper: Popper;
  let hostElement: Element;
  let chipElement: Element;

  beforeEach(() => {
    hostElement = setupTestDOM('<div id="host">foo</div>');
    chipElement = setupTestDOM('<div id="chip">bar</div>');
    popper = new Popper(hostElement, chipElement, {
      placement: 'auto',
    });
  });

  afterEach(() => {
    teardownTestDOM(hostElement);
    teardownTestDOM(chipElement);
  });

  it('should create chip with new options when `createChip` is called', () => {
    popper = createChip(hostElement, chipElement);

    expect(popper.options.eventsEnabled).toBe(false);
    expect(popper.options.placement).toBe('top-start');
    expect(popper.options.modifiers?.preventOverflow?.padding).toBe(0);
  });
});
