/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingReconnectableP2PConnection } from '@sitecore/horizon-messaging';
import { EventEmitter } from '../messaging/event-emitter';
import { ChromeInfo } from '../messaging/horizon-canvas.contract.parts';
import { ElementDimensions } from '../utils/dom';

// To ensure that public property can be set only via helper function.
const PARENT_CHROME_PROPERTY = Symbol('PARENT_CHROME');
const CHROME_ID_PROPERTY = Symbol('CHROME_ID');

export type PersonalizationAction = 'SetDataSourceAction' | 'HideRenderingAction' | 'SetRenderingAction';

export interface ChromeHighlightFrameSource {
  getDimensions(): ElementDimensions;
  getIsPersonalized(): boolean;
}

export interface SelectableChrome {
  select(): void;
}

export interface SortableChrome {
  sortMoveUp?: () => void;
  sortMoveDown?: () => void;
}

export interface SortRenderingsOptions {
  up: {
    allowed: boolean;
    onClick: (ev: MouseEvent) => void;
    onEnterKey: (ev: KeyboardEvent) => void;
  };
  down: {
    allowed: boolean;
    onClick: (ev: MouseEvent) => void;
    onEnterKey: (ev: KeyboardEvent) => void;
  };
}

export abstract class Chrome implements ChromeHighlightFrameSource, SelectableChrome, SortableChrome {
  protected readonly _onSizeChange = new EventEmitter();
  readonly onSizeChange = this._onSizeChange.asSource();

  protected readonly _onSelect = new EventEmitter();
  readonly onSelect = this._onSelect.asSource();

  [PARENT_CHROME_PROPERTY]: Chrome | undefined;
  get parentChrome(): Chrome | undefined {
    return this[PARENT_CHROME_PROPERTY];
  }

  [CHROME_ID_PROPERTY]: string;
  get chromeId(): string {
    return this[CHROME_ID_PROPERTY];
  }

  constructor(
    chromeId: string,
    readonly displayName: string,
    readonly childChromes: readonly Chrome[],
    readonly rhsMessaging: MessagingReconnectableP2PConnection,
  ) {
    this[CHROME_ID_PROPERTY] = chromeId;
  }

  abstract getDimensions(): ElementDimensions;

  abstract getIsPersonalized(): boolean;

  abstract getChromeInfo(): ChromeInfo;

  abstract select(): void;

  abstract sortMoveUp?(): void;

  abstract sortMoveDown?(): void;
}

// Move it outside of chrome, so it's not a part of intellisense as is not accidentally invoked.
export function chromeInitSetParent(chrome: Chrome, parent: Chrome): void {
  chrome[PARENT_CHROME_PROPERTY] = parent;
}

// Move it outside of chrome, so it's not a part of intellisense as is not accidentally invoked.
export function chromeInitSetId(chrome: Chrome, id: string): void {
  chrome[CHROME_ID_PROPERTY] = id;
}
