/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { RenderingChrome } from '../chrome/chrome.rendering';
import { PlaceholderChromeData, RenderingChromeData } from '../chrome/read/chrome-data-types';
import { ElementDimensions } from '../utils/dom';

/* eslint-disable @typescript-eslint/no-empty-interface, , ,  */

export const CANVAS_CONNECTION_CLIENT_ID = 'horizon-canvas';

// *************** BEACON CHANNEL ***************
export interface BeaconState {
  readonly itemId: string;
  readonly itemVersion: number;
  readonly siteName: string;
  readonly language: string;
  readonly variant: string | undefined;
}

export interface BeaconHorizonEvents {}

export interface BeaconCanvasEvents {
  state: BeaconState;
}

export interface BeaconHorizonRpcServices {}

export interface BeaconCanvasRpcServices {}

export const BeaconChannelName = 'beacon';

// *************** EDITING CHANNEL ***************

export type ChromeType = 'placeholder' | 'rendering' | 'field';
type ChromeTypePick<T extends ChromeType> = T;

export interface ChromeRhsMessage {
  readonly chromeId: string;
  readonly msg: unknown;
}

export interface BasicChromeInfo {
  readonly chromeId: string;
  readonly chromeType: ChromeType;
}

interface ContextChromeInfo extends BasicChromeInfo {
  readonly contextItem: {
    readonly id: string;
    readonly version: number;
    readonly language: string;
  };
}

export interface PlaceholderChromeInfo extends ContextChromeInfo {
  readonly chromeType: ChromeTypePick<'placeholder'>;
  readonly placeholderKey: string;
  readonly name: string;
  readonly displayName: string;
  readonly allowedRenderingIds: readonly string[];
  readonly parentRenderingChromeInfo?: RenderingChromeInfo;
}

export type PersonalizationAction = 'SetDataSourceAction' | 'HideRenderingAction' | 'SetRenderingAction';

export interface RenderingChromeInfo extends ContextChromeInfo {
  readonly chromeType: ChromeTypePick<'rendering'>;
  readonly renderingInstanceId: string;
  readonly renderingDefinitionId: string;
  readonly isPersonalized: boolean;
  readonly appliedPersonalizationActions: PersonalizationAction[];
  readonly inlineEditorProtocols: readonly string[];
  readonly parentPlaceholderChromeInfo: PlaceholderChromeInfo;
  readonly displayName: string;
  readonly compatibleRenderings: readonly string[];
}

export interface FieldChromeInfo extends ContextChromeInfo {
  readonly chromeType: ChromeTypePick<'field'>;
  readonly fieldType: string;
  readonly fieldId: string;
  readonly isPersonalized: boolean;
  readonly parentRenderingChromeInfo?: RenderingChromeInfo;
  readonly displayName: string;
}

export type ChromeInfo = PlaceholderChromeInfo | RenderingChromeInfo | FieldChromeInfo;

export interface FieldRawValue {
  rawValue: string;
}

export interface FieldValue {
  readonly itemId: string;
  readonly fieldId: string;
  readonly reset: boolean;
  readonly value: FieldRawValue;
  readonly itemVersion: number;
}

export interface InitialPageState {
  readonly fields: readonly (FieldValue & { readonly revision: string; readonly reset: boolean })[];
  readonly layout: string;
  readonly layoutDeviceId: string;
  readonly droppableRenderingIds: readonly string[];
  readonly styles: Record<string, string>;
}

export interface PageStateUpdate {
  readonly fields?: readonly FieldValue[];
}

export interface RenderingField {
  fieldType: string;
  fieldId: string;
  fieldName: string;
  textValue: string;
}

export interface RenderingFieldsdData {
  fields?: RenderingField[];
}

export type ChangeDomEvent = RemoveRenderingEvent | RearrangeRenderingsInSamePlaceholderEvent | InsertRenderingEvent | UpdateRenderingEvent;

export interface ChangeDomBasicEvent {
  chromeType: 'rendering';
  eventType: 'remove' | 'rearrangeInSamePlaceholder' | 'insert' | 'update';
}

export interface RemoveRenderingEvent extends ChangeDomBasicEvent {
  eventType: 'remove';
  renderingInstanceId: string;
}

export interface RearrangeRenderingsInSamePlaceholderEvent extends ChangeDomBasicEvent {
  eventType: 'rearrangeInSamePlaceholder';
  direction: 'up' | 'down';
  renderingInstanceId: string;
}

export interface InsertRenderingEvent extends ChangeDomBasicEvent {
  eventType: 'insert';
  renderingHtml: string;
  renderingInstanceId: string;
  placeholderKey: string;
  placement: RenderingPlacementAnchor | undefined;
}

export interface UpdateRenderingEvent extends ChangeDomBasicEvent {
  eventType: 'update';
  renderingInstanceId: string;
  renderingHtml: string;
}

export interface ItemPermissions {
  readonly canWrite: boolean;
  readonly canDelete: boolean;
  readonly canRename: boolean;
  readonly canCreate: boolean;
  readonly canPublish: boolean;
}

export interface MediaSelectionValue {
  embeddedHtml?: string;
  src?: string;
  alt?: string;
}

export type MediaSelectionResult = { status: 'OK'; selectedValue: MediaSelectionValue } | { status: 'Canceled' };
export type EditRteContentResult = { status: 'OK'; value: string } | { status: 'Canceled' };

export type LayoutContainerEditKind = 'columnStyles' | 'containerStyles';

export interface LayoutComponentIdentifier {
  containerInstanceId: string;
  renderingParameters: Record<string, string>;
  containerType?: LayoutContainerEditKind;
  columnIndex?: number;
  breakPoint?: string;
}

export type AbTestComponentConfigurationStatus =
  | 'notEnabledOnTenant'
  | 'noPOSIdentifierForSite'
  | 'pagePersonalizationConfigured'
  | 'readyForConfiguration'
  | 'modeNotSupported';

export type FlowStatus = 'PRODUCTION' | 'PAUSED' | 'DRAFT' | 'PUBLISHING' | 'COMPLETED';

export interface FlowDefinition {
  name: string;
  friendlyId: string;
  status: FlowStatus;
  variants: {
    tasks: {
      input: {
        template: string;
      };
    }[];
  }[];
}

export interface EditingHorizonEvents {
  'chrome:rhs:message': ChromeRhsMessage;
  'canvas:before-unload': { preserveCanvasSelection: boolean; chromeToSelect?: BasicChromeInfo };
  'canvas:change-dom': ChangeDomEvent;
  'canvas:set-personalization-mode': { isPersonalizationMode: boolean };
  'chrome:select': { id: string; chromeType: ChromeType; shouldScrollIntoView?: boolean };
  'chrome:highlight': { id: string; chromeType: ChromeType };
  'chrome:enable': { id: string; chromeType: ChromeType };
  'sc-mode-cookie:set': { scMode: 'edit' | 'preview' };
  'layoutComponentStylesSetting:change': LayoutComponentIdentifier;
}

export interface EditingCanvasEvents {
  'chrome:remove': RenderingChromeInfo;
  'chrome:select': ChromeInfo;
  'chrome:deselect': void;
  'chrome:rhs:message': ChromeRhsMessage;
  'page:load': InitialPageState;
  'field:change': FieldValue;
  'page:unloaded': void;
}

export interface EditingHorizonRpcServices {
  selectMedia(): MediaSelectionResult;
  editSourceCode(value: string): EditRteContentResult;
  addPhoneNumber(): EditRteContentResult;
  promptSelectPage(): { id: string | undefined; displayName: string | undefined };
  reloadCanvas(): void;
  getItemPermissions(): ItemPermissions;
  getPageFlows(itemId: string, language: string): FlowDefinition[];
  getAbTestConfigStatus(itemId: string, language: string): AbTestComponentConfigurationStatus;
  setRenderingParams(renderingInstanceId: string, value: string): void;
}

export interface EditingCanvasRpcServices {
  updatePageState(state: PageStateUpdate): void;
  selectChrome(chromeId: string): void;
  deselectChrome(): void;
  highlightPartialDesign(partialDesignId: string): void;
  unhighlightPartialDesign(): void;
  getChildRenderings(renderingInstanceId: string): RenderingChromeInfo[];
  getChildPlaceholders(renderingInstanceId: string): PlaceholderChromeInfo[];
  selectRendering(renderingInstanceId: string, shouldScrollIntoView: boolean): void;
  getRenderingFields(renderingInstanceId: string): RenderingFieldsdData;
  getPageFields(): FieldValue[];
}

export const EditingChannelName = 'editing';

// *************** DESIGNING CHANNEL ***************

export interface DragInfo {
  readonly renderingId: string;
  readonly movedRendering?: RenderingChrome;
  readonly clientX: number;
  readonly clientY: number;
}

export interface DesigningHorizonEvents {
  dragstart: void;
  dragenter: void;
  dragover: DragInfo;
  dragleave: void;
  drop: DragInfo;
  dragend: void;

  'insertRendering:cancel': void;
  'addRenderingDialog:close': void;
}

export interface DesigningCanvasEvents {
  'allow-drop:change': boolean;
}

export interface RenderingPlacementAnchor {
  readonly targetInstanceId: string;
  readonly position: 'before' | 'after';
}

export interface DesigningHorizonRpcServices {
  insertRendering(renderingDefinitionId: string, placeholderKey: string, anchor: RenderingPlacementAnchor | undefined): void;
  moveRendering(renderingInstanceId: string, placeholderKey: string, anchor: RenderingPlacementAnchor | undefined): void;
  promptInsertRendering(
    placeholderKey: string,
    allowedRenderingIds: readonly string[],
    chromeDimensions: ElementDimensions,
    anchor?: RenderingPlacementAnchor,
  ): boolean;
}

export interface DesigningCanvasRpcServices {}

export const DesigningChannelName = 'designing';

// *************** TRANSLATION CHANNEL ***************

export interface TranslationSource {
  [key: string]: string | TranslationSource;
}

export interface TranslationHorizonEvents {}

export interface TranslationCanvasEvents {}

export interface TranslationHorizonRpcServices {
  getTranslations(): TranslationSource;
}

export interface TranslationCanvasRpcServices {}

export const TranslationChannelName = 'translation';

// *************** FEATURE FLAGS CHANNEL ***************

export interface FeatureFlags {
  name: string;
  enabled: boolean;
}

export interface FeatureFlagsHorizonEvents {}

export interface FeatureFlagsCanvasEvents {}

export interface FeatureFlagsHorizonRpcServices {
  getFeatureFlags(): FeatureFlags[];
}

export interface FeatureFlagsCanvasRpcServices {}

export const FeatureFlagsChannelName = 'featureFlags';

// *************** CONFIGURATION CHANNEL ***************

export interface ConfigurationHorizonEvents {}

export interface ConfigurationCanvasEvents {}

export interface ConfigurationHorizonRpcServices {
  isLocalXM(): boolean;
  getPagesHostEnvironment(): string;
  getXmCloudTenantUrl(): string;
  getStreamTenantId(): string | undefined;
  getActiveVariant(): string | undefined;
}

export interface ConfigurationCanvasRpcServices {}

export const ConfigurationChannelName = 'configuration';

// *************** EDITING METADATA CHANNEL ***************

export interface FieldReference {
  fieldId: string;
  itemId: string;
  language: string;
  version: number;
  rawValue: string;
  containsStandardValue: boolean;
}

export interface EditingData {
  renderings: {
    renderingUid: string;
    chromeData: RenderingChromeData;
  }[];
  placeholders: {
    renderingUid: string;
    placeholderName: string;
    chromeData: PlaceholderChromeData;
  }[];
  fields: FieldReference[];
}

export interface EditingDataContext {
  itemId: string;
  itemVersion: number;
  siteName: string;
  language: string;
  variant: string | undefined;
}

export interface EditingMetadataHorizonEvents {}

export interface EditingMetadataCanvasEvents {}

export interface EditingMetadataHorizonRpcServices {
  getEditingMetadata(editingDataContext: EditingDataContext): EditingData;
}

export interface EditingMetadataCanvasRpcServices {}

export const EditingMetadataChannelName = 'editingMetadata';
