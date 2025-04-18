/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

const NORMALIZE_ID_WITHOUT_DASH_REGEX = /[{}-]/g;

export function isCorrectId(id: string) {
  return /\b\w{8}-\b\w{4}-\b\w{4}-\b\w{4}-\b\w{12}/.test(id);
}

export function insertDashes(id: string) {
  return id.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
}

export function isSameGuid(id1: string | undefined, id2: string | undefined): boolean {
  return normalizeIdWithoutDash(id1 || '') === normalizeIdWithoutDash(id2 || '');
}

export function normalizeIdWithoutDash(id: string) {
  return id.replace(NORMALIZE_ID_WITHOUT_DASH_REGEX, '').toUpperCase();
}
