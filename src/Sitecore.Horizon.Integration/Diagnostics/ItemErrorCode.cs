// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.Diagnostics
{
    internal enum ItemErrorCode
    {
        ItemNotFound,
        InvalidPath,
        ItemIsFallback,
        InsufficientPrivileges,
        InsufficientLanguagePrivileges,
        ItemIsReadOnly,
        FieldDoesNotExist,
        ItemIsLocked,
        InvalidItemName,
        InvalidTemplateId,
        InvalidParent,
        InvalidTemplateSource,
        DuplicateItemName,
        RootNotFound,
        RootNotReachable,
        InvalidDataSource
    }
}
