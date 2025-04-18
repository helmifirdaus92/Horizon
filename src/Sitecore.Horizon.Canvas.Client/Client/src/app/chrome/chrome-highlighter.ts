/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { EventEmitter } from '../messaging/event-emitter';
import { setupChromeEventsHierarchically } from '../utils/chrome';
import { Chrome } from './chrome';
import { ChromeDom } from './chrome-dom';
import { isRenderingChrome, RenderingChrome } from './chrome.rendering';

function findEditableParentRendering(chrome: RenderingChrome): RenderingChrome | null {
  let parent = chrome.parentChrome;
  while (parent) {
    if (isRenderingChrome(parent) && parent.editable) {
      return parent;
    }
    parent = parent.parentChrome;
  }

  return null;
}

export class ChromeHighlighter {
  private readonly _onEnter = new EventEmitter<Chrome>();
  readonly onEnter = this._onEnter.asSource();

  private readonly _onLeave = new EventEmitter();
  readonly onLeave = this._onLeave.asSource();

  private readonly _onSelect = new EventEmitter<Chrome>();
  readonly onSelect = this._onSelect.asSource();

  private _selectedChrome: Chrome | undefined;
  get selectedChrome(): Chrome | undefined {
    return this._selectedChrome;
  }

  private readonly _onDeselect = new EventEmitter();
  readonly onDeselect = this._onDeselect.asSource();

  constructor(private readonly chromeDom: ChromeDom, private readonly abortController: AbortController) {}

  setupChromes(chromes: readonly Chrome[], chromesRoot: Element): void {
    setupChromeEventsHierarchically(chromes, {
      field: (element, chrome) => {
        this.initCommonElementBehavior(element);
        this.initHighlightingElementBehavior(element, chrome);
      },

      rendering: (element, chrome) => {
        let editableChrome: RenderingChrome | null = chrome;

        // Notice, we should be aware that placeholder doesn't have its own markup and rendering should not necessarily have root tag.
        // Given the following markup:
        //
        //  <editable-ph-start-chrome />
        //  <rendering-start-chrome />
        //  <non-editable-ph-start-chrome />
        //  <rendering-start-chrome />
        //  <div>CURRENT_ELEMENT</div>
        //  ...
        //
        // If current rendering is non-editable, we should find first editable rendering and report event to it.
        // If we just skip the event, it will be bubbled up outside of rendering, so will be never delivered.
        // Also we deliver event to rendering instead of placeholder because normally it's impossible to highlight occupied placeholders.
        // We don't want to change that assumption for now.
        if (!chrome.editable) {
          editableChrome = findEditableParentRendering(chrome);
        }

        if (!editableChrome) {
          return;
        }

        this.initCommonElementBehavior(element);
        this.initHighlightingElementBehavior(element, editableChrome);
        this.initSelectingElementBehavior(element, editableChrome);
      },

      placeholder: (element, chrome) => {
        if (!chrome.editable) {
          // It should be not possible to select non-editable placeholder, but keep it to make code safe.
          return;
        }

        this.initCommonElementBehavior(element);
        this.initHighlightingElementBehavior(element, chrome);
        this.initSelectingElementBehavior(element, chrome);
      },
    });

    // Proxy selection event from chromes.
    chromes.forEach((chrome) => chrome.onSelect.on(() => this.selectChrome(chrome)));

    // if click was not handled by any chrome we should clear frames
    chromesRoot.addEventListener(
      'mousedown',
      () => {
        this.resetAllHighlightings();
      },
      { signal: this.abortController.signal },
    );
  }

  resetAllHighlightings(): void {
    // Some fields might still keep selection, so clear it explicitly.
    this.chromeDom.clearSelection();

    this._selectedChrome = undefined;
    this._onLeave.emit();
    this._onDeselect.emit();
  }

  private initCommonElementBehavior(element: Element) {
    // Do not bubble clicks, to prevent parent chromes from selecting
    element.addEventListener('mousedown', (event: Event) => event.stopPropagation(), { signal: this.abortController.signal });
  }

  private initHighlightingElementBehavior(element: Element, chrome: Chrome) {
    element.addEventListener(
      'mouseover',
      (event) => {
        this._onEnter.emit(chrome);

        // Capture mouse over event, so that parent chrome (rendering or placeholder) doesn't receive is and is not focused.
        event.stopPropagation();
      },
      { signal: this.abortController.signal },
    );

    // Notice, this event is not bubbled, so no need to stop propagation.
    element.addEventListener('mouseleave', () => this._onLeave.emit(), { signal: this.abortController.signal });
  }

  private initSelectingElementBehavior(element: Element, chrome: Chrome) {
    element.addEventListener('mousedown', () => this.selectChrome(chrome), { signal: this.abortController.signal });

    (element as HTMLElement).style.cursor = 'pointer';
  }

  private selectChrome(chrome: Chrome): void {
    // Do not notify if chrome is already selected.
    if (this.selectedChrome === chrome) {
      return;
    }

    this._onSelect.emit(chrome);
    this._selectedChrome = chrome;
  }
}
