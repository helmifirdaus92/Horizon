/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import Popper from 'popper.js';

export function createChip(element: Element, content: Element, isActive?: boolean): Popper {
  const popper = new Popper(element, content, {
    placement: 'top-start',
    eventsEnabled: false,
    modifiers: {
      flip: {
        // Trick to show popper at top if it cannot fit it to markup.
        // Happens for root renderings occupying whole page space.
        behavior: ['top', 'bottom', 'top'],
      },
      preventOverflow: {
        // To avoid gap between popper and element when there is no enough space to render it outside of element.
        padding: 0,
      },
      offset: {
        offset: isActive ? '0, 8' : '0, 0',
      },
    },
  });
  return popper;
}
