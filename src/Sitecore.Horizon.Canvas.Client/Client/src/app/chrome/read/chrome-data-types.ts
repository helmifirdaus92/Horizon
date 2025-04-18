/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeType } from 'src/app/messaging/horizon-canvas.contract.parts';
import { PersonalizationAction } from '../chrome';

export interface MarkupChrome {
  kind: 'open' | 'close' | 'inline';
  chromeType: ChromeType;
  element: Element;
}
export interface ContextItemInfo {
  id: string;
  version: number;
  language: string;
  revision: string;
}

export interface CommonChromeData {
  displayName: string;
}

export interface PlaceholderChromeData extends CommonChromeData {
  custom: {
    placeholderKey: string;
    placeholderMetadataKeys: string[];
    allowedRenderings: string[];
    contextItem: ContextItemInfo;
    editable?: string;
  };
}

export interface RenderingChromeData extends CommonChromeData {
  custom: {
    renderingInstanceId: string;
    renderingId: string;
    inlineEditor?: string;
    contextItem: ContextItemInfo;
    appliedPersonalizationActions: PersonalizationAction[];
    compatibleRenderings: string[];
    editable?: string;
    FEaasComponentName?: string;
    sxaSource?: string;
  };
}

export interface FieldChromeData extends CommonChromeData {
  custom: {
    fieldId: string;
    fieldType: string;
    fieldWebEditParameters?: Record<string, string>;
    contextItem: ContextItemInfo;
  };
  rawValueHolder: HTMLInputElement;
  valueElement: HTMLElement;
}
