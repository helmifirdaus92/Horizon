/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export interface ElementDimensions {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function calculateMaxDimensions(elements: Element[]): ElementDimensions {
  const empty = {
    top: Number.POSITIVE_INFINITY,
    left: Number.POSITIVE_INFINITY,
    width: 0,
    height: 0,
  };

  const dimensions = elements.reduce((result, current) => {
    const htmlElem = current as HTMLElement;
    const boundingRect = current.getBoundingClientRect();

    if (boundingRect.width > 0 && boundingRect.height > 0) {
      result.left = Math.min(result.left, boundingRect.left);
      // scrollWidth/scrollHeight are used because some child element sizes could be ignored by parent 'getBoundingClientRect()'
      result.width = Math.max(result.width, boundingRect.right - result.left, htmlElem.scrollWidth);

      result.top = Math.min(result.top, boundingRect.top);
      result.height = Math.max(result.height, boundingRect.bottom - result.top);
    }

    return result;
  }, empty);

  return dimensions;
}

export function getElementsInBetween(start: Element, end: Element): Element[] {
  const result: Element[] = [];

  let current = start.nextElementSibling;
  while (current && current !== end) {
    result.push(current);
    current = current.nextElementSibling;
  }

  return result;
}

export function setSizeAttribute(element: HTMLImageElement, attribute: 'width' | 'height', size?: number) {
  if (size === undefined) {
    element.removeAttribute(attribute);
  } else {
    element[attribute] = size;
  }
}

/**
 * Set position and size style attributes respecting the window scroll position.
 */
export function setElementDimensions(element: HTMLElement, update: Partial<ElementDimensions>): void {
  if (typeof update.top !== 'undefined') {
    element.style.top = update.top + window.pageYOffset + 'px';
  }

  if (typeof update.left !== 'undefined') {
    element.style.left = update.left + window.pageXOffset + 'px';
  }

  if (typeof update.height !== 'undefined') {
    element.style.height = update.height + 'px';
  }

  if (typeof update.width !== 'undefined') {
    element.style.width = update.width + 'px';
  }
}
