/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export type Linktype = GeneralLinkValue['linktype'];

interface CommonGeneralLinkPropertes {
  text?: string;
  class?: string;
  title?: string;
}

export interface ContentItem {
  id: string;
  url: string;
  displayName: string;
}

export type InternalGeneralLink = CommonGeneralLinkPropertes & {
  linktype: 'internal';
  item: ContentItem;
  anchor?: string;
  target?: string;
  querystring?: string;
};

export type ExternalGeneralLink = CommonGeneralLinkPropertes & {
  linktype: 'external';
  url: string;
  [key: string]: string | undefined;
};

export type MediaGeneralLink = CommonGeneralLinkPropertes & {
  linktype: 'media';
  item: ContentItem;
  target?: string;
};

export type AnchorGeneralLink = CommonGeneralLinkPropertes & {
  linktype: 'anchor';
  anchor: string;
};

export type MailGeneralLink = CommonGeneralLinkPropertes & {
  linktype: 'mailto';
  url: string;
};

export type JavascriptGeneralLink = CommonGeneralLinkPropertes & {
  linktype: 'javascript';
  url: string;
};

export type GeneralLinkValue =
  | InternalGeneralLink
  | ExternalGeneralLink
  | MediaGeneralLink
  | AnchorGeneralLink
  | MailGeneralLink
  | JavascriptGeneralLink;
