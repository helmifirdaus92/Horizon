/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { parseSingleXmlTag } from '../utils/utils';
import { allowedFileExtensions, maxSize, MediaUploadResultCode } from './media.interface';

/**
 * Try to parse the raw value of a media item.
 * If the raw value has the format of a platform media then the result will contain its `mediaId`
 */
export function parseMediaRawValue(rawValue: string): { mediaId: string } {
  if (!rawValue) {
    return { mediaId: '' };
  }
  const attributes = parseSingleXmlTag(rawValue);
  return { mediaId: attributes['mediaid'] ?? '' };
}

export function addAltToMediaRawValue(rawValue: string, alt: string): string {
  const attributes = parseSingleXmlTag(rawValue);
  attributes['alt'] = alt;
  return `<image ${Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ')} />`;
}

export function checkUploadFileErrorType(file: File): { errorCode: MediaUploadResultCode; isValid: boolean } {
  const ext = extractFileNameAndExtension(file).extension;
  if (file.size >= maxSize) {
    return { errorCode: 'FileSizeTooBig', isValid: false };
  }
  if (!allowedFileExtensions.includes(ext)) {
    return { errorCode: 'InvalidExtension', isValid: false };
  }
  return { errorCode: null, isValid: true };
}

export const IMAGES_BASE_TEMPLATE_IDS = [
  'C97BA923-8009-4858-BDD5-D8BE5FCCECF7',
  'F1828A2C-7E5D-4BBD-98CA-320474871548',
];

export const FILES_BASE_TEMPLATE_IDS = ['777F0C76-D712-46EA-9F40-371ACDA18A1C', '2A130D0C-A2A9-4443-B418-917F857BF6C9'];

export function extractFileNameAndExtension(file: File): { fileName: string; extension: string } {
  const nameParts = file.name.split('.');
  const fileName = nameParts.slice(0, -1).join('.');
  const extension = nameParts[nameParts.length - 1].toLowerCase();

  return { fileName, extension };
}
