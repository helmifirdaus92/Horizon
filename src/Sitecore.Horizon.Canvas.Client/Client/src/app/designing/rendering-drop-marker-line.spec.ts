/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeHighlightFrameSource } from '../chrome/chrome';
import { RenderingDropMarkerLine } from './rendering-drop-marker-line';

describe('RenderingDropMarkerLine', () => {
  let dimensionSource: jasmine.SpyObj<ChromeHighlightFrameSource>;
  let sut: RenderingDropMarkerLine;

  beforeEach(() => {
    dimensionSource = jasmine.createSpyObj<ChromeHighlightFrameSource>('chrome', {
      getDimensions: { top: 100, left: 1000, height: 100, width: 500 },
    });

    sut = new RenderingDropMarkerLine(dimensionSource, 'before', true);
  });

  new Array<{ height: number; expectedTop: number }>(
    { height: 1, expectedTop: 98 },
    { height: 3, expectedTop: 99 },
    { height: 4, expectedTop: 99.5 },
  ).forEach(({ height, expectedTop }) =>
    it(`[height: ${height}, expected top: ${expectedTop}] should center line if rendering is small`, () => {
      dimensionSource.getDimensions.and.returnValue({
        top: 100,
        height,
        left: 1000,
        width: 500,
      });

      sut.updatePosAndSize();

      expect(sut.nativeElement.style.top).toBe(`${expectedTop}px`);
      expect(sut.nativeElement.style.left).toBe(`1000px`);
      expect(sut.nativeElement.style.height).toBe('5px');
      expect(sut.nativeElement.style.height).toBe('5px');
    }),
  );

  it('should stick to top if position is before', () => {
    sut = new RenderingDropMarkerLine(dimensionSource, 'before', true);

    sut.updatePosAndSize();

    expect(sut.nativeElement.style.top).toBe('100px');
    expect(sut.nativeElement.style.left).toBe('1000px');
    expect(sut.nativeElement.style.height).toBe('5px');
    expect(sut.nativeElement.style.width).toBe('500px');
  });

  it('should stick to top if position is after', () => {
    sut = new RenderingDropMarkerLine(dimensionSource, 'after', true);

    sut.updatePosAndSize();

    expect(sut.nativeElement.style.top).toBe('195px');
    expect(sut.nativeElement.style.left).toBe('1000px');
    expect(sut.nativeElement.style.height).toBe('5px');
    expect(sut.nativeElement.style.width).toBe('500px');
  });

  it('should add `error-state` class if it is not droppable rendering', () => {
    sut = new RenderingDropMarkerLine(dimensionSource, 'before', false);
    expect(sut.nativeElement.className).toContain('error-state');
  });
});
