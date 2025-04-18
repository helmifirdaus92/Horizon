/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { RenderingChrome } from '../chrome/chrome.rendering';
import { ElementDimensions } from '../utils/dom';
import { RenderingDropZone } from './rendering-drop-zone';

describe(RenderingDropZone.name, () => {
  let rootElement: HTMLElement;
  let sut: RenderingDropZone;
  const dimensions: ElementDimensions = { top: 100, left: 100, width: 100, height: 100 };
  const renderingChrome = { getDimensions: () => dimensions, getIsPersonalized: () => false } as RenderingChrome;

  beforeEach(() => {
    rootElement = document.createElement('div');
    document.body.appendChild(rootElement);
  });

  afterEach(() => {
    rootElement.remove();
  });

  describe('set rendering drop zone style', () => {
    it('can drop', () => {
      sut = new RenderingDropZone(renderingChrome, 'before', true);

      expect(sut.nativeElement.classList.value).toContain('sc-rendering-drop-zone');
      expect(sut.nativeElement.classList.value).not.toContain('error');
      expect(sut.nativeElement.classList.value).not.toContain('notDefinedCanDrop');
    });

    it('can not drop', () => {
      sut = new RenderingDropZone(renderingChrome, 'before', false);

      expect(sut.nativeElement.classList.value).toContain('sc-rendering-drop-zone');
      expect(sut.nativeElement.classList.value).toContain('error');
      expect(sut.nativeElement.classList.value).not.toContain('notDefinedCanDrop1111111');
    });

    it('not defined can drop', () => {
      sut = new RenderingDropZone(renderingChrome, 'before');

      expect(sut.nativeElement.classList.value).toContain('sc-rendering-drop-zone');
      expect(sut.nativeElement.classList.value).not.toContain('error');
      expect(sut.nativeElement.classList.value).toContain('notDefinedCanDrop');
    });
  });

  describe('updatePosAndSize', () => {
    it('should return proper position and size', () => {
      sut = new RenderingDropZone(renderingChrome, 'before', false);

      sut.show(rootElement);
      sut.updatePosAndSize();

      const elementRectangle = sut.nativeElement.getBoundingClientRect();

      expect(elementRectangle.left).toEqual(dimensions.left);
      expect(elementRectangle.width).toEqual(dimensions.width);
      expect(elementRectangle.top).toEqual(dimensions.top);
      expect(elementRectangle.height).toEqual(40);
    });

    it('should reset the drop zone height if drag hit is in droppable area', () => {
      sut = new RenderingDropZone(renderingChrome, 'before', true);

      sut.show(rootElement);
      sut.updatePosAndSize();

      const elementRectangle = sut.nativeElement.getBoundingClientRect();

      expect(elementRectangle.height).toEqual(10);
    });
  });
});
