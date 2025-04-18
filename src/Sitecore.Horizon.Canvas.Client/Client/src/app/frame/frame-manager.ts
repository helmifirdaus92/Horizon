/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Chrome } from '../chrome/chrome';
import { ChromeDom } from '../chrome/chrome-dom';
import { isFieldChrome } from '../chrome/chrome.field';
import { isRenderingChrome, RenderingChrome } from '../chrome/chrome.rendering';
import { EventEmitter } from '../messaging/event-emitter';
import { ItemPermissions } from '../messaging/horizon-canvas.contract.parts';
import { FrameWithChrome } from './frame';
import { HighlightFrame } from './highlight-frame';
import { SelectFrame } from './select-frame';

export const defaultItemPermissions: ItemPermissions = {
  canWrite: true,
  canCreate: true,
  canDelete: true,
  canPublish: true,
  canRename: true,
};
export class FrameManager {
  private readonly chromeToFrameMap: Map<Chrome, { highlight?: FrameWithChrome; select?: FrameWithChrome; parent?: FrameWithChrome }> =
    new Map();

  private highlightedFrame: FrameWithChrome | null = null;
  private selectedFrame: FrameWithChrome | null = null;
  private parentFrame: FrameWithChrome | null = null;
  private highlightedFrames: FrameWithChrome[] | null = null;

  private readonly _onMoveRenderingStart = new EventEmitter<RenderingChrome>();
  readonly onMoveRenderingStart = this._onMoveRenderingStart.asSource();

  private readonly _onMoveRenderingEnd = new EventEmitter<RenderingChrome>();
  readonly onMoveRenderingEnd = this._onMoveRenderingEnd.asSource();

  private readonly _onDeleteRendering = new EventEmitter<RenderingChrome>();
  readonly onDeleteRendering = this._onDeleteRendering.asSource();

  private isPersonalizationMode = false;
  permissions: ItemPermissions = defaultItemPermissions;

  constructor(
    private readonly chromeDom: ChromeDom,
    private readonly abortController: AbortController,
  ) {}

  setPersonalizationMode(mode: boolean) {
    if (this.isPersonalizationMode === mode) {
      return;
    }

    this.isPersonalizationMode = mode;
    this.chromeToFrameMap.clear();
  }

  highlight(chrome: Chrome): void {
    if (this.highlightedFrame && this.highlightedFrame.chrome === chrome) {
      // Do nothing - same chrome is highlighted.
      return;
    }

    this.unhighlight();

    // Do not highlight already selected chrome, as that might create extra border.
    if (this.selectedFrame && this.selectedFrame.chrome === chrome) {
      return;
    }

    this.highlightedFrame = this.getOrCreateFrame(chrome, 'highlight');
    this.highlightedFrame.show(this.chromeDom.root);
  }

  highlightChromes(chromes: Chrome[]): void {
    this.unhighlightChromes();

    this.highlightedFrames = chromes.map((chrome) => this.getOrCreateFrame(chrome, 'parent'));
    this.highlightedFrames.forEach((frame) => frame.show(this.chromeDom.root));
  }

  unhighlightChromes(): void {
    this.highlightedFrames?.forEach((frame) => frame.hide());
    this.highlightedFrames = null;
  }

  unhighlight(): void {
    if (!this.highlightedFrame) {
      return;
    }

    this.highlightedFrame.hide();
    this.highlightedFrame = null;
  }

  select(chrome: Chrome): void {
    if (this.selectedFrame && this.selectedFrame.chrome === chrome) {
      // Do nothing - same chrome is selected.
      return;
    }

    this.deselect();

    // If current chrome is already highlighted - remove frame, otherwise extra border will be created.
    if (this.highlightedFrame && this.highlightedFrame.chrome === chrome) {
      this.unhighlight();
    }

    this.selectedFrame = this.getOrCreateFrame(chrome, 'select');
    this.selectedFrame.show(this.chromeDom.root);

    if (chrome.parentChrome && isFieldChrome(chrome) && isRenderingChrome(chrome.parentChrome)) {
      this.parentFrame = this.getOrCreateFrame(chrome.parentChrome, 'parent');
      this.parentFrame.show(this.chromeDom.root);
    }
  }

  deselect(): void {
    if (!this.selectedFrame) {
      return;
    }

    this.selectedFrame.hide();
    this.selectedFrame = null;

    if (this.parentFrame) {
      this.parentFrame.hide();
      this.parentFrame = null;
    }
  }

  resizeActiveChromes(): void {
    if (this.selectedFrame) {
      this.selectedFrame.updatePosAndSize();
    }

    if (this.highlightedFrame) {
      this.highlightedFrame.updatePosAndSize();
    }

    if (this.parentFrame) {
      this.parentFrame.updatePosAndSize();
    }
  }

  private getOrCreateFrame(chrome: Chrome, kind: 'highlight' | 'select' | 'parent'): FrameWithChrome {
    let frames = this.chromeToFrameMap.get(chrome);

    if (!frames) {
      frames = {};
      this.chromeToFrameMap.set(chrome, frames);
    }

    switch (kind) {
      case 'highlight':
        if (!frames.highlight) {
          frames.highlight = new FrameWithChrome(
            new SelectFrame(chrome, this.abortController, 'highlight', this.isPersonalizationMode),
            chrome,
          );
        }
        return frames.highlight;

      case 'select':
        if (!frames.select) {
          const selectFrame = new SelectFrame(chrome, this.abortController, 'select', this.isPersonalizationMode, this.permissions);

          if (isRenderingChrome(chrome)) {
            selectFrame.onDragStart.on(() => this._onMoveRenderingStart.emit(chrome));
            selectFrame.onDragEnd.on(() => this._onMoveRenderingEnd.emit(chrome));
            selectFrame.onDelete.on(() => {
              if (this.selectedFrame?.chrome === chrome) {
                this._onDeleteRendering.emit(chrome);
              }
            });
          }

          frames.select = new FrameWithChrome(selectFrame, chrome);
        }
        return frames.select;

      case 'parent':
        if (!frames.parent) {
          const parentFrame = new HighlightFrame(chrome);

          frames.parent = new FrameWithChrome(parentFrame, chrome);
        }
        return frames.parent;
    }
  }
}
