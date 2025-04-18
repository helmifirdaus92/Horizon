/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export type SaveItemErrorCode =
  /**
   * Item does not exist.
   */
  | 'ItemDoesNotExist'

  /**
   * No write access.
   */
  | 'NoWriteAccess'

  /**
   * Item is protected.
   */
  | 'ItemIsProtected'

  /**
   * Item is fallback.
   */
  | 'ItemIsFallback'

  /**
   * Item was modified.
   */
  | 'ItemWasModified'

  /**
   * Field was modified.
   */
  | 'FieldWasModified'

  /**
   * Returned when trying to modify item while it's locked by another user.
   */
  | 'ItemLockedByAnotherUser'

  /**
   * Returned when trying to modify item while it's locked by another user.
   */
  | 'ItemShouldBeLockedBeforeEdit'

  /**
   * Validation Error.
   */
  | 'ValidationError'

  /**
   * Incorrect clone source.
   */
  | 'IncorrectCloneSource'

  /**
   * Base template was changed.
   */
  | 'BaseTemplateWasChanged'

  /**
   * Shared or unversioned flag was changed.
   */
  | 'ChangedUnversionedOrSharedFlag'

  /**
   * Internal server error.
   */
  | 'InternalError';
