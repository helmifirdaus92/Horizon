/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { IdentityParams } from '../types';

const ORG_ID_STORAGE_KEY = 'pages:org_id';
const TENANT_NAME_STORAGE_KEY = 'pages:tenantName';

const TENANT_QS_NAME = 'tenantName';
const ORGANIZATION_ID_QS_NAME = 'organization';

type QueryParam = typeof ORGANIZATION_ID_QS_NAME | typeof TENANT_QS_NAME;
type StorageParam = typeof ORG_ID_STORAGE_KEY | typeof TENANT_NAME_STORAGE_KEY;

function storeParamToStorage(key: StorageParam, value: string | null) {
  if (value !== null) {
    localStorage.setItem(key, value);
    sessionStorage.setItem(key, value);
  } else {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
}

function storeParamToQuery(key: QueryParam, value: string | null) {
  const url = new URL(window.location.href);

  if (value !== null) {
    url.searchParams.set(key, value);
  } else {
    url.searchParams.delete(key);
  }
  window.history.pushState(null, '', url.toString());
}

export function restoreParams(): IdentityParams {
  const searchParams = new URLSearchParams(window.location.search);

  const organization =
    searchParams.get(ORGANIZATION_ID_QS_NAME) ||
    sessionStorage.getItem(ORG_ID_STORAGE_KEY) ||
    localStorage.getItem(ORG_ID_STORAGE_KEY);

  const tenantName =
    searchParams.get(TENANT_QS_NAME) ||
    sessionStorage.getItem(TENANT_NAME_STORAGE_KEY) ||
    localStorage.getItem(TENANT_NAME_STORAGE_KEY);

  return { organization, tenantName };
}

export function persistParams(params: IdentityParams) {
  const { organization, tenantName } = params;

  storeParamToQuery(ORGANIZATION_ID_QS_NAME, organization);
  storeParamToQuery(TENANT_QS_NAME, tenantName);

  storeParamToStorage(ORG_ID_STORAGE_KEY, organization);
  storeParamToStorage(TENANT_NAME_STORAGE_KEY, tenantName);
}

export function clearRedirectQueryParams(): string {
  const result = withoutRedirectQueryParams(window.location.href);
  window.history.pushState(null, '', result);
  return result;
}

export function withoutRedirectQueryParams(url: string): string {
  if (!url) {
    return url;
  }

  const _url = new URL(url);

  _url.searchParams.delete('code');
  _url.searchParams.delete('state');
  _url.searchParams.delete('isRedirect');

  // if authorize failed, Identity provider replies with additional QS parameters
  const identityErrorInfoParamKeys: string[] = [];
  _url.searchParams.forEach((_value, key, _parent) => {
    if (key.startsWith('error')) {
      identityErrorInfoParamKeys.push(key);
    }
  });
  identityErrorInfoParamKeys.forEach((key) => {
    _url.searchParams.delete(key);
  });

  return _url.toString();
}

export function withTenantQueryParams(url: string, tenantName: string | null, organization: string | null): string {
  if (!url || (!tenantName && !organization)) {
    return url;
  }

  const _url = new URL(url);
  if (organization) {
    _url.searchParams.set(ORGANIZATION_ID_QS_NAME, organization);
  }
  if (tenantName) {
    _url.searchParams.set(TENANT_QS_NAME, tenantName);
  }
  return _url.toString();
}

export function callListeners<T>(arr: Array<(arg: T) => unknown>, value: T) {
  arr.forEach((listener) => listener(value));
}
