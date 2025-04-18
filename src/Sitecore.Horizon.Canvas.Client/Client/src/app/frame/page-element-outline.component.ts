/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Chrome } from '../chrome/chrome';
import { isRenderingChrome } from '../chrome/chrome.rendering';
import { EventEmitter } from '../messaging/event-emitter';
import { TranslationService } from '../services/translation.service';
import { setElementDimensions } from '../utils/dom';
import { renderIconElement } from '../utils/icon';
import style from './page-element-outline.component.scss';

export type OutlineTheme = 'default' | 'focused' | 'error';
const stateToClassMap: Record<OutlineTheme, string> = {
  default: style['state-default'],
  focused: style['state-focused'],
  error: style['state-error'],
};

interface Icon {
  name: string;
  onClick?: (ev: MouseEvent) => void;
  keyboardEv?: (ev: KeyboardEvent) => void;
  isDisabled?: boolean;
  tooltip?: string;
}

export class PageElementOutlineComponent {
  readonly containerElement: HTMLDivElement;
  private readonly iconElement: HTMLSpanElement;
  private readonly textElement: HTMLDivElement;
  private readonly sortMoveUpElement: HTMLSpanElement;
  private readonly sortMoveDownElement: HTMLSpanElement;
  private readonly deleteElement: HTMLSpanElement;
  private readonly testComponentElement: HTMLSpanElement;
  private readonly generativeAiButtonElement: HTMLSpanElement;
  private readonly openInExplorerElement: HTMLSpanElement;
  private readonly Z_INDEX_MAX_VALUE = '2147483638';

  private readonly _onDragStart = new EventEmitter();
  readonly onDragStart = this._onDragStart.asSource();
  private readonly _onDragEnd = new EventEmitter();
  readonly onDragEnd = this._onDragEnd.asSource();

  activeElementIndex = 0;

  get text(): string {
    return this.textElement.innerText;
  }
  set text(value: string) {
    this.textElement.innerText = value;
  }

  private _icon: Icon | null = null;
  get icon(): Icon | null {
    return this._icon;
  }
  set icon(value: Icon | null) {
    if (this._icon?.onClick) {
      this.iconElement.removeEventListener('mousedown', this._icon.onClick);
    }
    this._icon = value;

    this.iconElement.innerHTML = value ? renderIconElement(value.name) : '';
    this.containerElement.classList.toggle(style['has-icon'], !!value);
    this.iconElement.classList.toggle(style['has-action'], !!value?.onClick);
    if (value?.onClick) {
      this.iconElement.addEventListener('mousedown', value.onClick, { signal: this.abortController.signal });
    }
    if (value?.keyboardEv) {
      this.iconElement.addEventListener('keydown', value.keyboardEv, { signal: this.abortController.signal });
    }
  }

  private _sortMoveUp: Icon | null = null;
  get sortMoveUp(): Icon | null {
    return this._sortMoveUp;
  }
  set sortMoveUp(value: Icon | null) {
    if (this._sortMoveUp?.onClick) {
      this.sortMoveDownElement.removeEventListener('mousedown', this._sortMoveUp.onClick);
    }
    this._sortMoveUp = value;
    if (!!value) {
      this.containerElement.classList.toggle(style['has-sort'], true);
      this.sortMoveUpElement.innerHTML = value ? renderIconElement(value.name) : '';
      this.sortMoveUpElement.classList.toggle(style['has-action'], !!value?.onClick);
      this.sortMoveUpElement.addEventListener(
        'mousedown',
        (event: MouseEvent) => {
          event.preventDefault();
          event.stopPropagation();
          (value.onClick as (ev: MouseEvent) => void)(event);
        },
        { signal: this.abortController.signal },
      );
      this.sortMoveUpElement.addEventListener(
        'keydown',
        (event: KeyboardEvent) => {
          if (event.key === 'Enter') {
            (value.keyboardEv as (ev: KeyboardEvent) => void)(event);
          }
        },
        { signal: this.abortController.signal },
      );
      if (value.isDisabled) {
        this.sortMoveUpElement.setAttribute('disabled', value.isDisabled.toString());
      }
    }
  }

  private _sortMoveDown: Icon | null = null;
  get sortMoveDown(): Icon | null {
    return this._sortMoveDown;
  }
  set sortMoveDown(value: Icon | null) {
    if (this._sortMoveDown?.onClick) {
      this.sortMoveDownElement.removeEventListener('mousedown', this._sortMoveDown.onClick);
    }
    this._sortMoveDown = value;
    if (!!value) {
      this.containerElement.classList.toggle(style['has-sort'], true);
      this.sortMoveDownElement.innerHTML = value ? renderIconElement(value.name) : '';
      this.sortMoveDownElement.classList.toggle(style['has-action'], !!value?.onClick);

      this.sortMoveDownElement.addEventListener(
        'mousedown',
        (event: MouseEvent) => {
          event.preventDefault();
          event.stopPropagation();
          (value.onClick as (ev: MouseEvent) => void)(event);
        },
        { signal: this.abortController.signal },
      );
      this.sortMoveDownElement.addEventListener(
        'keydown',
        (event) => {
          if (event.key === 'Enter') {
            (value.keyboardEv as (ev: KeyboardEvent) => void)(event);
          }
        },
        { signal: this.abortController.signal },
      );
      if (value.isDisabled) {
        this.sortMoveDownElement.setAttribute('disabled', value.isDisabled.toString());
      }
    }
  }

  private _delete: Icon | null = null;
  get delete(): Icon | null {
    return this._delete;
  }
  set delete(value: Icon | null) {
    if (this._delete?.onClick) {
      this.deleteElement.removeEventListener('mousedown', this._delete.onClick);
    }
    this._delete = value;

    this.deleteElement.innerHTML = value ? renderIconElement(value.name) : '';
    this.containerElement.classList.toggle(style['has-delete'], !!value);
    this.deleteElement.classList.toggle(style['has-action'], !!value?.onClick);
    if (value?.onClick) {
      this.deleteElement.addEventListener('mousedown', value.onClick, { signal: this.abortController.signal });
    }
    if (value?.keyboardEv) {
      this.deleteElement.addEventListener('keydown', value.keyboardEv, { signal: this.abortController.signal });
    }
    if (value?.isDisabled) {
      this.deleteElement.setAttribute('disabled', value.isDisabled.toString());
    }
  }

  // A/B test component event listener
  private _testComponent: Icon | null = null;
  get testComponent(): Icon | null {
    return this._testComponent;
  }
  set testComponent(value: Icon | null) {
    if (this._testComponent?.onClick) {
      this.testComponentElement.removeEventListener('mousedown', this._testComponent.onClick);
    }
    this._testComponent = value;

    this.testComponentElement.innerHTML = value ? renderIconElement(value.name) : '';
    this.containerElement.classList.toggle(style['has-abTest'], !!value);
    this.testComponentElement.classList.toggle(style['has-action'], !!value?.onClick);
    if (value?.onClick) {
      this.testComponentElement.addEventListener('mousedown', value.onClick, { signal: this.abortController.signal });
    }
    if (value?.keyboardEv) {
      this.testComponentElement.addEventListener('keydown', value.keyboardEv, { signal: this.abortController.signal });
    }
    if (value?.isDisabled) {
      this.testComponentElement.style.opacity = '0.3';
      this.testComponentElement.setAttribute('title', value?.tooltip?.toString() || '');
    }
  }

  // Ai test component event listener
  private _aiButtonIcon: Icon | null = null;
  get aiButtonIcon(): Icon | null {
    return this._aiButtonIcon;
  }
  set aiButtonIcon(value: Icon | null) {
    if (this._aiButtonIcon?.onClick) {
      this.generativeAiButtonElement.removeEventListener('mousedown', this._aiButtonIcon.onClick);
    }
    this._aiButtonIcon = value;

    this.generativeAiButtonElement.innerHTML = value ? renderIconElement(value.name) : '';
    this.containerElement.classList.toggle(style['has-optimize'], !!value);
    this.generativeAiButtonElement.classList.toggle(style['has-action'], !!value?.onClick);
    if (value?.onClick) {
      this.generativeAiButtonElement.addEventListener('mousedown', value.onClick, { signal: this.abortController.signal });
    }
    if (value?.keyboardEv) {
      this.generativeAiButtonElement.addEventListener('keydown', value.keyboardEv, { signal: this.abortController.signal });
    }
    if (value?.isDisabled) {
      this.generativeAiButtonElement.style.opacity = '0.3';
      this.generativeAiButtonElement.setAttribute('title', value?.tooltip?.toString() || '');
    }
  }

  private _openItemInExplorer: Icon | null = null;
  get openItemInExplorer(): Icon | null {
    return this._openItemInExplorer;
  }
  set openItemInExplorer(value: Icon | null) {
    if (this._openItemInExplorer?.onClick) {
      this.openInExplorerElement.removeEventListener('mousedown', this._openItemInExplorer.onClick);
    }
    this._openItemInExplorer = value;

    this.openInExplorerElement.innerHTML = value ? renderIconElement('open-in-new-window') : '';
    this.containerElement.classList.toggle(style['has-edit-content'], !!value);
    this.openInExplorerElement.classList.toggle(style['has-action'], !!value?.onClick);
    if (value?.onClick) {
      this.openInExplorerElement.addEventListener('mousedown', value.onClick, { signal: this.abortController.signal });
    }
    if (value?.keyboardEv) {
      this.openInExplorerElement.addEventListener('keydown', value.keyboardEv, { signal: this.abortController.signal });
    }
  }

  private _state: OutlineTheme = 'default';
  get state(): OutlineTheme {
    return this._state;
  }
  set state(value: OutlineTheme) {
    this.containerElement.classList.remove(stateToClassMap[this._state]);

    this._state = value;
    this.containerElement.classList.add(stateToClassMap[this._state]);
  }

  private _enableEvents = false;
  get enableEvents(): boolean {
    return this._enableEvents;
  }
  set enableEvents(value: boolean) {
    this._enableEvents = value;
    this.containerElement.classList.toggle(style['enable-events'], value);
  }

  constructor(
    private readonly abortController: AbortController,
    chrome: Chrome,
    styleType: 'select' | 'highlight' = 'select',
    isPersonalizationMode?: boolean,
  ) {
    // Container
    this.containerElement = document.createElement('div');
    this.containerElement.className = style['sc-page-element-outline'];
    this.containerElement.setAttribute('tabindex', '0');

    if (chrome.getIsPersonalized()) {
      this.containerElement.className += ` ${style['sc-personalized']}`;
    }

    if (styleType === 'highlight') {
      this.containerElement.className += ` ${style['sc-highlight']}`;
    } else {
      this.containerElement.setAttribute('select', '');
    }

    if (isRenderingChrome(chrome) && styleType === 'select' && !isPersonalizationMode) {
      this.containerElement.setAttribute('draggable', 'true');
      this.containerElement.onmousedown = (event) => {
        this.containerElement.style.zIndex = this.Z_INDEX_MAX_VALUE;
        event.stopPropagation();
      };

      this.containerElement.ondragstart = (_event) => {
        this._onDragStart.emit();
      };

      this.containerElement.ondragend = (_event) => {
        this._onDragEnd.emit();
      };

      const dragIconElement = document.createElement('div');
      dragIconElement.className = style['icon-button'];
      dragIconElement.classList.add(style['drag-vertical']);
      dragIconElement.style.cursor = 'pointer';
      dragIconElement.innerHTML = renderIconElement('drag-vertical');
      this.containerElement.appendChild(dragIconElement);

      this.containerElement.addEventListener(
        'keydown',
        (event) => {
          event.preventDefault();
          this.focusIndexedElement(event);
        },
        { signal: this.abortController.signal },
      );
    }

    // Go to parent Icon
    this.iconElement = document.createElement('button');
    this.iconElement.className = style['icon-button'];
    this.iconElement.classList.add(style['arrow-up-left']);
    this.iconElement.setAttribute('title', TranslationService.get('SELECT_PARENT'));
    this.containerElement.appendChild(this.iconElement);

    // Display name text
    this.textElement = document.createElement('div');
    this.textElement.className = style['text'];
    if (chrome.getIsPersonalized()) {
      this.textElement.className += ` ${style['sc-personalized']}`;
    }

    this.containerElement.appendChild(this.textElement);

    // First divider
    const firstDividerEl = this.getDividerElement('first');
    this.containerElement.appendChild(firstDividerEl);

    // Sort rendering
    const sortIconsContainerEl = document.createElement('div');
    sortIconsContainerEl.className = style['sort'];

    this.sortMoveUpElement = document.createElement('button');
    this.sortMoveDownElement = document.createElement('button');
    this.sortMoveUpElement.setAttribute('title', TranslationService.get('MOVE_UP'));
    this.sortMoveDownElement.setAttribute('title', TranslationService.get('MOVE_DOWN'));

    this.sortMoveUpElement.className = style['icon-button'];
    this.sortMoveUpElement.classList.add(style['arrow-up']);
    this.sortMoveDownElement.className = style['icon-button'];
    this.sortMoveDownElement.classList.add(style['arrow-down']);

    sortIconsContainerEl.appendChild(this.sortMoveUpElement);
    sortIconsContainerEl.appendChild(this.sortMoveDownElement);
    this.containerElement.appendChild(sortIconsContainerEl);

    // Second divider
    const secondDividerEl = this.getDividerElement('second');
    this.containerElement.appendChild(secondDividerEl);

    // Open in Explorer component
    this.openInExplorerElement = document.createElement('button');
    this.openInExplorerElement.className = style['icon-button'];
    this.openInExplorerElement.classList.add(style['open-in-new']);
    this.openInExplorerElement.setAttribute('title', TranslationService.get('OPEN_IN_EXPLORER'));
    this.containerElement.appendChild(this.openInExplorerElement);

    // Third divider
    const thirdDividerEl = this.getDividerElement('third');
    this.containerElement.appendChild(thirdDividerEl);

    // A/B test component
    this.testComponentElement = document.createElement('button');
    this.testComponentElement.className = style['icon-button'];
    this.testComponentElement.classList.add(style['personalize']);
    this.testComponentElement.setAttribute('title', TranslationService.get('PERSONALIZE_COMPONENT'));
    this.containerElement.appendChild(this.testComponentElement);

    // Generative AI button
    this.generativeAiButtonElement = document.createElement('button');
    this.generativeAiButtonElement.className = style['icon-button'];
    this.generativeAiButtonElement.classList.add(style['generative-ai']);
    this.generativeAiButtonElement.setAttribute('title', TranslationService.get('GENERATIVE_AI'));
    this.containerElement.appendChild(this.generativeAiButtonElement);

    // Fourth divider
    const fourthDividerEl = this.getDividerElement('fourth');
    this.containerElement.appendChild(fourthDividerEl);

    // Delete component
    this.deleteElement = document.createElement('button');
    this.deleteElement.className = style['icon-button'];
    this.deleteElement.classList.add(style['delete-outline']);
    this.deleteElement.setAttribute('title', TranslationService.get('DELETE'));
    this.containerElement.appendChild(this.deleteElement);
  }

  attach(host: Node): void {
    host.appendChild(this.containerElement);
  }

  detach(): void {
    this.containerElement.remove();
    this.activeElementIndex = 0;
  }

  setPosition(top: number, left: number): void {
    setElementDimensions(this.containerElement, { top, left });
  }

  private focusIndexedElement(event: KeyboardEvent): void {
    const buttonsWithAction = this.containerElement.querySelectorAll(`[class*='has-action']`);
    const key = event.key;

    (buttonsWithAction[this.activeElementIndex] as HTMLButtonElement).blur();

    if (key === 'ArrowRight') {
      event.preventDefault();

      this.activeElementIndex = (this.activeElementIndex + 1) % buttonsWithAction.length;
    } else if (key === 'ArrowLeft') {
      event.preventDefault();

      this.activeElementIndex = (this.activeElementIndex - 1 + buttonsWithAction.length) % buttonsWithAction.length;
    }
    (buttonsWithAction[this.activeElementIndex] as HTMLButtonElement).focus();
  }

  private getDividerElement(position: string): HTMLSpanElement {
    const dividerEl = document.createElement('span');
    dividerEl.className = `${style.divider} ${style[`${position}`]}`;
    return dividerEl;
  }
}
