/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingReconnectableP2PConnection } from '@sitecore/horizon-messaging';
import { EventEmitter } from '../messaging/event-emitter';
import { PlaceholderChromeInfo, RenderingChromeInfo } from '../messaging/horizon-canvas.contract.parts';
import { TranslationService } from '../services/translation.service';
import { calculateMaxDimensions, ElementDimensions, getElementsInBetween } from '../utils/dom';
import { renderIconElement } from '../utils/icon';
import { isSameGuid } from '../utils/id';
import { Chrome } from './chrome';
import { ChromeItemContext } from './chrome-item-context';
import style from './chrome.placeholder.scss';
import { isRenderingChrome } from './chrome.rendering';

function last<T>(array: readonly T[]): T | undefined {
  return array ? array[array.length - 1] : undefined;
}

export class PlaceholderChrome extends Chrome {
  private readonly _onAddCompBtnClick = new EventEmitter();
  readonly onAddCompBtnClick = this._onAddCompBtnClick.asSource();

  readonly isEmpty: boolean;

  constructor(
    chromeId: string,
    readonly startElement: Element,
    readonly endElement: Element,
    readonly placeholderKey: string,
    readonly placeholderMetadataKeys: readonly string[],
    readonly allowedRenderingIds: readonly string[],
    readonly itemContext: ChromeItemContext,
    readonly editable: boolean,
    displayName: string,
    childChromes: readonly Chrome[],
    rhsMessaging: MessagingReconnectableP2PConnection,
    readonly abortController: AbortController,
  ) {
    super(chromeId, displayName, childChromes, rhsMessaging);

    this.isEmpty = startElement.nextElementSibling === endElement;

    // It's not possible to drop anything to non-editable placeholder, so let's behave like nothign is allowed for it.
    if (!this.editable) {
      this.allowedRenderingIds = [];
    }

    if (this.isEmpty && this.editable) {
      this.renderPlaceholderSpacer();
    }
    if (this.hasSpacer()) {
      this.setupAddComponentButtonEvents();
    }
  }

  getDimensions(): ElementDimensions {
    return calculateMaxDimensions(getElementsInBetween(this.startElement, this.endElement));
  }

  getIsPersonalized(): boolean {
    return false;
  }

  getChromeInfo(): PlaceholderChromeInfo {
    let parentRenderingChromeInfo: RenderingChromeInfo | undefined;

    if (this.parentChrome && isRenderingChrome(this.parentChrome)) {
      parentRenderingChromeInfo = this.parentChrome?.getChromeInfo();
    }

    return {
      chromeType: 'placeholder',
      placeholderKey: this.placeholderKey,
      displayName: this.displayName,
      chromeId: this.chromeId,
      contextItem: this.itemContext,
      allowedRenderingIds: this.allowedRenderingIds,
      parentRenderingChromeInfo,

      // The last key is the most user friendly.
      // E.g. If key is '/page/content' then the last key is 'content'.
      name: last(this.placeholderMetadataKeys) || this.placeholderKey,
    };
  }

  select(): void {
    this._onSelect.emit();
  }

  canDropRendering(renderingDefinitionId: string): boolean {
    return this.allowedRenderingIds.findIndex((id) => isSameGuid(id, renderingDefinitionId)) !== -1;
  }

  sortMoveUp() {}
  sortMoveDown() {}

  private renderPlaceholderSpacer() {
    const spacer = document.createElement('div');
    spacer.id = 'emptySpacerContainer';
    spacer.className = style['empty-placeholder'];

    const button = document.createElement('button');
    button.className = style['add-comp-button'];

    // Icon
    const iconElement = document.createElement('div');
    iconElement.className = style['icon'];
    iconElement.classList.add(style['plus']);
    iconElement.innerHTML = renderIconElement('plus');
    button.appendChild(iconElement);

    // Attach button to spacer
    spacer.appendChild(button);
    this.startElement.insertAdjacentElement('afterend', spacer);
  }

  disableEditingInPersonalizationMode(isPersonalizationMode: boolean): void {
    const addComponentButton = this.startElement.nextElementSibling?.querySelector('button');
    const titleText = isPersonalizationMode
      ? TranslationService.get('CANVAS_TRANSLATIONS.PLACEHOLDER_NOT_EDITABLE')
      : TranslationService.get('CANVAS_TRANSLATIONS.ADD_COMPONENT');

    if (addComponentButton) {
      if (!!addComponentButton.title) {
        addComponentButton.removeAttribute('title');
      }
      if (addComponentButton.disabled) {
        addComponentButton.removeAttribute('disabled');
      }
      addComponentButton.setAttribute('title', titleText);
      addComponentButton.disabled = isPersonalizationMode;
      addComponentButton.classList.toggle(style['disabled'], isPersonalizationMode);
    }
  }

  private setupAddComponentButtonEvents(): void {
    const addComponentButton = this.startElement.nextElementSibling?.querySelector('button');
    if (addComponentButton) {
      addComponentButton.addEventListener(
        'mousedown',
        (event) => {
          if (addComponentButton.parentElement) {
            addComponentButton.parentElement.className += ` ${style['hovered']}`;
          }
          this._onAddCompBtnClick.emit();
          event.stopPropagation();
          event.preventDefault();
        },
        { signal: this.abortController.signal },
      );
    }
  }

  private hasSpacer(): boolean {
    const nextSibling = this.startElement.nextElementSibling;
    return nextSibling?.id === 'emptySpacerContainer';
  }
}

export function isPlaceholderChrome(chrome: Chrome): chrome is PlaceholderChrome {
  return chrome instanceof PlaceholderChrome;
}
