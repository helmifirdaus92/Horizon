/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { NgZone } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Params, Router } from '@angular/router';
import { CreateItemErrorCode } from 'app/pages/content-tree/content-tree.service';
import { concat, Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ConfigurationService } from '../configuration/configuration.service';
import { makeAbsoluteUrl } from './url.utils';

const NORMALIZE_GUID_REGEX = /^{?(.{8})-?(.{4})-?(.{4})-?(.{4})-?(.{12})}?$/;
const NORMALIZE_ID_WITHOUT_DASH_REGEX = /[{}-]/g;

const $paddingSmall = 20;
const $paddingLarge = 40;

export interface ElementDimensions {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

const watchMostInnerRouteSnapshot$ = (router: Router, route: ActivatedRoute) => {
  const mostInnerRouteSnapshot$ = router.events.pipe(
    filter((ev) => ev instanceof NavigationEnd),
    map(() => route.snapshot),
  );

  return concat(of(route.snapshot), mostInnerRouteSnapshot$).pipe(
    map((snapshot) => {
      while (snapshot.firstChild) {
        snapshot = snapshot.firstChild;
      }

      return snapshot;
    }),
  );
};

export function watchMostInnerRouteSegment(
  router: Router,
  route: ActivatedRoute,
): Observable<{
  segment: string;
  queryParams: Params;
}> {
  return watchMostInnerRouteSnapshot$(router, route).pipe(
    filter((snapshot) => !!snapshot.url[0]),
    map((snapshot) => {
      const result = { segment: snapshot.url[0]?.path, queryParams: snapshot.queryParams };
      return result;
    }),
  );
}

export function watchMostInnerRouteSnapshot(router: Router, route: ActivatedRoute): Observable<ActivatedRouteSnapshot> {
  return watchMostInnerRouteSnapshot$(router, route).pipe(filter((snapshot) => !!snapshot.url[0]));
}

export function isSameGuid(id1: string | undefined | null, id2: string | undefined | null): boolean {
  if (id1 === id2) {
    return true;
  }

  // falsy === falsy
  if (!!id1 === false && !!id2 === false) {
    return true;
  }

  if (!id1 || !id2) {
    return false;
  }

  return normalizeGuid(id1) === normalizeGuid(id2);
}

export function isSameItemVersion(
  current?: { id: string; language: string; version: number },
  previous?: { id: string; language: string; version: number },
): boolean {
  return (
    isSameGuid(current?.id, previous?.id) &&
    current?.language === previous?.language &&
    current?.version === previous?.version
  );
}

export function isEqualObject(object1: any, object2: any) {
  if (typeof object1 !== 'object' || typeof object2 !== 'object') {
    return object1 == object2;
  }

  if (object1 === object2) {
    return true;
  }

  if (object1 === null || object2 === null) {
    return false;
  }

  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    const valOne = object1[key];
    const valTwo = object2[key];

    const areObjects = typeof valOne === 'object' && typeof valTwo === 'object';

    if ((areObjects && !isEqualObject(valOne, valTwo)) || (!areObjects && valOne !== valTwo)) {
      return false;
    }
  }

  return true;
}

export function getNodeAttributes(rawValue: string, rootNodeName: string): NamedNodeMap | null {
  if (!rawValue) {
    return null;
  }

  const dom = new DOMParser().parseFromString(rawValue, 'text/xml');
  const rootNode = dom.getElementsByTagName(rootNodeName)[0];
  return rootNode ? rootNode.attributes : null;
}

/** Round the decimal value to the specified number of digits */
export function round10(value: number, exp: number) {
  // Copied from StackOverflow: https://stackoverflow.com/a/25075575

  // If the exp is undefined or zero...
  if (+exp === 0) {
    return Math.round(value);
  }

  value = +value;
  exp = +exp;

  // If the value is not a number or the exp is not an integer...
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }
  // Shift
  let [valueMantissa, valueExp] = value.toString().split('e');
  value = Math.round(+(valueMantissa + 'e' + (valueExp ? +valueExp - exp : -exp)));

  // Shift back
  [valueMantissa, valueExp] = value.toString().split('e');
  return +(valueMantissa + 'e' + (valueExp ? +valueExp + exp : exp));
}

export function normalizeGuid(id: string) {
  return id.replace(NORMALIZE_GUID_REGEX, '$1-$2-$3-$4-$5').toLowerCase();
}

export function normalizeGuidCharactersOnly(id: string) {
  return id.replace(NORMALIZE_GUID_REGEX, '$1$2$3$4$5').toLowerCase();
}

export function resizeAndPositionElement(
  element: HTMLElement,
  rect: { width: number; height: number; top: number; left: number },
) {
  element.style.top = rect.top + 'px';
  element.style.left = rect.left + 'px';
  element.style.width = rect.width + 'px';
  element.style.height = rect.height + 'px';
}

export function wrapInZone<TArgs extends any[], TResult>(
  ngZone: NgZone,
  callback: (...args: TArgs) => TResult,
): (...args: TArgs) => TResult {
  return (...args: TArgs) => ngZone.run(() => callback(...args));
}

export function runOutsideAngular<TArgs extends any[], TResult>(
  ngZone: NgZone,
  callback: (...args: TArgs) => TResult,
): (...args: TArgs) => TResult {
  return (...args: TArgs) => ngZone.runOutsideAngular(() => callback(...args));
}

export function runInNextMicrotask<TArgs extends any[], TResult>(
  callback: (...args: TArgs) => TResult,
): (...args: TArgs) => Promise<TResult> {
  return (...args: TArgs) => Promise.resolve().then(() => callback(...args));
}

export function runInNextMacrotask<TArgs extends any[], TResult>(
  callback: (...args: TArgs) => TResult,
): (...args: TArgs) => void {
  return (...args: TArgs) => setTimeout(() => callback(...args), 0);
}

interface Coordinates {
  clientX: number;
  clientY: number;
}

export function calculateRelativeCoordinates({ clientX, clientY }: Coordinates, overlayEl: HTMLElement): Coordinates {
  const { top, left } = overlayEl.getBoundingClientRect();
  return {
    clientX: clientX - left,
    clientY: clientY - top,
  };
}

export function sameCoordinates(a: Coordinates, b: Coordinates): boolean {
  return a.clientX === b.clientX && a.clientY === b.clientY;
}

export function parseSingleXmlTag(value: string): Record<string, string | undefined> {
  const parsedXml = new DOMParser().parseFromString(value, 'text/xml');
  const tag = parsedXml.firstElementChild;
  if (!tag) {
    return {};
  }

  return tag.getAttributeNames().reduce(
    (memo, attrName) => {
      memo[attrName] = tag.getAttribute(attrName) ?? undefined;
      return memo;
    },
    {} as Record<string, string | undefined>,
  );
}

export function pickDefinedProperties<T, K extends keyof T>(object: T, props: K[]): Pick<T, K> {
  const definedProps: Partial<T> = {};

  props.forEach((key) => {
    const value = object[key];

    if (value !== undefined) {
      definedProps[key] = object[key];
    }
  });

  return definedProps as Pick<T, K>;
}

export function moveItemInArray<T>(arr: T[], positionFrom: number, positionTo: number): T[] {
  if (
    !arr ||
    positionFrom === positionTo ||
    positionTo < 0 ||
    positionTo > arr.length - 1 ||
    !arr.includes(arr[positionFrom], positionFrom)
  ) {
    return arr;
  }

  const itemToMove = arr.splice(positionFrom, 1)[0];

  arr.splice(positionTo, 0, itemToMove);

  return arr;
}

export function getDashboardAppUrl(
  baseUrl: string,
  linkType: 'sites' | 'settings' | 'tools' = 'sites',
  siteName?: string,
): string {
  const TENANT_NAME_PARAM = 'tenantName';

  // Site specific settings
  if (siteName && linkType === 'settings') {
    const url = makeAbsoluteUrl(
      `sites/${siteName}/siteidentifiers?${TENANT_NAME_PARAM}=${ConfigurationService.tenantName}`,
      baseUrl,
    );
    return url;
  }

  return `${baseUrl}?tab=${linkType}&${TENANT_NAME_PARAM}=${ConfigurationService.tenantName}`;
}

export function getAnalyticsIdentifierUrl(
  baseUrl: string,
  collectionId?: string,
  siteId?: string,
  hostId?: string,
  linkType: 'sites' | 'settings' | 'tools' = 'sites',
): string {
  const TENANT_NAME_PARAM = 'tenantName';
  const ORGANIZATION_PARAM = 'organization';
  // Site specific settings
  if (collectionId && siteId && hostId) {
    const url = makeAbsoluteUrl(
      `collection/${collectionId}/sites/${siteId}/settings/hosts/${hostId}/analytics-and-personalization?${TENANT_NAME_PARAM}=${ConfigurationService.tenantName}&${ORGANIZATION_PARAM}=${ConfigurationService.organization}`,
      baseUrl,
    );
    return url;
  }

  return `${baseUrl}?tab=${linkType}&${TENANT_NAME_PARAM}=${ConfigurationService.tenantName}`;
}

export function getExplorerAppUrl(
  baseUrl: string,
  siteName: string,
  language: string,
  itemId: string,
  version?: number,
): string {
  // Content item specific settings
  return (
    `${baseUrl}?organization=${ConfigurationService.organization}` +
    appendQueryParam('tenantName', `${ConfigurationService.tenantName}`) +
    appendQueryParam('sc_lang', language) +
    appendQueryParam('sc_site', siteName) +
    appendQueryParam('sc_itemid', itemId) +
    (version ? appendQueryParam('sc_version', version.toString()) : '')
  );
}

export function abTestAnalyticsUrl(
  testName: string,
  itemName: string,
  siteName: string,
  isNewAnalyticsUrlEnabled: boolean,
  dashboardAppBaseUrl: string,
) {
  const analyticsAppBaseUrl = `${ConfigurationService.cdpTenant?.analyticsAppUrl}/#/analytics/ab-tests`;
  const sitesAppAnalyticsUrl = `${dashboardAppBaseUrl}/analytics`;

  return (
    `${isNewAnalyticsUrlEnabled ? sitesAppAnalyticsUrl : analyticsAppBaseUrl}?test=${testName}` +
    appendQueryParam('tenantId', ConfigurationService.tenantId ?? '') +
    appendQueryParam('organization', ConfigurationService.organization ?? '') +
    appendQueryParam('page', itemName) +
    appendQueryParam('site', siteName) +
    appendQueryParam('enableFeature', 'abTestsAnalytics')
  );
}

export function sitesAbTestsOverviewUrl(
  dashboardAppBaseUrl: string,
  siteId: string,
  collectionId?: string,
  organization?: string | null,
  tenantName?: string | null,
): string {
  return (
    `${dashboardAppBaseUrl}/collection/${collectionId}/sites/${siteId}/strategy/ab-tests` +
    `?organization=${organization}&tenantName=${tenantName}`
  );
}

function appendQueryParam(key: string, value: string) {
  return `&${key}=${encodeURIComponent(value)}`;
}

export interface ApiResponse<T> {
  apiIsBroken: boolean;
  requestIsInvalid: boolean;
  data: T | null;
  httpStatus?: number | undefined;
}

export function handleHttpResponse<T>(response: HttpResponse<T>): ApiResponse<T> {
  // Authentication error
  if (response.status === 401) {
    return { apiIsBroken: true, requestIsInvalid: false, data: null, httpStatus: response.status };
  }

  // Resource not found error
  if (response.status === 404) {
    return { apiIsBroken: false, requestIsInvalid: false, data: null, httpStatus: response.status };
  }

  // Client error
  if (response.status >= 400 && response.status < 500) {
    return { apiIsBroken: false, requestIsInvalid: true, data: null, httpStatus: response.status };
  }

  // Server error
  if (response.status >= 500) {
    return { apiIsBroken: true, requestIsInvalid: false, data: null, httpStatus: response.status };
  }

  // Default
  return {
    apiIsBroken: false,
    requestIsInvalid: false,
    data: response.ok ? response.body : null,
    httpStatus: response.status,
  };
}

export function handleHttpErrorResponse<T>(response: HttpErrorResponse): ApiResponse<T> {
  // Authentication error
  if (response.status === 401) {
    return { apiIsBroken: true, requestIsInvalid: false, data: null, httpStatus: response.status };
  }

  // Resource not found error
  if (response.status === 404) {
    return { apiIsBroken: false, requestIsInvalid: false, data: null, httpStatus: response.status };
  }

  // Client error
  if (response.status >= 400 && response.status < 500) {
    return { apiIsBroken: false, requestIsInvalid: true, data: null, httpStatus: response.status };
  }

  // Server error
  if (response.status >= 500) {
    return { apiIsBroken: true, requestIsInvalid: false, data: null, httpStatus: response.status };
  }

  // Default
  return { apiIsBroken: true, requestIsInvalid: true, data: null, httpStatus: response.status };
}

export function hidePageLoader() {
  const loaderEl = document.getElementById('main-loader');
  if (!loaderEl) {
    return;
  }

  loaderEl.classList.add('fade');

  setTimeout(() => {
    loaderEl.classList.add('hide');
  }, 450);
}

/**
 * Set element position based on canvas & chrome dimension.
 */
export function setElementPosition(currentElementDimension: ElementDimensions) {
  // Canvas dimension
  let canvasDimension: ElementDimensions = { top: 0, left: 0, width: 0, height: 0 };

  const canvasElement = document.getElementsByClassName('page-main')[0];

  if (canvasElement) {
    const canvasRect = canvasElement.getBoundingClientRect();
    canvasDimension = {
      top: canvasRect.top,
      left: canvasRect.left,
      width: canvasRect.width,
      height: canvasRect.height,
    };
  }

  // Dialog dimension
  const dialogEl = document.getElementById('galleryContainer');

  if (dialogEl && currentElementDimension) {
    const dialogElComputedStyle = getComputedStyle(dialogEl as Element);
    const dialogElMaxHeight = parseInt(dialogElComputedStyle.maxHeight, 10);
    const dialogElWidth = parseInt(dialogElComputedStyle.width, 10);
    const centerChromeTop = currentElementDimension.top + currentElementDimension.height / 2;
    const isDialogTooTall = canvasDimension.height - centerChromeTop < dialogElMaxHeight;

    // Calculate dialog top position
    const dialogDefaultTop = Math.min(currentElementDimension.top, 200);
    if (isDialogTooTall) {
      dialogEl.style.top = dialogDefaultTop + 'px';
    } else {
      dialogEl.style.top = centerChromeTop + 80 + 'px';
    }

    // Limit dialog height & top if canvas is too small
    if (canvasDimension.height < dialogElMaxHeight + dialogDefaultTop) {
      dialogEl.style.maxHeight = Math.min(dialogElMaxHeight, canvasDimension.height) + 'px';
      dialogEl.style.top = canvasDimension.top + 'px';
    }

    // Calculate dialog left position
    const canvasRightSpace = canvasDimension.width - (currentElementDimension.left + currentElementDimension.width);
    const leftPosition = canvasDimension.left + currentElementDimension.left + currentElementDimension.width / 2;
    if (canvasRightSpace + currentElementDimension.width / 2 < dialogElWidth + $paddingSmall) {
      dialogEl.style.left = leftPosition - (dialogElWidth + $paddingLarge) + 'px';
    } else {
      dialogEl.style.left = leftPosition + $paddingLarge + 'px';
    }
  }
}

export function getJsonValueFromLocalStorage(key: string) {
  let result = {};

  try {
    result = JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    localStorage.removeItem(key);
  }

  return result;
}

export function isDefined<T>(arg: T | null | undefined): arg is T extends null | undefined ? never : T {
  return arg !== null && arg !== undefined;
}

export function deepClone<T>(arg: T): T {
  return JSON.parse(JSON.stringify(arg));
}

export function replaceLineBreaksWithSpace(plainText: string) {
  const lineBreaksExpression = /(?:\r\n|\r|\n)/g;
  return plainText.replace(lineBreaksExpression, ' ');
}

export function normalizeIdWithoutDash(id: string) {
  return id.replace(NORMALIZE_ID_WITHOUT_DASH_REGEX, '').toUpperCase();
}

// This method is used to map error messages to error codes as facade api returns error messages, not codes.
export function mapErrorMessageToCode(errorMessage: string): CreateItemErrorCode {
  if (errorMessage.includes('The item with such name is already defined on this level.')) {
    return 'DuplicateItemName';
  }
  if (errorMessage.includes('The provided item name is not valid')) {
    return 'InvalidItemName';
  }
  return errorMessage as CreateItemErrorCode;
}
