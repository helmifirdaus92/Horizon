/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable max-classes-per-file */

import { ChromeHighlightFrameSource } from '../chrome/chrome';
import { ElementDimensions } from '../utils/dom';
import { PlacementAnchorPosition } from '../utils/placement-anchor';

interface DimensionsInfo {
  readonly top: number;
  readonly bottom: number;
  readonly height: number;

  /*
      Hit rules:
        bottom: clientY >= afterHitRegion
        top: clientY <= beforeHitRegion

      Evaluation starts with bottom
    */
  readonly beforeHitRegion: number;
  readonly afterHitRegion: number;
}

export class RenderingDropZonesUtil {
  calculateDropZonePosition(chrome: ChromeHighlightFrameSource, clientY: number): PlacementAnchorPosition | undefined {
    const info = this.getDimensionInfo(chrome);

    // Handle case when after re-calculation it appears outside of rendering.
    // Shouldn't normally happen, but if happens
    if (clientY < info.top || clientY >= info.bottom) {
      return undefined;
    }

    if (clientY >= info.afterHitRegion) {
      return 'after';
    }

    if (clientY <= info.beforeHitRegion) {
      return 'before';
    }

    return undefined;
  }

  getDropZoneSize(chrome: ChromeHighlightFrameSource): { readonly height: number; readonly fullSpace: boolean } {
    const dimensions = this.getDimensionInfo(chrome);

    // For renderings up to 40px we occupy the whole space, min 20px.
    if (dimensions.height < 40) {
      return {
        height: Math.max(20, dimensions.height),
        fullSpace: true,
      };
    }

    return {
      height: Math.min(40, Math.round(dimensions.height / 2)),
      fullSpace: false,
    };
  }

  getInsertionIndication(): { readonly height: number; readonly fullSpace: boolean } {
    return {
      height: 10,
      fullSpace: false,
    }
  }

  protected getDimensionInfo(chromeHighlightFrameSource: ChromeHighlightFrameSource): DimensionsInfo {
    const dimensions = chromeHighlightFrameSource.getDimensions();

    return {
      top: dimensions.top,
      bottom: dimensions.top + dimensions.height,
      height: dimensions.height,

      ...this.calculateHitRegions(dimensions),
    };
  }

  private calculateHitRegions(dimensions: ElementDimensions): { beforeHitRegion: number; afterHitRegion: number } {
    const height = dimensions.height;
    const bottom = dimensions.top + height;

    // Always hit bottom for tiny renderings.
    if (height < 40) {
      return {
        afterHitRegion: dimensions.top,
        beforeHitRegion: dimensions.top,
      };
    }

    // For small renderings divide zone by half.
    // Due to the range inclusiveness and evaluation order strict center is considered a bottom.
    if (height < 80) {
      const middle = bottom - Math.round(height / 2);
      return {
        afterHitRegion: middle,
        beforeHitRegion: middle,
      };
    }

    return {
      afterHitRegion: bottom - 40,
      // Notice, top is inclusive, bottom is exclusive.
      beforeHitRegion: dimensions.top + 39,
    };
  }
}

// eslint-disable-next-line max-classes-per-file, , , , ,
export class CachedRenderingDropZonesUtil extends RenderingDropZonesUtil {
  private readonly cachedDimensionsInfo = new Map<ChromeHighlightFrameSource, DimensionsInfo>();

  constructor() {
    super();
    window.onscroll = () => this.resetCache();
  }

  resetCache(): void {
    this.cachedDimensionsInfo.clear();
  }

  protected getDimensionInfo(chrome: ChromeHighlightFrameSource): DimensionsInfo {
    let result = this.cachedDimensionsInfo.get(chrome);

    if (!result) {
      result = super.getDimensionInfo(chrome);
      this.cachedDimensionsInfo.set(chrome, result);
    }

    return result;
  }
}
