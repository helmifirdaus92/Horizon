/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { AuthenticationDetails, ContentType, CurrentSiteId, MDialogResult } from './content-hub-dam-ext.dal.service';

export function parseAuthAndSiteData(
  authDetails: AuthenticationDetails,
  siteId: CurrentSiteId,
): { baseUrl: string; url: string } {
  /**
   * Our backend maps all properties of GetAuthenticationDetails request to camel-case instead of pascal-case.
   * Example: SearchPage => searchPage, ExternalRedirectKey => externalRedirectKey
   */

  const baseUrl = authDetails.m_instance;
  let url = authDetails.search_page;

  const externalRedirectKey = authDetails.external_redirect_key;
  const currentSiteId = siteId.site_id;
  const currentUrl = window.location.href;
  const queryString =
    '?externalRedirectKey=' + externalRedirectKey + '&externalRedirectUrl=' + currentUrl + '&hasExternalRedirect=true';

  url = url + queryString;

  if (currentSiteId) {
    url = url + '&id=' + currentSiteId;
  }

  return { baseUrl, url };
}

export function parseContentDetailsResponse(response: Response): {
  contentType: ContentType;
  extension: string;
  fileName: string;
} {
  const rawContentType = response.headers.get('content-type');
  const rawContentDisposition = response.headers.get('content-disposition');

  let contentType: ContentType = 'Other';
  let extension = '';
  let fileName = '';

  if (rawContentType) {
    // Content type has format similar to "video/mpeg" or "image/png"
    const type = rawContentType.split('/');

    extension = type[1];
    contentType = (() => {
      switch (type[0]) {
        case 'image':
          return 'Image';
        case 'video':
          return 'Video';
        default:
          return 'Other';
      }
    })();
  }

  if (rawContentDisposition) {
    const parsedValue = rawContentDisposition
      .split('; ')
      .filter((segment) => segment.includes('filename="'))
      .map((segment) => {
        return segment.replace('filename=', '').slice(1, -1);
      })[0];

    fileName = parsedValue || '';
  }

  return { contentType, extension, fileName };
}

export function buildEmbeddedHtml(media: MDialogResult): string {
  switch (media.file_type) {
    case 'Image':
      return `<img alt="${media.alternative}" src="${media.source}" />`;
    case 'Video':
      return `<video width="320" height="240" controls="controls"><source src="${media.source}"></source></video>`;
    case 'Other':
      return `<a href='${media.source}' target="_blank">${media.downloadText}</a>`;
    default:
      return '';
  }
}

export function buildRawValue(r: MDialogResult): string {
  r.damExtraProperties = r.damExtraProperties ?? [];

  const mappedAttributesNames = r.damExtraProperties.map((item) => item.name).join(',');

  let result = '';

  result += `<image mediaid=""`;

  for (const { name, value } of r.damExtraProperties ?? []) {
    result += ` ${name}="${escapeUnsafeCharacters(value)}"`;
  }

  result += mappedAttributesNames.includes('alt') ? '' : ` alt="${escapeUnsafeCharacters(r.alternative)}"`;

  if (!!r.width && !mappedAttributesNames.includes('width')) {
    result += ` width="${r.width}"`;
  }

  if (!!r.height && !mappedAttributesNames.includes('height')) {
    result += ` height="${r.height}"`;
  }

  result += mappedAttributesNames.includes('stylelabs-content-id') ? '' : ` stylelabs-content-id="${r.id}"`;
  result += mappedAttributesNames.includes('thumbnailsrc') ? '' : ` thumbnailsrc="${encodeURI(r.thumbnail)}"`;
  result += mappedAttributesNames.includes('src') ? '' : ` src="${encodeURI(r.source)}"`;
  result += mappedAttributesNames.includes('stylelabs-content-type') ? '' : ` stylelabs-content-type="${r.file_type}"`;
  result += ` />`;

  return result;
}

export function escapeUnsafeCharacters(str: string): string {
  if (!str) {
    return '';
  }

  return str.toString().replace(/[<>&"]/g, (character) => {
    switch (character) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '"':
        return '&quot;';
      default:
        return character;
    }
  });
}
