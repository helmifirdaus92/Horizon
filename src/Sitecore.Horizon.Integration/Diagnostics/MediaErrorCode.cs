// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.Diagnostics
{
    internal enum MediaErrorCode
    {
        None,
        InvalidId,
        NotFound,
        NotAMedia,
        SourceNotFound,
        NotAFolder,
        SourceNotReachable,
        RootNotFound,
        InvalidExtension,
        EmptyFile,
        FileSizeTooBig,
        GenericError,
        InsufficientPrivileges,
        DestinationFolderNotFound,
        InvalidFile,
        SvgScriptsNotAllowed
    }
}
