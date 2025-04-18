/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { normalizeGuid } from 'app/shared/utils/utils';
import {
  ComponentRendering,
  EditingData,
  FieldReference,
  HtmlElementRendering,
  LayoutServiceData,
  PartialRenderingChromedata,
  ROOT_UID,
} from './layout-service-models';

@Injectable({ providedIn: 'root' })
export class LayoutDataParseService {
  parseLayoutData(layoutData: LayoutServiceData) {
    const editingData: EditingData = {
      renderings: [],
      placeholders: [],
      fields: [],
    };
    if (!layoutData.sitecore.route) {
      return editingData;
    }

    this.parseEditableFields(layoutData.sitecore.route.fields, editingData);

    for (const placeholderName in layoutData.sitecore.route.placeholders) {
      if (Object.prototype.hasOwnProperty.call(layoutData.sitecore.route.placeholders, placeholderName)) {
        const placeholderData = layoutData.sitecore.route.placeholders[placeholderName];
        this.parsePlaceholder(placeholderName, placeholderData, ROOT_UID, editingData);
      }
    }

    return editingData;
  }

  private parsePlaceholder(
    placeholderName: string,
    placeholderData: Array<ComponentRendering | HtmlElementRendering>,
    renderingUid: string,
    editingData: EditingData,
  ) {
    for (let i = 0; i < placeholderData.length; i++) {
      // placeholder
      const phOpenChrome = placeholderData[i];
      if (this.isPlaceholderOpenElement(phOpenChrome) && phOpenChrome.contents) {
        try {
          const chromeData = JSON.parse(phOpenChrome.contents as string);
          editingData.placeholders.push({
            renderingUid,
            placeholderName,
            chromeData: chromeData,
          });
        } catch (e) {
          console.error(`Can't parse placeholder ${placeholderName}.Failed to parse chrome data`, phOpenChrome, e);
        }
        continue;
      }

      // rendering
      const renderingElement = placeholderData[i];
      if (this.isRenderingOpenElement(renderingElement)) {
        this.parseRenderingData(renderingElement, editingData);
        continue;
      }

      // component element
      if (this.isComponentElement(renderingElement)) {
        this.parseRenderingContent(renderingElement, editingData);
        continue;
      }
    }
  }

  private parseRenderingData(openRenderingChrome: HtmlElementRendering, editingData: EditingData) {
    try {
      const chromeData = JSON.parse(openRenderingChrome.contents as string) as PartialRenderingChromedata | null;
      if (chromeData != null && typeof chromeData?.custom?.renderingInstanceId === 'string') {
        editingData.renderings.push({
          renderingUid: normalizeGuid(chromeData.custom.renderingInstanceId),
          chromeData: chromeData,
        });
      } else {
        console.error("Can't parse rendering. Invalid chrome data", openRenderingChrome);
      }
    } catch (e) {
      console.error("Can't parse rendering. Failed to parse chrome data", openRenderingChrome, e);
    }
  }

  private parseRenderingContent(rendering: ComponentRendering, editingData: EditingData) {
    if (rendering.placeholders) {
      for (const placeholderName in rendering.placeholders) {
        if (Object.prototype.hasOwnProperty.call(rendering.placeholders, placeholderName)) {
          const placeholderData = rendering.placeholders[placeholderName];
          this.parsePlaceholder(placeholderName, placeholderData, rendering.uid, editingData);
        }
      }
    }

    if (rendering.fields) {
      this.parseEditableFields(rendering.fields, editingData);
    }
  }

  private parseEditableFields(fieldsContainer: unknown, editingData: EditingData) {
    // Fields container might be an arbitary JSON object with real field difined at any level
    // Deeply traverse a container to locate all "content fields"
    if (typeof fieldsContainer === 'object' && fieldsContainer !== null) {
      if (Array.isArray(fieldsContainer)) {
        fieldsContainer.forEach((item) => {
          this.parseEditableFields(item, editingData);
        });
      } else {
        if (this.isEditableField(fieldsContainer)) {
          const fieldReference = this.parseEditableField(fieldsContainer);
          if (fieldReference) {
            editingData.fields.push(fieldReference);
          }
        } else {
          Object.keys(fieldsContainer).forEach((key) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.parseEditableFields((fieldsContainer as any)[key], editingData);
          });
        }
      }
    }
  }

  private parseEditableField(field: EditableField): FieldReference | null {
    try {
      const fieldContent = field.editableFirstPart ?? field.editable;
      if (!fieldContent) {
        console.warn("Can't parse a field. Editable value is not present");
        return null;
      }

      const fieldDom = new DOMParser().parseFromString(fieldContent, 'text/html');

      const selector = 'code[type="text/sitecore"], .scChromeData';
      const chromeElement = fieldDom.querySelector(selector);
      if (!chromeElement) {
        console.warn("Can't parse a field. Could not find a chrome data element");
        return null;
      }

      const chromeData = this.parseFieldChromeData(chromeElement);
      if (!chromeData) {
        console.warn("Can't parse field. Chrome data is not present");
        return null;
      }

      const rawValueHolder = fieldDom.querySelector('input.scFieldValue') as HTMLInputElement;
      if (!rawValueHolder) {
        throw Error(`"Can't parse a field. Could not find a field value input element`);
      }

      return {
        fieldId: chromeData.custom.fieldId,
        itemId: chromeData.custom.contextItem.id,
        language: chromeData.custom.contextItem.language,
        version: chromeData.custom.contextItem.version,
        rawValue: rawValueHolder.value,
        containsStandardValue: chromeData.custom.containsStandardValue,
      };
    } catch (e) {
      console.error("Can't parse a field.", e);
      return null;
    }
  }

  private parseFieldChromeData(chromeElement: Element): FieldChromeData | null {
    const rawContent = chromeElement.textContent;
    if (!rawContent) {
      return null;
    }

    return JSON.parse(rawContent) as FieldChromeData;
  }

  private isEditableField(obj: unknown): obj is EditableField {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }
    // Field have value field
    if (!Object.prototype.hasOwnProperty.call(obj, 'value')) {
      return false;
    }

    return (
      typeof (obj as EditableField).editable === 'string' ||
      typeof (obj as EditableField).editableFirstPart === 'string'
    );
  }

  private isPlaceholderOpenElement(
    phContent: ComponentRendering | HtmlElementRendering,
  ): phContent is HtmlElementRendering {
    const phCandidate = phContent as Partial<HtmlElementRendering>;
    return (
      !!phCandidate.name &&
      !!phCandidate.attributes &&
      phCandidate.attributes.chrometype === 'placeholder' &&
      phCandidate.attributes.kind === 'open'
    );
  }

  private isRenderingOpenElement(
    rdContent: ComponentRendering | HtmlElementRendering,
  ): rdContent is HtmlElementRendering {
    const rdCandidate = rdContent as Partial<HtmlElementRendering>;
    return (
      !!rdCandidate.name &&
      !!rdCandidate.attributes &&
      rdCandidate.attributes.chrometype === 'rendering' &&
      rdCandidate.attributes.kind === 'open'
    );
  }

  private isComponentElement(rdContent: ComponentRendering | HtmlElementRendering): rdContent is ComponentRendering {
    const componentCandidate = rdContent as Partial<ComponentRendering>;
    return componentCandidate.uid !== undefined && componentCandidate.componentName !== undefined;
  }
}

interface EditableField {
  value: unknown;
  editable?: string;
  editableFirstPart?: string;
}

export interface FieldChromeData {
  custom: {
    fieldId: string;
    contextItem: {
      id: string;
      version: number;
      language: string;
    };
    rawValue: string;
    containsStandardValue: boolean;
  };
}
