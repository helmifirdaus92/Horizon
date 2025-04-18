/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MediaValue } from 'app/editor/right-hand-side/image-field/image-field-messaging.service';
import { parseMediaRawValue } from 'app/shared/platform-media/media.utils';
import { normalizeGuid } from 'app/shared/utils/utils';

export interface ItemGroup {
  displayName: string;
  itemId: string;
  children?: ItemGroup[];
}
export const CK_EDITOR_CONTENT_CLASS_NAME = 'ck-content';

export const TREE_NODE_ROOT_ID = '11111111-1111-1111-1111-111111111111';

export function getEmptyValue(): MediaValue {
  return { rawValue: '' };
}

export function formatAndJoinGuids(values: string[]): string {
  return values.map((v) => `{${v.toUpperCase()}}`).join('|');
}

export function extractAndNormalizeGuids(values: string): string[] {
  return values?.match(/{[^}]+}/g)?.map((v) => normalizeGuid(v)) || [];
}

export function parseImageRawValue(rawValue: string): MediaValue {
  if (!rawValue) {
    return { rawValue: '' };
  }

  const imageRawValue = parseXmlElement(rawValue);

  function parseIntAttr(value: string | undefined): number | undefined {
    if (!value) {
      return undefined;
    }

    return parseInt(value, 10);
  }

  const media = parseMediaRawValue(rawValue);
  return {
    rawValue,
    mediaId: media.mediaId,
    alt: imageRawValue.alt,
    src: imageRawValue.src,
    width: parseIntAttr(imageRawValue.width),
    height: parseIntAttr(imageRawValue.height),
  };
}

export function parseXmlElement(xml: string): Record<string, string | undefined> {
  const xElement = new DOMParser().parseFromString(xml, 'text/xml').firstElementChild;
  if (xElement === null) {
    return {};
  }

  return xElement.getAttributeNames().reduce(
    (memo, attrName) => {
      memo[attrName] = xElement.getAttribute(attrName) ?? undefined;
      return memo;
    },
    {} as Record<string, string | undefined>,
  );
}

export function bytesToKB(bytes?: number, decimalPlaces: number = 2): string {
  if (!bytes || bytes < 0) return '0 KB';
  return `${(bytes / 1024).toFixed(decimalPlaces)} KB`;
}

export function buildXmlElement(elementName: string, attributes: Record<string, string | undefined>): string {
  const doc = document.implementation.createDocument(null, elementName, null);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, ,
  const xElement = doc.firstElementChild!;

  for (const attrName in attributes) {
    if (Object.prototype.hasOwnProperty.call(attributes, attrName)) {
      const value = attributes[attrName];
      if (value !== undefined) {
        xElement.setAttribute(attrName, value);
      }
    }
  }

  return new XMLSerializer().serializeToString(xElement);
}
