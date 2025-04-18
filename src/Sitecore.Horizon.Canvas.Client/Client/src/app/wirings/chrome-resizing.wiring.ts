/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeManager } from '../chrome/chrome-manager';
import { FrameManager } from '../frame/frame-manager';
import { Wiring } from './wiring';

export class ChromeResizingWiring implements Wiring {
  private pendingRafId = 0;

  constructor(private readonly chromeManager: ChromeManager, private readonly frameManager: FrameManager) {}

  wire(abortController: AbortController): void {
    for (const chrome of this.chromeManager.chromes) {
      chrome.onSizeChange.on(() => this.requestResize());
    }

    window.addEventListener('resize', () => this.requestResize(), { signal: abortController.signal });
    window.addEventListener('scroll', () => this.requestResize(), { signal: abortController.signal });
  }

  private requestResize() {
    // If resize is already requested - discard and queue another. That way we could ensure that we invoke it required amount of times.
    if (this.pendingRafId !== 0) {
      cancelAnimationFrame(this.pendingRafId);
    }

    // Use next animation frame, so browser has a chance to apply all the pending layout changes done in this cycle.
    // Notice, we require 2 frames, as in worse case our frame itself might cause page scrolling.
    // So when we update frame on first cycle, another re-layout is required to catch up potential change.
    this.scheduleResizingOnNextRAF(2);
  }

  private scheduleResizingOnNextRAF(remainingUpdates: number) {
    if (remainingUpdates === 0) {
      return;
    }

    this.pendingRafId = requestAnimationFrame(() => {
      this.pendingRafId = 0;

      this.frameManager.resizeActiveChromes();

      this.scheduleResizingOnNextRAF(remainingUpdates - 1);
    });
  }
}
