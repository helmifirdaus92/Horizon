// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem
{
    internal enum SaveItemErrorCode
    {
        /// <summary>
        /// Item does not exist or was deleted
        /// </summary>
        ItemDoesNotExist,

        /// <summary>
        /// No write access
        /// </summary>
        NoWriteAccess,

        /// <summary>
        /// No language write access
        /// </summary>
        NoLanguageWriteAccess,

        /// <summary>
        /// Item is protected
        /// </summary>
        ItemIsProtected,

        /// <summary>
        /// Item is fallback item
        /// </summary>
        ItemIsFallback,

        /// <summary>
        /// Item was modified
        /// </summary>
        ItemWasModified,

        /// <summary>
        /// Field was modified
        /// </summary>
        FieldWasModified,

        /// <summary>
        /// Returned when trying to modify item while it's locked by another user
        /// </summary>
        ItemLockedByAnotherUser,

        /// <summary>
        /// Returned when trying to modify item while it's locked by another user
        /// </summary>
        ItemShouldBeLockedBeforeEdit,

        /// <summary>
        /// Validation Error
        /// </summary>
        ValidationError,

        /// <summary>
        /// Incorrect clone source
        /// </summary>
        IncorrectCloneSource,

        /// <summary>
        /// Base template was changed
        /// </summary>
        BaseTemplateWasChanged,

        /// <summary>
        /// Shared or unversioned flag was changed
        /// </summary>
        ChangedUnversionedOrSharedFlag,

        /// <summary>
        /// Internal Error
        /// </summary>
        InternalError
    }
}
