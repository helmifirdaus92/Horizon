/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

interface CommonGeneralLinkProperties {
  text?: string;
  class?: string;
  title?: string;
}

export type InternalGeneralLink = CommonGeneralLinkProperties & {
  linktype: 'internal';
  item: { id: string; url: string; displayName: string };
  anchor?: string;
  target?: string;
  querystring?: string;
};

export type ExternalGeneralLink = CommonGeneralLinkProperties & {
  linktype: 'external';
  url: string;
  [key: string]: string | undefined;
};

export type MediaGeneralLink = CommonGeneralLinkProperties & {
  linktype: 'media';
  item: { id: string; url: string; displayName: string };
  target?: string;
};

export type AnchorGeneralLink = CommonGeneralLinkProperties & {
  linktype: 'anchor';
  anchor: string;
};

export type MailGeneralLink = CommonGeneralLinkProperties & {
  linktype: 'mailto';
  url: string;
};

export type JavascriptGeneralLink = CommonGeneralLinkProperties & {
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
