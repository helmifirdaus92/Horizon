/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { SaveItemErrorCode } from './save-item-error-code';

interface ValidationError {
  aborted: string;
  errorLevel: string;
  errorMessage: string;
  fieldId: string;
}

interface SavedItem {
  fields: FieldSavedValue[];
  id: string;
  language: string;
  revision: string;
  version: number;
}

export interface FieldSavedValue {
  id: string;
  originalValue: string;
  value: string;
  reset: boolean;
}

export interface SaveItemError {
  errorCode: SaveItemErrorCode;
  message: string;
  itemId: string;
}

export interface ItemVersionInfo {
  itemId: string;
  displayName: string;
  versionNumber: number;
}

export interface SaveResult {
  errors: SaveItemError[];
  savedItems: SavedItem[];
  validationErrors: ValidationError[];
  warnings: string[];
  newCreatedVersions: ItemVersionInfo[];
}

export type WarningType = 'ItemWasModified' | 'FieldWasModified' | string;

export interface SaveFieldDetails {
  itemId: string;
  itemVersion?: number;
  revision: string | null;
  fields: FieldSaveInputValue[];
}

export interface SaveLayoutDetails {
  itemId: string;
  itemVersion?: number;
  presentationDetails: {
    kind: 'FINAL' | 'SHARED';
    body: string;
  };
  originalPresentationDetails: {
    kind: 'FINAL' | 'SHARED';
    body: string;
  };
  revision: string | null;
}

export type SaveItemDetails = SaveFieldDetails | SaveLayoutDetails;

export interface FieldSaveInputValue {
  id: string;
  originalValue: string;
  value: string;
  reset: boolean;
}
