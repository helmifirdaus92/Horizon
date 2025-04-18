/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { GeneralLinkValue } from 'app/editor/right-hand-side/general-link-field/general-link.type';
import { buildXmlElement, parseXmlElement } from '../../data-view.utils';

export interface LinkFieldValue {
  rawValue: string;
  model?: GeneralLinkValue | null;
}

export type GeneralLinkRawValue = { text: string; class: string; title: string } & (
  | {
      linktype: 'internal';
      id: string;
      anchor: string;
      target: string;
      querystring: string;
    }
  | {
      linktype: 'external';
      url: string;
      [key: string]: string;
    }
  | {
      linktype: 'media';
      id: string;
      target: string;
    }
  | {
      linktype: 'anchor';
      url: string;
      anchor: string;
    }
  | {
      linktype: 'mailto';
      url: string;
    }
  | {
      linktype: 'javascript';
      url: string;
    }
);

export function buildGeneralLinkRawValue(value: GeneralLinkValue | null): string {
  if (!value) {
    return '';
  }

  let rawValue: GeneralLinkRawValue;

  switch (value.linktype) {
    case 'external': {
      rawValue = {
        ...{
          linktype: 'external',
          url: value.url,
          target: value.target ?? '',
          text: value.text ?? '',
          title: value.title ?? '',
          class: value.class ?? '',
        },
        ...value,
      };
      break;
    }

    case 'internal': {
      rawValue = {
        linktype: 'internal',
        id: value.item.id,
        anchor: value.anchor ?? '',
        querystring: value.querystring ?? '',
        target: value.target ?? '',
        class: value.class ?? '',
        text: value.text ?? '',
        title: value.title ?? '',
      };
      break;
    }

    case 'anchor': {
      rawValue = {
        linktype: 'anchor',
        anchor: value.anchor,
        url: value.anchor,
        class: value.class ?? '',
        text: value.text ?? '',
        title: value.title ?? '',
      };
      break;
    }

    case 'media': {
      rawValue = {
        linktype: 'media',
        id: value.item.id,
        target: value.target ?? '',
        class: value.class ?? '',
        text: value.text ?? '',
        title: value.title ?? '',
      };
      break;
    }

    case 'mailto': {
      rawValue = {
        linktype: 'mailto',
        url: value.url,
        class: value.class ?? '',
        text: value.text ?? '',
        title: value.title ?? '',
      };
      break;
    }

    case 'javascript': {
      rawValue = {
        linktype: 'javascript',
        url: value.url,
        class: value.class ?? '',
        text: value.text ?? '',
        title: value.title ?? '',
      };
      break;
    }
  }

  return buildXmlElement('link', rawValue);
}

export function parseGeneralLinkRawValue(value: string): GeneralLinkValue | null {
  if (!value.trim()) {
    return null;
  }

  const rawValue = parseXmlElement(value) as GeneralLinkRawValue;

  switch (rawValue.linktype) {
    case 'external': {
      const { linktype, url, target, text, title, class: classAttribute, ...customAttributes } = rawValue;

      const externalGeneralLink = {
        linktype,
        url,
        target: target || undefined,
        text: text || undefined,
        title: title || undefined,
        class: classAttribute || undefined,
        ...customAttributes,
      };

      return externalGeneralLink;
    }

    case 'internal':
      return {
        linktype: 'internal',
        item: {
          id: rawValue.id,
          url: '',
          displayName: '',
        },
        anchor: rawValue.anchor || undefined,
        querystring: rawValue.querystring || undefined,
        target: rawValue.target || undefined,
        class: rawValue.class || undefined,
        text: rawValue.text || undefined,
        title: rawValue.title || undefined,
      };

    case 'anchor':
      return {
        linktype: 'anchor',
        anchor: rawValue.anchor,
        class: rawValue.class || undefined,
        text: rawValue.text || undefined,
        title: rawValue.title || undefined,
      };

    case 'media':
      return {
        linktype: 'media',
        item: {
          id: rawValue.id,
          url: '',
          displayName: '',
        },
        target: rawValue.target || undefined,
        class: rawValue.class || undefined,
        text: rawValue.text || undefined,
        title: rawValue.title || undefined,
      };

    case 'mailto':
      return {
        linktype: 'mailto',
        url: rawValue.url,
        class: rawValue.class || undefined,
        text: rawValue.text || undefined,
        title: rawValue.title || undefined,
      };

    case 'javascript':
      return {
        linktype: 'javascript',
        url: rawValue.url,
        class: rawValue.class || undefined,
        text: rawValue.text || undefined,
        title: rawValue.title || undefined,
      };

    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw Error(`Unknown link type: ${rawValue}`);
  }
}
