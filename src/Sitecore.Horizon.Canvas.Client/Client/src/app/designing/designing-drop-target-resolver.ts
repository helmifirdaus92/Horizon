/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Chrome } from '../chrome/chrome';
import { isPlaceholderChrome, PlaceholderChrome } from '../chrome/chrome.placeholder';
import { isRenderingChrome, RenderingChrome } from '../chrome/chrome.rendering';
import { DropTarget } from './designing-manager';
import { DesigningHitEvent } from './designing-native-events-translator';
import { CachedRenderingDropZonesUtil } from './rendering-drop-zones-util';

function isDropTarget(data: unknown): data is DropTarget {
  return typeof data === 'object' && !!data && 'placeholder' in data && isPlaceholderChrome((data as DropTarget).placeholder);
}

export class DesigningDropTargetResolver {
  constructor(private readonly renderingDropZonesUtil: CachedRenderingDropZonesUtil) {}

  public resetCache(): void {
    this.renderingDropZonesUtil.resetCache();
  }

  public resolveDropTarget(hit: DesigningHitEvent['hit']): DropTarget | undefined {
    if (hit.type === 'custom') {
      return isDropTarget(hit.data) ? hit.data : undefined;
    }

    const { chrome, clientY } = hit;

    const currentDropTarget = findFirstDroppableChrome(chrome);
    if (!currentDropTarget) {
      return undefined;
    }

    if (isRenderingChrome(currentDropTarget)) {
      const position = this.renderingDropZonesUtil.calculateDropZonePosition(currentDropTarget, clientY);
      return position ? { placeholder: currentDropTarget.parentChrome, anchor: { position, target: currentDropTarget } } : undefined;
    }

    // Were are handling hit on placeholder in a special way.
    // It could happen that placeholder is occupying the whole parent rendering doesn't allowing to drop before/after that rendering.
    // To solve it we move virtual rendering hit layer _before_ placeholer creating the following layers (most top one is first):
    //
    //        user cursor position:    p1      p2        p3
    // virtual rendering hit layer:  ------            ------
    //           placeholder layer:  ------------------------
    //             rendering layer:  ------------------------
    //
    // This way we drop to following places:
    //    - p1: drop before rendering
    //    - p2: drop to placeholder
    //    - p3: drop after rendering

    const previousDropTarget = findFirstDroppableChrome(chrome.parentChrome);
    if (previousDropTarget && isRenderingChrome(previousDropTarget)) {
      const position = this.renderingDropZonesUtil.calculateDropZonePosition(previousDropTarget, clientY);
      if (position) {
        return { placeholder: previousDropTarget.parentChrome, anchor: { position, target: previousDropTarget } };
      }
    }

    return { placeholder: currentDropTarget };
  }
}

/**
 * Find first chrome which is a possible drop target. This function handles non-editable chromes and renderings with wrong parent.
 */
export function findFirstDroppableChrome(
  chrome: Chrome | undefined,
): PlaceholderChrome | (RenderingChrome & { parentChrome: PlaceholderChrome }) | undefined {
  if (!chrome) {
    return chrome;
  }

  let currentChrome: Chrome | undefined = chrome;
  while (currentChrome) {
    if (isPlaceholderChrome(currentChrome) && currentChrome.editable) {
      return currentChrome;
    }

    if (
      isRenderingChrome(currentChrome) &&
      !!currentChrome.parentChrome &&
      isPlaceholderChrome(currentChrome.parentChrome) &&
      currentChrome.parentChrome.editable
    ) {
      const rendering: RenderingChrome = currentChrome;
      // Kill typing here as TS cannot infer that parentChrome is strictly of PlaceholderChrome type.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return rendering as any;
    }

    currentChrome = currentChrome.parentChrome;
  }

  return undefined;
}
