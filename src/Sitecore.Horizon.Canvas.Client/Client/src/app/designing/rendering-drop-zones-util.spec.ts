/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeHighlightFrameSource } from '../chrome/chrome';
import { ElementDimensions } from '../utils/dom';
import { PlacementAnchorPosition } from '../utils/placement-anchor';
import { CachedRenderingDropZonesUtil, RenderingDropZonesUtil } from './rendering-drop-zones-util';

function makeSource(dimensions: ElementDimensions): ChromeHighlightFrameSource {
  return jasmine.createSpyObj<ChromeHighlightFrameSource>('source', { getDimensions: dimensions });
}

describe(CachedRenderingDropZonesUtil.name, () => {
  it('should reset cache when page was scrolled', () => {
    const sut = new CachedRenderingDropZonesUtil();
    const resetCacheSpy = spyOn(sut, 'resetCache');

    window.dispatchEvent(new CustomEvent('scroll'));

    expect(resetCacheSpy).toHaveBeenCalledTimes(1);
  });
});

describe(RenderingDropZonesUtil.name, () => {
  let sut: RenderingDropZonesUtil;

  beforeEach(() => {
    sut = new RenderingDropZonesUtil();
  });

  describe('3x3 rendering', () => {
    const source = makeSource({ top: 0, left: 0, width: 3, height: 3 });

    it('should have correct drop zone size', () => {
      const result = sut.getDropZoneSize(source);

      expect(result.height).toBe(20);
      expect(result.fullSpace).toBeTruthy();
    });

    new Array<{ y: number; position: PlacementAnchorPosition }>({ y: 0, position: 'after' }, { y: 2, position: 'after' }).forEach(
      ({ y, position }) =>
        it(`[ y: ${y} , position: '${position}'] should correctly resolve zone position`, () => {
          const result = sut.calculateDropZonePosition(source, y);

          expect(result).toBe(position);
        }),
    );
  });

  describe('35x35 rendering', () => {
    const source = makeSource({ top: 100, left: 100, width: 35, height: 35 });

    it('should have correct drop zone size', () => {
      const result = sut.getDropZoneSize(source);

      expect(result.height).toBe(35);
      expect(result.fullSpace).toBeTruthy();
    });

    new Array<{ y: number; position: PlacementAnchorPosition | undefined }>(
      { y: 99, position: undefined },
      { y: 100, position: 'after' },
      { y: 110, position: 'after' },
      { y: 120, position: 'after' },
      { y: 130, position: 'after' },
      { y: 134, position: 'after' },
      { y: 135, position: undefined },
    ).forEach(({ y, position }) =>
      it(`[ y: ${y} , position: '${position}'] should correctly resolve zone position`, () => {
        const result = sut.calculateDropZonePosition(source, y);

        expect(result).toBe(position);
      }),
    );
  });

  describe('40x40 rendering', () => {
    const source = makeSource({ top: 100, left: 100, width: 40, height: 40 });

    it('should have correct drop zone size', () => {
      const result = sut.getDropZoneSize(source);

      expect(result.height).toBe(20);
      expect(result.fullSpace).toBeFalsy();
    });

    new Array<{ y: number; position: PlacementAnchorPosition | undefined }>(
      { y: 99, position: undefined },
      { y: 100, position: 'before' },
      { y: 110, position: 'before' },
      { y: 119, position: 'before' },
      { y: 120, position: 'after' },
      { y: 130, position: 'after' },
      { y: 139, position: 'after' },
      { y: 140, position: undefined },
    ).forEach(({ y, position }) =>
      it(`[ y: ${y} , position: '${position}'] should correctly resolve zone position`, () => {
        const result = sut.calculateDropZonePosition(source, y);

        expect(result).toBe(position);
      }),
    );
  });

  describe('70x70 rendering', () => {
    const source = makeSource({ top: 100, left: 100, width: 70, height: 70 });

    it('should have correct drop zone size', () => {
      const result = sut.getDropZoneSize(source);

      expect(result.height).toBe(35);
      expect(result.fullSpace).toBeFalsy();
    });

    new Array<{ y: number; position: PlacementAnchorPosition | undefined }>(
      { y: 99, position: undefined },
      { y: 100, position: 'before' },
      { y: 120, position: 'before' },
      { y: 130, position: 'before' },
      { y: 134, position: 'before' },
      { y: 135, position: 'after' },
      { y: 140, position: 'after' },
      { y: 160, position: 'after' },
      { y: 169, position: 'after' },
      { y: 170, position: undefined },
    ).forEach(({ y, position }) =>
      it(`[ y: ${y} , position: '${position}'] should correctly resolve zone position`, () => {
        const result = sut.calculateDropZonePosition(source, y);

        expect(result).toBe(position);
      }),
    );
  });

  describe('80x80 rendering', () => {
    const source = makeSource({ top: 100, left: 100, width: 80, height: 80 });

    it('should have correct drop zone size', () => {
      const result = sut.getDropZoneSize(source);

      expect(result.height).toBe(40);
      expect(result.fullSpace).toBeFalsy();
    });

    new Array<{ y: number; position: PlacementAnchorPosition | undefined }>(
      { y: 99, position: undefined },
      { y: 100, position: 'before' },
      { y: 120, position: 'before' },
      { y: 130, position: 'before' },
      { y: 139, position: 'before' },
      { y: 140, position: 'after' },
      { y: 160, position: 'after' },
      { y: 170, position: 'after' },
      { y: 179, position: 'after' },
      { y: 180, position: undefined },
    ).forEach(({ y, position }) =>
      it(`[ y: ${y} , position: '${position}'] should correctly resolve zone position`, () => {
        const result = sut.calculateDropZonePosition(source, y);

        expect(result).toBe(position);
      }),
    );
  });

  describe('100x100 rendering', () => {
    const source = makeSource({ top: 100, left: 100, width: 100, height: 100 });

    it('should have correct drop zone size', () => {
      const result = sut.getDropZoneSize(source);

      expect(result.height).toBe(40);
      expect(result.fullSpace).toBeFalsy();
    });

    new Array<{ y: number; position: PlacementAnchorPosition | undefined }>(
      { y: 99, position: undefined },
      { y: 100, position: 'before' },
      { y: 110, position: 'before' },
      { y: 120, position: 'before' },
      { y: 130, position: 'before' },
      { y: 139, position: 'before' },
      { y: 140, position: undefined },
      { y: 150, position: undefined },
      { y: 159, position: undefined },
      { y: 160, position: 'after' },
      { y: 170, position: 'after' },
      { y: 180, position: 'after' },
      { y: 190, position: 'after' },
      { y: 199, position: 'after' },
      { y: 200, position: undefined },
    ).forEach(({ y, position }) =>
      it(`[ y: ${y} , position: '${position}'] should correctly resolve zone position`, () => {
        const result = sut.calculateDropZonePosition(source, y);

        expect(result).toBe(position);
      }),
    );
  });
});
