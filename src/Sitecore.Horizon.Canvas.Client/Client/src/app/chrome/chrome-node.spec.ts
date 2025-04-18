/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { setupTestDOM, teardownTestDOM } from '../utils/dom.testing';
import { PlaceholderChromeNode, RenderingChromeNode } from './chrome-node';
import { PlaceholderChrome } from './chrome.placeholder';
import { RenderingChrome } from './chrome.rendering';

describe(RenderingChromeNode.name, () => {
  let rootElement: HTMLElement;
  let sutRendering: RenderingChromeNode;

  let renderingChromeRaw: { startElement: Element; content: Element; endElement: Element };

  beforeEach(async () => {
    rootElement = setupTestDOM(`
    <rendering id="rendering">
      <h1>Rendering</h1>
    </rendering>
    `);

    renderingChromeRaw = {
      startElement: rootElement.querySelector('[id*=start_]') as Element,
      content: rootElement.querySelector('h1') as Element,
      endElement: rootElement.querySelector('[id*=end_]') as Element,
    };

    sutRendering = new RenderingChromeNode({
      startElement: renderingChromeRaw.startElement,
      endElement: renderingChromeRaw.endElement,
    } as RenderingChrome);
  });

  afterEach(() => {
    teardownTestDOM(rootElement);
  });

  it('should be created', () => {
    expect(sutRendering).toBeDefined();
  });

  describe('getHTMLString', () => {
    it('should return the element html', () => {
      expect(sutRendering.getHTMLString().querySelector('h1')?.outerHTML).toBe('<h1>Rendering</h1>');
    });
  });

  describe('getElements()', () => {
    it('should return Elements inside of the Rendering chrome', () => {
      expect(sutRendering.getElements()).toEqual([
        renderingChromeRaw.startElement,
        renderingChromeRaw.content,
        renderingChromeRaw.endElement,
      ]);
    });
  });

  describe('remove()', () => {
    it('should remove Rendering chrome', () => {
      expect(
        rootElement.innerHTML
          .toString()
          .trim()
          .startsWith('<code type="text/sitecore" chrometype="rendering"'),
      ).toBeTrue();

      sutRendering.remove();
      expect(rootElement.innerHTML.toString().trim()).toBe('');
    });
  });
});

describe(PlaceholderChromeNode.name, () => {
  let rootElement: HTMLElement;
  let sutPlaceholder: PlaceholderChromeNode;

  let placeholderChromeRaw: { startElement: Element; content: Element; endElement: Element };

  beforeEach(async () => {
    rootElement = setupTestDOM(`
    <placeholder id="placeholder">
      <h1>Placeholder</h1>
    </placeholder>
    `);

    placeholderChromeRaw = {
      startElement: rootElement.querySelector('[id*=start_]') as Element,
      content: rootElement.querySelector('h1') as Element,
      endElement: rootElement.querySelector('[id*=end_]') as Element,
    };

    sutPlaceholder = new PlaceholderChromeNode({
      startElement: placeholderChromeRaw.startElement,
      endElement: placeholderChromeRaw.endElement,
    } as PlaceholderChrome);
  });

  afterEach(() => {
    teardownTestDOM(rootElement);
  });

  it('should be created', () => {
    expect(sutPlaceholder).toBeDefined();
  });

  describe('getElements()', () => {
    it('should return Elements inside of the Rendering chrome', () => {
      expect(sutPlaceholder.getElements()).toEqual([
        placeholderChromeRaw.startElement,
        placeholderChromeRaw.content,
        placeholderChromeRaw.endElement,
      ]);
    });
  });

  describe('remove()', () => {
    it('should remove Placeholder chrome', () => {
      expect(
        rootElement.innerHTML
          .toString()
          .trim()
          .startsWith('<code type="text/sitecore" chrometype="placeholder"'),
      ).toBeTrue();

      sutPlaceholder.remove();
      expect(rootElement.innerHTML.toString().trim()).toBe('');
    });
  });

  describe('clearInnerHtml(', () => {
    it('should clear Placeholder inner html', () => {
      expect(
        rootElement.innerHTML
          .toString()
          .trim()
          .startsWith('<code type="text/sitecore" chrometype="placeholder"'),
      ).toBeTrue();
      expect(rootElement.querySelector('h1')).toBeTruthy();

      sutPlaceholder.clearInnerHtml();

      expect(
        rootElement.innerHTML
          .toString()
          .trim()
          .startsWith('<code type="text/sitecore" chrometype="placeholder"'),
      ).toBeTrue();
      expect(rootElement.querySelector('h1')).toBeFalsy();
    });
  });
});
