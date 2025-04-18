/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { PlaceholderChrome } from '../chrome/chrome.placeholder';
import { isRenderingChrome, RenderingChrome } from '../chrome/chrome.rendering';
import { EventEmitter } from '../messaging/event-emitter';
import { PlacementAnchor } from '../utils/placement-anchor';
import { DesigningDropTargetResolver, findFirstDroppableChrome } from './designing-drop-target-resolver';
import { DesigningHitEvent } from './designing-native-events-translator';

export interface DropTarget {
  readonly placeholder: PlaceholderChrome;
  readonly anchor?: PlacementAnchor<RenderingChrome>;
}

export class DesigningManager {
  private readonly _onShowGuideDropZones = new EventEmitter<RenderingChrome>();
  readonly onShowGuideDropZones = this._onShowGuideDropZones.asSource();

  private readonly _onClearGuideDropZones = new EventEmitter();
  readonly onClearGuideDropZones = this._onClearGuideDropZones.asSource();

  private readonly _onHighlightDropTarget = new EventEmitter<{
    readonly canDrop: boolean;
    readonly target: DropTarget;
  }>();
  readonly onHighlightDropTarget = this._onHighlightDropTarget.asSource();

  private readonly _onClearHighlightingDropTarget = new EventEmitter();
  readonly onClearHighlightingDropTarget = this._onClearHighlightingDropTarget.asSource();

  private readonly _onDropped = new EventEmitter<{
    placeholder: PlaceholderChrome;
    renderingDefinitionId: string;
    movedRendering?: RenderingChrome;
    anchor: PlacementAnchor<RenderingChrome> | undefined;
  }>();
  readonly onDropped = this._onDropped.asSource();

  private readonly _onDroppedCanceled = new EventEmitter();
  readonly onDroppedCanceled = this._onDroppedCanceled.asSource();

  constructor(private readonly dropTargetResolver: DesigningDropTargetResolver) {}

  dragStart(): void {
    // Invalidate cache and page might have been resized since last cancelled drag-n-drop session.
    this.dropTargetResolver.resetCache();
  }

  dragOver(event: DesigningHitEvent): void {
    const target = this.dropTargetResolver.resolveDropTarget(event.hit);
    if (!target) {
      this._onClearHighlightingDropTarget.emit();
      this.notifyShowOrHideGuideDropZones(event);
      return;
    }

    const canDrop = target.placeholder.canDropRendering(event.renderingDefinitionId);
    this._onHighlightDropTarget.emit({ canDrop, target });
    this._onClearGuideDropZones.emit();
  }

  async dropRendering(event: DesigningHitEvent): Promise<void> {
    const target = this.dropTargetResolver.resolveDropTarget(event.hit);
    if (!target) {
      return;
    }

    const { placeholder, anchor } = target;

    if (!placeholder.canDropRendering(event.renderingDefinitionId)) {
      return;
    }

    this._onDropped.emit({
      placeholder,
      renderingDefinitionId: event.renderingDefinitionId,
      movedRendering: event.movedRendering,
      anchor,
    });
  }

  dragLeave(): void {
    this._onClearHighlightingDropTarget.emit();
    this._onClearGuideDropZones.emit();
  }

  cancelDrop(): void {
    this._onDroppedCanceled.emit();
    this._onClearGuideDropZones.emit();
  }

  private notifyShowOrHideGuideDropZones(event: DesigningHitEvent) {
    if (event.hit.type === 'native') {
      const droppableChrome = findFirstDroppableChrome(event.hit.chrome);

      if (droppableChrome && isRenderingChrome(droppableChrome)) {
        this._onShowGuideDropZones.emit(droppableChrome);
      } else {
        this._onClearGuideDropZones.emit();
      }
    }
  }
}
