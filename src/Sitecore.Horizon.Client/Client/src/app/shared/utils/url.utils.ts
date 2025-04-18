/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

const DUMMY_BASE_URL = 'http://example.com';

export function getSearchParams(path: string) {
  return new URL(path, DUMMY_BASE_URL).searchParams;
}

export function makeAbsoluteUrl(relativeOrAbsoluteUrl: string, baseUrl: string): string {
  // @TODO: Temporary solution for handling empty platform url when no tenant is available,
  //  needs to be updated once the requirements are finalized.
  try {
    return new URL(relativeOrAbsoluteUrl, baseUrl).toString();
  } catch {
    return `${baseUrl}${relativeOrAbsoluteUrl}`;
  }
}

export function appendQueryString(url: string, queryStringParameters: Array<[string, string]>): string {
  let hasQueryString = !!new URL(url, DUMMY_BASE_URL).search;

  for (const [key, value] of queryStringParameters) {
    url += `${hasQueryString ? '&' : '?'}${key}=${encodeURI(value)}`;
    hasQueryString = true;
  }

  return url;
}

export function isSameUrl(relativeOrAbsoluteUrl1: string, relativeOrAbsoluteUrl2?: string): boolean {
  // Use URL to normalize incoming values (e.g. different leading and trailing slashes)
  return (
    !!relativeOrAbsoluteUrl2 &&
    new URL(relativeOrAbsoluteUrl1, DUMMY_BASE_URL).toString() ===
      new URL(relativeOrAbsoluteUrl2, DUMMY_BASE_URL).toString()
  );
}

export function isSameHost(absoluteUrl1: string, absoluteUrl2?: string): boolean {
  try {
    return !!absoluteUrl2 && new URL(absoluteUrl1).host === new URL(absoluteUrl2).host;
  } catch {
    return false;
  }
}

export function parseParameterFromQueryString(queryString?: string, param?: string): string | null {
  if (!queryString || !param) {
    return null;
  }

  return new URLSearchParams(queryString).get(param);
}

export function setParameterIntoQueryString(queryString: string, paramName: string, value: string | null): string {
  const _queryString = new URLSearchParams(queryString);

  if (!value) {
    _queryString.delete(paramName);
  } else {
    _queryString.set(paramName, value);
  }

  return _queryString.toString();
}

export function isAbsoluteUrl(url: string) {
  return url.indexOf('https://') === 0 || url.indexOf('http://') === 0;
}

export function isXmcMediaRelativeUrl(url: string) {
  return url.toLowerCase().startsWith('-/media/') || url.toLowerCase().startsWith('/-/media/');
}
