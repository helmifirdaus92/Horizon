/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export function isAbsoluteUrl(url: string) {
  return url.indexOf('https://') === 0 || url.indexOf('http://') === 0;
}

export function isXmcMediaRelativeUrl(url: string) {
  return url.toLowerCase().startsWith('-/media/') || url.toLowerCase().startsWith('/-/media/');
}

export function makeAbsoluteUrl(relativeOrAbsoluteUrl: string, baseUrl: string): string {
  try {
    return new URL(relativeOrAbsoluteUrl, baseUrl).toString();
  } catch {
    return `${baseUrl}${relativeOrAbsoluteUrl}`;
  }
}
