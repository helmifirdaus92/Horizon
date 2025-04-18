/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingP2PChannel, MessagingP2PChannelDefFromChannel, MessagingReconnectableP2PConnection } from '@sitecore/horizon-messaging';
import { PlaceholderChromeInfo, RenderingChromeInfo, RenderingFieldsdData } from '../messaging/horizon-canvas.contract.parts';
import { calculateMaxDimensions, ElementDimensions, getElementsInBetween } from '../utils/dom';
import { Chrome, PersonalizationAction } from './chrome';
import { ChromeItemContext } from './chrome-item-context';
import { FieldChrome, isFieldChrome } from './chrome.field';
import { isPlaceholderChrome, PlaceholderChrome } from './chrome.placeholder';
import { RenderingChromeInlineEditor } from './chrome.rendering.inline-editor';

export type RhsChannel = MessagingP2PChannel<
  // Inbound events
  {},
  // Outbound events
  {
    'sort:move': 'up' | 'down';
    openItemInExplorer: 'open';
    promptCreateAbTestComponent: 'start';
    openOptimizeContent: void;
  },
  // Remote RPC services
  {
    postPropertiesEditorMessage(msg: unknown): void;
  },
  // Provided RPC services
  {
    canRemove(): boolean;
    postInlineEditorMessage(msg: unknown): void;
  }
>;

export const RhsChannelDef: MessagingP2PChannelDefFromChannel<RhsChannel> = {
  name: 'general',
};

export class RenderingChrome extends Chrome {
  private messaging: RhsChannel;

  constructor(
    chromeId: string,
    readonly startElement: Element,
    readonly endElement: Element,
    readonly renderingInstanceId: string,
    readonly renderingDefinitionId: string,
    readonly itemContext: ChromeItemContext,
    readonly appliedPersonalizationActions: PersonalizationAction[],
    readonly compatibleRenderings: string[],
    readonly editable: boolean,
    readonly inlineEditor: RenderingChromeInlineEditor,
    displayName: string,
    childChromes: readonly Chrome[],
    rhsMessaging: MessagingReconnectableP2PConnection,
    readonly sxaSource?: string,
  ) {
    super(chromeId, displayName, childChromes, rhsMessaging);

    const inlineEditorMessaging = inlineEditor.getInlineEditorMessaging();

    this.messaging = rhsMessaging.getChannel(RhsChannelDef);
    this.messaging.setRpcServicesImpl({
      canRemove: () => this.canRemove(),

      postInlineEditorMessage: (msg) => inlineEditorMessaging.emit('onPropertiesEditorMessage', msg),
    });

    inlineEditorMessaging.setRpcServicesImpl({
      postPropertiesEditorMessage: (msg) => this.messaging.rpc.postPropertiesEditorMessage(msg),
    });
    inlineEditor.connectMessaging();

    const chromeUtilsMessaging = inlineEditor.getRenderingChromeUtilsMessaging();
    chromeUtilsMessaging.setRpcServicesImpl({
      notifyResize: () => this._onSizeChange.emit(),
    });

    this.subscribeResizing();
  }

  getDimensions(): ElementDimensions {
    return calculateMaxDimensions(getElementsInBetween(this.startElement, this.endElement));
  }

  getIsPersonalized(): boolean {
    return !!this.appliedPersonalizationActions?.length;
  }

  getChromeInfo(): RenderingChromeInfo {
    return {
      chromeType: 'rendering',
      chromeId: this.chromeId,
      displayName: this.displayName,
      renderingInstanceId: this.renderingInstanceId,
      renderingDefinitionId: this.renderingDefinitionId,
      inlineEditorProtocols: this.inlineEditor.inlineEditorMessagingProtocols,
      contextItem: this.itemContext,
      isPersonalized: this.getIsPersonalized(),
      appliedPersonalizationActions: this.appliedPersonalizationActions,
      parentPlaceholderChromeInfo: this.getParentPlaceholder(),
      compatibleRenderings: this.compatibleRenderings,
    };
  }

  select(): void {
    this._onSelect.emit();
  }

  sortMoveUp(): void {
    this.messaging.emit('sort:move', 'up');
  }

  sortMoveDown(): void {
    this.messaging.emit('sort:move', 'down');
  }

  openItemInExplorer(): void {
    this.messaging.emit('openItemInExplorer', 'open');
  }

  promptCreateAbComponentTest(): void {
    this.messaging.emit('promptCreateAbTestComponent', 'start');
  }

  openOptimizeContent(): void {
    this.messaging.emit('openOptimizeContent');
  }

  getChildRenderings(): RenderingChromeInfo[] {
    const childRenderings: RenderingChromeInfo[] = [];
    const childPlaceholders = this.childChromes.filter((c) => isPlaceholderChrome(c)) as PlaceholderChrome[];
    childPlaceholders.forEach((childPlaceholder) => {
      childPlaceholder.childChromes.forEach((childRendering) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        if (exports.isRenderingChrome(childRendering)) {
          childRenderings.push((childRendering as RenderingChrome).getChromeInfo());
        }
      });
    });
    return childRenderings;
  }

  getChildPlaceholders(): PlaceholderChromeInfo[] {
    const childPlaceholdersInfos: PlaceholderChromeInfo[] = [];
    const childPlaceholders = this.childChromes.filter((c) => isPlaceholderChrome(c)) as PlaceholderChrome[];
    childPlaceholders.forEach((placeholder) => {
      childPlaceholdersInfos.push(placeholder.getChromeInfo());
    });
    return childPlaceholdersInfos;
  }

  getChromeFields(): RenderingFieldsdData {
    const fieldData: RenderingFieldsdData = { fields: [] };
    const childFieldChromes = this.childChromes.filter((c) => isFieldChrome(c)) as FieldChrome[];
    for (const field of childFieldChromes) {
      fieldData.fields?.push({
        fieldType: field.fieldType,
        fieldId: field.fieldId,
        fieldName: field.displayName,
        textValue: field.getValue().rawValue,
      });
    }
    return fieldData;
  }

  private canRemove(): boolean {
    return !!this.parentChrome && isPlaceholderChrome(this.parentChrome) && this.parentChrome.editable;
  }

  private subscribeResizing(): void {
    const elements = getElementsInBetween(this.startElement, this.endElement);
    const resizeObserver = new ResizeObserver(() => {
      // requestAnimationFrame handles "ResizeObserver loop limit exceeded" error: https://stackoverflow.com/a/58701523
      // This error means that ResizeObserver was not able to deliver all observations within a single animation frame.
      window.requestAnimationFrame(() => this._onSizeChange.emit());
    });
    elements.forEach((e) => resizeObserver.observe(e));

    const mutationObserver = new MutationObserver(() => this._onSizeChange.emit());
    const parentElement = this.startElement.parentElement;
    if (parentElement) {
      mutationObserver.observe(parentElement, { childList: true, subtree: true });
    }
  }

  private getParentPlaceholder(): PlaceholderChromeInfo {
    if (!!this.parentChrome && isPlaceholderChrome(this.parentChrome)) {
      return this.parentChrome.getChromeInfo();
    }

    // should never happen because every rendering has parent placeholder
    const emptyChromeInfo: PlaceholderChromeInfo = {
      contextItem: { id: '', language: '', version: 0 },
      name: '',
      displayName: '',
      chromeType: 'placeholder',
      placeholderKey: '',
      chromeId: '',
      allowedRenderingIds: [],
    };
    return emptyChromeInfo;
  }
}

export function isRenderingChrome(chrome: Chrome): chrome is RenderingChrome {
  return chrome instanceof RenderingChrome;
}
